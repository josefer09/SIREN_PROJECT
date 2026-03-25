import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StorageAdapterInterface } from '@common/interfaces';

@Injectable()
export class StorageAdapter implements StorageAdapterInterface {
  private readonly logger = new Logger(StorageAdapter.name);
  private readonly uploadDir: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3001';
  }

  async upload(
    file: Buffer,
    filename: string,
    folder: string,
  ): Promise<string> {
    try {
      const folderPath = path.join(this.uploadDir, folder);
      fs.mkdirSync(folderPath, { recursive: true });

      const filePath = path.join(folderPath, filename);
      fs.writeFileSync(filePath, file);

      const relativePath = path.join(folder, filename).replace(/\\/g, '/');
      this.logger.log(`File uploaded: ${relativePath}`);

      return relativePath;
    } catch (error) {
      this.logger.error(`Error uploading file ${filename}: ${(error as Error).message}`);
      throw error;
    }
  }

  async delete(filepath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, filepath);

      if (!fs.existsSync(fullPath)) {
        this.logger.warn(`File not found for deletion: ${filepath}`);
        return;
      }

      fs.unlinkSync(fullPath);
      this.logger.log(`File deleted: ${filepath}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${filepath}: ${(error as Error).message}`);
      throw error;
    }
  }

  getUrl(filepath: string): string {
    const normalizedPath = filepath.replace(/\\/g, '/');
    return `${this.appUrl}/api/v1/upload/${normalizedPath}`;
  }
}
