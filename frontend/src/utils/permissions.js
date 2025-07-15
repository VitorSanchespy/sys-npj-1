export function hasRole(user, roles) {
  if (!user || !user.role) return false;
  const userRole = String(user.role).toLowerCase();
  if (Array.isArray(roles)) {
    return roles.map(r => String(r).toLowerCase()).includes(userRole);
  }
  return userRole === String(roles).toLowerCase();
}