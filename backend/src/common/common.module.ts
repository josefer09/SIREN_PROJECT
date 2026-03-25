import { Module } from '@nestjs/common';

import { HashingAdapter, UuidAdapter, StorageAdapter } from './adapters';
import { DatabaseExceptionHandler } from './providers/database-exception-handler.provider';

@Module({
  providers: [HashingAdapter, UuidAdapter, StorageAdapter, DatabaseExceptionHandler],
  exports: [HashingAdapter, UuidAdapter, StorageAdapter, DatabaseExceptionHandler],
})
export class CommonModule {}
