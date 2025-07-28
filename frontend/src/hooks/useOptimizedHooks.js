import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

// Hook para gerenciar estados de loading otimizado
export const useOptimizedLoading = (initialStates = {}) => {
  const [loadingStates, setLoadingStates] = useState(initialStates);

  const setLoading = useCallback((key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  const isLoading = useCallback((key) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useMemo(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return { setLoading, isLoading, isAnyLoading, loadingStates };
};

// Hook para debounce otimizado
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para gerenciar modais de forma otimizada
export const useModalManager = () => {
  const [modals, setModals] = useState({});

  const openModal = useCallback((modalName, data = null) => {
    setModals(prev => ({ ...prev, [modalName]: { open: true, data } }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: { open: false, data: null } }));
  }, []);

  const getModal = useCallback((modalName) => {
    return modals[modalName] || { open: false, data: null };
  }, [modals]);

  return { openModal, closeModal, getModal, modals };
};

// Hook para paginação otimizada
export const usePagination = (totalItems, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * itemsPerPage;
  }, [currentPage, itemsPerPage]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + itemsPerPage - 1, totalItems - 1);
  }, [startIndex, itemsPerPage, totalItems]);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

// Hook para filtros otimizados
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => 
      filters[key] !== initialFilters[key] && filters[key] !== '' && filters[key] != null
    );
  }, [filters, initialFilters]);

  return {
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters
  };
};

// Hook para renovação automática de token
export function useTokenRefresh() {
  const { token, refreshToken, logout, fetchWithAuth } = useAuthContext();
  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    if (!token || !refreshToken) return;

    // Decodificar token para obter tempo de expiração (se JWT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Converter para millisegundos
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // Renovar 2 minutos antes da expiração
      const refreshTime = Math.max(timeUntilExpiry - (2 * 60 * 1000), 0);

      if (refreshTime > 0) {
        refreshTimeoutRef.current = setTimeout(async () => {
          try {
            await fetchWithAuth(async () => {
              // Forçar uma requisição que vai disparar o refresh
              const response = await fetch('http://localhost:3001/api/usuarios/me', {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!response.ok) throw new Error('Token expired');
            });
          } catch (error) {
            console.warn('Falha na renovação automática do token:', error);
            logout(); // Logout se não conseguir renovar
          }
        }, refreshTime);
      }
    } catch (error) {
      // Se não conseguir decodificar, assumir que expira em 1 hora
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          await fetchWithAuth(async () => {
            throw new Error('Token refresh needed');
          });
        } catch (error) {
          logout();
        }
      }, 58 * 60 * 1000); // 58 minutos
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [token, refreshToken, logout, fetchWithAuth]);
}

// Hook para detectar quando o usuário fica offline/online
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Quando voltar online, limpar cache para forçar refresh
      if (window.clearCache) {
        window.clearCache();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
