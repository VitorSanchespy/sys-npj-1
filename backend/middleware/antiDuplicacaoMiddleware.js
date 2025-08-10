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
    const { usuario_id, data_evento, titulo } = req.body;
    const { agendamentoModel: Agendamento } = require('../models/indexModel');
    
    if (!data_evento || !usuario_id) {
      return next();
    }
    
    const dataEvento = new Date(data_evento);
    const inicioJanela = new Date(dataEvento.getTime() - (30 * 60000)); // 30 minutos antes
    const fimJanela = new Date(dataEvento.getTime() + (30 * 60000)); // 30 minutos depois
    
    // Verificar se é uma atualização (tem ID no params)
    const isUpdate = req.params.id;
    const whereClause = {
      usuario_id,
      data_evento: {
        [Op.between]: [inicioJanela, fimJanela]
      }
    };
    
    // Se for atualização, excluir o próprio agendamento da verificação
    if (isUpdate) {
      whereClause.id = { [Op.ne]: req.params.id };
    }
    
    const agendamentoConflitante = await Agendamento.findOne({ where: whereClause });
    
    if (agendamentoConflitante) {
      return res.status(409).json({
        erro: 'Conflito de horário detectado',
        detalhes: {
          campo: 'data_evento',
          valor: data_evento,
          mensagem: `Já existe um agendamento para este usuário entre ${inicioJanela.toLocaleString()} e ${fimJanela.toLocaleString()}`,
          agendamento_conflitante: {
            id: agendamentoConflitante.id,
            titulo: agendamentoConflitante.titulo,
            data_evento: agendamentoConflitante.data_evento
          }
        }
      });
    }
    
    // Verificar duplicação de título para o mesmo usuário no mesmo dia
    const inicioDia = new Date(dataEvento);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataEvento);
    fimDia.setHours(23, 59, 59, 999);
    
    const whereClauseTitulo = {
      usuario_id,
      titulo,
      data_evento: {
        [Op.between]: [inicioDia, fimDia]
      }
    };
    
    if (isUpdate) {
      whereClauseTitulo.id = { [Op.ne]: req.params.id };
    }
    
    const agendamentoTituloDuplicado = await Agendamento.findOne({ where: whereClauseTitulo });
    
    if (agendamentoTituloDuplicado) {
      return res.status(409).json({
        erro: 'Duplicação detectada',
        detalhes: {
          campo: 'titulo',
          valor: titulo,
          mensagem: 'Já existe um agendamento com este título para o mesmo usuário neste dia'
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro no middleware anti-duplicação de agendamento:', error);
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
