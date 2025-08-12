// Controller de Atualizações de Processo simplificado

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

// Listar atualizações
exports.listarAtualizacoes = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    const { idprocesso, processo_id } = req.query;
    // Aceitar tanto idprocesso quanto processo_id para compatibilidade
    const processoIdFilter = idprocesso || processo_id;
    
    const { atualizacaoProcessoModel: Atualizacao, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
    const where = processoIdFilter ? { processo_id: processoIdFilter } : {};
    
    const atualizacoes = await Atualizacao.findAll({
      where,
      include: [
        { model: Usuario, as: 'usuario' },
        { model: Processo, as: 'processo' }
      ],
      order: [['data_atualizacao', 'DESC']]
    });
    
    res.json(atualizacoes);
    
  } catch (error) {
    console.error('Erro ao listar atualizações:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter atualização por ID
exports.obterAtualizacao = async (req, res) => {
  try {
    if (!isDbAvailable()) {
      return res.status(503).json({ erro: 'Banco de dados não disponível' });
    }

    const { id } = req.params;
    
    const { atualizacaoProcessoModel: Atualizacao, usuarioModel: Usuario, processoModel: Processo } = require('../models/indexModel');
    const atualizacao = await Atualizacao.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuario' },
        { model: Processo, as: 'processo' }
      ]
    });
    
    if (!atualizacao) {
      return res.status(404).json({ erro: 'Atualização não encontrada' });
    }
    
    res.json(atualizacao);
    
  } catch (error) {
    console.error('Erro ao obter atualização:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar atualização
exports.criarAtualizacao = async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      status_anterior,
      status_novo,
      idprocesso
    } = req.body;
    
    if (!titulo || !descricao || !idprocesso) {
      return res.status(400).json({ 
        erro: 'Título, descrição e ID do processo são obrigatórios' 
      });
    }
    
    if (isDbAvailable()) {
      try {
        const { atualizacaoProcessoModel: Atualizacao } = require('../models/indexModel');
        
        const novaAtualizacao = await Atualizacao.create({
          titulo,
          descricao,
          status_anterior,
          status_novo,
          idprocesso,
          idusuario: req.user ? req.user.id : 1
        });
        
        res.status(201).json(novaAtualizacao);
      } catch (dbError) {
        console.log('Erro no banco, usando modo mock:', dbError.message);
        // Fallback para modo mock
        const novaAtualizacao = {
          id: Date.now(),
          titulo,
          descricao,
          status_anterior,
          status_novo,
          idprocesso,
          idusuario: req.user ? req.user.id : 1,
          data_atualizacao: new Date().toISOString()
        };
        
        res.status(201).json(novaAtualizacao);
      }
      
    } else {
      // Modo mock
      const novaAtualizacao = {
        id: Date.now(),
        titulo,
        descricao,
        status_anterior,
        status_novo,
        idprocesso,
        idusuario: req.user ? req.user.id : 1,
        data_atualizacao: new Date().toISOString()
      };
      
      res.status(201).json(novaAtualizacao);
    }
    
  } catch (error) {
    console.error('Erro ao criar atualização:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar atualização (editar)
exports.atualizarAtualizacao = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    
    if (isDbAvailable()) {
      const { atualizacaoProcessoModel: Atualizacao } = require('../models/indexModel');
      
      const atualizacao = await Atualizacao.findByPk(id);
      if (!atualizacao) {
        return res.status(404).json({ erro: 'Atualização não encontrada' });
      }
      
      await atualizacao.update(dadosAtualizacao);
      res.json(atualizacao);
      
    } else {
      // Modo mock
      res.json({
        id: parseInt(id),
        ...dadosAtualizacao,
        atualizado_em: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Erro ao atualizar atualização:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar atualização
exports.deletarAtualizacao = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbAvailable()) {
      const { atualizacaoProcessoModel: Atualizacao } = require('../models/indexModel');
      
      const atualizacao = await Atualizacao.findByPk(id);
      if (!atualizacao) {
        return res.status(404).json({ erro: 'Atualização não encontrada' });
      }
      // Bloquear exclusão se processo estiver concluído
      const { processoModel: Processo } = require('../models/indexModel');
      const processo = await Processo.findByPk(atualizacao.processo_id);
      if (processo && processo.status === 'Concluído') {
        return res.status(403).json({ erro: 'Processo concluído não pode ser alterado. Reabra para modificar.' });
      }
      await atualizacao.destroy();
      res.json({ message: 'Atualização deletada com sucesso' });
      
    } else {
      // Modo mock
      res.json({ message: 'Atualização deletada com sucesso (modo desenvolvimento)' });
    }
    
  } catch (error) {
    console.error('Erro ao deletar atualização:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
