import { Module } from '@nestjs/common';

import { HashingAdapter, UuidAdapter } from './adapters';
import { DatabaseExceptionHandler } from './providers/database-exception-handler.provider';

@Module({
  providers: [HashingAdapter, UuidAdapter, DatabaseExceptionHandler],
  exports: [HashingAdapter, UuidAdapter, DatabaseExceptionHandler],
})
export class CommonModule {}
