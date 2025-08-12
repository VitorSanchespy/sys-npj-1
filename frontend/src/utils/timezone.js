/**
 * Utilitários para manipulação de timezone ÚNICO - América/São_Paulo - FRONTEND
 * NOVA ABORDAGEM: Manter fuso horário explícito, nunca converter para UTC
 * 
 * REGRA: Todos os horários são sempre em "America/Sao_Paulo"
 * - Armazenar com offset explícito: 2025-08-13T10:00:00-03:00
 * - Exibir sempre no fuso Brasil: 10:00
 * - Google Calendar sempre recebe fuso Brasil
 */

/**
 * Converte entrada do usuário para ISO com fuso Brasil explícito
 * @param {string|Date} dateInput - Data de entrada (assumida como Brasil)
 * @returns {string} - ISO string com fuso Brasil (-03:00)
 */
export function toBrasiliaISO(dateInput) {
  if (!dateInput) return null;
  
  let date;
  if (typeof dateInput === 'string') {
    // Se é string no formato datetime-local: "2025-08-13T10:00"
    if (dateInput.includes('T') && !dateInput.includes('Z') && !dateInput.includes('+') && !dateInput.includes('-', 10)) {
      // Assume que é horário de Brasília, adiciona offset explícito
      return `${dateInput}:00-03:00`;
    } else if (dateInput.includes('Z')) {
      // Se é UTC, converte para Brasil
      date = new Date(dateInput);
      const brasiliaDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
      return brasiliaDate.toISOString().replace('Z', '-03:00');
    } else {
      // Se já tem offset, mantém
      return dateInput;
    }
  } else {
    date = new Date(dateInput);
    const brasiliaDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
    return brasiliaDate.toISOString().replace('Z', '-03:00');
  }
  
  return dateInput;
}

/**
 * Converte qualquer data para horário de Brasília (sempre local Brasil)
 * @param {string|Date} dateInput - Data em qualquer formato
 * @returns {Date} - Data em horário de Brasília
 */
export function toBrasiliaDate(dateInput) {
  if (!dateInput) return null;
  
  const date = new Date(dateInput);
  
  // Se a data foi interpretada como UTC, ajusta para Brasil
  if (dateInput.includes && dateInput.includes('Z')) {
    return new Date(date.getTime() - 3 * 60 * 60 * 1000);
  }
  
  // Se já tem offset Brasil, usa direto
  if (dateInput.includes && dateInput.includes('-03:00')) {
    return new Date(dateInput.replace('-03:00', ''));
  }
  
  // Caso contrário, assume que já é Brasil
  return date;
}

/**
 * Formata uma data para exibição em horário de Brasília
 * @param {string|Date} dateInput - Data em qualquer formato
 * @returns {string} - Data formatada "DD/MM/AAAA HH:mm"
 */
export function formatToBrasilia(dateInput) {
  if (!dateInput) return '';
  
  const brasiliaDate = toBrasiliaDate(dateInput);
  const pad = (n) => n.toString().padStart(2, '0');
  
  return `${pad(brasiliaDate.getDate())}/${pad(brasiliaDate.getMonth() + 1)}/${brasiliaDate.getFullYear()} ${pad(brasiliaDate.getHours())}:${pad(brasiliaDate.getMinutes())}`;
}

/**
 * Converte data para formato datetime-local (para inputs HTML)
 * sempre em horário de Brasília
 * @param {string|Date} dateInput - Data em qualquer formato
 * @returns {string} - Formato "YYYY-MM-DDTHH:mm" em horário de Brasília
 */
export function toDateTimeLocalBrasilia(dateInput) {
  if (!dateInput) return '';
  
  const brasiliaDate = toBrasiliaDate(dateInput);
  const pad = (n) => n.toString().padStart(2, '0');
  
  const year = brasiliaDate.getFullYear();
  const month = pad(brasiliaDate.getMonth() + 1);
  const day = pad(brasiliaDate.getDate());
  const hour = pad(brasiliaDate.getHours());
  const minute = pad(brasiliaDate.getMinutes());
  
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Para Google Calendar - sempre retorna objeto com timezone Brasil
 * @param {string|Date} dateInput - Data em qualquer formato
 * @returns {Object} - Objeto com dateTime e timeZone para Google
 */
export function toGoogleCalendarFormat(dateInput) {
  if (!dateInput) return null;
  
  const brasiliaISO = toBrasiliaISO(dateInput);
  
  return {
    dateTime: brasiliaISO.replace('-03:00', ''), // Google Calendar quer sem offset no dateTime
    timeZone: 'America/Sao_Paulo'
  };
}

/**
 * Obtém a data/hora atual em horário de Brasília com offset explícito
 * @returns {string} - ISO string com fuso Brasil
 */
export function nowBrasiliaISO() {
  const now = new Date();
  const brasiliaDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brasiliaDate.toISOString().replace('Z', '-03:00');
}

/**
 * Obtém a data/hora atual em horário de Brasília (Date object)
 * @returns {Date} - Data atual em horário de Brasília
 */
export function nowBrasilia() {
  const now = new Date();
  return new Date(now.getTime() - 3 * 60 * 60 * 1000);
}
