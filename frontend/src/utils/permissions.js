export function hasRole(user, roles) {
  if (!user) return false;

  // Primeiro, tenta usar o role_id se disponível
  if (user.role_id) {
    const roleMap = { 1: 'Admin', 2: 'Professor', 3: 'Aluno' };
    const userRole = roleMap[user.role_id];
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return userRole === roles;
  }

  // Fallback para o campo 'role' (string ou objeto)
  if (user.role) {
    let userRoleString;
    if (typeof user.role === 'string') {
      userRoleString = user.role;
    } else if (typeof user.role === 'object' && user.role !== null) {
      userRoleString = user.role.nome || user.role.name;
    }

    if (userRoleString) {
      if (Array.isArray(roles)) {
        return roles.includes(userRoleString);
      }
      return userRoleString === roles;
    }
  }

  // Se não tem nem role_id nem role, retorna false
  return false;
}