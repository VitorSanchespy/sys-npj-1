-- Script para inicializar banco de teste do NPJ (MySQL)
-- Execute este script no seu MySQL local (ex: via MySQL Workbench, DBeaver ou linha de comando)

CREATE DATABASE IF NOT EXISTS npj_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'test_user'@'localhost' IDENTIFIED BY 'test_password';

GRANT ALL PRIVILEGES ON npj_test.* TO 'test_user'@'localhost';

FLUSH PRIVILEGES;

-- Para rodar via terminal:
-- mysql -u root -p < scripts/init-npj-test-db.sql
