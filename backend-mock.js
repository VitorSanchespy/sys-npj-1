const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Middleware adicional para debug
app.use((req, res, next) => {
    console.log(`🔍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Mock do banco de dados
const mockUsers = [
    {
        id: 1,
        nome: 'Admin Teste',
        email: 'admin@test.com',
        senha: '$2b$10$8KJvbTZHh4Q6W5k8lB2YEuN8qNGrYwHoF9Z.5J7X6k4B1Q9cD8fC6', // senha: 123456
        role_id: 1,
        ativo: true,
        role: { id: 1, nome: 'Admin' }
    },
    {
        id: 2,
        nome: 'Professor Teste',
        email: 'professor@test.com',
        senha: '$2b$10$8KJvbTZHh4Q6W5k8lB2YEuN8qNGrYwHoF9Z.5J7X6k4B1Q9cD8fC6', // senha: 123456
        role_id: 2,
        ativo: true,
        role: { id: 2, nome: 'Professor' }
    },
    {
        id: 3,
        nome: 'Aluno Teste',
        email: 'aluno@test.com',
        senha: '$2b$10$8KJvbTZHh4Q6W5k8lB2YEuN8qNGrYwHoF9Z.5J7X6k4B1Q9cD8fC6', // senha: 123456
        role_id: 3,
        ativo: true,
        role: { id: 3, nome: 'Aluno' }
    }
];

// Rota de login mock
app.post('/auth/login', async (req, res) => {
    try {
        console.log('📥 Recebida requisição de login:', req.body);
        console.log('📋 Headers da requisição:', req.headers);
        
        const { email, senha } = req.body;
        
        if (!email || !senha) {
            console.log('❌ Dados incompletos:', { email: !!email, senha: !!senha });
            return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
        }
        
        // Buscar usuário mock
        const usuario = mockUsers.find(u => u.email === email && u.ativo);
        
        if (!usuario) {
            console.log('❌ Usuário não encontrado:', email);
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }
        
        // Verificar senha (aceitar 123456 ou senha hash)
        const bcrypt = require('bcryptjs');
        const senhaValida = await bcrypt.compare(senha, usuario.senha) || senha === '123456';
        
        if (!senhaValida) {
            console.log('❌ Senha inválida para:', email);
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }
        
        // Gerar token mock
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: usuario.id, role: usuario.role.nome },
            'seuSegredoSuperSecreto4321',
            { expiresIn: '24h' }
        );
        
        console.log('✅ Login bem-sucedido para:', usuario.nome);
        
        res.json({
            success: true,
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role.nome,
                role_id: usuario.role_id
            }
        });
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});

// Rota para verificar token
app.get('/auth/perfil', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }
    
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, 'seuSegredoSuperSecreto4321');
        const usuario = mockUsers.find(u => u.id === decoded.id);
        
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        
        res.json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role.nome
        });
    } catch (error) {
        console.error('Erro na verificação do token:', error);
        res.status(401).json({ erro: 'Token inválido' });
    }
});

// Rota de teste
app.get('/test', (req, res) => {
    console.log('🔍 Test endpoint accessed');
    res.json({ message: 'Servidor mock funcionando!', timestamp: new Date().toISOString() });
});

// Rota específica de debug para frontend
app.options('/auth/login', (req, res) => {
    console.log('🔍 OPTIONS /auth/login - CORS preflight');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

// Rota de status do servidor
app.get('/status', (req, res) => {
    console.log('🔍 Status check');
    res.json({ 
        status: 'online', 
        timestamp: new Date().toISOString(),
        endpoints: ['/auth/login', '/auth/perfil', '/test', '/status']
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor mock rodando na porta ${PORT}`);
    console.log('📧 Usuários de teste disponíveis:');
    mockUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role.nome}) - senha: 123456`);
    });
});
