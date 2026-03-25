import * as path from 'path';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StorageAdapter, UuidAdapter } from '@common/adapters';
import { UploadResponse } from './interfaces';

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly maxFileSize: number;

  constructor(
    private readonly storageAdapter: StorageAdapter,
    private readonly uuidAdapter: UuidAdapter,
    private readonly configService: ConfigService,
  ) {
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE') || 2097152;
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResponse> {
    try {
      if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
        throw new BadRequestException(
          'Formato de imagen no válido. Formatos permitidos: jpg, png, webp, gif',
        );
      }

      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          'El archivo excede el tamaño máximo permitido',
        );
      }

      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueFilename = `${this.uuidAdapter.generate()}${ext}`;

      const storedPath = await this.storageAdapter.upload(
        file.buffer,
        uniqueFilename,
        folder,
      );

      return {
        filename: uniqueFilename,
        originalName: file.originalname,
        path: storedPath,
        url: this.storageAdapter.getUrl(storedPath),
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      this.logger.error(`Error uploading image: ${(error as Error).message}`);
      throw error;
    }
  }

  async deleteFile(filepath: string): Promise<void> {
    try {
      await this.storageAdapter.delete(filepath);
    } catch (error) {
      this.logger.error(`Error deleting file ${filepath}: ${(error as Error).message}`);
    }
  }
}
