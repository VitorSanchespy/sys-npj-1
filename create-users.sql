-- Script SQL para criar usuários do sistema NPJ
-- Execute este script no seu banco de dados MySQL
-- Data: 22/09/2025

-- Verificar se as roles existem (deve retornar 3 registros)
SELECT id, nome FROM roles ORDER BY id;

-- 1. Admin (role_id = 1)
INSERT INTO usuarios (nome, email, senha, role_id, ativo, telefone) VALUES
('Administrador', 'vitorhugosanchesyt@gmail.com', '$2b$10$4Vx0uZS9zNWCmE7fyfiiY.67JuXJZSPFtXtJ9R3.h5l1UwyEBwhhu', 1, 1, NULL);

-- 2. Professor (role_id = 2)
INSERT INTO usuarios (nome, email, senha, role_id, ativo, telefone) VALUES
('Professor Vitor', 'vitor.sanches@ufmt.br', '$2b$10$E.WfIi7BJ1570S2vq6Uo5uPZMwsDlgvcFcgCjhkAdzj/Bnju7VYo6', 2, 1, NULL);

-- 3. Aluno (role_id = 3)
INSERT INTO usuarios (nome, email, senha, role_id, ativo, telefone) VALUES
('Aluno', 'reidosotakos@gmail.com', '$2b$10$cZSclMhGiLcz6Obsjlp/YOAt9AO9nmcp7YDB799j5ZhAM/JbdPeAe', 3, 1, NULL);

-- Verificar se os usuários foram criados corretamente:
SELECT 
    u.id, 
    u.nome, 
    u.email, 
    u.role_id,
    r.nome as role_nome,
    u.ativo,
    u.criado_em
FROM usuarios u 
LEFT JOIN roles r ON u.role_id = r.id 
ORDER BY u.role_id;

-- Contar usuários por role
SELECT 
    r.nome as role,
    COUNT(u.id) as total_usuarios
FROM roles r
LEFT JOIN usuarios u ON r.id = u.role_id
GROUP BY r.id, r.nome
ORDER BY r.id;