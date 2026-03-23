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
import { ProjectService } from '@project/project.service';
import { Page } from './entities/page.entity';
import { CreatePageDto, UpdatePageDto } from './dto';

@Injectable()
export class PageService {
  private readonly logger = new Logger(PageService.name);

  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    private readonly projectService: ProjectService,
    private readonly dbExHandler: DatabaseExceptionHandler,
  ) {}

  async create(createPageDto: CreatePageDto, user: AuthUser) {
    try {
      const { projectId, ...pageData } = createPageDto;

      await this.projectService.findByIdAndOwner(projectId, user.id);

      const page = this.pageRepository.create({
        ...pageData,
        project: { id: projectId },
      });

      await this.pageRepository.save(page);
      return HttpResponseMessage.created('Page', page);
    } catch (error) {
      this.logger.error(`Error creating page: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async findAllByProject(projectId: string, user: AuthUser) {
    try {
      await this.projectService.findByIdAndOwner(projectId, user.id);

      return await this.pageRepository.find({
        where: { project: { id: projectId } },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching pages: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async findOne(id: string, user: AuthUser) {
    try {
      const page = await this.findByIdWithProject(id);
      await this.projectService.findByIdAndOwner(page.project.id, user.id);
      return page;
    } catch (error) {
      this.logger.error(`Error fetching page ${id}: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async update(id: string, updatePageDto: UpdatePageDto, user: AuthUser) {
    try {
      const page = await this.findByIdWithProject(id);
      await this.projectService.findByIdAndOwner(page.project.id, user.id);

      Object.assign(page, updatePageDto);
      await this.pageRepository.save(page);

      return HttpResponseMessage.updated('Page', page);
    } catch (error) {
      this.logger.error(`Error updating page ${id}: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async remove(id: string, user: AuthUser) {
    try {
      const page = await this.findByIdWithProject(id);
      await this.projectService.findByIdAndOwner(page.project.id, user.id);

      await this.pageRepository.remove(page);
      return HttpResponseMessage.deleted('Page', { id, name: page.name });
    } catch (error) {
      this.logger.error(`Error deleting page ${id}: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  private async findByIdWithProject(id: string): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!page) {
      throw new NotFoundException(`Page with id ${id} not found`);
    }

    return page;
  }
}
