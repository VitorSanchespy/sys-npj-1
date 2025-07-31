const { usuariosModels: Usuario, rolesModels: Role } = require('./backend/models/indexModels');

async function verificarRoles() {
  try {
    console.log('🔍 VERIFICANDO ROLES NO BANCO...\n');

    // Listar todas as roles
    const roles = await Role.findAll();
    console.log('🔑 Roles encontradas:', roles.length);
    
    for (const role of roles) {
      console.log(`- ID: ${role.id}, Nome: ${role.nome}`);
    }

    console.log('\n👥 VERIFICANDO USUÁRIOS...\n');

    // Listar usuários com suas roles
    const usuarios = await Usuario.findAll({
      include: [{ model: Role, as: 'role' }]
    });

    console.log('👤 Usuários encontrados:', usuarios.length);
    
    for (const usuario of usuarios) {
      console.log(`- ${usuario.nome} (${usuario.email})`);
      console.log(`  Role ID: ${usuario.role_id}`);
      console.log(`  Role Nome: ${usuario.role?.nome || 'SEM ROLE'}`);
      console.log('---');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

verificarRoles();
