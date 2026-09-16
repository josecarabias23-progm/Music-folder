/**
 * Configuración compartida de JWT.
 *
 * El secreto y la validez viven en un único lugar para que el módulo que FIRMA
 * (`JwtModule`) y la estrategia que VERIFICA (`JwtStrategy`) no puedan divergir:
 * si aplicaran secretos distintos, todos los tokens dejarían de validar y el
 * fallo sería silencioso (401 en cada request).
 */

/**
 * Validez del token. Se declara como literal para que sea asignable tanto a
 * `string` (jsonwebtoken 8 / @nestjs/jwt 10) como al tipo `StringValue` de `ms`.
 */
export const JWT_EXPIRES_IN = '24h';

export const JWT_ISSUER = 'music-folder-api';

export const JWT_AUDIENCE = 'music-folder-web';

const DEV_FALLBACK_SECRET = 'music-folder-dev-secret-solo-para-desarrollo-local';

/**
 * Devuelve la clave de firma de los tokens.
 *
 * En producción el arranque FALLA si `JWT_SECRET` no está definida (fail-fast):
 * un secreto por defecto y conocido permitiría a cualquiera forjar tokens válidos
 * y suplantar a cualquier usuario.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret && secret.length > 0) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET es obligatorio en producción: definilo en las variables de entorno del servicio (ver render.yaml).',
    );
  }

  return DEV_FALLBACK_SECRET;
}
