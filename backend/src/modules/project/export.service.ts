import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { AuthUser } from '@auth/interfaces';
import { Page } from '@page/entities/page.entity';
import { Selector } from '@selector/entities/selector.entity';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

export interface SelectorExport {
  strategy: string;
  value: string;
  elementType: string;
}

export interface PageExport {
  pageName: string;
  baseUrl: string;
  selectors: Record<string, SelectorExport>;
}

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Selector)
    private readonly selectorRepository: Repository<Selector>,
    private readonly projectService: ProjectService,
  ) {}

  async exportPageJson(pageId: string, user: AuthUser): Promise<PageExport> {
    const page = await this.pageRepository.findOne({
      where: { id: pageId },
      relations: ['project', 'project.owner'],
    });

    if (!page) {
      throw new NotFoundException(`Page with id ${pageId} not found`);
    }

    await this.projectService.findByIdAndOwner(page.project.id, user.id);

    const selectors = await this.selectorRepository.find({
      where: { page: { id: pageId } },
    });

    const selectorMap: Record<string, SelectorExport> = {};
    for (const sel of selectors) {
      if (sel.selectorValue && sel.selectorStrategy) {
        selectorMap[sel.name] = {
          strategy: sel.selectorStrategy,
          value: sel.selectorValue,
          elementType: sel.elementType,
        };
      }
    }

    return {
      pageName: page.name,
      baseUrl: page.project.baseUrl,
      selectors: selectorMap,
    };
  }

  async exportPageTypescript(pageId: string, user: AuthUser): Promise<string> {
    const data = await this.exportPageJson(pageId, user);

    const className = this.toPascalCase(data.pageName);
    const lines: string[] = [];

    lines.push(`export class ${className} {`);

    // Private arrow functions
    const entries = Object.entries(data.selectors);
    if (entries.length > 0) {
      lines.push('  // Selectors');
      for (const [name, sel] of entries) {
        const propName = this.toCamelCase(name);
        lines.push(
          `  private ${propName} = () => cy.get('${sel.value}');`,
        );
      }

      lines.push('');
      lines.push('  // Getters');
      for (const [name] of entries) {
        const propName = this.toCamelCase(name);
        const getterName = `get${this.toPascalCase(name)}`;
        lines.push(
          `  ${getterName}() { return this.${propName}(); }`,
        );
      }
    }

    lines.push('}');
    lines.push('');

    return lines.join('\n');
  }

  async exportProjectJson(projectId: string, user: AuthUser): Promise<PageExport[]> {
    await this.projectService.findByIdAndOwner(projectId, user.id);

    const pages = await this.pageRepository.find({
      where: { project: { id: projectId } },
    });

    const results: PageExport[] = [];
    for (const page of pages) {
      results.push(await this.exportPageJson(page.id, user));
    }

    return results;
  }

  async updateFile(
    pageId: string,
    user: AuthUser,
  ): Promise<{ filePath: string; created: boolean }> {
    const page = await this.pageRepository.findOne({
      where: { id: pageId },
      relations: ['project', 'project.owner'],
    });

    if (!page) {
      throw new NotFoundException(`Page with id ${pageId} not found`);
    }

    await this.projectService.findByIdAndOwner(page.project.id, user.id);

    const projectPath = page.project.projectPath;
    if (!projectPath) {
      throw new BadRequestException(
        'Project does not have a configured projectPath. Set it in project settings.',
      );
    }

    // Resolve the target directory
    const targetDir = path.resolve(projectPath);

    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      this.logger.log(`Created directory: ${targetDir}`);
    }

    // Search for existing file with .ts or .js extension
    const pageName = this.toPascalCase(page.name);
    const tsFilePath = path.join(targetDir, `${pageName}.ts`);
    const jsFilePath = path.join(targetDir, `${pageName}.js`);

    let filePath: string;
    let created = false;

    if (fs.existsSync(tsFilePath)) {
      filePath = tsFilePath;
    } else if (fs.existsSync(jsFilePath)) {
      filePath = jsFilePath;
    } else {
      filePath = tsFilePath;
      created = true;
    }

    // Generate content and write to file
    const content = await this.exportPageTypescript(pageId, user);
    fs.writeFileSync(filePath, content, 'utf-8');

    this.logger.log(
      `${created ? 'Created' : 'Updated'} file: ${filePath}`,
    );

    return { filePath, created };
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, (_, c) => c.toUpperCase());
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }
}
