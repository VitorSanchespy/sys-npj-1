// Provider global para sistema de Toast - permite usar toasts em qualquer componente
// Integrado com react-toastify como sistema principal
import React, { createContext, useContext } from 'react';
import { useToast, ToastContainer } from '../components/common/Toast';
import { toastService } from '../services/toastService';

const ToastContext = createContext();

export const useGlobalToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useGlobalToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const customToastMethods = useToast();

  // Métodos híbridos que usam tanto o sistema customizado quanto react-toastify
  const hybridMethods = {
    ...customToastMethods,
    // Métodos que usam react-toastify como principal
    showSuccess: (message, duration) => {
      toastService.success(message);
      // Fallback para sistema customizado se preferir
      // customToastMethods.showSuccess(message, duration);
    },
    showError: (message, duration) => {
      toastService.error(message);
    },
    showWarning: (message, duration) => {
      toastService.warning(message);
    },
    showInfo: (message, duration) => {
      toastService.info(message);
    }
  };

  return (
    <ToastContext.Provider value={hybridMethods}>
      {children}
      {/* Manter sistema customizado como fallback */}
      <ToastContainer 
        toasts={customToastMethods.toasts} 
        onRemove={customToastMethods.removeToast} 
      />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
