
USE npjdatabase;

-- Inserir roles adicionais (caso não existam)
INSERT IGNORE INTO roles (nome) VALUES 
  ('Admin'), 
  ('Aluno'), 
  ('Professor');

-- Inserir usuarios
INSERT INTO usuarios (nome, email, senha, role_id)
VALUES 
  ('Joao Silva', 'joao@exemplo.com', 'senha123', 2),
  ('Maria Souza', 'maria@exemplo.com', 'senha123', 3),
  ('Carlos Admin', 'carlos@admin.com', 'admin', 1)
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- Inserir processos
INSERT INTO processos (numero_processo, descricao)
VALUES 
  ('PROC001', 'Processo sobre atendimento juridico civil'),
  ('PROC002', 'Processo sobre orientacao penal');

-- Relacionar alunos com processos
INSERT INTO alunos_processos (usuario_id, processo_id)
VALUES 
  (1, 1), -- Joao Silva no PROC001
  (1, 2); -- Joao Silva no PROC002

-- Inserir atualizacoes de processos
INSERT INTO atualizacoes (usuario_id, processo_id, descricao)
VALUES 
  (1, 1, 'Contato inicial com o cliente'),
  (2, 1, 'Revisao feita pelo professor Maria Souza'),
  (1, 2, 'Documentos recebidos do cliente');
