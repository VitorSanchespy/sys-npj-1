const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// Configuração do banco
const db = new Sequelize('npjdatabase', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// Modelo simples do usuário
const Usuario = db.define('usuarios', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

async function resetarSenhaAdmin() {
  try {
    await db.authenticate();
    console.log('🔧 Resetando senha do admin@npj.com...');
    
    // Nova senha: admin123
    const novaSenha = 'admin123';
    const senhaHash = await bcrypt.hash(novaSenha, 12);
    
    // Atualizar a senha
    const resultado = await Usuario.update(
      { senha: senhaHash },
      { where: { email: 'admin@npj.com' } }
    );
    
    if (resultado[0] > 0) {
      console.log(`✅ Senha resetada com sucesso!`);
      console.log(`📧 Email: admin@npj.com`);
      console.log(`🔐 Nova senha: ${novaSenha}`);
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

resetarSenhaAdmin();
