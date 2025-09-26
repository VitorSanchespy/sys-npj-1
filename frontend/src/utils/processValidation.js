/**
 * Utilitários de validação para formulários de processo
 * Centraliza todas as regras de validação para criação e edição
 */

import { toastAudit } from '../services/toastSystemAudit';

// Regras de validação para campos de processo
export const processValidationRules = {
  numero_processo: {
    required: true,
    minLength: 10,
    pattern: /^[\d\-\.\/]+$/,
    message: "Número do processo deve seguir o padrão: 0001234-56.2024.8.07.0001"
  },
  titulo: {
    required: true,
    minLength: 5,
    maxLength: 200,
    message: "Título deve ter entre 5 e 200 caracteres"
  },
  descricao: {
    required: true,
    minLength: 10,
    maxLength: 1000,
    message: "Descrição deve ter entre 10 e 1000 caracteres"
  },
  tipo_processo: {
    required: true,
    minLength: 3,
    maxLength: 50,
    message: "Tipo do processo é obrigatório (Ex: Cível, Criminal, Trabalhista)"
  },
  num_processo_sei: {
    required: false,
    pattern: /^(SEI-)?[\d\.\/-]+$/,
    message: "Número SEI deve seguir o padrão: SEI-23085.012345/2025-67"
  },
  assistido: {
    required: false,
    minLength: 3,
    maxLength: 100,
    message: "Nome do assistido deve ter entre 3 e 100 caracteres"
  },
  contato_assistido: {
    required: false,
    pattern: /^[\w\.\-_]+@[\w\.\-_]+\.[A-Za-z]{2,}$|^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/,
    message: "Contato deve ser um email válido ou telefone (11) 99999-9999"
  },
  status: {
    required: true,
    options: ['Em andamento', 'Concluído', 'Suspenso', 'Arquivado'],
    message: "Status deve ser selecionado"
  },
  sistema: {
    required: true,
    options: ['Físico', 'PEA', 'PJE'],
    message: "Sistema deve ser selecionado"
  },
  data_encerramento: {
    required: false,
    validate: (value, formData) => {
      if (value && formData.status !== 'Concluído') {
        return "Data de encerramento só deve ser preenchida para processos concluídos";
      }
      if (formData.status === 'Concluído' && !value) {
        return "Data de encerramento é obrigatória para processos concluídos";
      }
      if (value && new Date(value) > new Date()) {
        return "Data de encerramento não pode ser no futuro";
      }
      return null;
    }
  },
  materia_assunto_id: {
    required: true,
    message: "Matéria/Assunto deve ser selecionada"
  },
  fase_id: {
    required: true,
    message: "Fase deve ser selecionada"
  },
  diligencia_id: {
    required: true,
    message: "Diligência deve ser selecionada"
  },
  local_tramitacao_id: {
    required: true,
    message: "Local de Tramitação deve ser selecionado"
  }
};

// Função principal de validação
export const validateProcessForm = (formData, isEditing = false) => {
  const errors = {};
  let isValid = true;

  // Validar cada campo
  Object.keys(processValidationRules).forEach(fieldName => {
    const rule = processValidationRules[fieldName];
    const value = formData[fieldName];
    
    // Verificar campo obrigatório
    if (rule.required && (!value || String(value).trim() === '')) {
      errors[fieldName] = `${getFieldLabel(fieldName)} é obrigatório`;
      isValid = false;
      return;
    }
    
    // Se campo não é obrigatório e está vazio, pular outras validações
    if (!value || String(value).trim() === '') {
      return;
    }
    
    // Validar comprimento mínimo
    if (rule.minLength && String(value).length < rule.minLength) {
      errors[fieldName] = `${getFieldLabel(fieldName)} deve ter pelo menos ${rule.minLength} caracteres`;
      isValid = false;
      return;
    }
    
    // Validar comprimento máximo
    if (rule.maxLength && String(value).length > rule.maxLength) {
      errors[fieldName] = `${getFieldLabel(fieldName)} deve ter no máximo ${rule.maxLength} caracteres`;
      isValid = false;
      return;
    }
    
    // Validar padrão regex
    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors[fieldName] = rule.message;
      isValid = false;
      return;
    }
    
    // Validar opções válidas
    if (rule.options && !rule.options.includes(value)) {
      errors[fieldName] = rule.message;
      isValid = false;
      return;
    }
    
    // Validação customizada
    if (rule.validate) {
      const customError = rule.validate(value, formData);
      if (customError) {
        errors[fieldName] = customError;
        isValid = false;
        return;
      }
    }
  });
  
  // Validações específicas de relacionamento entre campos
  
  // Validar data de encerramento vs status
  if (formData.status === 'Concluído' && !formData.data_encerramento) {
    errors.data_encerramento = "Data de encerramento é obrigatória para processos concluídos";
    isValid = false;
  }
  
  if (formData.data_encerramento && formData.status !== 'Concluído') {
    errors.data_encerramento = "Data de encerramento só deve ser preenchida para processos concluídos";
    isValid = false;
  }

  return { isValid, errors };
};

