
-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS npjdatabase;
USE npjdatabase;

-- Tabela de roles (perfis de usuários)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL
);

-- Inserção de roles padrão
INSERT INTO roles (nome)
SELECT 'Admin' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nome = 'Admin');
INSERT INTO roles (nome)
SELECT 'Aluno' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nome = 'Aluno');
INSERT INTO roles (nome)
SELECT 'Professor' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nome = 'Professor');

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Inserir usuário admin, se não existir
INSERT INTO usuarios (nome, email, senha, role_id)
SELECT 'Admin User', 'admin@admin.com', 'admin', id FROM roles WHERE nome = 'Admin'
AND NOT EXISTS (
  SELECT 1 FROM usuarios WHERE email = 'admin@admin.com'
);

-- Tabela de processos
CREATE TABLE IF NOT EXISTS processos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_processo VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento entre alunos e processos
CREATE TABLE IF NOT EXISTS alunos_processos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  processo_id INT NOT NULL,
  data_atribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (usuario_id, processo_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (processo_id) REFERENCES processos(id)
);

-- Tabela de atualizações em processos
CREATE TABLE IF NOT EXISTS atualizacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  processo_id INT NOT NULL,
  descricao TEXT NOT NULL,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (processo_id) REFERENCES processos(id)
);
