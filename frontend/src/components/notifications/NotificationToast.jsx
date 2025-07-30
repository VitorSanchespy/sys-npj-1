import React, { useEffect, useState } from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';

const NotificationToast = () => {
  const { newNotification, clearNewNotification } = useNotificationContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (newNotification) {
      setIsVisible(true);
      
      // Auto-hide após 5 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => clearNewNotification(), 300); // Aguardar animação
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [newNotification, clearNewNotification]);

  if (!newNotification) return null;

  // Obter ícone baseado no tipo
  const getIcon = (tipo) => {
    if (tipo.includes('sucesso') || tipo.includes('criado')) return '✅';
    if (tipo.includes('cancelado') || tipo.includes('incorreta')) return '❌';
    if (tipo.includes('atualizado')) return '📝';
    if (tipo.includes('agendamento')) return '📅';
    if (tipo.includes('login')) return '🔐';
    return '🔔';
  };

  // Obter cor baseada no tipo
  const getColor = (tipo) => {
    if (tipo.includes('sucesso') || tipo.includes('criado')) {
      return 'bg-green-500 border-green-600';
    }
    if (tipo.includes('cancelado') || tipo.includes('incorreta') || tipo.includes('bloqueada')) {
      return 'bg-red-500 border-red-600';
    }
    if (tipo.includes('atualizado')) {
      return 'bg-blue-500 border-blue-600';
    }
    if (tipo.includes('alerta')) {
      return 'bg-yellow-500 border-yellow-600';
    }
    return 'bg-gray-500 border-gray-600';
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`rounded-lg border-l-4 p-4 shadow-lg bg-white ${getColor(newNotification.tipo)}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">{getIcon(newNotification.tipo)}</span>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {newNotification.titulo}
            </p>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {newNotification.mensagem}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => clearNewNotification(), 300);
              }}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <span className="sr-only">Fechar</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
