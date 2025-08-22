/**
 * Script para extrair estrutura completa do banco de dados atual
 * e gerar arquivo init_0.sql
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuração do banco (usando as mesmas configurações do sistema)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'npjdatabase',
  port: process.env.DB_PORT || 3306
};

console.log('🔍 Conectando ao banco de dados:', {
  host: dbConfig.host,
  database: dbConfig.database,
  port: dbConfig.port,
  user: dbConfig.user
});

async function extractDatabaseStructure() {
  let connection;
  
  try {
    // Conectar ao banco
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');
    
    // Obter lista de todas as tabelas
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    console.log(`📋 Encontradas ${tables.length} tabelas:`, tables.map(t => t.TABLE_NAME));
    
    let sqlOutput = '';
    
    // Cabeçalho do arquivo
    sqlOutput += `-- ========================================
-- Estrutura Completa do Banco NPJ Database
-- Sistema NPJ - Núcleo de Prática Jurídica
-- Extraído automaticamente em: ${new Date().toLocaleDateString('pt-BR')}
-- ========================================

-- Configurações iniciais
SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ========================================
-- TABELAS PRINCIPAIS
-- ========================================

`;

    // Para cada tabela, extrair estrutura
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      
      // Pular SequelizeMeta pois vamos removê-la
      if (tableName === 'SequelizeMeta' || tableName === 'sequelizemeta') {
        continue;
      }
      
      console.log(`📊 Extraindo estrutura da tabela: ${tableName}`);
      
      sqlOutput += `-- Tabela: ${tableName}\n`;
      
      // Obter CREATE TABLE statement
      const [createTable] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
      const createStatement = createTable[0]['Create Table'];
      
      // Adicionar DROP TABLE IF EXISTS
      sqlOutput += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlOutput += createStatement + ';\n\n';
      sqlOutput += '-- ========================================\n\n';
    }
    
    // Seção de dados básicos
    sqlOutput += `-- ========================================
-- INSERIR DADOS BÁSICOS ESSENCIAIS
-- ========================================

`;

    // Extrair dados essenciais de tabelas de configuração
    const essentialTables = ['roles', 'diligencia', 'fase', 'materia_assunto', 'local_tramitacao'];
    
    for (const tableName of essentialTables) {
      const tableExists = tables.find(t => t.TABLE_NAME === tableName);
      
      if (tableExists) {
        console.log(`📝 Extraindo dados básicos de: ${tableName}`);
        
        const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\` ORDER BY id`);
        
        if (rows.length > 0) {
          sqlOutput += `-- Inserir dados básicos de ${tableName}\n`;
          
          // Obter nomes das colunas
          const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION
          `, [dbConfig.database, tableName]);
          
          const columnNames = columns.map(c => c.COLUMN_NAME);
          
          // Gerar INSERT statements
          sqlOutput += `INSERT INTO \`${tableName}\` (\`${columnNames.join('`, `')}\`) VALUES\n`;
          
          const values = rows.map(row => {
            const rowValues = columnNames.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
              if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
              return value;
            });
            return `(${rowValues.join(', ')})`;
          });
          
          sqlOutput += values.join(',\n') + ';\n\n';
        }
      }
    }
    
    // Finalização
    sqlOutput += `-- Reativar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- FIM DO SCRIPT
-- ========================================

-- Mensagem de conclusão
SELECT '✅ Banco de dados NPJ criado com sucesso!' as status,
       '📊 Todas as tabelas foram criadas' as tabelas,
       '🔗 Relacionamentos configurados' as relacionamentos,
       '📝 Dados iniciais inseridos' as dados,
       '🎯 Sistema pronto para uso!' as resultado;
`;
    
    // Salvar arquivo
    const outputPath = path.join(__dirname, 'init_0.sql');
    fs.writeFileSync(outputPath, sqlOutput, 'utf8');
    
    console.log('✅ Arquivo init_0.sql criado com sucesso!');
    console.log(`📁 Local: ${outputPath}`);
    console.log(`📊 Tamanho: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Erro ao extrair estrutura do banco:', error.message);
    
    // Se não conseguir conectar, vamos usar uma estrutura baseada no seu arquivo legado
    console.log('🔄 Gerando estrutura baseada no arquivo legado...');
    generateFromLegacy();
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

function generateFromLegacy() {
  console.log('📋 Usando estrutura do arquivo legado como base...');
  
  const legacySql = `-- ========================================
-- Estrutura Completa do Banco NPJ Database
-- Sistema NPJ - Núcleo de Prática Jurídica
-- Atualizado: ${new Date().toLocaleDateString('pt-BR')}
-- ========================================

-- Configurações iniciais
SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ========================================
-- TABELAS PRINCIPAIS
-- ========================================

-- Tabela: roles
DROP TABLE IF EXISTS \`roles\`;
CREATE TABLE \`roles\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`nome\` varchar(50) NOT NULL,
  \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`nome\` (\`nome\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: usuarios
DROP TABLE IF EXISTS \`usuarios\`;
CREATE TABLE \`usuarios\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`nome\` varchar(100) NOT NULL,
  \`email\` varchar(100) NOT NULL,
  \`senha\` varchar(255) NOT NULL,
  \`role_id\` int NOT NULL,
  \`criado_em\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`ativo\` tinyint(1) DEFAULT '1',
  \`telefone\` varchar(20) DEFAULT NULL,
  \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`email\` (\`email\`),
  KEY \`role_id\` (\`role_id\`),
  CONSTRAINT \`usuarios_ibfk_1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: diligencia
DROP TABLE IF EXISTS \`diligencia\`;
CREATE TABLE \`diligencia\` (
  \`id\` int unsigned NOT NULL AUTO_INCREMENT,
  \`nome\` varchar(100) NOT NULL,
  \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`diligencia_nome_unique\` (\`nome\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: fase
DROP TABLE IF EXISTS \`fase\`;
CREATE TABLE \`fase\` (
  \`id\` int unsigned NOT NULL AUTO_INCREMENT,
  \`nome\` varchar(100) NOT NULL,
  \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`fase_nome_unique\` (\`nome\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: materia_assunto
DROP TABLE IF EXISTS \`materia_assunto\`;
CREATE TABLE \`materia_assunto\` (
  \`id\` int unsigned NOT NULL AUTO_INCREMENT,
  \`nome\` varchar(100) NOT NULL,
  \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`materia_assunto_nome_unique\` (\`nome\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: local_tramitacao
DROP TABLE IF EXISTS \`local_tramitacao\`;
CREATE TABLE \`local_tramitacao\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`nome\` varchar(255) NOT NULL,
  \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: processos
DROP TABLE IF EXISTS \`processos\`;
CREATE TABLE \`processos\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`numero_processo\` varchar(50) NOT NULL,
  \`descricao\` text,
  \`criado_em\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`status\` varchar(30) DEFAULT NULL,
  \`tipo_processo\` varchar(50) DEFAULT NULL,
  \`idusuario_responsavel\` int DEFAULT NULL,
  \`data_encerramento\` timestamp NULL DEFAULT NULL,
  \`observacoes\` text,
  \`sistema\` enum('Físico','PEA','PJE') DEFAULT 'Físico',
  \`materia_assunto_id\` int unsigned DEFAULT NULL,
  \`fase_id\` int unsigned DEFAULT NULL,
  \`diligencia_id\` int unsigned DEFAULT NULL,
  \`num_processo_sei\` varchar(100) DEFAULT NULL,
  \`assistido\` varchar(100) DEFAULT NULL,
  \`contato_assistido\` varchar(255) DEFAULT NULL,
  \`local_tramitacao_id\` int DEFAULT NULL,
  \`titulo\` varchar(200) DEFAULT NULL,
  \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`numero_processo\` (\`numero_processo\`),
  KEY \`processos_idusuario_responsavel_foreign\` (\`idusuario_responsavel\`),
  KEY \`processos_materia_assunto_id_foreign\` (\`materia_assunto_id\`),
  KEY \`processos_fase_id_foreign\` (\`fase_id\`),
  KEY \`processos_diligencia_id_foreign\` (\`diligencia_id\`),
  KEY \`processos_local_tramitacao_id_foreign_idx\` (\`local_tramitacao_id\`),
  CONSTRAINT \`processos_diligencia_id_foreign\` FOREIGN KEY (\`diligencia_id\`) REFERENCES \`diligencia\` (\`id\`),
  CONSTRAINT \`processos_fase_id_foreign\` FOREIGN KEY (\`fase_id\`) REFERENCES \`fase\` (\`id\`),
  CONSTRAINT \`processos_idusuario_responsavel_foreign\` FOREIGN KEY (\`idusuario_responsavel\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT \`processos_local_tramitacao_id_foreign_idx\` FOREIGN KEY (\`local_tramitacao_id\`) REFERENCES \`local_tramitacao\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`processos_materia_assunto_id_foreign\` FOREIGN KEY (\`materia_assunto_id\`) REFERENCES \`materia_assunto\` (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: arquivos
DROP TABLE IF EXISTS \`arquivos\`;
CREATE TABLE \`arquivos\` (
  \`id\` int unsigned NOT NULL AUTO_INCREMENT,
  \`nome\` varchar(255) NOT NULL,
  \`nome_original\` varchar(255) NOT NULL,
  \`caminho\` varchar(255) NOT NULL,
  \`tamanho\` int NOT NULL,
  \`tipo\` varchar(255) NOT NULL,
  \`processo_id\` int DEFAULT NULL,
  \`usuario_id\` int NOT NULL,
  \`ativo\` tinyint(1) DEFAULT '1',
  \`criado_em\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`descricao\` text,
  \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`arquivos_processo_id_foreign\` (\`processo_id\`),
  KEY \`arquivos_usuario_id_foreign\` (\`usuario_id\`),
  CONSTRAINT \`arquivos_processo_id_foreign\` FOREIGN KEY (\`processo_id\`) REFERENCES \`processos\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`arquivos_usuario_id_foreign\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: atualizacoes_processo
DROP TABLE IF EXISTS \`atualizacoes_processo\`;
CREATE TABLE \`atualizacoes_processo\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`usuario_id\` int NOT NULL,
  \`processo_id\` int NOT NULL,
  \`arquivos_id\` int unsigned DEFAULT NULL,
  \`data_atualizacao\` datetime NOT NULL,
  \`tipo_atualizacao\` varchar(255) NOT NULL,
  \`descricao\` text,
  \`status\` varchar(50) DEFAULT 'pendente',
  \`observacoes\` text,
  \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`usuario_id\` (\`usuario_id\`),
  KEY \`processo_id\` (\`processo_id\`),
  KEY \`arquivos_id\` (\`arquivos_id\`),
  CONSTRAINT \`atualizacoes_processo_ibfk_1\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`atualizacoes_processo_ibfk_2\` FOREIGN KEY (\`processo_id\`) REFERENCES \`processos\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`atualizacoes_processo_ibfk_3\` FOREIGN KEY (\`arquivos_id\`) REFERENCES \`arquivos\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: usuarios_processo (Relacionamento Many-to-Many)
DROP TABLE IF EXISTS \`usuarios_processo\`;
CREATE TABLE \`usuarios_processo\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`usuario_id\` int NOT NULL,
  \`processo_id\` int NOT NULL,
  \`role\` varchar(50) DEFAULT 'observador',
  \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`usuarios_processo_usuario_id_processo_id\` (\`usuario_id\`,\`processo_id\`),
  KEY \`processo_id\` (\`processo_id\`),
  CONSTRAINT \`usuarios_processo_ibfk_1\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`usuarios_processo_ibfk_2\` FOREIGN KEY (\`processo_id\`) REFERENCES \`processos\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: agendamentos
DROP TABLE IF EXISTS \`agendamentos\`;
CREATE TABLE \`agendamentos\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`processo_id\` int DEFAULT NULL,
  \`usuario_id\` int NOT NULL,
  \`criado_por\` int NOT NULL,
  \`tipo_evento\` enum('audiencia','prazo','reuniao','diligencia','outro') NOT NULL,
  \`titulo\` varchar(200) NOT NULL,
  \`descricao\` text,
  \`data_inicio\` datetime NOT NULL,
  \`data_fim\` datetime DEFAULT NULL,
  \`local\` varchar(255) DEFAULT NULL,
  \`status\` enum('agendado','realizado','cancelado','adiado') DEFAULT 'agendado',
  \`lembrete_1_dia\` tinyint(1) DEFAULT '1',
  \`lembrete_2_dias\` tinyint(1) DEFAULT '1',
  \`lembrete_1_semana\` tinyint(1) DEFAULT '0',
  \`criado_em\` datetime DEFAULT CURRENT_TIMESTAMP,
  \`atualizado_em\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_processo_id\` (\`processo_id\`),
  KEY \`idx_usuario_id\` (\`usuario_id\`),
  KEY \`idx_criado_por\` (\`criado_por\`),
  KEY \`idx_data_inicio\` (\`data_inicio\`),
  KEY \`idx_status\` (\`status\`),
  CONSTRAINT \`agendamentos_processo_id_foreign\` FOREIGN KEY (\`processo_id\`) REFERENCES \`processos\` (\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`agendamentos_usuario_id_foreign\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`agendamentos_criado_por_foreign\` FOREIGN KEY (\`criado_por\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: refresh_tokens
DROP TABLE IF EXISTS \`refresh_tokens\`;
CREATE TABLE \`refresh_tokens\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`usuario_id\` int NOT NULL,
  \`token\` varchar(256) NOT NULL,
  \`expires_at\` datetime NOT NULL,
  \`revoked\` tinyint(1) DEFAULT '0',
  \`createdAt\` datetime DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`token\` (\`token\`),
  KEY \`idx_usuario_id\` (\`usuario_id\`),
  KEY \`idx_token\` (\`token\`),
  KEY \`idx_expires_at\` (\`expires_at\`),
  CONSTRAINT \`refresh_tokens_usuario_id_foreign\` FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuarios\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- INSERIR DADOS BÁSICOS ESSENCIAIS
-- ========================================

-- Inserir roles padrão
INSERT INTO \`roles\` (\`id\`, \`nome\`) VALUES
(1, 'Admin'),
(2, 'Professor'),
(3, 'Aluno');

-- Inserir dados básicos de diligências
INSERT INTO \`diligencia\` (\`nome\`) VALUES
('Audiência de Conciliação'),
('Audiência de Instrução'),
('Perícia Técnica'),
('Citação'),
('Intimação'),
('Apresentar Defesa'),
('Apresentar Recurso'),
('Juntada de Documentos');

-- Inserir dados básicos de fases
INSERT INTO \`fase\` (\`nome\`) VALUES
('Petição Inicial'),
('Citação'),
('Contestação'),
('Tréplica'),
('Saneamento'),
('Instrução'),
('Alegações Finais'),
('Sentença'),
('Recurso'),
('Execução');

-- Inserir dados básicos de matérias/assuntos
INSERT INTO \`materia_assunto\` (\`nome\`) VALUES
('Direito Civil'),
('Direito Penal'),
('Direito do Trabalho'),
('Direito Previdenciário'),
('Direito de Família'),
('Direito do Consumidor'),
('Direito Administrativo'),
('Direito Tributário'),
('Direito Empresarial'),
('Direito Ambiental');

-- Inserir dados básicos de local de tramitação
INSERT INTO \`local_tramitacao\` (\`nome\`) VALUES
('1ª Vara Cível de Cuiabá'),
('2ª Vara Cível de Cuiabá'),
('Vara de Família de Cuiabá'),
('Vara Criminal de Cuiabá'),
('Juizado Especial Cível'),
('Tribunal de Justiça - MT');

-- Reativar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- FIM DO SCRIPT
-- ========================================

-- Mensagem de conclusão
SELECT '✅ Banco de dados NPJ criado com sucesso!' as status,
       '📊 Todas as tabelas foram criadas' as tabelas,
       '🔗 Relacionamentos configurados' as relacionamentos,
       '📝 Dados iniciais inseridos' as dados,
       '🎯 Sistema pronto para uso!' as resultado;
`;

  // Salvar arquivo
  const outputPath = path.join(__dirname, 'init_0.sql');
  fs.writeFileSync(outputPath, legacySql, 'utf8');
  
  console.log('✅ Arquivo init_0.sql criado com base na estrutura legado!');
  console.log(`📁 Local: ${outputPath}`);
}

// Executar extração
extractDatabaseStructure();
