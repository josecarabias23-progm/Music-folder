import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from './jwt.strategy';
import { AppRole, ROLES_KEY } from './roles.decorator';
import { isAdminRole, isDirectorRole } from './roles.util';

/** Cómo se satisface cada rol declarado con `@Roles(...)`. */
const ROLE_MATCHERS: Record<AppRole, (role?: string | null) => boolean> = {
  admin: isAdminRole,
  director: isDirectorRole,
};

/**
 * Guard global de autorización por rol.
 *
 * Se ejecuta DESPUÉS de `JwtAuthGuard`, por lo que `request.user` ya contiene la
 * identidad verificada desde el token. Si el handler no declara `@Roles(...)`,
 * basta con estar autenticado.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Se requiere autenticación para acceder a este recurso.');
    }

    const allowed = requiredRoles.some((requiredRole) => ROLE_MATCHERS[requiredRole]?.(user.role));

    if (!allowed) {
      throw new ForbiddenException('No tenés permisos para acceder a este recurso.');
    }

    return true;
  }
}