const sequelize = require('./config/config.json');
const { Sequelize, DataTypes } = require('sequelize');

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

async function verificarAdmin() {
  try {
    await db.authenticate();
    console.log('🔍 Procurando usuário admin...');
    
    const admin = await Usuario.findOne({ 
      where: { email: 'admin@npj.com' } 
    });
    
    if (admin) {
      console.log('✅ Admin encontrado:');
      console.log('ID:', admin.id);
      console.log('Nome:', admin.nome);
      console.log('Email:', admin.email);
      console.log('Role ID:', admin.role_id);
      console.log('Ativo:', admin.ativo);
    } else {
      console.log('❌ Admin não encontrado');
    }
    
    // Listar todos os usuários com role_id 1 (admin)
    console.log('\n🔍 Usuários com role_id 1 (Admin):');
    const admins = await Usuario.findAll({ 
      where: { role_id: 1 },
      attributes: ['id', 'nome', 'email', 'role_id', 'ativo']
    });
    
    if (admins.length > 0) {
      admins.forEach(admin => {
        console.log(`- ${admin.email} (${admin.nome}) - ID: ${admin.id}`);
      });
    } else {
      console.log('❌ Nenhum usuário admin encontrado');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

verificarAdmin();
