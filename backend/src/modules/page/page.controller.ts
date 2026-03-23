import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Auth, GetUser } from '@auth/decorators';
import { AuthUser } from '@auth/interfaces';
import { PageService } from './page.service';
import { CreatePageDto, UpdatePageDto } from './dto';

@ApiTags('Pages')
@ApiBearerAuth()
@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new page' })
  create(@Body() createPageDto: CreatePageDto, @GetUser() user: AuthUser) {
    return this.pageService.create(createPageDto, user);
  }

  @Get('by-project/:projectId')
  @Auth()
  @ApiOperation({ summary: 'Get all pages for a project' })
  findAllByProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.pageService.findAllByProject(projectId, user);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get a page by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: AuthUser) {
    return this.pageService.findOne(id, user);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update a page' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePageDto: UpdatePageDto,
    @GetUser() user: AuthUser,
  ) {
    return this.pageService.update(id, updatePageDto, user);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete a page' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: AuthUser) {
    return this.pageService.remove(id, user);
  }
}
