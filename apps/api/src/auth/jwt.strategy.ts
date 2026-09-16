import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JWT_AUDIENCE, JWT_ISSUER, getJwtSecret } from './jwt.config';

/** Contenido del token firmado por AuthService.signToken(). */
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/** Identidad disponible en `request.user` tras validar el token. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      // El token viaja en la cabecera `Authorization: Bearer <token>`.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  }

  /**
   * Se revalida el usuario contra la base de datos en cada petición: así una
   * cuenta desactivada o eliminada pierde el acceso de inmediato, sin esperar
   * a que expire el token.
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Token inválido.');
    }

    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('El usuario del token ya no existe.');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('La cuenta se encuentra desactivada.');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}