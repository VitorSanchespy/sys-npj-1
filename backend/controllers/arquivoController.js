const upload = require('../middleware/uploadMiddleware');
const Arquivo = require('../models/arquivo.js');

exports.uploadArquivo = [
  upload.single('arquivo'), // 'arquivo' é o nome do campo no form
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
      }

      // Garante que o caminho salvo seja sempre relativo à pasta uploads
      let caminhoRelativo = req.file.path.replace(/\\/g, '/');
      const idx = caminhoRelativo.indexOf('uploads/');
      if (idx !== -1) caminhoRelativo = caminhoRelativo.substring(idx);
      const metadados = {
        nome: req.file.originalname,
        caminho: caminhoRelativo,
        tamanho: req.file.size,
        tipo: req.file.mimetype,
        processo_id: req.body.processo_id && req.body.processo_id !== 'undefined' ? req.body.processo_id : null,
        usuario_id: req.usuario.id // Usuário autenticado
      };

      const id = await Arquivo.criar(metadados);
      res.status(201).json({ id, ...metadados });

    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: error.message });
    }
  }
];


exports.listarArquivos = async (req, res) => {
  try {
    const { processo_id } = req.params;
    const arquivos = await Arquivo.listarPorProcesso(processo_id);
    res.json(arquivos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Listar arquivos enviados por um usuário
exports.listarArquivosUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const arquivos = await Arquivo.listarPorUsuario(usuario_id);
    res.json(arquivos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Anexar arquivo já enviado a um processo
exports.anexarArquivoExistente = async (req, res) => {
  try {
    const { processo_id, arquivo_id } = req.body;
    if (!processo_id || !arquivo_id) {
      return res.status(400).json({ erro: 'processo_id e arquivo_id são obrigatórios' });
    }
    // Atualiza o processo_id do arquivo existente
    await Arquivo.anexarAProcesso(arquivo_id, processo_id);
    res.json({ mensagem: 'Arquivo anexado ao processo com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};