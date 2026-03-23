import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@auth/auth.module';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
