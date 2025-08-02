// Controller de Arquivos simplificado
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir tipos comuns de arquivo
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|rtf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

// Dados mock para desenvolvimento
const getMockData = () => {
  try {
    return require('../utils/mockData');
  } catch (error) {
    return {
      arquivos: [
        {
          id: 1,
          nome_original: 'documento_teste.pdf',
          nome_arquivo: 'arquivo-123456789.pdf',
          caminho: '/uploads/arquivo-123456789.pdf',
          tamanho: 1024000,
          tipo: 'application/pdf',
          idprocesso: 1,
          idusuario: 1,
          data_upload: new Date().toISOString()
        }
      ]
    };
  }
};

// Upload de arquivo
exports.uploadArquivo = [
  upload.single('arquivo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo foi enviado' });
      }
      
      const { idprocesso, descricao } = req.body;
      
      const arquivoData = {
        nome_original: req.file.originalname,
        nome_arquivo: req.file.filename,
        caminho: `/uploads/${req.file.filename}`,
        tamanho: req.file.size,
        tipo: req.file.mimetype,
        idprocesso: idprocesso ? parseInt(idprocesso) : null,
        idusuario: req.user.id,
        descricao: descricao || '',
        data_upload: new Date().toISOString()
      };
      
      if (isDbAvailable()) {
        const { arquivoModel: Arquivo } = require('../models/indexModel');
        const novoArquivo = await Arquivo.create(arquivoData);
        res.status(201).json(novoArquivo);
      } else {
        // Modo mock
        const novoArquivo = {
          id: Date.now(),
          ...arquivoData
        };
        res.status(201).json(novoArquivo);
      }
      
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
];

// Listar arquivos
exports.listarArquivos = async (req, res) => {
  try {
    const { idprocesso } = req.query;
    let arquivos = [];
    
    if (isDbAvailable()) {
      const { arquivoModel: Arquivo, usuarioModel: Usuario } = require('../models/indexModel');
      const where = idprocesso ? { idprocesso } : {};
      
      arquivos = await Arquivo.findAll({
        where,
        include: [{ model: Usuario, as: 'usuario' }],
        order: [['data_upload', 'DESC']]
      });
    } else {
      const mockData = getMockData();
      arquivos = mockData.arquivos;
      
      if (idprocesso) {
        arquivos = arquivos.filter(a => a.idprocesso == idprocesso);
      }
    }
    
    res.json(arquivos);
    
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Obter arquivo por ID
exports.obterArquivo = async (req, res) => {
  try {
    const { id } = req.params;
    let arquivo = null;
    
    if (isDbAvailable()) {
      const { arquivoModel: Arquivo, usuarioModel: Usuario } = require('../models/indexModel');
      arquivo = await Arquivo.findByPk(id, {
        include: [{ model: Usuario, as: 'usuario' }]
      });
    } else {
      const mockData = getMockData();
      arquivo = mockData.arquivos.find(a => a.id == id);
    }
    
    if (!arquivo) {
      return res.status(404).json({ erro: 'Arquivo não encontrado' });
    }
    
    res.json(arquivo);
    
  } catch (error) {
    console.error('Erro ao obter arquivo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Download de arquivo
exports.downloadArquivo = async (req, res) => {
  try {
    const { id } = req.params;
    let arquivo = null;
    
    if (isDbAvailable()) {
      const { arquivoModel: Arquivo } = require('../models/indexModel');
      arquivo = await Arquivo.findByPk(id);
    } else {
      const mockData = getMockData();
      arquivo = mockData.arquivos.find(a => a.id == id);
    }
    
    if (!arquivo) {
      return res.status(404).json({ erro: 'Arquivo não encontrado' });
    }
    
    const caminhoArquivo = path.join(__dirname, '../uploads', arquivo.nome_arquivo);
    
    if (!fs.existsSync(caminhoArquivo)) {
      return res.status(404).json({ erro: 'Arquivo físico não encontrado' });
    }
    
    res.download(caminhoArquivo, arquivo.nome_original);
    
  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar arquivo
exports.deletarArquivo = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbAvailable()) {
      const { arquivoModel: Arquivo } = require('../models/indexModel');
      
      const arquivo = await Arquivo.findByPk(id);
      if (!arquivo) {
        return res.status(404).json({ erro: 'Arquivo não encontrado' });
      }
      
      // Deletar arquivo físico
      const caminhoArquivo = path.join(__dirname, '../uploads', arquivo.nome_arquivo);
      if (fs.existsSync(caminhoArquivo)) {
        fs.unlinkSync(caminhoArquivo);
      }
      
      await arquivo.destroy();
      res.json({ message: 'Arquivo deletado com sucesso' });
      
    } else {
      // Modo mock
      res.json({ message: 'Arquivo deletado com sucesso (modo desenvolvimento)' });
    }
    
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
