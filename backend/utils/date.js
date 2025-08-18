/**
 * Utilitários para manipulação de datas no sistema de eventos
 */

/**
 * Converte uma data para UTC
 * @param {Date|string} date - Data para converter
 * @returns {Date} Data em UTC
 */
function toUTC(date) {
  const d = new Date(date);
  return new Date(d.getTime() + (d.getTimezoneOffset() * 60000));
}

/**
 * Converte uma data UTC para local
 * @param {Date|string} date - Data UTC para converter
 * @returns {Date} Data local
 */
function fromUTC(date) {
  const d = new Date(date);
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
}

/**
 * Formata uma data para string ISO
 * @param {Date|string} date - Data para formatar
 * @returns {string} Data formatada em ISO
 */
function formatISO(date) {
  return new Date(date).toISOString();
}

/**
 * Verifica se uma data é hoje
 * @param {Date|string} date - Data para verificar
 * @returns {boolean} True se for hoje
 */
function isToday(date) {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    today.getFullYear() === checkDate.getFullYear() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getDate() === checkDate.getDate()
  );
}

/**
 * Verifica se uma data é no futuro
 * @param {Date|string} date - Data para verificar
 * @returns {boolean} True se for no futuro
 */
function isFuture(date) {
  return new Date(date) > new Date();
}

/**
 * Verifica se uma data é no passado
 * @param {Date|string} date - Data para verificar
 * @returns {boolean} True se for no passado
 */
function isPast(date) {
  return new Date(date) < new Date();
}

/**
 * Adiciona minutos a uma data
 * @param {Date|string} date - Data base
 * @param {number} minutes - Minutos para adicionar
 * @returns {Date} Nova data
 */
function addMinutes(date, minutes) {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Adiciona horas a uma data
 * @param {Date|string} date - Data base
 * @param {number} hours - Horas para adicionar
 * @returns {Date} Nova data
 */
function addHours(date, hours) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Adiciona dias a uma data
 * @param {Date|string} date - Data base
 * @param {number} days - Dias para adicionar
 * @returns {Date} Nova data
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calcula diferença em minutos entre duas datas
 * @param {Date|string} date1 - Data inicial
 * @param {Date|string} date2 - Data final
 * @returns {number} Diferença em minutos
 */
function diffInMinutes(date1, date2) {
  return (new Date(date2) - new Date(date1)) / (1000 * 60);
}

/**
 * Calcula diferença em horas entre duas datas
 * @param {Date|string} date1 - Data inicial
 * @param {Date|string} date2 - Data final
 * @returns {number} Diferença em horas
 */
function diffInHours(date1, date2) {
  return diffInMinutes(date1, date2) / 60;
}

/**
 * Calcula diferença em dias entre duas datas
 * @param {Date|string} date1 - Data inicial
 * @param {Date|string} date2 - Data final
 * @returns {number} Diferença em dias
 */
function diffInDays(date1, date2) {
  return diffInHours(date1, date2) / 24;
}

/**
 * Formata data para exibição brasileira
 * @param {Date|string} date - Data para formatar
 * @returns {string} Data formatada (dd/mm/aaaa hh:mm)
 */
function formatBrazilian(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Obtém início do dia para uma data
 * @param {Date|string} date - Data base
 * @returns {Date} Início do dia
 */
function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Obtém fim do dia para uma data
 * @param {Date|string} date - Data base
 * @returns {Date} Fim do dia
 */
function endOfDay(date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

module.exports = {
  toUTC,
  fromUTC,
  formatISO,
  isToday,
  isFuture,
  isPast,
  addMinutes,
  addHours,
  addDays,
  diffInMinutes,
  diffInHours,
  diffInDays,
  formatBrazilian,
  startOfDay,
  endOfDay
};
