const upload = require('../middleware/uploadMiddleware');
const { arquivoModels: Arquivo, processoModels: Processo, usuariosModels: Usuario } = require('../models/indexModels');

// uploadArquivo é responsável por receber o arquivo enviado pelo usuário
exports.uploadArquivo = [
  upload.single('arquivo'), // 'arquivo' é o nome do campo no form
  async (req, res) => {
    try {
      console.log('📝 Dados recebidos no upload:');
      console.log('- Body:', req.body);
      console.log('- File:', req.file ? { 
        originalname: req.file.originalname, 
        size: req.file.size, 
        mimetype: req.file.mimetype 
      } : 'Nenhum arquivo');
      console.log('- Usuario:', req.usuario ? req.usuario.id : 'Não autenticado');
      
      if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
      }

      // Garante que o caminho salvo seja sempre relativo à pasta uploads
      let caminhoRelativo = req.file.path.replace(/\\/g, '/');
      const idx = caminhoRelativo.indexOf('uploads/');
      if (idx !== -1) caminhoRelativo = caminhoRelativo.substring(idx);
      
      // Validar se o processo_id existe (se fornecido)
      let processo_id = req.body.processo_id;
      
      // Tratar valores inválidos como null
      if (!processo_id || processo_id === 'undefined' || processo_id === 'null' || processo_id === '') {
        processo_id = null;
      } else {
        // Se foi fornecido um ID, validar se existe
        const processoExiste = await Processo.findByPk(processo_id);
        if (!processoExiste) {
          return res.status(400).json({ erro: `Processo com ID ${processo_id} não encontrado` });
        }
      }
      
      console.log('🔍 Processo ID processado:', processo_id);
      
      const metadados = {
        nome: req.file.originalname,
        caminho: caminhoRelativo,
        tamanho: req.file.size,
        tipo: req.file.mimetype,
        processo_id: processo_id,
        usuario_id: req.usuario.id // Usuário autenticado
      };

      const arquivo = await Arquivo.create(metadados);
      res.status(201).json(arquivo);

    } catch (error) {
      console.error('Erro no upload:', error);
      
      // Tratamento específico para erros de foreign key
      if (error.message.includes('foreign key constraint fails')) {
        return res.status(400).json({ 
          erro: 'Processo não encontrado. Verifique se o processo_id está correto.' 
        });
      }
      
      // Tratamento para erros de validação do Sequelize
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          erro: 'Dados inválidos: ' + error.errors.map(e => e.message).join(', ') 
        });
      }
      
      res.status(500).json({ erro: 'Erro interno do servidor: ' + error.message });
    }
  }
];

// Soft delete de arquivo
exports.softDeleteArquivo = async (req, res) => {
  try {
    const { id } = req.params;
    const arquivo = await Arquivo.findByPk(id);
    if (!arquivo) return res.status(404).json({ erro: 'Arquivo não encontrado' });
    // Como não há campo ativo, fazemos delete real
    await arquivo.destroy();
    res.json({ mensagem: 'Arquivo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};
// Listar arquivos de um processo específico
exports.listarArquivos = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const arquivos = await Arquivo.findAll({
      where: { processo_id, ativo: true },
      include: [
        { model: Processo, as: 'processo' },
        { model: Usuario, as: 'usuario' }
      ]
    });
    res.json(arquivos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Listar arquivos enviados por um usuário
exports.listarArquivosUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const arquivos = await Arquivo.findAll({
      where: { usuario_id, ativo: true },
      include: [
        { model: Processo, as: 'processo' },
        { model: Usuario, as: 'usuario' }
      ]
    });
    res.json(arquivos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Listar arquivos não anexados a processos (arquivos "soltos")
exports.listarArquivosNaoAnexados = async (req, res) => {
  try {
    const arquivos = await Arquivo.findAll({
      where: { 
        usuario_id: req.usuario.id,
        processo_id: null 
      },
      include: [
        { model: Usuario, as: 'usuario' }
      ],
      order: [['criado_em', 'DESC']]
    });
    res.json(arquivos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Anexar arquivo já enviado a um processo
exports.anexarArquivoExistente = async (req, res) => {
  try {
    let { processo_id, arquivo_id } = req.body;
    
    console.log('📎 Anexando arquivo:', { processo_id, arquivo_id });
    
    // Converter para números se necessário
    processo_id = parseInt(processo_id);
    arquivo_id = parseInt(arquivo_id);
    
    if (!processo_id || !arquivo_id || isNaN(processo_id) || isNaN(arquivo_id)) {
      return res.status(400).json({ erro: 'processo_id e arquivo_id são obrigatórios e devem ser números válidos' });
    }
    
    // Verificar se o processo existe
    const processoExiste = await Processo.findByPk(processo_id);
    if (!processoExiste) {
      return res.status(400).json({ erro: `Processo com ID ${processo_id} não encontrado` });
    }
    
    // Verificar se o arquivo existe
    const arquivo = await Arquivo.findByPk(arquivo_id);
    if (!arquivo) {
      return res.status(400).json({ erro: `Arquivo com ID ${arquivo_id} não encontrado` });
    }
    
    // Verificar se o usuário tem permissão (arquivo pertence ao usuário)
    if (arquivo.usuario_id !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você não tem permissão para anexar este arquivo' });
    }
    
    // Atualizar o processo_id do arquivo
    await arquivo.update({ processo_id: processo_id });
    
    res.json({ 
      mensagem: 'Arquivo anexado ao processo com sucesso',
      arquivo: {
        id: arquivo.id,
        nome: arquivo.nome,
        processo_id: processo_id
      }
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Desvincular arquivo de um processo
exports.desvincularArquivo = async (req, res) => {
  try {
    const { id } = req.params;
    const arquivo = await Arquivo.findByPk(id);

    if (!arquivo) {
      return res.status(404).json({ erro: 'Arquivo não encontrado' });
    }

    // Remove o vínculo do arquivo com o processo
    arquivo.processo_id = null;
    await arquivo.save();

    res.json({ mensagem: 'Arquivo desvinculado do processo com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};