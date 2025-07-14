// Funções utilitárias para validação de dados

export function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isRequired(value) {
  return value !== undefined && value !== null && value !== "";
}

export function minLength(value, length) {
  return (value || "").length >= length;
}