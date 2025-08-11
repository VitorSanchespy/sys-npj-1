// Persistência simples de agendamentos simulados em DEV
const fs = require('fs');
const path = require('path');

const AGENDAMENTOS_FILE = path.join(__dirname, '../../tests/agendamentos-dev.json');

function loadAgendamentos() {
  try {
    if (fs.existsSync(AGENDAMENTOS_FILE)) {
      const data = fs.readFileSync(AGENDAMENTOS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[DEV] Erro ao carregar agendamentos simulados:', e);
  }
  return [];
}

function saveAgendamentos(agendamentos) {
  try {
    fs.writeFileSync(AGENDAMENTOS_FILE, JSON.stringify(agendamentos, null, 2), 'utf-8');
  } catch (e) {
    console.error('[DEV] Erro ao salvar agendamentos simulados:', e);
  }
}

module.exports = { loadAgendamentos, saveAgendamentos };
