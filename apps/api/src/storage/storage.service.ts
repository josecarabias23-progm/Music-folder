import { Injectable, Logger } from '@nestjs/common';
import { promises as fsPromises, createReadStream } from 'fs';
import { join, extname } from 'path';

export interface StoredFileInfo {
  url: string;
  size: number;
  format: string;
  path: string;
}

@Injectable()
export class LocalStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly basePath = process.env.UPLOADS_DIR || './uploads';

  constructor() {
    // Ensure base dir exists
    fsPromises.mkdir(this.basePath, { recursive: true }).catch((err) => {
      this.logger.error('Could not create uploads directory', err?.message || err);
    });
  }

  async saveFile(file: any, prefix = 'file'): Promise<StoredFileInfo> {
    const ext = extname(file.originalname) || '';
    const filename = `${prefix}-${Date.now()}${ext}`;
    const dest = join(this.basePath, filename);
    if (file.buffer && file.buffer.length) {
      await fsPromises.writeFile(dest, file.buffer);
    } else if ((file as any).path) {
      // multer wrote a temp file to disk; move it
      const tempPath = (file as any).path as string;
      await fsPromises.rename(tempPath, dest);
    } else {
      // fallback: try to write empty buffer
      await fsPromises.writeFile(dest, '');
    }

    return {
      url: dest,
      path: dest,
      size: file.size || (await fsPromises.stat(dest)).size,
      format: (ext.replace('.', '') || file.mimetype) as string,
    };
  }

  createReadStream(filePath: string) {
    return createReadStream(filePath);
  }
}
