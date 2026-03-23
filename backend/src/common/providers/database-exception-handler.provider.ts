import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class DatabaseExceptionHandler {
  private readonly logger = new Logger(DatabaseExceptionHandler.name);

  handle(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as Record<string, unknown>;
      const code = driverError?.code as string;

      switch (code) {
        case '23505':
          throw new BadRequestException(
            this.extractDuplicateMessage(driverError),
          );
        case '23502':
          throw new BadRequestException(
            `Missing required field: ${driverError?.column || 'unknown'}`,
          );
        case '23503':
          throw new BadRequestException(
            'Referenced record does not exist',
          );
        default:
          this.logger.error(`Database error [${code}]: ${error.message}`);
          throw new BadRequestException('Database operation failed');
      }
    }

    if (error instanceof BadRequestException) {
      throw error;
    }

    if (error instanceof Error) {
      this.logger.error(`Unexpected error: ${error.message}`);
      throw error;
    }

    throw new BadRequestException('An unexpected error occurred');
  }

  private extractDuplicateMessage(
    driverError: Record<string, unknown>,
  ): string {
    const detail = driverError?.detail as string;
    if (detail) {
      const match = detail.match(/Key \((.+?)\)=\((.+?)\)/);
      if (match) {
        return `${match[1]} '${match[2]}' already exists`;
      }
    }
    return 'Duplicate entry';
  }
}
