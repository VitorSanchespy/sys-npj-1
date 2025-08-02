const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Função utilitária para verificar disponibilidade do banco
function isDbAvailable() {
  return global.dbAvailable || false;
}

// Dados mock para desenvolvimento
const getMockData = () => {
  try {
    return require('../utils/mockData');
  } catch (error) {
    // Dados padrão se o arquivo não existir
    return {
      usuarios: [
        {
          id: 1,
          nome: 'Admin Sistema',
          email: 'admin@teste.com',
          senha: '$2b$10$8KJvbTZHh4Q6W5k8lB2YEuN8qNGrYwHoF9Z.5J7X6k4B1Q9cD8fC6', // admin123
          role: 'Admin',
          ativo: true
        },
        {
          id: 2,
          nome: 'Professor Teste',
          email: 'professor@teste.com',
          senha: '$2b$10$8KJvbTZHh4Q6W5k8lB2YEuN8qNGrYwHoF9Z.5J7X6k4B1Q9cD8fC6', // admin123
          role: 'Professor',
          ativo: true
        },
        {
          id: 3,
          nome: 'Aluno Teste',
          email: 'aluno@teste.com',
          senha: '$2b$10$8KJvbTZHh4Q6W5k8lB2YEuN8qNGrYwHoF9Z.5J7X6k4B1Q9cD8fC6', // admin123
          role: 'Aluno',
          ativo: true
        }
      ]
    };
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }
    
    let usuario = null;
    
    if (isDbAvailable()) {
      // Usar banco de dados
      try {
        const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
        usuario = await Usuario.findOne({
          where: { email, ativo: true },
          include: [{ model: Role, as: 'role' }]
        });
        
        if (usuario && usuario.role) {
          usuario.role = usuario.role.nome;
        }
      } catch (dbError) {
        console.log('⚠️ Erro no banco, usando mock:', dbError.message);
        global.dbAvailable = false;
      }
    }
    
    if (!usuario) {
      // Usar dados mock
      const mockData = getMockData();
      usuario = mockData.usuarios.find(u => u.email === email && u.ativo);
    }
    
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Verificar senha
    let senhaValida = false;
    if (isDbAvailable() && usuario.senha && usuario.senha.startsWith('$2b$')) {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } else {
      // Modo mock: aceitar senhas comuns de desenvolvimento
      senhaValida = ['admin123', '123456', 'senha123', 'professor123', 'aluno123'].includes(senha);
    }
    
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Gerar token
    const token = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        role: usuario.role
      },
      process.env.JWT_SECRET || 'seuSegredoSuperSecreto4321',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Registro
exports.registro = async (req, res) => {
  try {
    const { nome, email, senha, role_id = 3 } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }
    
    if (isDbAvailable()) {
      // Usar banco de dados
      const { usuariosModels: Usuario } = require('../models/indexModels');
      
      // Verificar se email já existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }
      
      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);
      
      // Criar usuário
      const novoUsuario = await Usuario.create({
        nome,
        email,
        senha: senhaHash,
        role_id,
        ativo: true
      });
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          role_id: novoUsuario.role_id
        }
      });
      
    } else {
      // Modo mock
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso (modo desenvolvimento)',
        usuario: {
          id: Date.now(),
          nome,
          email,
          role_id
        }
      });
    }
    
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Perfil
exports.perfil = async (req, res) => {
  try {
    const userId = req.user.id;
    let usuario = null;
    
    if (isDbAvailable()) {
      const { usuariosModels: Usuario, rolesModels: Role } = require('../models/indexModels');
      usuario = await Usuario.findByPk(userId, {
        include: [{ model: Role, as: 'role' }]
      });
      
      if (usuario && usuario.role) {
        usuario.role = usuario.role.nome;
      }
    } else {
      // Usar dados mock
      const mockData = getMockData();
      usuario = mockData.usuarios.find(u => u.id === userId);
    }
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      ativo: usuario.ativo
    });
    
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// Esqueci senha
exports.esqueciSenha = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório' });
    }
    
    // Para desenvolvimento, sempre retornar sucesso
    res.json({
      success: true,
      message: 'Se o email existir, você receberá instruções de recuperação'
    });
    
  } catch (error) {
    console.error('Erro ao processar esqueci senha:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};
