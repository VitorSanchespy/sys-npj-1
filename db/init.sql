CREATE DATABASE IF NOT EXISTS npjdatabase;
USE npjdatabase;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  senha VARCHAR(255),
  tipo_usuario ENUM('admin', 'usuario') NOT NULL
);

-- Insert 'admin' user if it doesn't already exist
INSERT INTO usuarios (nome, email, senha, tipo_usuario)
SELECT 'Admin User', 'admin', 'admin', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'admin'
);