const bcrypt = require('bcryptjs');
const { usuariosModels, rolesModels } = require('../../backend/models/indexModels');

async function criarUsuarioTeste() {
    try {
        // Verificar se o usuário já existe
        const usuarioExistente = await usuariosModels.findOne({
            where: { email: 'teste@agendamento.com' }
        });
        
        if (usuarioExistente) {
            console.log('👤 Usuário teste já existe, atualizando senha...');
            const senhaHash = await bcrypt.hash('teste123', 10);
            await usuarioExistente.update({ senha: senhaHash });
            console.log('✅ Senha atualizada!');
            return;
        }
        
        // Buscar role de administrador (assumindo que existe)
        const roleAdmin = await rolesModels.findOne({ where: { nome: 'administrador' } });
        const roleId = roleAdmin ? roleAdmin.id : 1; // fallback para ID 1
        
        // Hash da senha
        const senhaHash = await bcrypt.hash('teste123', 10);
        
        // Criar usuário
        const novoUsuario = await usuariosModels.create({
            nome: 'Usuário Teste Agendamento',
            email: 'teste@agendamento.com',
            senha: senhaHash,
            role_id: roleId,
            ativo: true
        });
        
        console.log('✅ Usuário teste criado:', {
            id: novoUsuario.id,
            email: novoUsuario.email,
            nome: novoUsuario.nome
        });
        console.log('🔑 Use as credenciais:');
        console.log('   Email: teste@agendamento.com');
        console.log('   Senha: teste123');
        
    } catch (error) {
        console.error('❌ Erro ao criar usuário:', error.message);
    }
}

criarUsuarioTeste();
