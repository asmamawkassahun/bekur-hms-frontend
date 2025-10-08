import { useSelector } from 'react-redux';
import { RootState } from '@/store';

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(requiredPermission: string): boolean {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  return permissions?.includes(requiredPermission) || false;
}

/**
 * Hook to check if user has any of the required permissions
 */
export function useAnyPermission(permissions: string[]): boolean {
  const userPermissions = useSelector(
    (state: RootState) => state.auth.permissions,
  );
  return (
    permissions.some((permission) => userPermissions?.includes(permission)) ||
    false
  );
}

/**
 * Hook to check if user has all of the required permissions
 */
export function useAllPermissions(permissions: string[]): boolean {
  const userPermissions = useSelector(
    (state: RootState) => state.auth.permissions,
  );
  return (
    permissions.every((permission) => userPermissions?.includes(permission)) ||
    false
  );
}

/**
 * Hook to check if user has a specific role
 */
export function useRole(requiredRole: string): boolean {
  const roles = useSelector((state: RootState) => state.auth.roles);
  return roles?.includes(requiredRole) || false;
}

/**
 * Hook to check if user has any of the required roles
 */
export function useAnyRole(roles: string[]): boolean {
  const userRoles = useSelector((state: RootState) => state.auth.roles);
  return roles.some((role) => userRoles?.includes(role)) || false;
}

/**
 * Hook to get user access information (roles, permissions, etc.)
 */
export function useUserAccess() {
  const roles = useSelector((state: RootState) => state.auth.roles);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  return {
    roles: roles || [],
    permissions: permissions || [],
    isAuthenticated,
    hasPermission: (permission: string) =>
      permissions?.includes(permission) || false,
    hasRole: (role: string) => roles?.includes(role) || false,
    hasAnyPermission: (perms: string[]) =>
      perms.some((p) => permissions?.includes(p)) || false,
    hasAnyRole: (userRoles: string[]) =>
      userRoles.some((r) => roles?.includes(r)) || false,
  };
}
