// ========================================
// Script para Criar Usuário Admin Inicial
// ========================================

require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./sequelize');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../env/main.env') });
const Usuario = require('../models/usuarioModel');
const Role = require('../models/roleModel');

async function createAdminUser() {
  try {
    // Testar conexão com o banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida.');

    // Verificar se o admin já existe
    const adminExists = await Usuario.findOne({
      where: { email: 'admin@npj.com' }
    });

    if (adminExists) {
      console.log('⚠️  Usuário admin já existe.');
      return;
    }

    // Verificar se a role Admin existe
    const adminRole = await Role.findOne({
      where: { nome: 'Admin' }
    });

    if (!adminRole) {
      console.log('❌ Role Admin não encontrada. Execute as migrations primeiro.');
      return;
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash('admin123', 10);

    // Criar usuário admin
    const admin = await Usuario.create({
      nome: 'Administrador Sistema',
      email: 'admin@npj.com',
      senha: senhaHash,
      role_id: adminRole.id,
      ativo: true,
      telefone: '(65) 99999-9999'
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email: admin@npj.com');
    console.log('🔑 Senha: admin123');
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;
