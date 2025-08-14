-- Script para adicionar campos do Google Calendar à tabela AgendamentosProcesso
-- Execute este script no MySQL para corrigir os erros de colunas inexistentes

USE npjdatabase;

-- Adicionar campo html_link se não existir
ALTER TABLE AgendamentosProcesso 
ADD COLUMN IF NOT EXISTS html_link VARCHAR(500) NULL COMMENT 'Link do evento no Google Calendar';

-- Adicionar campo attendees se não existir  
ALTER TABLE AgendamentosProcesso 
ADD COLUMN IF NOT EXISTS attendees TEXT NULL COMMENT 'Participantes do evento (JSON)';

-- Adicionar campo reminders_config se não existir
ALTER TABLE AgendamentosProcesso 
ADD COLUMN IF NOT EXISTS reminders_config TEXT NULL COMMENT 'Configuração de lembretes (JSON)';

-- Adicionar campo email_sent se não existir
ALTER TABLE AgendamentosProcesso 
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Se o e-mail de lembrete foi enviado';

-- Verificar se as colunas foram criadas
DESCRIBE AgendamentosProcesso;

SELECT 'Campos do Google Calendar adicionados com sucesso!' AS resultado;
