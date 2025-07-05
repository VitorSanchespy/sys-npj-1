const upload = require('../middleware/uploadMiddleware');
const Arquivo = require('../models/arquivo.js');

exports.uploadArquivo = [
  upload.single('arquivo'), // 'arquivo' é o nome do campo no form
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
      }

      const metadados = {
        nome: req.file.originalname,
        caminho: req.file.path,
        tamanho: req.file.size,
        tipo: req.file.mimetype,
        processo_id: req.body.processo_id, // ID do processo relacionado
        usuario_id: req.usuario.id // Usuário autenticado
      };

      const id = await Arquivo.criar(metadados);
      res.status(201).json({ id, ...metadados });

    } catch (error) {
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