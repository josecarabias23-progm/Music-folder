import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DownloadTarget,
  IncomingFile,
  StorageAdapter,
  StoredFileInfo,
} from './storage.interface';

/** Token de inyección del adaptador activo (ver `StorageModule`). */
export const STORAGE_ADAPTER = 'STORAGE_ADAPTER';

/**
 * Fachada de almacenamiento que consume la aplicación.
 *
 * Desacopla a los controladores del medio concreto: sólo conocen `saveFile` y
 * `resolveDownload`, mientras que el adaptador (disco local o S3/R2) se elige por
 * configuración (`STORAGE_DRIVER`). Antes esta clase leía el disco directamente
 * con `fs.existsSync`, lo que ataba la descarga a la ruta local del contenedor.
 *
 * Nota: `StoredFileInfo` se re-exporta desde `storage.interface` para no romper
 * los imports existentes (`{ StoredFileInfo } from './storage.service'`).
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(@Inject(STORAGE_ADAPTER) private readonly adapter: StorageAdapter) {
    this.logger.log(`Almacenamiento de partituras: driver "${this.adapter.driver}"`);
  }

  get driver(): string {
    return this.adapter.driver;
  }

  saveFile(file: IncomingFile, prefix?: string): Promise<StoredFileInfo> {
    return this.adapter.saveFile(file, prefix);
  }

  resolveDownload(reference: string): Promise<DownloadTarget | null> {
    return this.adapter.resolveDownload(reference);
  }

  deleteFile(reference: string): Promise<void> {
    return this.adapter.deleteFile(reference);
  }
}

export type { DownloadTarget, IncomingFile, StorageAdapter, StoredFileInfo };
