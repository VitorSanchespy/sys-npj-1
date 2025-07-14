export function hasRole(user, roles) {
  if (!user || !user.role) return false;
  if (Array.isArray(roles)) return roles.includes(user.role);
  return user.role === roles;
}