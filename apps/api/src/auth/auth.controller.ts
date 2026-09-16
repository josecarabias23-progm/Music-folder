import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Público: es el único camino para crear una cuenta. */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** Público: sin token previo no habría forma de obtener uno. */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Requiere JWT válido + rol de administración o dirección: expone el padrón de
   * usuarios (emails y roles), por lo que no debe ser anónimo ni accesible a
   * cualquier usuario autenticado.
   */
  @Roles('admin', 'director')
  @Get('users')
  async getUsers() {
    return this.authService.getUsers();
  }
}
