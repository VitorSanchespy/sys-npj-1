// src/utils/format.js
export const FormatUtils = {
  /**
   * Formata bytes para unidades legíveis (KB, MB, GB)
   * @param {number} bytes - Tamanho em bytes
   * @param {number} decimals - Casas decimais (padrão: 2)
   * @returns {string} String formatada
   */
  bytes(bytes, decimals = 2) {
    if (isNaN(bytes) || bytes < 0) return '0 Bytes';
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  },

  /**
   * Formata data para o padrão brasileiro
   * @param {string|Date} date - Data a ser formatada
   * @param {boolean} includeTime - Incluir hora? (padrão: false)
   * @returns {string} Data formatada
   */
  date(date, includeTime = false) {
    if (!date) return '';
    
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    return new Date(date).toLocaleDateString('pt-BR', options);
  },

  /**
   * Formata número para moeda (R$)
   * @param {number} value - Valor numérico
   * @param {number} decimals - Casas decimais (padrão: 2)
   * @returns {string} Valor formatado como moeda
   */
  currency(value, decimals = 2) {
    if (isNaN(value)) return 'R$ 0,00';
    
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Formata CPF/CNPJ
   * @param {string} doc - Documento sem formatação
   * @returns {string} Documento formatado
   */
  document(doc) {
    if (!doc) return '';
    
    // Remove tudo que não é dígito
    const cleaned = doc.toString().replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return doc; // Retorna original se não for CPF/CNPJ válido
  }
};

// Métodos diretos para uso rápido (opcional)
export const formatBytes = (bytes, decimals) => FormatUtils.bytes(bytes, decimals);
export const formatDate = (dateString, includeTime) => FormatUtils.date(dateString, includeTime);
export const formatCurrency = (value, decimals) => FormatUtils.currency(value, decimals);
export const formatDocument = (doc) => FormatUtils.document(doc);