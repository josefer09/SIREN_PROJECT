import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HashingAdapter } from '@common/adapters';
import { HttpResponseMessage } from '@common/utils';
import { User } from '@user/entities/user.entity';
import { Role } from '@role/entities/role.entity';
import { Token } from '@auth/entities/token.entity';
import { SEED_ROLES, SEED_USERS } from './data/seed-data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly hashingAdapter: HashingAdapter,
    private readonly configService: ConfigService,
  ) {}

  async executeSeed() {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (nodeEnv === 'prod' || nodeEnv === 'production') {
      throw new BadRequestException('Seed cannot run in production');
    }

    this.logger.log('Starting database seed...');

    await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .from(Token)
      .execute();
    await this.userRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .execute();
    await this.roleRepository
      .createQueryBuilder()
      .delete()
      .from(Role)
      .execute();

    const roles = await this.seedRoles();
    await this.seedUsers(roles);

    this.logger.log('Seed completed successfully');

    return HttpResponseMessage.success('Seed executed successfully', {
      roles: roles.length,
      users: SEED_USERS.length,
    });
  }

  private async seedRoles(): Promise<Role[]> {
    const roles: Role[] = [];

    for (const roleData of SEED_ROLES) {
      const role = this.roleRepository.create(roleData);
      roles.push(await this.roleRepository.save(role));
    }

    this.logger.log(`Seeded ${roles.length} roles`);
    return roles;
  }

  private async seedUsers(roles: Role[]): Promise<void> {
    for (const userData of SEED_USERS) {
      const role = roles.find((r) => r.name === userData.roleName);
      if (!role) continue;

      const hashedPassword = await this.hashingAdapter.hash(userData.password);

      const user = this.userRepository.create({
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        isVerified: true,
        isActive: true,
        roles: [role],
      });

      await this.userRepository.save(user);
    }

    this.logger.log(`Seeded ${SEED_USERS.length} users`);
  }
}
