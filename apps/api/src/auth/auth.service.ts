import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  instrument_primary: string;
  created_at: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    const role = dto.role || 'Músico / Instrumentista';
    const instrumentPrimary = dto.instrument_primary || 'Violín';

    const user = this.userRepository.create({
      email,
      username,
      password_hash: dto.password,
      first_name: firstName,
      last_name: lastName,
      role,
      instrument_primary: instrumentPrimary,
      is_active: true,
    });

    const savedUser = await this.userRepository.save(user);
    const fullName = `${savedUser.first_name || ''} ${savedUser.last_name || ''}`.trim();

    return {
      success: true,
      message: 'Usuario registrado correctamente',
      user: {
        id: savedUser.id,
        name: fullName,
        email: savedUser.email,
        role: savedUser.role,
        instrument_primary: savedUser.instrument_primary,
      },
      token: `token_${savedUser.id}`,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
      const parts = name.split(' ');
      const firstName = parts[0] || name;
      const lastName = parts.slice(1).join(' ') || '';

      user = this.userRepository.create({
        email,
        username: email.split('@')[0],
        password_hash: dto.password,
        first_name: firstName,
        last_name: lastName,
        role: 'Director / Conductor',
        instrument_primary: 'Tutti',
        is_active: true,
      });
      user = await this.userRepository.save(user);
    } else {
      if (user.password_hash && user.password_hash !== dto.password) {
        throw new UnauthorizedException('Contraseña incorrecta. Por favor, intentalo de nuevo.');
      }
    }

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0];

    return {
      success: true,
      user: {
        id: user.id,
        name: fullName,
        email: user.email,
        role: user.role || 'Músico',
        instrument_primary: user.instrument_primary || 'Tutti',
      },
      token: `token_${user.id}`,
    };
  }

  async getUsers() {
    return this.userRepository.find({
      select: ['id', 'email', 'username', 'first_name', 'last_name', 'role', 'instrument_primary', 'created_at'],
    });
  }
}
