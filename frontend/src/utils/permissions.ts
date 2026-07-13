import { type UserRole } from '../types/auth.types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  seller: 1,
  admin: 2
};

export const hasMinimumRole = (userRole: UserRole | undefined, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const canViewTab = (userRole: UserRole | undefined, tabMinRole: UserRole): boolean => {
  return hasMinimumRole(userRole, tabMinRole);
};