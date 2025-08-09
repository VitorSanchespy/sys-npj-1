// Controller de Processos simplificado

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}


// Obter processo por ID
exports.obterProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    let processo = null;
    
    if (isDbAvailable()) {
      const { processoModel: Processo, usuarioModel: Usuario } = require('../models/indexModel');
      processo = await Processo.findByPk(id, {
        include: [{ model: Usuario, as: 'responsavel' }]
      });
    } 
    
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    
    res.json(processo);
    
  } catch (error) {
    console.error('Erro ao obter processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter processo com detalhes completos
exports.obterProcessoDetalhes = async (req, res) => {
  try {
    const { id } = req.params;
    let processo = null;
    
    if (isDbAvailable()) {
      const { 
        processoModel: Processo, 
        usuarioModel: Usuario,
        usuarioProcessoModel: UsuarioProcesso,
        atualizacaoProcessoModel: AtualizacaoProcesso,
        arquivoModel: Arquivo,
        materiaAssuntoModel: MateriaAssunto,
        faseModel: Fase,
        diligenciaModel: Diligencia,
        localTramitacaoModel: LocalTramitacao
      } = require('../models/indexModel');

      processo = await Processo.findByPk(id, {
        include: [
          { model: Usuario, as: 'responsavel' },
          { 
            model: AtualizacaoProcesso, 
            as: 'atualizacoes',
            include: [{ model: Usuario, as: 'usuario' }],
            order: [['data_atualizacao', 'DESC']]
          },
          { model: Arquivo, as: 'arquivos' },
          { model: MateriaAssunto, as: 'materiaAssunto' },
          { model: Fase, as: 'fase' },
          { model: Diligencia, as: 'diligencia' },
          { model: LocalTramitacao, as: 'localTramitacao' }
        ]
      });

      // Buscar o primeiro usuário vinculado ao processo (quem criou ou o primeiro da tabela de ligação)
      let responsavelVinculado = null;
      const usuariosProcesso = await UsuarioProcesso.findAll({
        where: { processo_id: id },
        include: [{ model: Usuario, as: 'usuario' }],
        order: [['id', 'ASC']]
      });
      if (usuariosProcesso.length > 0) {
        const usuario = usuariosProcesso[0].usuario;
        responsavelVinculado = usuario ? {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone
        } : null;
      }
      // Adiciona ao objeto de resposta
      const processoObj = processo.toJSON();
      processoObj.responsavelVinculado = responsavelVinculado;
      res.json(processoObj);
      return;
    }
    if (!processo) {
      return res.status(404).json({ erro: 'Processo não encontrado' });
    }
    res.json(processo);
    
  } catch (error) {
    console.error('Erro ao obter detalhes do processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar usuários vinculados ao processo
exports.listarUsuariosProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    let usuarios = [];
    
    if (isDbAvailable()) {
      const { 
        usuarioProcessoModel: UsuarioProcesso,
        usuarioModel: Usuario,
        roleModel: Role
      } = require('../models/indexModel');
      
      const usuariosProcesso = await UsuarioProcesso.findAll({
        where: { processo_id: id },
        include: [{
          model: Usuario,
          as: 'usuario',
          include: [{ model: Role, as: 'role' }]
        }]
      });
      
      usuarios = usuariosProcesso.map(up => {
        const usuario = up.usuario;
        return {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
          role: usuario.role ? usuario.role.nome : 'Não definido'
        };
      });
    }
    
    res.json(usuarios);
    
  } catch (error) {
    console.error('Erro ao listar usuários do processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Criar processo
exports.criarProcesso = async (req, res) => {
  try {
    const {
      numero_processo,
      num_processo_sei,
      assistido,
      descricao,
      status = 'Em andamento',
      materia_assunto_id,
      local_tramitacao_id,
      sistema = 'Físico',
      fase_id,
      diligencia_id,
      contato_assistido,
      idusuario_responsavel
    } = req.body;

    if (!numero_processo) {
      return res.status(400).json({ 
        erro: 'Número do processo é obrigatório' 
      });
    }
    
    if (isDbAvailable()) {
      const { 
        processoModel: Processo,
        atualizacaoProcessoModel: AtualizacaoProcesso
      } = require('../models/indexModel');
      // Verificar se número do processo já existe
      const processoExistente = await Processo.findOne({ where: { numero_processo } });
      if (processoExistente) {
        return res.status(400).json({ erro: 'Número do processo já cadastrado' });
      }
      const novoProcesso = await Processo.create({
        numero_processo,
        num_processo_sei,
        assistido,
        descricao,
        status,
        materia_assunto_id,
        local_tramitacao_id,
        sistema,
        fase_id,
        diligencia_id,
        contato_assistido,
        idusuario_responsavel
      });
      
      // Registrar criação no histórico
      await AtualizacaoProcesso.create({
        usuario_id: req.user.id,
        processo_id: novoProcesso.id,
        tipo_atualizacao: 'Criação do Processo',
        descricao: `Processo "${numero_processo}" criado no sistema`
      });
      
      res.status(201).json(novoProcesso);
    } 
    
  } catch (error) {
    console.error('Erro ao criar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Atualizar processo
exports.atualizarProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    const usuarioId = req.user.id; // ID do usuário que está fazendo a atualização
    
    console.log('🔍 Debug atualização processo:', {
      processId: id,
      usuarioId,
      dadosRecebidos: JSON.stringify(dadosAtualizacao, null, 2),
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type']
    });
    
    // Validar se os dados necessários existem
    if (!dadosAtualizacao || Object.keys(dadosAtualizacao).length === 0) {
      console.log('❌ Dados de atualização vazios');
      return res.status(400).json({ erro: 'Dados de atualização não fornecidos' });
    }
    
    // Converter strings para integers nos campos de FK
    if (dadosAtualizacao.materia_assunto_id && typeof dadosAtualizacao.materia_assunto_id === 'string') {
      dadosAtualizacao.materia_assunto_id = parseInt(dadosAtualizacao.materia_assunto_id);
    }
    if (dadosAtualizacao.fase_id && typeof dadosAtualizacao.fase_id === 'string') {
      dadosAtualizacao.fase_id = parseInt(dadosAtualizacao.fase_id);
    }
    if (dadosAtualizacao.diligencia_id && typeof dadosAtualizacao.diligencia_id === 'string') {
      dadosAtualizacao.diligencia_id = parseInt(dadosAtualizacao.diligencia_id);
    }
    if (dadosAtualizacao.local_tramitacao_id && typeof dadosAtualizacao.local_tramitacao_id === 'string') {
      dadosAtualizacao.local_tramitacao_id = parseInt(dadosAtualizacao.local_tramitacao_id);
    }
    // Corrigir idusuario_responsavel: se string vazia, vira null; se string numérica, vira inteiro
    if (typeof dadosAtualizacao.idusuario_responsavel === 'string') {
      if (dadosAtualizacao.idusuario_responsavel.trim() === '') {
        dadosAtualizacao.idusuario_responsavel = null;
      } else {
        dadosAtualizacao.idusuario_responsavel = parseInt(dadosAtualizacao.idusuario_responsavel);
      }
    }
    
    // Tratar data_encerramento vazia
    if (dadosAtualizacao.data_encerramento === '') {
      dadosAtualizacao.data_encerramento = null;
    }
    
    console.log('🔧 Dados após processamento:', JSON.stringify(dadosAtualizacao, null, 2));
    
    if (isDbAvailable()) {
      const { 
        processoModel: Processo, 
        atualizacaoProcessoModel: AtualizacaoProcesso 
      } = require('../models/indexModel');
      
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      
      // Capturar valores antigos para comparação
      const valoresAntigos = processo.toJSON();
      
      // Atualizar processo
      try {
        await processo.update(dadosAtualizacao);
        console.log('✅ Processo atualizado com sucesso');
      } catch (updateError) {
        console.error('❌ Erro específico na atualização do processo:', updateError);
        console.error('❌ Detalhes do erro Sequelize:', updateError.message);
        if (updateError.errors) {
          console.error('❌ Erros de validação:', updateError.errors);
        }
        throw updateError;
      }
      
      // Registrar histórico de alterações
      const alteracoes = [];
      const camposMonitorados = {
        'numero_processo': 'Número do Processo',
        'descricao': 'Descrição',
        'status': 'Status',
        'tipo_processo': 'Tipo do Processo',
        'assistido': 'Nome do Assistido',
        'contato_assistido': 'Contato do Assistido',
        'num_processo_sei': 'Número SEI',
        'sistema': 'Sistema',
        'observacoes': 'Observações',
        'materia_assunto_id': 'Matéria/Assunto',
        'fase_id': 'Fase',
        'diligencia_id': 'Diligência',
        'local_tramitacao_id': 'Local de Tramitação',
        'idusuario_responsavel': 'Responsável'
      };
      
      // Verificar quais campos foram alterados
      for (const [campo, label] of Object.entries(camposMonitorados)) {
        if (dadosAtualizacao.hasOwnProperty(campo) && 
            valoresAntigos[campo] !== dadosAtualizacao[campo]) {
          const valorAntigo = valoresAntigos[campo] || 'Não definido';
          const valorNovo = dadosAtualizacao[campo] || 'Não definido';
          alteracoes.push(`${label}: "${valorAntigo}" → "${valorNovo}"`);
        }
      }
      
      // Se houve alterações, registrar no histórico
      if (alteracoes.length > 0) {
        await AtualizacaoProcesso.create({
          usuario_id: usuarioId,
          processo_id: id,
          tipo_atualizacao: 'Edição do Processo',
          descricao: `Processo editado. Alterações: ${alteracoes.join('; ')}`
        });
      }
      
      res.json(processo);
      
    } else {
      res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
    
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar processo
exports.deletarProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbAvailable()) {
      const { processoModel: Processo } = require('../models/indexModel');
      
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      
      await processo.destroy();
      res.json({ message: 'Processo deletado com sucesso' });
      
    } 
    
  } catch (error) {
    console.error('Erro ao deletar processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar processos do usuário
exports.listarProcessosUsuario = async (req, res) => {
  try {
    const userId = req.user.id;
    let processos = [];
    
    if (isDbAvailable()) {
      const { processoModel: Processo, usuarioModel: Usuario } = require('../models/indexModel');
      processos = await Processo.findAll({
        where: { idusuario_responsavel: userId },
        include: [{ model: Usuario, as: 'responsavel' }],
        order: [['criado_em', 'DESC']]
      });
    } 
    
    res.json(processos);
    
  } catch (error) {
    console.error('Erro ao listar processos do usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar todos os processos
exports.listarProcessos = async (req, res) => {
  try {
    const { processoModel: Processo, usuarioModel: Usuario } = require('../models/indexModel');
    const processos = await Processo.findAll({
      include: [{ model: Usuario, as: 'responsavel' }],
      order: [['criado_em', 'DESC']]
    });
    res.json(processos);
  } catch (error) {
    console.error('Erro ao listar processos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Vincular usuário ao processo
exports.vincularUsuario = async (req, res) => {
  try {
    const { id } = req.params; // ID do processo
    const { usuario_id, role } = req.body;
    const usuarioLogado = req.user.id; // ID do usuário que está fazendo a vinculação
    
    if (!usuario_id) {
      return res.status(400).json({ erro: 'ID do usuário é obrigatório' });
    }
    
    if (isDbAvailable()) {
      const { 
        usuarioProcessoModel: UsuarioProcesso,
        usuarioModel: Usuario,
        processoModel: Processo,
        atualizacaoProcessoModel: AtualizacaoProcesso
      } = require('../models/indexModel');
      
      // Verificar se processo existe
      const processo = await Processo.findByPk(id);
      if (!processo) {
        return res.status(404).json({ erro: 'Processo não encontrado' });
      }
      
      // Verificar se usuário existe
      const usuario = await Usuario.findByPk(usuario_id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      
      // Verificar se já está vinculado
      const vinculoExistente = await UsuarioProcesso.findOne({
        where: { usuario_id, processo_id: id }
      });
      
      if (vinculoExistente) {
        return res.status(400).json({ erro: 'Usuário já está vinculado a este processo' });
      }
      
      // Criar vinculação
      await UsuarioProcesso.create({
        usuario_id,
        processo_id: id
      });
      
      // Buscar usuário que fez a alteração
      const usuarioAlteracao = await Usuario.findByPk(usuarioLogado);
      // Registrar no histórico
      await AtualizacaoProcesso.create({
        usuario_id: usuarioLogado,
        processo_id: id,
        tipo_atualizacao: 'Vinculação de Usuário',
        descricao: `Usuário "${usuario.nome}" (${usuario.email}) foi vinculado ao processo\nPor: ${usuarioAlteracao ? usuarioAlteracao.nome : 'Desconhecido'} (${usuarioAlteracao ? usuarioAlteracao.email : ''})`
      });
      
      res.status(201).json({ mensagem: 'Usuário vinculado ao processo com sucesso' });
    } else {
      res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
    
  } catch (error) {
    console.error('Erro ao vincular usuário ao processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Desvincular usuário do processo
exports.desvincularUsuario = async (req, res) => {
  try {
    const { id } = req.params; // ID do processo
    const { usuario_id } = req.body;
    const usuarioLogado = req.user.id; // ID do usuário que está fazendo a desvinculação
    
    if (!usuario_id) {
      return res.status(400).json({ erro: 'ID do usuário é obrigatório' });
    }
    
    if (isDbAvailable()) {
      const { 
        usuarioProcessoModel: UsuarioProcesso,
        usuarioModel: Usuario,
        atualizacaoProcessoModel: AtualizacaoProcesso
      } = require('../models/indexModel');
      
      // Buscar usuário para obter informações antes de desvincular
      const usuario = await Usuario.findByPk(usuario_id);
      
      // Buscar vinculação
      const vinculo = await UsuarioProcesso.findOne({
        where: { usuario_id, processo_id: id }
      });
      
      if (!vinculo) {
        return res.status(404).json({ erro: 'Usuário não está vinculado a este processo' });
      }
      
      // Remover vinculação
      await vinculo.destroy();
      
      // Buscar usuário que fez a alteração
      const usuarioAlteracao = await Usuario.findByPk(usuarioLogado);
      // Registrar no histórico se conseguiu obter dados do usuário
      if (usuario) {
        await AtualizacaoProcesso.create({
          usuario_id: usuarioLogado,
          processo_id: id,
          tipo_atualizacao: 'Desvinculação de Usuário',
          descricao: `Usuário "${usuario.nome}" (${usuario.email}) foi desvinculado do processo\nPor: ${usuarioAlteracao ? usuarioAlteracao.nome : 'Desconhecido'} (${usuarioAlteracao ? usuarioAlteracao.email : ''})`
        });
      }
      
      res.json({ mensagem: 'Usuário desvinculado do processo com sucesso' });
    } else {
      res.status(503).json({ erro: 'Banco de dados não disponível' });
    }
    
  } catch (error) {
    console.error('Erro ao desvincular usuário do processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
