import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@common/common.module';
import { AuthModule } from '@auth/auth.module';
import { Page } from '@page/entities/page.entity';
import { Selector } from '@selector/entities/selector.entity';
import { Project } from './entities/project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ExportService } from './export.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Page, Selector]),
    CommonModule,
    AuthModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ExportService],
  exports: [TypeOrmModule, ProjectService],
})
export class ProjectModule {}
