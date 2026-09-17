import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JWT_AUDIENCE, JWT_EXPIRES_IN, JWT_ISSUER } from './jwt.config';

/** Coste de bcrypt (2^10 iteraciones). */
const BCRYPT_ROUNDS = 10;

/** Los hashes bcrypt empiezan por $2a$/$2b$/$2y$; cualquier otro valor es legado. */
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$/;

/** Datos de usuario que se devuelven al cliente (nunca el hash de la contraseña). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  instrument_primary: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = email.split('@')[0];
    const parts = dto.name.trim().split(' ');
    const firstName = parts[0] || dto.name;
    const lastName = parts.slice(1).join(' ') || '';

    const existing = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });
    if (existing) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado');
    }

    const role = dto.role && dto.role.trim() ? dto.role.trim() : 'Músico / Instrumentista';
    const instrumentPrimary = dto.instrument_primary || 'Violín';

    // Nunca se persiste la contraseña en claro: se guarda el hash bcrypt (coste 10).
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = this.userRepository.create({
      email,
      username,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role,
      instrument_primary: instrumentPrimary,
      is_active: true,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: 'Usuario registrado correctamente',
      user: this.toPublicUser(savedUser),
      token: await this.signToken(savedUser),
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepository.findOne({ where: { email } });

    // El login NUNCA crea cuentas: antes, un email desconocido auto-creaba un
    // usuario con rol 'Director / Conductor', lo que permitía obtener privilegios
    // sin verificar identidad. Las cuentas se crean sólo vía /auth/register.
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas. Verificá tu correo y contraseña.');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('La cuenta se encuentra desactivada.');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Credenciales inválidas. Verificá tu correo y contraseña.');
    }

    // La contraseña se compara contra el hash bcrypt, nunca en texto plano.
    const passwordMatches = await this.verifyPassword(dto.password, user);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas. Verificá tu correo y contraseña.');
    }

    return {
      success: true,
      user: this.toPublicUser(user),
      token: await this.signToken(user),
    };
  }

  /** Emite un JWT firmado, con la identidad que valida `JwtStrategy`. */
  private async signToken(user: User): Promise<string> {
    return this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: JWT_EXPIRES_IN, issuer: JWT_ISSUER, audience: JWT_AUDIENCE },
    );
  }

  private toPublicUser(user: User): PublicUser {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0];

    return {
      id: user.id,
      name: fullName,
      email: user.email,
      role: user.role || 'Músico',
      instrument_primary: user.instrument_primary || 'Tutti',
    };
  }

  /**
   * Verifica la contraseña contra el hash almacenado.
   *
   * Compatibilidad temporal: las filas creadas antes de la Fase 1 guardan la
   * contraseña en texto plano (por ejemplo el seed con 'demo123'). En ese caso se
   * compara una única vez y, si coincide, se reescribe el hash bcrypt para dejar
   * la fila migrada sin bloquear el acceso del usuario.
   * TODO(Fase 2): eliminar esta rama cuando no queden hashes legados
   * (`SELECT count(*) FROM users WHERE password_hash NOT LIKE '$2%'`).
   */
  private async verifyPassword(plainPassword: string, user: User): Promise<boolean> {
    const storedHash = user.password_hash;

    if (BCRYPT_HASH_PATTERN.test(storedHash)) {
      return bcrypt.compare(plainPassword, storedHash);
    }

    if (storedHash !== plainPassword) {
      return false;
    }

    user.password_hash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
    await this.userRepository.save(user);
    return true;
  }

  async getUsers() {
    return this.userRepository.find({
      select: ['id', 'email', 'username', 'first_name', 'last_name', 'role', 'instrument_primary', 'created_at'],
    });
  }
}
