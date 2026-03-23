import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { HashingAdapter } from '@common/adapters';
import { DatabaseExceptionHandler } from '@common/providers/database-exception-handler.provider';
import { HttpResponseMessage } from '@common/utils';
import { PaginationDto } from '@common/dto/pagination.dto';
import { Role } from '@role/entities/role.entity';
import { AuthUser } from '@auth/interfaces';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly hashingAdapter: HashingAdapter,
    private readonly dbExHandler: DatabaseExceptionHandler,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, roles: roleIds, ...userData } = createUserDto;

      const roles = await this.findRolesExist(roleIds);
      const hashedPassword = await this.hashingAdapter.hash(password);

      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
        isVerified: true,
        roles,
      });

      await this.userRepository.save(user);
      delete (user as Partial<User>).password;

      return HttpResponseMessage.created('User', user);
    } catch (error) {
      this.logger.error(`Error creating user: ${(error as Error).message}`);
      this.dbExHandler.handle(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;

      const [users, total] = await this.userRepository.findAndCount({
        take: limit,
        skip: offset,
        relations: ['roles'],
      });

      return { users, total, limit, offset };
    } catch (error) {
      this.logger.error(`Error fetching users: ${(error as Error).message}`);
      this.dbExHandler.handle(error);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.findById(id);
      return user;
    } catch (error) {
      this.logger.error(`Error fetching user ${id}: ${(error as Error).message}`);
      if (error instanceof NotFoundException) throw error;
      this.dbExHandler.handle(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findById(id);

      if (updateUserDto.roles) {
        user.roles = await this.findRolesExist(updateUserDto.roles);
      }

      Object.assign(user, {
        ...updateUserDto,
        roles: user.roles,
      });

      await this.userRepository.save(user);

      return HttpResponseMessage.updated('User', user);
    } catch (error) {
      this.logger.error(`Error updating user ${id}: ${(error as Error).message}`);
      if (error instanceof NotFoundException) throw error;
      this.dbExHandler.handle(error);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.findById(id);
      await this.userRepository.remove(user);

      return HttpResponseMessage.deleted('User', { id, email: user.email });
    } catch (error) {
      this.logger.error(`Error deleting user ${id}: ${(error as Error).message}`);
      if (error instanceof NotFoundException) throw error;
      this.dbExHandler.handle(error);
    }
  }

  async block(id: string) {
    try {
      const user = await this.findById(id);
      user.isActive = false;
      await this.userRepository.save(user);

      return HttpResponseMessage.updated('User', {
        id: user.id,
        email: user.email,
        isActive: false,
      });
    } catch (error) {
      this.logger.error(`Error blocking user ${id}: ${(error as Error).message}`);
      if (error instanceof NotFoundException) throw error;
      this.dbExHandler.handle(error);
    }
  }

  async unblock(id: string) {
    try {
      const user = await this.findById(id);
      user.isActive = true;
      await this.userRepository.save(user);

      return HttpResponseMessage.updated('User', {
        id: user.id,
        email: user.email,
        isActive: true,
      });
    } catch (error) {
      this.logger.error(`Error unblocking user ${id}: ${(error as Error).message}`);
      if (error instanceof NotFoundException) throw error;
      this.dbExHandler.handle(error);
    }
  }

  async changePassword(authUser: AuthUser, changePasswordDto: ChangePasswordDto) {
    try {
      const { currentPassword, newPassword } = changePasswordDto;

      const user = await this.userRepository.findOne({
        where: { id: authUser.id },
        select: ['id', 'password'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isValid = await this.hashingAdapter.compare(
        currentPassword,
        user.password,
      );

      if (!isValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      user.password = await this.hashingAdapter.hash(newPassword);
      await this.userRepository.save(user);

      return HttpResponseMessage.success('Password changed successfully', {
        id: authUser.id,
      });
    } catch (error) {
      this.logger.error(
        `Error changing password for user ${authUser.id}: ${(error as Error).message}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  private async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  private async findRolesExist(roleIds: string[]): Promise<Role[]> {
    const roles = await this.roleRepository.findBy({ id: In(roleIds) });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more roles do not exist');
    }

    return roles;
  }
}
