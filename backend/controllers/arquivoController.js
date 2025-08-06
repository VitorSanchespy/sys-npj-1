// Controller de Arquivos simplificado
const path = require('path');
const fs = require('fs');
const uploadMiddleware = require('../middleware/uploadMiddleware');

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
exports.uploadArquivo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo foi enviado' });
    }
    
    const { processo_id, usuario_id, nome, descricao } = req.body;

    const arquivoData = {
      nome: nome || req.file.originalname,
      nome_original: req.file.originalname,
      caminho: `/uploads/${req.file.filename}`,
      tamanho: req.file.size,
      tipo: req.file.mimetype,
      processo_id: processo_id ? parseInt(processo_id) : null,
      usuario_id: usuario_id ? parseInt(usuario_id) : req.user.id
    };

    if (isDbAvailable()) {
      const { arquivoModel: Arquivo } = require('../models/indexModel');
      const novoArquivo = await Arquivo.create(arquivoData);
      res.status(201).json(novoArquivo);
    } else {
      // Modo mock
      const novoArquivo = {
        id: Date.now(),
        ...arquivoData,
        criado_em: new Date().toISOString()
      };
      res.status(201).json(novoArquivo);
    }
      
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ erro: 'Erro interno do servidor', detalhes: error.message });
    }
};

// Listar arquivos
exports.listarArquivos = async (req, res) => {
  try {
    const { processo_id, idprocesso, incluir_inativos } = req.query;
    const processoId = processo_id || idprocesso;
    let arquivos = [];
    
    if (isDbAvailable()) {
      try {
        const { arquivoModel: Arquivo, usuarioModel: Usuario } = require('../models/indexModel');
        const where = processoId ? { processo_id: processoId } : {};
        
        // Por padrão, mostrar apenas arquivos ativos, exceto se explicitamente solicitado
        if (incluir_inativos !== 'true') {
          where.ativo = true;
        }
        
        arquivos = await Arquivo.findAll({
          where,
          include: [{ model: Usuario, as: 'usuario', attributes: ['nome', 'email'] }],
          order: [['criado_em', 'DESC']]
        });
      } catch (dbError) {
        console.log('Erro no banco, usando dados mock:', dbError.message);
        const mockData = getMockData();
        arquivos = mockData.arquivos;
        
        if (processoId) {
          arquivos = arquivos.filter(a => a.processo_id == processoId || a.idprocesso == processoId);
        }
      }
    } else {
      const mockData = getMockData();
      arquivos = mockData.arquivos;
      
      if (processoId) {
        arquivos = arquivos.filter(a => a.processo_id == processoId || a.idprocesso == processoId);
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
    
    // Extrair o nome do arquivo do caminho
    const nomeArquivo = arquivo.caminho.split('/').pop();
    const caminhoArquivo = path.join(__dirname, '../uploads', nomeArquivo);
    
    if (!fs.existsSync(caminhoArquivo)) {
      return res.status(404).json({ erro: 'Arquivo físico não encontrado' });
    }
    
    // Usar o nome original salvo no campo nome_original, ou o nome do arquivo se não existir
    const nomeDownload = arquivo.nome_original || arquivo.nome || nomeArquivo;
    res.download(caminhoArquivo, nomeDownload);
    
  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Deletar arquivo (Soft Delete)
exports.deletarArquivo = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isDbAvailable()) {
      const { arquivoModel: Arquivo } = require('../models/indexModel');
      
      const arquivo = await Arquivo.findByPk(id);
      if (!arquivo) {
        return res.status(404).json({ erro: 'Arquivo não encontrado' });
      }
      
      // Soft delete: marcar como inativo ao invés de deletar
      await arquivo.update({ ativo: false });
      
      // Se o arquivo não estiver vinculado a um processo, também pode deletar fisicamente
      if (!arquivo.processo_id) {
        const nomeArquivo = arquivo.caminho.split('/').pop();
        const caminhoArquivo = path.join(__dirname, '../uploads', nomeArquivo);
        if (fs.existsSync(caminhoArquivo)) {
          try {
            fs.unlinkSync(caminhoArquivo);
          } catch (fsError) {
            console.log('Erro ao deletar arquivo físico:', fsError.message);
            // Continua mesmo se não conseguir deletar o arquivo físico
          }
        }
      }
      
      res.json({ 
        message: 'Arquivo removido com sucesso',
        vinculado_processo: !!arquivo.processo_id,
        info: arquivo.processo_id ? 'Arquivo mantido no processo para preservar histórico' : 'Arquivo completamente removido'
      });
      
    } else {
      // Modo mock
      res.json({ message: 'Arquivo removido com sucesso (modo desenvolvimento)' });
    }
    
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
