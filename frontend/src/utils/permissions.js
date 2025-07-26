export function hasRole(user, roles) {
  if (!user) return false;

  // Função helper para obter role do usuário
  const getUserRole = (user) => {
    if (!user) return null;
    
    if (typeof user.role === 'string') {
      return user.role;
    }
    
    if (user.role && typeof user.role === 'object') {
      return user.role.nome || user.role.name || null;
    }
    
    if (user.role_id === 1) return 'Admin';
    if (user.role_id === 2) return 'Aluno';
    if (user.role_id === 3) return 'Professor';
    
    return null;
  };

  const userRole = getUserRole(user);
  if (!userRole) return false;
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return allowedRoles.includes(userRole);
}