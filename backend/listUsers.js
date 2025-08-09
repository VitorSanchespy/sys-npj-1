const { usuarioModel: Usuario, roleModel: Role } = require('./models/indexModel');

async function listarUsuarios() {
  try {
    console.log('✅ Verificando usuários...');
    
    const usuarios = await Usuario.findAll({
      include: [{ model: Role, as: 'role' }],
      where: { ativo: true }
    });
    
    console.log('📋 Usuários encontrados:');
    usuarios.forEach(u => {
      console.log(`- ${u.nome} (${u.email}) - Role: ${u.role?.nome || 'Sem role'}`);
    });
    
    if (usuarios.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

listarUsuarios();
