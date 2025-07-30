/**
 * Middleware para prevenir duplicações no sistema
 * Implementa regras lógicas para evitar criação de registros duplicados
 */

const {
  usuariosModels: Usuario,
  processoModels: Processo,
  agendamentoModels: Agendamento
} = require('../models/indexModels');
const { Op } = require('sequelize');

/**
 * Validação anti-duplicação para usuários
 * Verifica email único e outras regras de negócio
 */
const validarUsuarioDuplicado = async (req, res, next) => {
  try {
    const { email, nome, telefone } = req.body;
    const { id } = req.params; // Para atualizações

    // Verificar se email foi fornecido
    if (!email) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: {
          campo: 'email',
          mensagem: 'Email é obrigatório'
        }
      });
    }

    // Validação de email único
    const emailQuery = { email: email.toLowerCase().trim() };
    if (id) {
      emailQuery.id = { [Op.ne]: id }; // Excluir o próprio registro em atualizações
    }

    const usuarioExistente = await Usuario.findOne({
      where: emailQuery
    });

    if (usuarioExistente) {
      return res.status(409).json({
        erro: 'Usuário duplicado',
        detalhes: {
          campo: 'email',
          mensagem: 'Este email já está cadastrado no sistema',
          valor: email
        }
      });
    }

    // Validação adicional: telefone único (se fornecido)
    if (telefone && telefone.trim()) {
      const telefonequery = { 
        telefone: telefone.trim(),
        telefone: { [Op.ne]: null } 
      };
      if (id) {
        telefonequery.id = { [Op.ne]: id };
      }

      const usuarioComTelefone = await Usuario.findOne({
        where: telefonequery
      });

      if (usuarioComTelefone) {
        return res.status(409).json({
          erro: 'Usuário duplicado',
          detalhes: {
            campo: 'telefone',
            mensagem: 'Este telefone já está cadastrado no sistema',
            valor: telefone
          }
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erro na validação anti-duplicação de usuário:', error);
    return res.status(500).json({ erro: 'Erro interno na validação' });
  }
};

/**
 * Validação anti-duplicação para processos
 * Verifica número de processo único
 */
const validarProcessoDuplicado = async (req, res, next) => {
  try {
    const { numero_processo } = req.body;
    const { processo_id } = req.params; // Para atualizações

    if (!numero_processo) {
      return next(); // Se não há número, deixa outras validações handlearem
    }

    const numeroLimpo = numero_processo.trim().toUpperCase();
    const query = { numero_processo: numeroLimpo };
    
    if (processo_id) {
      query.id = { [Op.ne]: processo_id };
    }

    const processoExistente = await Processo.findOne({
      where: query
    });

    if (processoExistente) {
      return res.status(409).json({
        erro: 'Processo duplicado',
        detalhes: {
          campo: 'numero_processo',
          mensagem: 'Este número de processo já está cadastrado no sistema',
          valor: numero_processo,
          processoExistente: {
            id: processoExistente.id,
            numero_processo: processoExistente.numero_processo,
            criado_em: processoExistente.criado_em
          }
        }
      });
    }

    // Normalizar o número do processo para armazenamento
    req.body.numero_processo = numeroLimpo;
    
    next();
  } catch (error) {
    console.error('Erro na validação anti-duplicação de processo:', error);
    return res.status(500).json({ erro: 'Erro interno na validação' });
  }
};

/**
 * Validação anti-duplicação para agendamentos
 * Evita agendamentos conflitantes no mesmo horário
 */
const validarAgendamentoDuplicado = async (req, res, next) => {
  try {
    const { 
      usuario_id, 
      data_evento, 
      titulo,
      processo_id 
    } = req.body;
    const { id } = req.params; // Para atualizações

    if (!data_evento || !usuario_id) {
      return next(); // Deixa outras validações handlearem campos obrigatórios
    }

    const dataEvento = new Date(data_evento);
    
    // Margem de 30 minutos para evitar conflitos
    const margemMinutos = 30;
    const dataInicio = new Date(dataEvento.getTime() - (margemMinutos * 60000));
    const dataFim = new Date(dataEvento.getTime() + (margemMinutos * 60000));

    // Verificar conflitos para o mesmo usuário
    const queryConflito = {
      usuario_id,
      data_evento: {
        [Op.between]: [dataInicio, dataFim]
      }
    };

    if (id) {
      queryConflito.id = { [Op.ne]: id };
    }

    const agendamentoConflitante = await Agendamento.findOne({
      where: queryConflito,
      include: [{
        model: Processo,
        as: 'processo',
        attributes: ['numero_processo']
      }]
    });

    if (agendamentoConflitante) {
      return res.status(409).json({
        erro: 'Agendamento conflitante',
        detalhes: {
          campo: 'data_evento',
          mensagem: `Já existe um agendamento para este usuário no período de ${margemMinutos} minutos`,
          agendamentoConflitante: {
            id: agendamentoConflitante.id,
            titulo: agendamentoConflitante.titulo,
            data_evento: agendamentoConflitante.data_evento,
            processo: agendamentoConflitante.processo?.numero_processo || 'N/A'
          }
        }
      });
    }

    // Verificar duplicação exata (mesmo título, data e usuário)
    if (titulo && titulo.trim()) {
      const queryDuplicacao = {
        usuario_id,
        titulo: titulo.trim(),
        data_evento: dataEvento
      };

      if (id) {
        queryDuplicacao.id = { [Op.ne]: id };
      }

      const agendamentoDuplicado = await Agendamento.findOne({
        where: queryDuplicacao
      });

      if (agendamentoDuplicado) {
        return res.status(409).json({
          erro: 'Agendamento duplicado',
          detalhes: {
            campo: 'titulo',
            mensagem: 'Já existe um agendamento idêntico para este usuário na mesma data e horário',
            agendamentoDuplicado: {
              id: agendamentoDuplicado.id,
              titulo: agendamentoDuplicado.titulo,
              data_evento: agendamentoDuplicado.data_evento
            }
          }
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erro na validação anti-duplicação de agendamento:', error);
    return res.status(500).json({ erro: 'Erro interno na validação' });
  }
};

/**
 * Validação para evitar vinculação duplicada de usuário a processo
 */
const validarVinculacaoUsuarioProcesso = async (req, res, next) => {
  try {
    const { usuario_id, processo_id } = req.body;

    if (!usuario_id || !processo_id) {
      return next();
    }

    const { usuariosProcessoModels: UsuariosProcesso } = require('../models/indexModels');
    
    const vinculacaoExistente = await UsuariosProcesso.findOne({
      where: {
        usuario_id,
        processo_id
      }
    });

    if (vinculacaoExistente) {
      return res.status(409).json({
        erro: 'Vinculação duplicada',
        detalhes: {
          mensagem: 'Este usuário já está vinculado a este processo',
          vinculacao: {
            usuario_id,
            processo_id,
            criado_em: vinculacaoExistente.createdAt
          }
        }
      });
    }

    next();
  } catch (error) {
    console.error('Erro na validação de vinculação usuário-processo:', error);
    return res.status(500).json({ erro: 'Erro interno na validação' });
  }
};

module.exports = {
  validarUsuarioDuplicado,
  validarProcessoDuplicado,
  validarAgendamentoDuplicado,
  validarVinculacaoUsuarioProcesso
};
