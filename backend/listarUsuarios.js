const { usuariosModels } = require('./models/indexModels');

async function listarUsuarios() {
    try {
        const users = await usuariosModels.findAll();
        console.log('👥 Usuários encontrados:');
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Email: ${u.email}, Nome: ${u.nome}, Ativo: ${u.ativo}`);
        });
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

listarUsuarios();
