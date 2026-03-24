import {
  BadRequestException,
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
import { PageService } from '@page/page.service';
import { Selector } from './entities/selector.entity';
import { SelectorStatus } from './enums';
import { CreateSelectorDto, UpdateSelectorDto, SetSelectorValueDto } from './dto';

@Injectable()
export class SelectorService {
  private readonly logger = new Logger(SelectorService.name);

  constructor(
    @InjectRepository(Selector)
    private readonly selectorRepository: Repository<Selector>,
    private readonly pageService: PageService,
    private readonly dbExHandler: DatabaseExceptionHandler,
  ) {}

  async create(createSelectorDto: CreateSelectorDto, user: AuthUser) {
    try {
      const { pageId, ...selectorData } = createSelectorDto;

      await this.pageService.findOne(pageId, user);

      if (selectorData.selectorValue) {
        await this.ensureValueUnique(pageId, selectorData.selectorValue);
      }

      const selector = this.selectorRepository.create({
        ...selectorData,
        page: { id: pageId },
      });

      await this.selectorRepository.save(selector);
      return HttpResponseMessage.created('Selector', selector);
    } catch (error) {
      this.logger.error(`Error creating selector: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async findAllByPage(pageId: string, user: AuthUser) {
    try {
      await this.pageService.findOne(pageId, user);

      return await this.selectorRepository.find({
        where: { page: { id: pageId } },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error fetching selectors: ${(error as Error).message}`);
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
      const selector = await this.findByIdWithPage(id);
      await this.pageService.findOne(selector.page.id, user);
      return selector;
    } catch (error) {
      this.logger.error(`Error fetching selector ${id}: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async update(id: string, updateSelectorDto: UpdateSelectorDto, user: AuthUser) {
    try {
      const selector = await this.findByIdWithPage(id);
      await this.pageService.findOne(selector.page.id, user);

      if (
        updateSelectorDto.selectorValue &&
        updateSelectorDto.selectorValue !== selector.selectorValue
      ) {
        await this.ensureValueUnique(
          selector.page.id,
          updateSelectorDto.selectorValue,
          id,
        );
      }

      Object.assign(selector, updateSelectorDto);
      await this.selectorRepository.save(selector);

      return HttpResponseMessage.updated('Selector', selector);
    } catch (error) {
      this.logger.error(`Error updating selector ${id}: ${(error as Error).message}`);
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
      const selector = await this.findByIdWithPage(id);
      await this.pageService.findOne(selector.page.id, user);

      await this.selectorRepository.remove(selector);
      return HttpResponseMessage.deleted('Selector', { id, name: selector.name });
    } catch (error) {
      this.logger.error(`Error deleting selector ${id}: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async setValue(id: string, setSelectorValueDto: SetSelectorValueDto, user: AuthUser) {
    try {
      const selector = await this.findByIdWithPage(id);
      await this.pageService.findOne(selector.page.id, user);

      await this.ensureValueUnique(
        selector.page.id,
        setSelectorValueDto.selectorValue,
        id,
      );

      selector.selectorStrategy = setSelectorValueDto.selectorStrategy;
      selector.selectorValue = setSelectorValueDto.selectorValue;
      selector.status = SelectorStatus.MAPPED;

      await this.selectorRepository.save(selector);

      return HttpResponseMessage.updated('Selector', selector);
    } catch (error) {
      this.logger.error(`Error setting selector value ${id}: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async checkDuplicates(pageId: string, name: string, user: AuthUser) {
    try {
      await this.pageService.findOne(pageId, user);

      const existing = await this.selectorRepository.findOne({
        where: { page: { id: pageId }, name },
      });

      return { isDuplicate: !!existing };
    } catch (error) {
      this.logger.error(`Error checking duplicates: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  async checkDuplicateValue(
    pageId: string,
    selectorValue: string,
    user: AuthUser,
    excludeId?: string,
  ) {
    try {
      await this.pageService.findOne(pageId, user);

      const existing = await this.selectorRepository.findOne({
        where: { page: { id: pageId }, selectorValue },
      });

      const isDuplicate = !!existing && existing.id !== excludeId;
      return { isDuplicate };
    } catch (error) {
      this.logger.error(`Error checking value duplicates: ${(error as Error).message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      this.dbExHandler.handle(error);
    }
  }

  private async ensureValueUnique(
    pageId: string,
    selectorValue: string,
    excludeId?: string,
  ) {
    const existing = await this.selectorRepository.findOne({
      where: { page: { id: pageId }, selectorValue },
    });

    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(
        `A selector with value "${selectorValue}" already exists on this page`,
      );
    }
  }

  private async findByIdWithPage(id: string): Promise<Selector> {
    const selector = await this.selectorRepository.findOne({
      where: { id },
      relations: ['page', 'page.project'],
    });

    if (!selector) {
      throw new NotFoundException(`Selector with id ${id} not found`);
    }

    return selector;
  }
}
