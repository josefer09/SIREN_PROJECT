import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatabaseExceptionHandler } from '@common/providers/database-exception-handler.provider';
import { HttpResponseMessage } from '@common/utils';
import { Role } from './entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly dbExHandler: DatabaseExceptionHandler,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = this.roleRepository.create(createRoleDto);
      await this.roleRepository.save(role);
      return HttpResponseMessage.created('Role', role);
    } catch (error) {
      this.logger.error(`Error creating role: ${(error as Error).message}`);
      this.dbExHandler.handle(error);
    }
  }

  async findAll() {
    try {
      return await this.roleRepository.find();
    } catch (error) {
      this.logger.error(`Error fetching roles: ${(error as Error).message}`);
      this.dbExHandler.handle(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.findById(id);
    } catch (error) {
      this.logger.error(`Error fetching role ${id}: ${(error as Error).message}`);
      if (error instanceof NotFoundException) throw error;
      this.dbExHandler.handle(error);
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      const role = await this.findById(id);
      Object.assign(role, updateRoleDto);
      await this.roleRepository.save(role);
      return HttpResponseMessage.updated('Role', role);
    } catch (error) {
      this.logger.error(`Error updating role ${id}: ${(error as Error).message}`);
      if (error instanceof NotFoundException) throw error;
      this.dbExHandler.handle(error);
    }
  }

  async remove(id: string) {
    try {
      const role = await this.findById(id);
      await this.roleRepository.remove(role);
      return HttpResponseMessage.deleted('Role', { id, name: role.name });
    } catch (error) {
      this.logger.error(`Error deleting role ${id}: ${(error as Error).message}`);
      if (error instanceof NotFoundException) throw error;
      this.dbExHandler.handle(error);
    }
  }

  private async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }
}
