// src/utils/validators.js
export const validateEmail = email => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password, minLength = 6) => 
  typeof password === 'string' && password.length >= minLength;

const calcCPFDigit = slice => {
  const numbers = [...slice].map(Number);
  const sum = numbers.reduce((acc, num, i) => 
    acc + (num * (slice.length + 1 - i)), 0);
  return sum % 11 < 2 ? 0 : 11 - (sum % 11);
};

export const validateCPF = cpf => {
  const cleaned = cpf?.replace(/\D/g, '') || '';
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) return false;
  
  return calcCPFDigit(cleaned.slice(0, 9)) === Number(cleaned[9]) && 
         calcCPFDigit(cleaned.slice(0, 10)) === Number(cleaned[10]);
};

const calcCNPJDigit = (slice, factors) => {
  const numbers = [...slice].map(Number);
  const sum = numbers.reduce((acc, num, i) => acc + (num * factors[i]), 0);
  return sum % 11 < 2 ? 0 : 11 - (sum % 11);
};

export const validateCNPJ = cnpj => {
  const cleaned = cnpj?.replace(/\D/g, '') || '';
  if (cleaned.length !== 14 || /^(\d)\1{13}$/.test(cleaned)) return false;

  const factors1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const factors2 = [6, ...factors1];
  
  return calcCNPJDigit(cleaned.slice(0, 12), factors1) === Number(cleaned[12]) &&
         calcCNPJDigit(cleaned.slice(0, 13), factors2) === Number(cleaned[13]);
};

export const validatePhone = phone => {
  const cleaned = phone?.replace(/\D/g, '') || '';
  return cleaned.length === 10 || cleaned.length === 11;
};

// Aliases para compatibilidade
export const validateCpf = validateCPF;
export const validateCnpj = validateCNPJ;