-- ========================================
-- Estrutura Completa do Banco NPJ Database
-- Sistema NPJ - Núcleo de Prática Jurídica
-- Atualizado: 29 de Janeiro de 2025
-- ========================================

-- Configurações iniciais
SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';

-- ========================================
-- TABELAS PRINCIPAIS
-- ========================================

-- Tabela: roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Inserir roles padrão
INSERT INTO `roles` (`id`, `nome`) VALUES
(1, 'Admin'),
(2, 'Professor'),
(3, 'Aluno'),
(4, 'Coordenador');

-- ========================================

-- Tabela: usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ativo` tinyint(1) DEFAULT '1',
  `telefone` varchar(20) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: diligencia
DROP TABLE IF EXISTS `diligencia`;
CREATE TABLE `diligencia` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `diligencia_nome_unique` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: fase
DROP TABLE IF EXISTS `fase`;
CREATE TABLE `fase` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fase_nome_unique` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: materia_assunto
DROP TABLE IF EXISTS `materia_assunto`;
CREATE TABLE `materia_assunto` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `materia_assunto_nome_unique` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: local_tramitacao
DROP TABLE IF EXISTS `local_tramitacao`;
CREATE TABLE `local_tramitacao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: processos
DROP TABLE IF EXISTS `processos`;
CREATE TABLE `processos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_processo` varchar(50) NOT NULL,
  `descricao` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(30) DEFAULT NULL,
  `tipo_processo` varchar(50) DEFAULT NULL,
  `idusuario_responsavel` int DEFAULT NULL,
  `data_encerramento` timestamp NULL DEFAULT NULL,
  `observacoes` text,
  `sistema` enum('Físico','PEA','PJE') DEFAULT 'Físico',
  `materia_assunto_id` int unsigned DEFAULT NULL,
  `fase_id` int unsigned DEFAULT NULL,
  `diligencia_id` int unsigned DEFAULT NULL,
  `num_processo_sei` varchar(100) DEFAULT NULL,
  `assistido` varchar(100) DEFAULT NULL,
  `contato_assistido` varchar(255) DEFAULT NULL,
  `local_tramitacao_id` int DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_processo` (`numero_processo`),
  KEY `processos_idusuario_responsavel_foreign` (`idusuario_responsavel`),
  KEY `processos_materia_assunto_id_foreign` (`materia_assunto_id`),
  KEY `processos_fase_id_foreign` (`fase_id`),
  KEY `processos_diligencia_id_foreign` (`diligencia_id`),
  KEY `processos_local_tramitacao_id_foreign_idx` (`local_tramitacao_id`),
  CONSTRAINT `processos_diligencia_id_foreign` FOREIGN KEY (`diligencia_id`) REFERENCES `diligencia` (`id`),
  CONSTRAINT `processos_fase_id_foreign` FOREIGN KEY (`fase_id`) REFERENCES `fase` (`id`),
  CONSTRAINT `processos_idusuario_responsavel_foreign` FOREIGN KEY (`idusuario_responsavel`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `processos_local_tramitacao_id_foreign_idx` FOREIGN KEY (`local_tramitacao_id`) REFERENCES `local_tramitacao` (`id`) ON DELETE SET NULL,
  CONSTRAINT `processos_materia_assunto_id_foreign` FOREIGN KEY (`materia_assunto_id`) REFERENCES `materia_assunto` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: arquivos
DROP TABLE IF EXISTS `arquivos`;
CREATE TABLE `arquivos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `nome_original` varchar(255) NOT NULL,
  `caminho` varchar(255) NOT NULL,
  `tamanho` int NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `processo_id` int DEFAULT NULL,
  `usuario_id` int NOT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `arquivos_processo_id_foreign` (`processo_id`),
  KEY `arquivos_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `arquivos_processo_id_foreign` FOREIGN KEY (`processo_id`) REFERENCES `processos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `arquivos_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: atualizacoes_processo
DROP TABLE IF EXISTS `atualizacoes_processo`;
CREATE TABLE `atualizacoes_processo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `processo_id` int NOT NULL,
  `arquivos_id` int unsigned DEFAULT NULL,
  `data_atualizacao` datetime NOT NULL,
  `tipo_atualizacao` varchar(255) NOT NULL,
  `descricao` text,
  `status` varchar(50) DEFAULT 'pendente',
  `observacoes` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `processo_id` (`processo_id`),
  KEY `arquivos_id` (`arquivos_id`),
  CONSTRAINT `atualizacoes_processo_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `atualizacoes_processo_ibfk_2` FOREIGN KEY (`processo_id`) REFERENCES `processos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `atualizacoes_processo_ibfk_3` FOREIGN KEY (`arquivos_id`) REFERENCES `arquivos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: usuarios_processo (Relacionamento Many-to-Many)
DROP TABLE IF EXISTS `usuarios_processo`;
CREATE TABLE `usuarios_processo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `processo_id` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_processo_usuario_id_processo_id` (`usuario_id`,`processo_id`),
  KEY `processo_id` (`processo_id`),
  CONSTRAINT `usuarios_processo_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuarios_processo_ibfk_2` FOREIGN KEY (`processo_id`) REFERENCES `processos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- NOVAS TABELAS (AGENDAMENTOS E NOTIFICAÇÕES)
-- ========================================

-- Tabela: agendamentos
DROP TABLE IF EXISTS `agendamentos`;
CREATE TABLE `agendamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `processo_id` int DEFAULT NULL,
  `usuario_id` int NOT NULL,
  `criado_por` int NOT NULL,
  `tipo_evento` enum('audiencia','prazo','reuniao','diligencia','outro') NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descricao` text,
  `data_evento` datetime NOT NULL,
  `local` varchar(255) DEFAULT NULL,
  `status` enum('agendado','realizado','cancelado','adiado') DEFAULT 'agendado',
  `lembrete_1_dia` tinyint(1) DEFAULT '1',
  `lembrete_2_dias` tinyint(1) DEFAULT '1',
  `lembrete_1_semana` tinyint(1) DEFAULT '0',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_processo_id` (`processo_id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_criado_por` (`criado_por`),
  KEY `idx_data_evento` (`data_evento`),
  KEY `idx_status` (`status`),
  CONSTRAINT `agendamentos_processo_id_foreign` FOREIGN KEY (`processo_id`) REFERENCES `processos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `agendamentos_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `agendamentos_criado_por_foreign` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: notificacoes
DROP TABLE IF EXISTS `notificacoes`;
CREATE TABLE `notificacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `processo_id` int DEFAULT NULL,
  `agendamento_id` int DEFAULT NULL,
  `tipo` enum('lembrete','alerta','informacao','sistema') NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `mensagem` text NOT NULL,
  `canal` enum('email','sistema','ambos') DEFAULT 'sistema',
  `status` enum('pendente','enviado','lido','erro') DEFAULT 'pendente',
  `data_envio` datetime DEFAULT NULL,
  `data_leitura` datetime DEFAULT NULL,
  `tentativas` int DEFAULT '0',
  `erro_detalhes` text,
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_processo_id` (`processo_id`),
  KEY `idx_agendamento_id` (`agendamento_id`),
  KEY `idx_status` (`status`),
  KEY `idx_data_envio` (`data_envio`),
  CONSTRAINT `notificacoes_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notificacoes_processo_id_foreign` FOREIGN KEY (`processo_id`) REFERENCES `processos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notificacoes_agendamento_id_foreign` FOREIGN KEY (`agendamento_id`) REFERENCES `agendamentos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: configuracoes_notificacao
DROP TABLE IF EXISTS `configuracoes_notificacao`;
CREATE TABLE `configuracoes_notificacao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `email_agendamentos` tinyint(1) DEFAULT '1',
  `email_processos` tinyint(1) DEFAULT '1',
  `email_sistema` tinyint(1) DEFAULT '1',
  `sistema_agendamentos` tinyint(1) DEFAULT '1',
  `sistema_processos` tinyint(1) DEFAULT '1',
  `sistema_sistema` tinyint(1) DEFAULT '1',
  `email_atualizacoes` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `configuracoes_notificacao_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: refresh_tokens
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(256) NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_token` (`token`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `refresh_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: sequelizemeta (para controle de migrations)
DROP TABLE IF EXISTS `sequelizemeta`;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- ========================================
-- INSERIR DADOS BÁSICOS
-- ========================================

-- Inserir dados iniciais de diligências
INSERT INTO `diligencia` (`nome`) VALUES
('Audiência de Conciliação'),
('Audiência de Instrução'),
('Perícia Técnica'),
('Citação'),
('Intimação'),
('Apresentar Defesa'),
('Apresentar Recurso'),
('Juntada de Documentos');

-- Inserir dados iniciais de fases
INSERT INTO `fase` (`nome`) VALUES
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

-- Inserir dados iniciais de matérias/assuntos
INSERT INTO `materia_assunto` (`nome`) VALUES
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

-- Inserir dados iniciais de local de tramitação
INSERT INTO `local_tramitacao` (`nome`) VALUES
('1ª Vara Cível de Cuiabá'),
('2ª Vara Cível de Cuiabá'),
('Vara de Família de Cuiabá'),
('Vara Criminal de Cuiabá'),
('Juizado Especial Cível'),
('Tribunal de Justiça - MT');

-- Marcar migrations como executadas
INSERT INTO `sequelizemeta` (`name`) VALUES
('20250717130001_create_usuarios_processo.js'),
('20250717130002_add_local_tramitacao_fk_to_processos.js'),
('20250717180000_add_contato_assistido_to_processos.js'),
('20250717180000_create_local_tramitacao_table.js'),
('20250718180000_add_fields_to_atualizacoes_processo.js'),
('20250721180000-create-refresh-tokens.js'),
('20250722190000-add-ativo-to-arquivos.js'),
('20250723000001_create_agendamentos_table.js'),
('20250723000002_create_notificacoes_table.js'),
('20250723000003_create_configuracoes_notificacao_table.js'),
('20250724163228-add_email_atualizacoes_to_configuracoes_notificacao.js'),
('20250725000001_add_criado_por_to_agendamentos.js'),
('20250728000001_add_criado_por_to_agendamentos.js'),
('20250729_01_create_notificacoes.js'),
('20250729_02_create_configuracoes_notificacao.js'),
('20250729_03_create_agendamentos.js'),
('20250729_04_create_refresh_tokens.js');

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
