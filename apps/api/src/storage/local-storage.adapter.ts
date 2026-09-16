import { Injectable, Logger } from '@nestjs/common';
import { createReadStream, existsSync, promises as fsPromises } from 'fs';
import { extname, isAbsolute, join, resolve } from 'path';
import {
  DownloadTarget,
  IncomingFile,
  StorageAdapter,
  StoredFileInfo,
} from './storage.interface';

export interface LocalStorageOptions {
  /** Directorio donde se escriben los archivos (`UPLOADS_DIR`). */
  basePath: string;
}

const HTTP_URL_PATTERN = /^https?:\/\//i;

/**
 * Adaptador de disco local.
 *
 * En producción requiere un **volumen persistente** montado en `UPLOADS_DIR`
 * (Render: sólo en planes con disco); si no, cualquier reinicio del contenedor
 * borra los PDF. Para hosting efímero usar `STORAGE_DRIVER=s3`.
 *
 * Mantiene compatibilidad hacia atrás con las referencias ya guardadas por la
 * implementación anterior: rutas relativas (`uploads/sheet-x.pdf`), absolutas y
 * URLs externas (partituras importadas) se resuelven correctamente.
 */
@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  readonly driver = 'local';

  private readonly logger = new Logger(LocalStorageAdapter.name);

  constructor(private readonly options: LocalStorageOptions) {
    fsPromises.mkdir(this.options.basePath, { recursive: true }).catch((error) => {
      this.logger.error(
        `No se pudo crear el directorio de subidas (${this.options.basePath}): ${error?.message || error}`,
      );
    });
  }

  async saveFile(file: IncomingFile, prefix = 'file'): Promise<StoredFileInfo> {
    const storedName = `${prefix}-${Date.now()}${extname(file.originalname) || ''}`;
    const destination = join(this.options.basePath, storedName);

    if (file.buffer && file.buffer.length) {
      await fsPromises.writeFile(destination, file.buffer);
    } else if (file.path) {
      // multer escribió un temporal en disco: se mueve al destino final.
      await fsPromises.rename(file.path, destination);
    } else {
      await fsPromises.writeFile(destination, '');
    }

    const size = file.size ?? (await fsPromises.stat(destination)).size;
    const format = extname(storedName).replace('.', '') || file.mimetype || 'bin';

    return { reference: destination, size, format };
  }

  async resolveDownload(reference: string): Promise<DownloadTarget | null> {
    // Referencias externas (partituras importadas de IMSLP y similares): se
    // redirige en lugar de intentar abrirlas en el disco del contenedor.
    if (HTTP_URL_PATTERN.test(reference)) {
      return { kind: 'redirect', url: reference };
    }

    const filePath = isAbsolute(reference) ? reference : resolve(reference);

    if (!existsSync(filePath)) {
      return null;
    }

    return {
      kind: 'stream',
      stream: createReadStream(filePath),
      contentType: 'application/pdf',
    };
  }

  async deleteFile(reference: string): Promise<void> {
    if (HTTP_URL_PATTERN.test(reference)) {
      return;
    }

    const filePath = isAbsolute(reference) ? reference : resolve(reference);

    if (!existsSync(filePath)) {
      return;
    }

    try {
      await fsPromises.unlink(filePath);
    } catch (error) {
      // Nunca se propaga: un fallo al borrar el blob no debe romper la operación
      // de negocio que ya se completó en la base de datos.
      this.logger.warn(`No se pudo eliminar el archivo ${filePath}: ${(error as Error).message}`);
    }
  }
}