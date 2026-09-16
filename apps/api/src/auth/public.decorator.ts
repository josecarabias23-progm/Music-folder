import { SetMetadata } from '@nestjs/common';

/**
 * Clave de metadatos que marca un endpoint como público.
 *
 * `JwtAuthGuard` está registrado como guard GLOBAL: todo endpoint exige un JWT
 * válido salvo los que declaren `@Public()` (login, register y health).
 */
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
