/**
 * SessionValidator - Componente para validar sessão periodicamente
 * 
 * Funcionalidades:
 * - Valida token a cada 5 minutos
 * - Detecta quando usuário fica inativo por muito tempo
 * - Força nova autenticação quando necessário
 */

import { useEffect, useRef } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { authService } from '../../api/services';

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
const INACTIVITY_LIMIT = 30 * 60 * 1000;     // 30 minutos

export default function SessionValidator() {
  const { user, token, forceReauth, isAuthenticated } = useAuthContext();
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef(null);

  // Atualizar última atividade quando usuário interage
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Eventos que indicam atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Validação periódica da sessão
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const validateSession = async () => {
      try {
        console.log('🔍 Validando sessão periodicamente...');
        
        // Verificar inatividade
        const inactiveTime = Date.now() - lastActivityRef.current;
        if (inactiveTime > INACTIVITY_LIMIT) {
          console.log('😴 Usuário inativo por muito tempo, forçando nova autenticação');
          forceReauth('Sessão expirada por inatividade. Faça login novamente.');
          return;
        }

        // Validar token no servidor
        await authService.getProfile(token);
        console.log('✅ Sessão válida');

      } catch (error) {
        console.log('❌ Sessão inválida detectada na validação periódica:', error.message);
        
        if (error.status === 401) {
          forceReauth('Sua sessão expirou. Faça login novamente.');
        } else {
          console.log('⚠️ Erro na validação da sessão, mas não é 401:', error);
        }
      }
    };

    // Executar primeira validação após 1 minuto
    const initialTimeout = setTimeout(validateSession, 60 * 1000);
    
    // Configurar validação periódica
    intervalRef.current = setInterval(validateSession, SESSION_CHECK_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, token, forceReauth]);

  // Este componente não renderiza nada visível
  return null;
}

export { SESSION_CHECK_INTERVAL, INACTIVITY_LIMIT };