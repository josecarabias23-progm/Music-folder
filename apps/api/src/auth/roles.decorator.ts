import { SetMetadata } from '@nestjs/common';

/**
 * Roles que pueden acceder a un endpoint, evaluados por `RolesGuard`.
 *
 * `admin`     → roles de administración del sistema.
 * `director`  → roles de dirección/gestión de agrupación.
 */
export type AppRole = 'admin' | 'director';

export const ROLES_KEY = 'requiredRoles';

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
