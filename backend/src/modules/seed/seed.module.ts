import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { CommonModule } from '@common/common.module';
import { User } from '@user/entities/user.entity';
import { Role } from '@role/entities/role.entity';
import { Token } from '@auth/entities/token.entity';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Token]),
    ConfigModule,
    CommonModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
