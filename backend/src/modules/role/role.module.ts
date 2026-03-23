import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@common/common.module';
import { Role } from './entities/role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), CommonModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [TypeOrmModule, RoleService],
})
export class RoleModule {}
