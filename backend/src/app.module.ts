import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvConfiguration, envValidationSchema } from '@config/index';
import { CommonModule } from '@common/common.module';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@user/user.module';
import { RoleModule } from '@role/role.module';
import { EmailModule } from '@email/email.module';
import { SeedModule } from '@seed/seed.module';
import { ProjectModule } from '@project/project.module';
import { PageModule } from '@page/page.module';
import { SelectorModule } from '@selector/selector.module';
import { ProxyModule } from '@proxy/proxy.module';
import { UploadModule } from '@upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: envValidationSchema,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'dev',
      }),
      inject: [ConfigService],
    }),
    CommonModule,
    AuthModule,
    UserModule,
    RoleModule,
    EmailModule,
    SeedModule,
    ProjectModule,
    PageModule,
    SelectorModule,
    ProxyModule,
    UploadModule,
  ],
})
export class AppModule {}
