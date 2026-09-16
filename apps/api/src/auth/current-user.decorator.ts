import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedUser } from './jwt.strategy';

/**
 * Inyecta el usuario autenticado (validado por `JwtStrategy` desde el token).
 *
 * Es la ÚNICA forma correcta de saber quién ejecuta una acción: los ids que
 * llegan por body, query o params son datos del cliente y no son confiables.
 *
 *   @Get()
 *   findAll(@CurrentUser() user: AuthenticatedUser) { ... user.id ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado.');
    }

    return user;
  },
);