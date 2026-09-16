import { Injectable, Logger } from '@nestjs/common';
import { createReadStream } from 'fs';
import { extname } from 'path';
import { DownloadTarget, IncomingFile, StorageAdapter, StoredFileInfo } from './storage.interface';

export interface S3StorageOptions {
  bucket: string;
  region: string;
  /** URL del endpoint para S3-compatible (R2, MinIO). S3 de AWS no lo necesita. */
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  /** Necesario en MinIO y en la mayoría de endpoints compatibles. */
  forcePathStyle?: boolean;
  /** Prefijo de las claves dentro del bucket. */
  prefix?: string;
  /** Validez de la URL prefirmada de descarga, en segundos. */
  signedUrlExpiresIn?: number;
}

const HTTP_URL_PATTERN = /^https?:\/\//i;

/**
 * Adaptador para almacenamiento de objetos compatible con S3 (AWS S3, Cloudflare
 * R2, MinIO, Backblaze B2...).
 *
 * El SDK se carga de forma DIFERIDA (`require` dinámico) para que el proyecto
 * compile y arranque sin la dependencia instalada mientras se use
 * `STORAGE_DRIVER=local`. Al activar S3 hacen falta:
 *   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 */
@Injectable()
export class S3StorageAdapter implements StorageAdapter {
  readonly driver = 's3';

  private readonly logger = new Logger(S3StorageAdapter.name);

  private sdk: any;

  private clientInstance: any;

  constructor(private readonly options: S3StorageOptions) {}

  private loadSdk(): any {
    if (this.sdk) {
      return this.sdk;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const clientS3 = require('@aws-sdk/client-s3');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const presigner = require('@aws-sdk/s3-request-presigner');

      this.sdk = { ...clientS3, ...presigner };
      return this.sdk;
    } catch (error) {
      throw new Error(
        'STORAGE_DRIVER=s3 requiere las dependencias "@aws-sdk/client-s3" y "@aws-sdk/s3-request-presigner". ' +
          `Instalalas con: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner (${(error as Error).message})`,
      );
    }
  }

  private client(): any {
    if (!this.clientInstance) {
      const sdk = this.loadSdk();

      this.clientInstance = new sdk.S3Client({
        region: this.options.region,
        ...(this.options.endpoint ? { endpoint: this.options.endpoint } : {}),
        ...(this.options.forcePathStyle ? { forcePathStyle: true } : {}),
        ...(this.options.accessKeyId && this.options.secretAccessKey
          ? {
              credentials: {
                accessKeyId: this.options.accessKeyId,
                secretAccessKey: this.options.secretAccessKey,
              },
            }
          : {}),
      });
    }

    return this.clientInstance;
  }

  private buildKey(storedName: string): string {
    const prefix = (this.options.prefix || '').replace(/^\/+|\/+$/g, '');
    return prefix ? `${prefix}/${storedName}` : storedName;
  }

  async saveFile(file: IncomingFile, prefix = 'file'): Promise<StoredFileInfo> {
    const storedName = `${prefix}-${Date.now()}${extname(file.originalname) || ''}`;
    const key = this.buildKey(storedName);
    const sdk = this.loadSdk();

    const body =
      file.buffer && file.buffer.length
        ? file.buffer
        : file.path
          ? createReadStream(file.path)
          : Buffer.alloc(0);

    await this.client().send(
      new sdk.PutObjectCommand({
        Bucket: this.options.bucket,
        Key: key,
        Body: body,
        ...(file.mimetype ? { ContentType: file.mimetype } : {}),
      }),
    );

    if (file.size === undefined && file.buffer) {
      this.logger.debug(`Subido ${key} (${file.buffer.length} bytes)`);
    }

    return {
      reference: key,
      size: file.size ?? file.buffer?.length ?? 0,
      format: extname(storedName).replace('.', '') || 'bin',
    };
  }

  async resolveDownload(reference: string): Promise<DownloadTarget | null> {
    if (HTTP_URL_PATTERN.test(reference)) {
      return { kind: 'redirect', url: reference };
    }

    const sdk = this.loadSdk();
    const url = await sdk.getSignedUrl(
      this.client(),
      new sdk.GetObjectCommand({ Bucket: this.options.bucket, Key: reference }),
      { expiresIn: this.options.signedUrlExpiresIn ?? 300 },
    );

    return { kind: 'redirect', url };
  }

  async deleteFile(reference: string): Promise<void> {
    if (HTTP_URL_PATTERN.test(reference)) {
      return;
    }

    try {
      const sdk = this.loadSdk();
      await this.client().send(
        new sdk.DeleteObjectCommand({ Bucket: this.options.bucket, Key: reference }),
      );
    } catch (error) {
      this.logger.warn(`No se pudo eliminar ${reference} del bucket: ${(error as Error).message}`);
    }
  }
}