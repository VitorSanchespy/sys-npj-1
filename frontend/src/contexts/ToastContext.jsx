// Provider global para sistema de Toast - permite usar toasts em qualquer componente
import React, { createContext, useContext } from 'react';
import { useToast, ToastContainer } from '../components/common/Toast';

const ToastContext = createContext();

export const useGlobalToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useGlobalToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const toastMethods = useToast();

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer 
        toasts={toastMethods.toasts} 
        onRemove={toastMethods.removeToast} 
      />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
