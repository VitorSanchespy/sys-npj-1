<<<<<<< HEAD


const upload = require('../utils/uploadMiddleware');
=======
// Controlador para Arquivos
const upload = require('../middleware/uploadMiddleware');
>>>>>>> 631e91f783120f46177e0e5e9cc8462e2edf0526
const { arquivoModels: Arquivo, processoModels: Processo, usuariosModels: Usuario } = require('../models/indexModels');

// Upload de arquivo
exports.uploadArquivo = [
  upload.single('arquivo'), // 'arquivo' é o nome do campo no form
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
      }

      const { processo_id } = req.body;
      const { id: usuarioId } = req.usuario;

      const novoArquivo = await Arquivo.create({
        nome_original: req.file.originalname,
        nome_arquivo: req.file.filename,
        caminho: req.file.path,
        tipo: req.file.mimetype,
        tamanho: req.file.size,
        usuario_id: usuarioId,
        processo_id: processo_id || null,
        ativo: true
      });

      res.status(201).json({
        mensagem: 'Arquivo enviado com sucesso',
        arquivo: novoArquivo
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
];

// Listar arquivos por processo
exports.listarArquivosPorProcesso = async (req, res) => {
  try {
    const { processo_id } = req.params;
    
    const arquivos = await Arquivo.findAll({
      where: { 
        processo_id,
        ativo: true
      },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['nome']
      }],
      order: [['criado_em', 'DESC']]
    });

    res.json(arquivos);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Buscar arquivo por ID
exports.buscarArquivoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const arquivo = await Arquivo.findOne({
      where: { 
        id,
        ativo: true
      },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['nome']
      }]
    });

    if (!arquivo) {
      return res.status(404).json({ erro: 'Arquivo não encontrado' });
    }

    res.json(arquivo);
  } catch (error) {
    console.error('Erro ao buscar arquivo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar arquivo (soft delete)
exports.deletarArquivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: usuarioId } = req.usuario;

    const arquivo = await Arquivo.findByPk(id);
    
    if (!arquivo) {
      return res.status(404).json({ erro: 'Arquivo não encontrado' });
    }

    // Verificar se o usuário é o dono do arquivo
    if (arquivo.usuario_id !== usuarioId) {
      return res.status(403).json({ erro: 'Sem permissão para deletar este arquivo' });
    }

    // Soft delete
    arquivo.ativo = false;
    await arquivo.save();

    res.json({ mensagem: 'Arquivo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Soft delete de arquivo (alias para compatibilidade)
exports.softDeleteArquivo = exports.deletarArquivo;

// Listar todos os arquivos ativos
exports.listarArquivos = async (req, res) => {
  try {
    const arquivos = await Arquivo.findAll({
      where: { ativo: true },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['nome']
      }],
      order: [['criado_em', 'DESC']]
    });

    res.json(arquivos);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Listar arquivos de um usuário
exports.listarArquivosUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    
    const arquivos = await Arquivo.findAll({
      where: { 
        usuario_id,
        ativo: true 
      },
      include: [{
        model: Processo,
        as: 'processo',
        attributes: ['numero', 'titulo']
      }],
      order: [['criado_em', 'DESC']]
    });

    res.json(arquivos);
  } catch (error) {
    console.error('Erro ao listar arquivos do usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Anexar arquivo existente a um processo
exports.anexarArquivoExistente = async (req, res) => {
  try {
    const { arquivo_id, processo_id } = req.body;
    const { id: usuarioId } = req.usuario;

    const arquivo = await Arquivo.findOne({
      where: { 
        id: arquivo_id,
        usuario_id: usuarioId,
        ativo: true
      }
    });

    if (!arquivo) {
      return res.status(404).json({ erro: 'Arquivo não encontrado ou sem permissão' });
    }

    arquivo.processo_id = processo_id;
    await arquivo.save();

    res.json({ mensagem: 'Arquivo anexado ao processo com sucesso' });
  } catch (error) {
    console.error('Erro ao anexar arquivo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Desvincular arquivo de um processo
exports.desvincularArquivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: usuarioId } = req.usuario;

    const arquivo = await Arquivo.findOne({
      where: {
        id,
        usuario_id: usuarioId,
        ativo: true
      }
    });

    if (!arquivo) {
      return res.status(404).json({ erro: 'Arquivo não encontrado ou sem permissão' });
    }

    arquivo.processo_id = null;
    await arquivo.save();

    res.json({ mensagem: 'Arquivo desvinculado do processo com sucesso' });
  } catch (error) {
    console.error('Erro ao desvincular arquivo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};