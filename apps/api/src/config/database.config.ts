import * as path from 'path';
import { DataSourceOptions } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Instrument } from '../instruments/entities/instrument.entity';
import { Sheet } from '../sheets/entities/sheet.entity';
import { RehearsalLog } from '../records/entities/rehearsal-log.entity';
import { ForumThread } from '../forums/entities/forum-thread.entity';
import { ForumComment } from '../forums/entities/forum-comment.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Group } from '../groups/entities/group.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { GroupLibraryItem } from '../groups/entities/group-library-item.entity';
import { GroupRehearsal } from '../groups/entities/group-rehearsal.entity';
import { GroupCommunityPost } from '../groups/group-community.entity';


/**
 * Entidades del esquema.
 *
 * Se listan explícitamente (sin globs) para que la aplicación y el CLI de TypeORM
 * trabajen con exactamente el mismo conjunto, tanto en TypeScript como en `dist/`.
 */
export const DATABASE_ENTITIES = [
  User,
  Instrument,
  Sheet,
  RehearsalLog,
  ForumThread,
  ForumComment,
  Notification,
  Group,
  GroupMember,
  GroupLibraryItem,
  GroupRehearsal,
  GroupCommunityPost,
];



export type DatabaseType = 'postgres' | 'sqlite';

/** `DB_TYPE` explícito o, si no está definido, postgres cuando hay `DATABASE_URL`. */
export function resolveDatabaseType(): DatabaseType {
  const configured = (process.env.DB_TYPE || '').trim().toLowerCase();

  if (configured === 'sqlite' || configured === 'postgres') {
    return configured;
  }

  return process.env.DATABASE_URL ? 'postgres' : 'sqlite';
}

export function resolveSqlitePath(): string {
  return process.env.SQLITE_DB_PATH || path.resolve(process.cwd(), 'db', 'music-folder.sqlite');
}

function parseBoolean(value?: string): boolean {
  return ['1', 'true', 'yes', 'on'].includes((value || '').trim().toLowerCase());
}

/**
 * SSL opt-in (`DB_SSL=true`) para conexiones externas a un Postgres gestionado.
 * Por defecto no se fuerza SSL: las conexiones internas de Render no lo requieren.
 */
function resolvePostgresSsl(): { rejectUnauthorized: boolean } | undefined {
  return parseBoolean(process.env.DB_SSL) ? { rejectUnauthorized: false } : undefined;
}

/**
 * Habilita la ejecución automática de migraciones al iniciar la aplicación.
 * Puede ser deshabilitada explícitamente definiendo `DB_MIGRATIONS_RUN=false`.
 */
export function resolveMigrationsRun(): boolean {
  const configured = process.env.DB_MIGRATIONS_RUN;

  if (configured !== undefined && configured.trim() !== '') {
    return parseBoolean(configured);
  }

  return true;
}

/**
 * Opciones de conexión compartidas por la aplicación (`AppModule`) y por el CLI
 * (`typeorm.datasource.ts`), para que ambos caminos no puedan desincronizarse.
 */
export function buildDataSourceOptions(): DataSourceOptions {
  const isTypeScriptRuntime = __filename.endsWith('.ts');
  const migrationsGlob = path.join(
    __dirname,
    isTypeScriptRuntime ? '../migrations/*.ts' : '../migrations/*.js',
  );

  const sharedOptions = {
    entities: DATABASE_ENTITIES,
    migrations: [migrationsGlob],
    migrationsTableName: 'migrations',
    migrationsRun: resolveMigrationsRun(),
  };

  if (resolveDatabaseType() === 'sqlite') {
    return {
      type: 'sqlite',
      database: resolveSqlitePath(),
      ...sharedOptions,
    };
  }

  const ssl = resolvePostgresSsl();
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      ...sharedOptions,
      ...(ssl ? { ssl } : {}),
    };
  }

  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgrespassword',
    database: process.env.POSTGRES_DB || 'music_folder',
    ...sharedOptions,
    ...(ssl ? { ssl } : {}),
  };
}

/**
 * Valor efectivo de `synchronize`.
 *
 * Nunca se activa de forma implícita en producción: el esquema se gestiona con
 * migraciones y Render las aplica en `preDeployCommand` o al iniciar la app.
 */
export function resolveSynchronize(): boolean {
  const configured = process.env.DB_SYNCHRONIZE;

  if (configured === undefined || configured.trim() === '') {
    return process.env.NODE_ENV !== 'production';
  }

  return parseBoolean(configured);
}