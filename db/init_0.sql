-- ========================================
-- Estrutura Completa do Banco NPJ Database
-- Sistema NPJ - Núcleo de Prática Jurídica
-- Extraído automaticamente em: 22/08/2025
-- ========================================

-- Configurações iniciais
SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ========================================
-- TABELAS PRINCIPAIS
-- ========================================

-- Tabela: agendamentos
DROP TABLE IF EXISTS `agendamentos`;
CREATE TABLE `agendamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `processo_id` int DEFAULT NULL,
  `titulo` varchar(255) NOT NULL COMMENT 'Título do agendamento',
  `descricao` text COMMENT 'Descrição detalhada do agendamento',
  `data_inicio` datetime NOT NULL COMMENT 'Data e hora de início',
  `data_fim` datetime NOT NULL COMMENT 'Data e hora de fim',
  `local` varchar(500) DEFAULT NULL COMMENT 'Local do agendamento',
  `tipo` enum('reuniao','audiencia','prazo','outro') NOT NULL DEFAULT 'reuniao' COMMENT 'Tipo do agendamento',
  `status` enum('em_analise','enviando_convites','marcado','cancelado','finalizado') NOT NULL DEFAULT 'em_analise',
  `email_lembrete` varchar(255) DEFAULT NULL COMMENT 'Email para envio de lembrete',
  `lembrete_enviado` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Se o lembrete foi enviado',
  `criado_por` int NOT NULL COMMENT 'Usuário que criou o agendamento',
  `observacoes` text COMMENT 'Observações adicionais',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `convidados` json DEFAULT NULL COMMENT 'Lista de convidados com status de resposta',
  `motivo_recusa` text COMMENT 'Motivo da recusa quando o responsável rejeita o agendamento',
  `aprovado_por` int DEFAULT NULL COMMENT 'Usuário que aprovou o agendamento',
  `data_aprovacao` datetime DEFAULT NULL COMMENT 'Data em que o agendamento foi aprovado',
  `lembrete_1h_enviado` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Lembrete 1 hora antes foi enviado',
  PRIMARY KEY (`id`),
  KEY `idx_agendamentos_processo` (`processo_id`),
  KEY `idx_agendamentos_periodo` (`data_inicio`,`data_fim`),
  KEY `idx_agendamentos_status` (`status`),
  KEY `idx_agendamentos_usuario` (`criado_por`),
  KEY `agendamentos_aprovado_por_foreign_idx` (`aprovado_por`),
  CONSTRAINT `agendamentos_aprovado_por_foreign_idx` FOREIGN KEY (`aprovado_por`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `agendamentos_ibfk_1` FOREIGN KEY (`processo_id`) REFERENCES `processos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `agendamentos_ibfk_2` FOREIGN KEY (`criado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `descricao` text COMMENT 'Descrição do arquivo fornecida pelo usuário',
  PRIMARY KEY (`id`),
  KEY `arquivos_processo_id_foreign` (`processo_id`),
  KEY `arquivos_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `arquivos_processo_id_foreign` FOREIGN KEY (`processo_id`) REFERENCES `processos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `arquivos_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: local_tramitacao
DROP TABLE IF EXISTS `local_tramitacao`;
CREATE TABLE `local_tramitacao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: migrations
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `migration_name` varchar(255) NOT NULL,
  `executed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `migration_name` (`migration_name`),
  KEY `idx_migration_name` (`migration_name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: processos
DROP TABLE IF EXISTS `processos`;
CREATE TABLE `processos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_processo` varchar(50) NOT NULL,
  `titulo` varchar(255) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

-- Tabela: roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `descricao` text,
  `permissoes` json DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `googleAccessToken` text,
  `googleRefreshToken` text,
  `googleCalendarConnected` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- Tabela: usuarios_processo
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
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================

-- ========================================
-- INSERIR DADOS BÁSICOS ESSENCIAIS
-- ========================================

-- Inserir dados básicos de roles
INSERT INTO `roles` (`id`, `nome`, `createdAt`, `updatedAt`, `descricao`, `permissoes`, `ativo`) VALUES
(1, 'Admin', '2025-08-02 20:17:09', '2025-08-02 20:17:09', NULL, NULL, 1),
(2, 'Professor', '2025-08-02 20:17:09', '2025-08-02 20:17:09', NULL, NULL, 1),
(3, 'Aluno', '2025-08-02 20:17:09', '2025-08-02 20:17:09', NULL, NULL, 1),

-- Inserir dados básicos de diligencia
INSERT INTO `diligencia` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES
(1, 'Audiência de Conciliação', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(2, 'Audiência de Instrução', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(3, 'Perícia Técnica', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(4, 'Citação', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(5, 'Intimação', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(6, 'Apresentar Defesa', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(7, 'Apresentar Recurso', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(8, 'Juntada de Documentos', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(9, 'Perícia', '2025-08-04 12:42:32', '2025-08-04 12:42:32'),
(10, 'detste', '2025-08-04 19:11:40', '2025-08-04 19:11:40'),
(11, 'jota', '2025-08-09 12:37:45', '2025-08-09 12:37:45'),
(12, 'teste12', '2025-08-12 11:33:42', '2025-08-12 11:33:42'),
(13, 'MeuProcesso', '2025-08-12 12:19:48', '2025-08-12 12:19:48'),
(14, 'teste123', '2025-08-12 21:38:25', '2025-08-12 21:38:25'),
(15, 'teste1333', '2025-08-12 21:39:57', '2025-08-12 21:39:57');

-- Inserir dados básicos de fase
INSERT INTO `fase` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES
(1, 'Petição Inicial', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(2, 'Citação', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(3, 'Contestação', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(4, 'Tréplica', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(5, 'Saneamento', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(6, 'Instrução', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(7, 'Alegações Finais', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(8, 'Sentença', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(9, 'Recurso', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(10, 'Execução', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(11, 'Inicial', '2025-08-04 12:42:32', '2025-08-04 12:42:32'),
(12, 'teste', '2025-08-04 19:05:19', '2025-08-04 19:05:19'),
(13, 'teste1', '2025-08-04 19:05:44', '2025-08-04 19:05:44'),
(14, 'tese12', '2025-08-04 19:11:31', '2025-08-04 19:11:31'),
(15, 'jota', '2025-08-09 12:37:33', '2025-08-09 12:37:33'),
(16, 'teste12', '2025-08-12 11:33:38', '2025-08-12 11:33:38'),
(17, 'MeuProcesso', '2025-08-12 12:19:42', '2025-08-12 12:19:42'),
(27, 'teste1333', '2025-08-12 21:39:53', '2025-08-12 21:39:53');

-- Inserir dados básicos de materia_assunto
INSERT INTO `materia_assunto` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES
(1, 'Direito Civil', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(2, 'Direito Penal', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(3, 'Direito do Trabalho', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(4, 'Direito Previdenciário', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(5, 'Direito de Família', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(6, 'Direito do Consumidor', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(7, 'Direito Administrativo', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(8, 'Direito Tributário', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(9, 'Direito Empresarial', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(10, 'Direito Ambiental', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(11, 'Direito Trabalhista', '2025-08-04 12:42:32', '2025-08-04 12:42:32'),
(12, 'teste', '2025-08-04 18:57:45', '2025-08-04 18:57:45'),
(13, 'jogo', '2025-08-04 19:06:23', '2025-08-04 19:06:23'),
(14, 'rotta', '2025-08-04 19:08:00', '2025-08-04 19:08:00'),
(15, 'testesss', '2025-08-04 19:11:17', '2025-08-04 19:11:17'),
(16, 'jota', '2025-08-09 12:37:25', '2025-08-09 12:37:25'),
(17, 'teste14', '2025-08-12 11:33:30', '2025-08-12 11:33:30'),
(18, 'MeuProcesso', '2025-08-12 12:19:38', '2025-08-12 12:19:38'),
(19, 'teste13', '2025-08-12 21:36:23', '2025-08-12 21:36:23'),
(20, 'teste123', '2025-08-12 21:37:45', '2025-08-12 21:37:45'),
(21, 'teste1333', '2025-08-12 21:39:47', '2025-08-12 21:39:47'),
(27, 'taetae', '2025-08-20 13:32:11', '2025-08-20 13:32:11'),
(30, 'Teste010', '2025-08-22 12:07:51', '2025-08-22 12:07:51');

-- Inserir dados básicos de local_tramitacao
INSERT INTO `local_tramitacao` (`id`, `nome`, `createdAt`, `updatedAt`) VALUES
(1, '1ª Vara Cível de Cuiabá', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(2, '2ª Vara Cível de Cuiabá', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(3, 'Vara de Família de Cuiabá', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(4, 'Vara Criminal de Cuiabá', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(5, 'Juizado Especial Cível', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(6, 'Tribunal de Justiça - MT', '2025-08-02 20:17:10', '2025-08-02 20:17:10'),
(7, 'Vara Cível - Cuiabá', '2025-08-04 12:42:32', '2025-08-04 12:42:32'),
(8, 'Vara Trabalhista - Várzea Grande', '2025-08-04 12:42:32', '2025-08-04 12:42:32'),
(9, 'jesta', '2025-08-04 19:11:49', '2025-08-04 19:11:49'),
(10, 'jota', '2025-08-09 12:37:52', '2025-08-09 12:37:52'),
(11, 'teste12', '2025-08-12 11:33:47', '2025-08-12 11:33:47'),
(12, 'MeuProcesso', '2025-08-12 12:19:51', '2025-08-12 12:19:51'),
(13, 'teste1333', '2025-08-12 21:40:02', '2025-08-12 21:40:02');

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
