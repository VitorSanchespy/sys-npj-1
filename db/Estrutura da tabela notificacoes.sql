-- Estrutura da tabela notificacoes
CREATE TABLE notificacoes (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  usuario_id int NOT NULL,
  processo_id int,
  tipo enum('lembrete','alerta','informacao','sistema') NOT NULL,
  titulo varchar(200) NOT NULL,
  mensagem text NOT NULL,
  canal enum('email','sistema','ambos') DEFAULT 'sistema',
  status enum('pendente','enviado','lido','erro') DEFAULT 'pendente',
  data_envio datetime,
  data_leitura datetime,
  tentativas int DEFAULT 0,
  erro_detalhes text,
  criado_em datetime DEFAULT CURRENT_TIMESTAMP,
  data_criacao timestamp DEFAULT CURRENT_TIMESTAMP,
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  evento_externo_id varchar(255)
);

-- Estrutura da tabela configuracoes_notificacao
CREATE TABLE configuracoes_notificacao (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  usuario_id int NOT NULL UNIQUE,
  email_agendamentos tinyint(1) DEFAULT 1,
  email_processos tinyint(1) DEFAULT 1,
  email_sistema tinyint(1) DEFAULT 1,
  sistema_agendamentos tinyint(1) DEFAULT 1,
  sistema_processos tinyint(1) DEFAULT 1,
  sistema_sistema tinyint(1) DEFAULT 1,
  email_atualizacoes tinyint(1) DEFAULT 1,
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Estrutura da tabela event_notifications
CREATE TABLE event_notifications (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  event_id int NOT NULL,
  type enum('approval_request','approved','rejected','daily_reminder','hourly_reminder') NOT NULL,
  sent_at datetime DEFAULT CURRENT_TIMESTAMP,
  meta json,
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Estrutura da tabela event_participants
CREATE TABLE event_participants (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  event_id int NOT NULL,
  user_id int,
  email varchar(255) NOT NULL,
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Estrutura da tabela events
CREATE TABLE events (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title varchar(255) NOT NULL,
  description text,
  start_at datetime,
  end_at datetime,
  status enum('requested','approved','rejected','canceled','completed') DEFAULT 'requested',
  requester_id int NOT NULL,
  approver_id int,
  rejection_reason text,
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);