/**
 * Middleware específico para o sistema de eventos
 */
const { isAdmin, isProfessor } = require('./roleMiddleware');

/**
 * Middleware para verificar se o usuário pode criar eventos
 * Qualquer usuário autenticado pode criar eventos
 */
const canCreateEvent = (req, res, next) => {
  try {
    const user = req.user || req.usuario;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticação necessário' 
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

/**
 * Middleware para verificar se o usuário pode aprovar/rejeitar eventos
 * Apenas Admins e Professores podem aprovar/rejeitar
 */
const canApproveRejectEvent = (req, res, next) => {
  try {
    const user = req.user || req.usuario;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticação necessário' 
      });
    }

    if (!isAdmin(user) && !isProfessor(user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas administradores e professores podem aprovar/rejeitar eventos' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

/**
 * Middleware para verificar se o usuário pode visualizar eventos
 * Usuário pode ver eventos onde é solicitante ou participante
 */
const canViewEvent = (req, res, next) => {
  try {
    const user = req.user || req.usuario;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticação necessário' 
      });
    }
    
    // Admin e Professor podem ver todos os eventos
    if (isAdmin(user) || isProfessor(user)) {
      return next();
    }
    
    // Para outros usuários, será verificado no controller se é solicitante ou participante
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

module.exports = {
  canCreateEvent,
  canApproveRejectEvent,
  canViewEvent
};
