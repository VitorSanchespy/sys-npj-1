// Listar arquivos de um usuário específico
exports.listarArquivosPorUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;
    
    // Verificar permissões: Aluno só pode ver seus próprios arquivos
    if (userRole === 'Aluno' && parseInt(id) !== userId) {
      return res.status(403).json({ 
        erro: 'Acesso negado. Alunos só podem visualizar seus próprios arquivos.' 
      });
    }
    
    const { arquivoModel: Arquivo, usuarioModel: Usuario } = require('../models/indexModel');
    const arquivos = await Arquivo.findAll({
      where: { usuario_id: id, ativo: true },
      include: [{ model: Usuario, as: 'usuario', attributes: ['nome', 'email'] }],
      order: [['criado_em', 'DESC']]
    });
    res.json(arquivos);
  } catch (error) {
    console.error('Erro ao listar arquivos do usuário:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const path = require('path');
const fs = require('fs');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Upload de arquivo
exports.uploadArquivo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo foi enviado' });
    }
    const { processo_id, usuario_id, nome, descricao } = req.body;
    // Bloquear upload se processo estiver concluído
    if (processo_id) {
      const { processoModel: Processo } = require('../models/indexModel');
      const processo = await Processo.findByPk(processo_id);
      if (processo && processo.status === 'Concluído') {
        return res.status(403).json({ erro: 'Processo concluído não pode receber novos documentos. Reabra para modificar.' });
      }
    }
    const arquivoData = {
      nome: nome || req.file.originalname,
      nome_original: req.file.originalname,
      descricao: descricao || null,
      caminho: `/uploads/${req.file.filename}`,
      tamanho: req.file.size,
      tipo: req.file.mimetype,
      processo_id: processo_id ? parseInt(processo_id) : null,
      usuario_id: usuario_id ? parseInt(usuario_id) : req.user.id
    };
    const { arquivoModel: Arquivo } = require('../models/indexModel');
    const novoArquivo = await Arquivo.create(arquivoData);
    res.status(201).json(novoArquivo);
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
    const { arquivoModel: Arquivo, usuarioModel: Usuario } = require('../models/indexModel');
    const where = processoId ? { processo_id: processoId } : {};
    if (incluir_inativos !== 'true') {
      where.ativo = true;
    }
    const arquivos = await Arquivo.findAll({
      where,
      include: [{ model: Usuario, as: 'usuario', attributes: ['nome', 'email'] }],
      order: [['criado_em', 'DESC']]
    });
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
    const { arquivoModel: Arquivo, usuarioModel: Usuario } = require('../models/indexModel');
    const arquivo = await Arquivo.findByPk(id, {
      include: [{ model: Usuario, as: 'usuario' }]
    });
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
    const { arquivoModel: Arquivo } = require('../models/indexModel');
    const arquivo = await Arquivo.findByPk(id);
    if (!arquivo) {
      return res.status(404).json({ erro: 'Arquivo não encontrado' });
    }
    const nomeArquivo = arquivo.caminho.split('/').pop();
    const caminhoArquivo = path.join(__dirname, '../uploads', nomeArquivo);
    if (!fs.existsSync(caminhoArquivo)) {
      return res.status(404).json({ erro: 'Arquivo físico não encontrado' });
    }
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
    const { arquivoModel: Arquivo, processoModel: Processo } = require('../models/indexModel');
    const arquivo = await Arquivo.findByPk(id);
    if (!arquivo) {
      return res.status(404).json({ erro: 'Arquivo não encontrado' });
    }
    // Bloquear exclusão se processo estiver concluído
    if (arquivo.processo_id) {
      const processo = await Processo.findByPk(arquivo.processo_id);
      if (processo && processo.status === 'Concluído') {
        return res.status(403).json({ erro: 'Processo concluído não pode ser alterado. Reabra para modificar.' });
      }
    }
    await arquivo.update({ ativo: false });
    if (!arquivo.processo_id) {
      const nomeArquivo = arquivo.caminho.split('/').pop();
      const caminhoArquivo = path.join(__dirname, '../uploads', nomeArquivo);
      if (fs.existsSync(caminhoArquivo)) {
        try {
          fs.unlinkSync(caminhoArquivo);
        } catch (fsError) {
          console.log('Erro ao deletar arquivo físico:', fsError.message);
        }
      }
    }
    res.json({ 
      message: 'Arquivo removido com sucesso',
      vinculado_processo: !!arquivo.processo_id,
      info: arquivo.processo_id ? 'Arquivo mantido no processo para preservar histórico' : 'Arquivo completamente removido'
    });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
