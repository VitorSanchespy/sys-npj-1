// Middleware para prevenção de duplicações no sistema
const { Op } = require('sequelize');

/**
 * Middleware para prevenção de duplicação de usuários
 * Verifica se o email já está em uso por outro usuário
 */
const preveniDuplicacaoUsuario = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { usuarioModel: Usuario } = require('../models/indexModel');
    
    // Verificar se é uma atualização (tem ID no params)
    const isUpdate = req.params.id;
    const whereClause = { email };
    
    // Se for atualização, excluir o próprio usuário da verificação
    if (isUpdate) {
      whereClause.id = { [Op.ne]: req.params.id };
    }
    
    const usuarioExistente = await Usuario.findOne({ where: whereClause });
    
    if (usuarioExistente) {
      return res.status(409).json({
        erro: 'Duplicação detectada',
        detalhes: {
          campo: 'email',
          valor: email,
          mensagem: 'Este email já está sendo usado por outro usuário'
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro no middleware anti-duplicação de usuário:', error);
    next();
  }
};

/**
 * Middleware para prevenção de duplicação de processos
 * Verifica se o número do processo já existe
 */
const preveniDuplicacaoProcesso = async (req, res, next) => {
  try {
    const { numero_processo } = req.body;
    const { processoModel: Processo } = require('../models/indexModel');
    
    // Verificar se é uma atualização (tem ID no params)
    const isUpdate = req.params.id;
    const whereClause = { numero_processo };
    
    // Se for atualização, excluir o próprio processo da verificação
    if (isUpdate) {
      whereClause.id = { [Op.ne]: req.params.id };
    }
    
    const processoExistente = await Processo.findOne({ where: whereClause });
    
    if (processoExistente) {
      return res.status(409).json({
        erro: 'Duplicação detectada',
        detalhes: {
          campo: 'numero_processo',
          valor: numero_processo,
          mensagem: 'Este número de processo já está cadastrado'
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro no middleware anti-duplicação de processo:', error);
    next();
  }
};

/**
 * Middleware para prevenção de duplicação de agendamentos
 * Verifica se há conflito de horário para o mesmo usuário
 */
const preveniDuplicacaoAgendamento = async (req, res, next) => {
  try {
    console.log('🛡️ Middleware anti-duplicação executado para agendamento');
    console.log('📝 Dados recebidos:', { 
      data_inicio: req.body.data_inicio, 
      titulo: req.body.titulo, 
      usuario: req.user?.id,
      processo_id: req.body.processo_id 
    });
    
    const { data_inicio, data_fim, titulo, processo_id } = req.body;
    const { agendamentoModel: Agendamento } = require('../models/indexModel');
    
    if (!data_inicio || !processo_id) {
      console.log('⚠️ Pulando verificação - dados insuficientes (data_inicio ou processo_id ausentes)');
      return next();
    }
    
    const dataInicio = new Date(data_inicio);
    const dataFim = data_fim ? new Date(data_fim) : new Date(dataInicio.getTime() + (60 * 60000)); // 1 hora padrão
    
    console.log('🔍 Verificando conflitos no PROCESSO:', processo_id);
    console.log('⏰ Período:', { inicio: dataInicio, fim: dataFim });
    
    // Verificar se é uma atualização (tem ID no params)
    const isUpdate = req.params.id;
    
    // ALTERAÇÃO PRINCIPAL: Verificar conflito de horário POR PROCESSO (não por usuário)
    const whereClauseHorario = {
      processo_id, // Conflito apenas no mesmo processo
      [Op.and]: [
        {
          data_inicio: {
            [Op.lt]: dataFim
          }
        },
        {
          data_fim: {
            [Op.gt]: dataInicio
          }
        }
      ]
    };
    
    // Se for atualização, excluir o próprio agendamento da verificação
    if (isUpdate) {
      whereClauseHorario.id = { [Op.ne]: req.params.id };
    }
    
    const agendamentoConflitante = await Agendamento.findOne({ where: whereClauseHorario });
    
    console.log('🔍 Resultado da busca por conflitos:', agendamentoConflitante ? 'CONFLITO ENCONTRADO' : 'Nenhum conflito');
    
    if (agendamentoConflitante) {
      console.log('❌ Bloqueando criação devido ao conflito no processo');
      return res.status(409).json({
        success: false,
        tipo: 'conflito_processo',
        titulo: 'Conflito no Processo',
        mensagem: `Já existe um agendamento que conflita com este horário no processo`,
        detalhes: {
          campo: 'data_inicio',
          valor: data_inicio,
          processo_id: processo_id,
          agendamento_conflitante: {
            id: agendamentoConflitante.id,
            titulo: agendamentoConflitante.titulo,
            data_inicio: agendamentoConflitante.data_inicio,
            data_fim: agendamentoConflitante.data_fim
          }
        },
        toast: {
          type: 'error',
          title: 'Conflito no Processo',
          message: `Já existe "${agendamentoConflitante.titulo}" marcado para este horário no processo`,
          duration: 5000
        }
      });
    }
    
    console.log('✅ Nenhum conflito de horário encontrado no processo');
    
    // NOVA VERIFICAÇÃO: Conflito de horário POR USUÁRIO (independente do processo)
    console.log('👤 Verificando conflitos para o usuário:', req.user.id);
    
    const whereClauseUsuario = {
      criado_por: req.user.id, // Verificar agendamentos do mesmo usuário
      [Op.and]: [
        {
          data_inicio: {
            [Op.lt]: dataFim
          }
        },
        {
          data_fim: {
            [Op.gt]: dataInicio
          }
        }
      ]
    };
    
    // Se for atualização, excluir o próprio agendamento da verificação
    if (isUpdate) {
      whereClauseUsuario.id = { [Op.ne]: req.params.id };
    }
    
    const agendamentoUsuarioConflitante = await Agendamento.findOne({ 
      where: whereClauseUsuario,
      include: [
        { 
          model: require('../models/indexModel').processoModel, 
          as: 'processo', 
          attributes: ['id', 'numero_processo', 'titulo'] 
        }
      ]
    });
    
    if (agendamentoUsuarioConflitante) {
      console.log('❌ Bloqueando criação devido ao conflito de usuário');
      
      return res.status(409).json({
        success: false,
        message: 'Você já possui um agendamento no mesmo horário',
        toast: 'Você já possui um agendamento no mesmo horário'
      });
    }
    
    console.log('✅ Nenhum conflito de usuário encontrado');
    
    // Verificar duplicação de título no mesmo processo (mais restritivo - mesmo titulo e horário próximo)
    const inicioDia = new Date(dataInicio);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataInicio);
    fimDia.setHours(23, 59, 59, 999);
    
    const whereClauseTitulo = {
      processo_id, // Verificar título duplicado apenas no mesmo processo
      titulo,
      data_inicio: {
        [Op.between]: [inicioDia, fimDia]
      }
    };
    
    if (isUpdate) {
      whereClauseTitulo.id = { [Op.ne]: req.params.id };
    }
    
    const agendamentoTituloDuplicado = await Agendamento.findOne({ where: whereClauseTitulo });
    
    if (agendamentoTituloDuplicado) {
      console.log('❌ Bloqueando criação devido ao título duplicado no processo');
      return res.status(409).json({
        success: false,
        tipo: 'titulo_duplicado',
        titulo: 'Título Duplicado',
        mensagem: `Já existe um agendamento com este título no processo`,
        detalhes: {
          campo: 'titulo',
          valor: titulo,
          processo_id: processo_id
        },
        toast: {
          type: 'warning',
          title: 'Título Duplicado',
          message: `Já existe um agendamento com o título "${titulo}" neste processo hoje`,
          duration: 4000
        }
      });
    }
    
    console.log('✅ Agendamento aprovado pelo middleware anti-duplicação');
    next();
  } catch (error) {
    console.error('❌ Erro no middleware anti-duplicação de agendamento:', error);
    next();
  }
};

/**
 * Middleware para prevenção de vinculação duplicada usuário-processo
 */
const preveniDuplicacaoVinculacao = async (req, res, next) => {
  try {
    const { usuario_id } = req.body;
    const processo_id = req.params.id;
    const { usuarioProcessoModel: UsuarioProcesso } = require('../models/indexModel');
    
    if (!usuario_id || !processo_id) {
      return next();
    }
    
    const vinculoExistente = await UsuarioProcesso.findOne({
      where: { usuario_id, processo_id }
    });
    
    if (vinculoExistente) {
      return res.status(409).json({
        erro: 'Vinculação duplicada',
        detalhes: {
          campo: 'vinculacao',
          mensagem: 'Este usuário já está vinculado a este processo'
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro no middleware anti-duplicação de vinculação:', error);
    next();
  }
};

module.exports = {
  preveniDuplicacaoUsuario,
  preveniDuplicacaoProcesso,
  preveniDuplicacaoAgendamento,
  preveniDuplicacaoVinculacao
};
