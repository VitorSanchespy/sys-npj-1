const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  const { nome, email, password, role } = req.body;

  // Validate inputs
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'E-mail, senha e papel (role) são obrigatórios.' });
  }

  console.log('Tentativa de registro:', email);

  // Check if user already exists
  await User.findByEmail(email, (err, results) => {
    if (err) {
      console.error('Erro ao verificar e-mail existente:', err);
      return res.status(500).json({ message: 'Erro no servidor, tente novamente.' });
    }

    if (results.length > 0) {
      console.log('Usuário já existe:', email);
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Erro ao criar hash da senha:', err);
        return res.status(500).json({ message: 'Erro ao registrar usuário, tente novamente.' });
      }

      // Create new user
      const newUser = { nome, email, senha: hash, tipo_usuario: role };

      User.create(newUser, (err, results) => {
        if (err) {
          console.error('Erro ao criar usuário:', err);
          return res.status(500).json({ message: 'Erro ao salvar usuário no banco de dados.' });
        }

        console.log('Usuário registrado com sucesso:', email);
        res.status(201).json({ message: 'Usuário registrado com sucesso.' });
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  console.log('Tentativa de login:', email);

  User.findByEmail(email, (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ message: 'Erro no servidor, tente novamente.' });
    }

    if (results.length === 0) {
      console.log('Usuário não encontrado:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const user = results[0];

    // Log both the password and the hash for debugging
    console.log('Password recebido:', password);
    console.log('Hash de senha armazenado:', user.senha);

    // Check if password or stored hash is undefined
    if (!password || !user.senha) {
      console.log('Erro: Senha ou hash ausente');
      return res.status(500).json({ message: 'Erro no processo de login' });
    }

    bcrypt.compare(password, user.senha, (err, match) => {
      if (err) {
        console.error('Erro ao comparar senhas:', err);
        return res.status(500).json({ message: 'Erro ao comparar as senhas.' });
      }

      if (!match) {
        console.log('Senha incorreta para o usuário:', email);
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.tipo_usuario },
        'secreto',
        { expiresIn: '1h' }
      );

      console.log('Login bem-sucedido para:', email);

      res.json({
        token,
        usuario: {
          id: user.id,
          email: user.email,
          name: user.nome,
          role: user.tipo_usuario,
        },
      });
    });
  });
};
