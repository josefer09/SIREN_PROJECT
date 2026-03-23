import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DatabaseExceptionHandler } from '@common/providers/database-exception-handler.provider';
import { HttpResponseMessage } from '@common/utils';
import { AuthUser } from '@auth/interfaces';
import { Project } from './entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly dbExHandler: DatabaseExceptionHandler,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: AuthUser) {
    try {
      const project = this.projectRepository.create({
        ...createProjectDto,
        owner: { id: user.id },
      });

      await this.projectRepository.save(project);
      return HttpResponseMessage.created('Project', project);
    } catch (error) {
      this.logger.error(`Error creating project: ${(error as Error).message}`);
      this.dbExHandler.handle(error);
    }
  }

  async findAll(user: AuthUser) {
    try {
      const projects = await this.projectRepository.find({
        where: { owner: { id: user.id } },
        order: { createdAt: 'DESC' },
      });

      return projects;
    } catch (error) {
      this.logger.error(`Error fetching projects: ${(error as Error).message}`);
      this.dbExHandler.handle(error);
    }
  }

  async findOne(id: string, user: AuthUser) {
    try {
      const project = await this.findByIdAndOwner(id, user.id);
      return project;
    } catch (error) {
      this.logger.error(`Error fetching project ${id}: ${(error as Error).message}`);
      if (error instanceof NotFoundException || error instanceof ForbiddenException)
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: AuthUser) {
    try {
      const project = await this.findByIdAndOwner(id, user.id);
      Object.assign(project, updateProjectDto);
      await this.projectRepository.save(project);
      return HttpResponseMessage.updated('Project', project);
    } catch (error) {
      this.logger.error(`Error updating project ${id}: ${(error as Error).message}`);
      if (error instanceof NotFoundException || error instanceof ForbiddenException)
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async remove(id: string, user: AuthUser) {
    try {
      const project = await this.findByIdAndOwner(id, user.id);
      await this.projectRepository.remove(project);
      return HttpResponseMessage.deleted('Project', { id, name: project.name });
    } catch (error) {
      this.logger.error(`Error deleting project ${id}: ${(error as Error).message}`);
      if (error instanceof NotFoundException || error instanceof ForbiddenException)
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async findByIdAndOwner(id: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    if (project.owner.id !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }
}
