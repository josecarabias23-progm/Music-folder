/**
 * Utilidades de rol compartidas por guards y servicios.
 *
 * Los roles del sistema son etiquetas libres ("Director / Conductor",
 * "Músico / Instrumentista", "Jefe de cuerda", ...), así que se normalizan
 * (se quitan acentos y separadores) y se comparan por tokens en lugar de por
 * igualdad exacta, para no depender de la redacción concreta de la etiqueta.
 */

export function normalizeRole(role?: string | null): string {
  return (role ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Términos que identifican un rol de dirección o gestión de agrupación. */
const DIRECTOR_ROLE_TOKENS = [
  'director',
  'conductor',
  'gestor',
  'coordinador',
  'administrador',
  'jefe de cuerda',
];

/**
 * Roles de dirección/gestión: pueden crear grupos, administrar su repertorio,
 * programar ensayos y consultar el listado de usuarios.
 */
export function isDirectorRole(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) {
    return false;
  }

  return DIRECTOR_ROLE_TOKENS.some((token) => normalized.includes(token));
}

/** Roles de administración del sistema ('admin', 'administrador', 'administración'). */
export function isAdminRole(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) {
    return false;
  }

  return normalized.includes('admin');
}
