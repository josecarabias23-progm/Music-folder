import { Logger, Module } from '@nestjs/common';
import { LocalStorageAdapter } from './local-storage.adapter';
import { S3StorageAdapter } from './s3-storage.adapter';
import { StorageAdapter } from './storage.interface';
import { STORAGE_ADAPTER, StorageService } from './storage.service';

function parseBoolean(value?: string): boolean {
  return ['1', 'true', 'yes', 'on'].includes((value || '').trim().toLowerCase());
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}, obligatoria para STORAGE_DRIVER=s3.`);
  }

  return value;
}

/**
 * Elige el adaptador de almacenamiento según `STORAGE_DRIVER`:
 *
 * - `local` (por defecto): disco en `UPLOADS_DIR`. Requiere volumen persistente
 *   en producción; si no, los archivos se pierden en cada deploy.
 * - `s3`: S3 o compatible (Cloudflare R2, MinIO, Backblaze). Variables:
 *   `S3_BUCKET` (obligatoria), `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`,
 *   `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`, `S3_PREFIX`,
 *   `S3_SIGNED_URL_EXPIRES_IN`.
 */
@Module({
  providers: [
    {
      provide: STORAGE_ADAPTER,
      useFactory: (): StorageAdapter => {
        const driver = (process.env.STORAGE_DRIVER || 'local').trim().toLowerCase();

        if (driver === 's3') {
          new Logger('StorageModule').log('Usando almacenamiento de objetos (S3-compatible)');

          return new S3StorageAdapter({
            bucket: requireEnv('S3_BUCKET'),
            region: process.env.S3_REGION?.trim() || 'auto',
            endpoint: process.env.S3_ENDPOINT?.trim(),
            accessKeyId: process.env.S3_ACCESS_KEY_ID?.trim(),
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY?.trim(),
            forcePathStyle: parseBoolean(process.env.S3_FORCE_PATH_STYLE),
            prefix: process.env.S3_PREFIX?.trim(),
            signedUrlExpiresIn: process.env.S3_SIGNED_URL_EXPIRES_IN
              ? parseInt(process.env.S3_SIGNED_URL_EXPIRES_IN, 10)
              : undefined,
          });
        }

        if (driver !== 'local') {
          new Logger('StorageModule').warn(
            `STORAGE_DRIVER="${driver}" no es válido: se usa el almacenamiento local.`,
          );
        }

        return new LocalStorageAdapter({ basePath: process.env.UPLOADS_DIR || './uploads' });
      },
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}