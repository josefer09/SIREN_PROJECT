import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@common/common.module';
import { AuthModule } from '@auth/auth.module';
import { PageModule } from '@page/page.module';
import { Selector } from './entities/selector.entity';
import { SelectorController } from './selector.controller';
import { SelectorService } from './selector.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Selector]),
    CommonModule,
    AuthModule,
    PageModule,
  ],
  controllers: [SelectorController],
  providers: [SelectorService],
  exports: [TypeOrmModule, SelectorService],
})
export class SelectorModule {}