// Função para mostrar erros via toast
export const showValidationErrors = (errors) => {
  const errorFields = Object.keys(errors);
  
  if (errorFields.length === 1) {
    // Um erro específico
    toastAudit.validation.invalidData(errors[errorFields[0]]);
  } else if (errorFields.length <= 3) {
    // Poucos erros, mostrar todos
    errorFields.forEach(field => {
      toastAudit.validation.invalidData(`${getFieldLabel(field)}: ${errors[field]}`);
    });
  } else {
    // Muitos erros, mostrar resumo
    toastAudit.validation.invalidData(`Formulário contém ${errorFields.length} erros. Verifique os campos destacados.`);
  }
};

// Função para obter label amigável do campo
export const getFieldLabel = (fieldName) => {
  const labels = {
    numero_processo: 'Número do Processo',
    titulo: 'Título',
    descricao: 'Descrição',
    tipo_processo: 'Tipo do Processo',
    num_processo_sei: 'Número SEI',
    assistido: 'Assistido',
    contato_assistido: 'Contato do Assistido',
    status: 'Status',
    sistema: 'Sistema',
    data_encerramento: 'Data de Encerramento',
    materia_assunto_id: 'Matéria/Assunto',
    fase_id: 'Fase',
    diligencia_id: 'Diligência',
    local_tramitacao_id: 'Local de Tramitação',
    observacoes: 'Observações',
    idusuario_responsavel: 'Responsável'
  };
  
  return labels[fieldName] || fieldName;
};

// Função para validar campo individualmente (para validação em tempo real)
export const validateField = (fieldName, value, formData = {}) => {
  const rule = processValidationRules[fieldName];
  if (!rule) return null;
  
  // Campo obrigatório
  if (rule.required && (!value || String(value).trim() === '')) {
    return `${getFieldLabel(fieldName)} é obrigatório`;
  }
  
  // Se campo está vazio e não é obrigatório, não há erro
  if (!value || String(value).trim() === '') {
    return null;
  }
  
  // Validações específicas
  if (rule.minLength && String(value).length < rule.minLength) {
    return `${getFieldLabel(fieldName)} deve ter pelo menos ${rule.minLength} caracteres`;
  }
  
  if (rule.maxLength && String(value).length > rule.maxLength) {
    return `${getFieldLabel(fieldName)} deve ter no máximo ${rule.maxLength} caracteres`;
  }
  
  if (rule.pattern && !rule.pattern.test(String(value))) {
    return rule.message;
  }
  
  if (rule.options && !rule.options.includes(value)) {
    return rule.message;
  }
  
  if (rule.validate) {
    return rule.validate(value, formData);
  }
  
  return null;
};

// Função para aplicar máscara em campos específicos
export const applyFieldMask = (fieldName, value) => {
  switch (fieldName) {
    case 'numero_processo':
      // Máscara para número de processo judicial
      return value.replace(/\D/g, '').replace(/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})$/, '$1-$2.$3.$4.$5.$6');
    
    case 'contato_assistido':
      // Se parece com telefone, aplicar máscara
      if (/^\d+$/.test(value.replace(/\D/g, ''))) {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
          return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        } else {
          return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        }
      }
      return value;
    
    default:
      return value;
  }
};

// Estado inicial padrão para formulários de processo
export const getInitialProcessFormData = () => ({
  numero_processo: "",
  titulo: "",
  descricao: "",
  status: "Em andamento",
  tipo_processo: "",
  idusuario_responsavel: "",
  data_encerramento: "",
  observacoes: "",
  sistema: "Físico",
  materia_assunto_id: "",
  fase_id: "",
  diligencia_id: "",
  num_processo_sei: "",
  assistido: "",
  contato_assistido: "",
  local_tramitacao_id: ""
});