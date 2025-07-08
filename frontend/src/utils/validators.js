// src/utils/validators.js
export const Validators = {
  /**
   * Valida formato de e-mail
   * @param {string} email - Email a ser validado
   * @returns {boolean} Verdadeiro se for um email válido
   */
  email(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Valida força da senha (mínimo 6 caracteres)
   * @param {string} password - Senha a ser validada
   * @param {number} minLength - Tamanho mínimo (padrão: 6)
   * @returns {boolean} Verdadeiro se atender aos requisitos
   */
  password(password, minLength = 6) {
    return password?.length >= minLength;
  },

  /**
   * Valida CPF conforme algoritmo oficial
   * @param {string} cpf - CPF a ser validado (com ou sem formatação)
   * @returns {boolean} Verdadeiro se for um CPF válido
   */
  cpf(cpf) {
    if (!cpf) return false;
    
    const cleaned = cpf.replace(/[^\d]+/g, '');
    if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) return false;

    const calcDigit = (slice) => {
      const numbers = Array.from(slice).map(Number);
      const modulus = numbers.length + 1;
      const sum = numbers.reduce((acc, num, i) => acc + (num * (modulus - i)), 0);
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };

    return calcDigit(cleaned.slice(0, 9)) === Number(cleaned[9]) && 
           calcDigit(cleaned.slice(0, 10)) === Number(cleaned[10]);
  },

  /**
   * Valida CNPJ conforme algoritmo oficial
   * @param {string} cnpj - CNPJ a ser validado
   * @returns {boolean} Verdadeiro se for um CNPJ válido
   */
  cnpj(cnpj) {
    if (!cnpj) return false;
    
    const cleaned = cnpj.replace(/[^\d]+/g, '');
    if (cleaned.length !== 14 || /^(\d)\1{13}$/.test(cleaned)) return false;

    const calcDigit = (slice, factor) => {
      const numbers = Array.from(slice).map(Number);
      let sum = 0;
      
      for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i] * (factor - i);
      }
      
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };

    // Valida primeiro dígito verificador
    const firstDigit = calcDigit(cleaned.slice(0, 12), 5);
    if (firstDigit !== Number(cleaned[12])) return false;

    // Valida segundo dígito verificador
    const secondDigit = calcDigit(cleaned.slice(0, 13), 6);
    return secondDigit === Number(cleaned[13]);
  },

  /**
   * Valida telefone brasileiro (10 ou 11 dígitos)
   * @param {string} phone - Número de telefone
   * @returns {boolean} Verdadeiro se for um telefone válido
   */
  phone(phone) {
    const cleaned = phone?.replace(/\D/g, '');
    return cleaned?.length === 10 || cleaned?.length === 11;
  }
};

// Métodos diretos para compatibilidade
export const validateEmail = (email) => Validators.email(email);
export const validatePassword = (password) => Validators.password(password);
export const validateCPF = (cpf) => Validators.cpf(cpf);
export const validateCNPJ = (cnpj) => Validators.cnpj(cnpj);
export const validatePhone = (phone) => Validators.phone(phone);