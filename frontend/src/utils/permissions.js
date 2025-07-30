export function hasRole(user, roles) {
  if (!user) return false;

  // Primeiro, tenta usar o role_id se disponível
  if (user.role_id) {
    const roleMap = { 5: 'admin', 2: 'aluno', 1: 'professor' };
    const userRole = roleMap[user.role_id];
    if (Array.isArray(roles)) {
      return roles.map(r => String(r).toLowerCase()).includes(userRole);
    }
    return userRole === String(roles).toLowerCase();
  }

  // Fallback para o campo 'role' (string)
  if (user.role) {
    const userRoleString = String(user.role).toLowerCase();
    if (Array.isArray(roles)) {
      return roles.map(r => String(r).toLowerCase()).includes(userRoleString);
    }
    return userRoleString === String(roles).toLowerCase();
  }

  // Se não tem nem role_id nem role, retorna false
  return false;
}