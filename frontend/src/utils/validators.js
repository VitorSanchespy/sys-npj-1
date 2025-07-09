// src/utils/validators.js

/**
 * Valida formato de e-mail
 * @param {string} email - Email a ser validado
 * @returns {boolean} Verdadeiro se for um email válido
 */
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Valida força da senha (mínimo 6 caracteres)
 * @param {string} password - Senha a ser validada
 * @param {number} minLength - Tamanho mínimo (padrão: 6)
 * @returns {boolean} Verdadeiro se atender aos requisitos
 */
export const validatePassword = (password, minLength = 6) => {
  return typeof password === 'string' && password.length >= minLength;
};

/**
 * Valida CPF conforme algoritmo oficial
 * @param {string} cpf - CPF a ser validado (com ou sem formatação)
 * @returns {boolean} Verdadeiro se for um CPF válido
 */
export const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) return false;

  const calcDigit = (slice) => {
    const numbers = Array.from(slice).map(Number);
    const sum = numbers.reduce((acc, num, i) => 
      acc + (num * (slice.length + 1 - i)), 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return calcDigit(cleaned.slice(0, 9)) === Number(cleaned[9]) && 
         calcDigit(cleaned.slice(0, 10)) === Number(cleaned[10]);
};

/**
 * Valida CNPJ conforme algoritmo oficial
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} Verdadeiro se for um CNPJ válido
 */
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;
  
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14 || /^(\d)\1{13}$/.test(cleaned)) return false;

  const calcDigit = (slice, factors) => {
    const numbers = Array.from(slice).map(Number);
    const sum = numbers.reduce((acc, num, i) => 
      acc + (num * factors[i]), 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  // Valida primeiro dígito verificador
  const factors1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  if (calcDigit(cleaned.slice(0, 12), factors1) !== Number(cleaned[12])) 
    return false;

  // Valida segundo dígito verificador
  const factors2 = [6, ...factors1];
  return calcDigit(cleaned.slice(0, 13), factors2) === Number(cleaned[13]);
};

/**
 * Valida telefone brasileiro (10 ou 11 dígitos)
 * @param {string} phone - Número de telefone
 * @returns {boolean} Verdadeiro se for um telefone válido
 */
export const validatePhone = (phone) => {
  const cleaned = phone?.replace(/\D/g, '') || '';
  return cleaned.length === 10 || cleaned.length === 11;
};

// Aliases para compatibilidade
export const validateCpf = validateCPF;
export const validateCnpj = validateCNPJ;