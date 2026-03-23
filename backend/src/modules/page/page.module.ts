import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@common/common.module';
import { AuthModule } from '@auth/auth.module';
import { ProjectModule } from '@project/project.module';
import { Page } from './entities/page.entity';
import { PageController } from './page.controller';
import { PageService } from './page.service';

@Module({
  imports: [TypeOrmModule.forFeature([Page]), CommonModule, AuthModule, ProjectModule],
  controllers: [PageController],
  providers: [PageService],
  exports: [TypeOrmModule, PageService],
})
export class PageModule {}
