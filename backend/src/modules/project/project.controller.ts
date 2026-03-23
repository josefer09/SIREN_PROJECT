import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Auth, GetUser } from '@auth/decorators';
import { AuthUser } from '@auth/interfaces';
import { ProjectService } from './project.service';
import { ExportService } from './export.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly exportService: ExportService,
  ) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new project' })
  create(@Body() createProjectDto: CreateProjectDto, @GetUser() user: AuthUser) {
    return this.projectService.create(createProjectDto, user);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all projects for current user' })
  findAll(@GetUser() user: AuthUser) {
    return this.projectService.findAll(user);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get a project by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: AuthUser) {
    return this.projectService.findOne(id, user);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update a project' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @GetUser() user: AuthUser,
  ) {
    return this.projectService.update(id, updateProjectDto, user);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete a project' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: AuthUser) {
    return this.projectService.remove(id, user);
  }

  @Get(':id/export')
  @Auth()
  @ApiOperation({ summary: 'Export all pages of a project as JSON' })
  exportProject(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.exportService.exportProjectJson(id, user);
  }

  @Get('export/page/:pageId/json')
  @Auth()
  @ApiOperation({ summary: 'Export a single page as JSON' })
  exportPageJson(
    @Param('pageId', ParseUUIDPipe) pageId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.exportService.exportPageJson(pageId, user);
  }

  @Get('export/page/:pageId/typescript')
  @Auth()
  @ApiOperation({ summary: 'Export a single page as TypeScript POM class' })
  async exportPageTypescript(
    @Param('pageId', ParseUUIDPipe) pageId: string,
    @GetUser() user: AuthUser,
    @Res() res: Response,
  ) {
    const content = await this.exportService.exportPageTypescript(pageId, user);
    res.set('Content-Type', 'text/plain');
    res.set('Content-Disposition', 'attachment; filename="page.ts"');
    res.send(content);
  }

  @Post('export/page/:pageId/update-file')
  @Auth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Write/update the TypeScript POM file on disk' })
  updateFile(
    @Param('pageId', ParseUUIDPipe) pageId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.exportService.updateFile(pageId, user);
  }
}
