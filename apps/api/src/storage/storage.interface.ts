import { Readable } from 'stream';

/**
 * Contrato de almacenamiento de archivos.
 *
 * La aplicación NUNCA toca el sistema de archivos directamente: le pide a un
 * adaptador que guarde el archivo y que resuelva su descarga. Así el mismo código
 * funciona con disco local (volumen persistente) o con almacenamiento de objetos
 * (S3 / Cloudflare R2 / MinIO / Backblaze) sin cambios en los controladores.
 *
 * Consumidores: `sheets.controller.ts`, `storage.service.ts`,
 * `storage.module.ts`, `s3-storage.adapter.ts`, `local-storage.adapter.ts`.
 */

/** Archivo recibido por multer (en memoria o en un temporal de disco). */
export interface IncomingFile {
  originalname: string;
  mimetype?: string;
  size?: number;
  buffer?: Buffer;
  path?: string;
}

/**
 * Referencia que se persiste en la base de datos (`scores.file_url`).
 * Para el adaptador local es una ruta; para S3/R2, la clave del objeto.
 */
export interface StoredFileInfo {
  reference: string;
  size: number;
  format: string;
}

/**
 * Cómo entregar un archivo al cliente:
 * - `stream`: el backend transfiere los bytes (disco local).
 * - `redirect`: se delega en una URL (recurso externo o URL prefirmada de S3).
 */
export type DownloadTarget =
  | { kind: 'stream'; stream: Readable; size?: number; contentType?: string }
  | { kind: 'redirect'; url: string };

/** Adaptador concreto de almacenamiento (disco local, S3, ...). */
export interface StorageAdapter {
  /** Identificador del adaptador activo (`local`, `s3`), útil para logs. */
  readonly driver: string;

  /** Guarda el archivo y devuelve la referencia a persistir en la base de datos. */
  saveFile(file: IncomingFile, prefix?: string): Promise<StoredFileInfo>;

  /** `null` cuando el archivo ya no existe (el controlador lo traduce a 404). */
  resolveDownload(reference: string): Promise<DownloadTarget | null>;

  deleteFile(reference: string): Promise<void>;
}

/** Límite duro de subida, alineado con el `limits.fileSize` del FileInterceptor. */
export const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

/** Etiqueta legible del límite anterior, para mensajes de error. */
export const MAX_UPLOAD_SIZE_LABEL = '20 MB';