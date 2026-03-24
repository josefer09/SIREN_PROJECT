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
import { SelectorService } from './selector.service';
import { CreateSelectorDto, UpdateSelectorDto, SetSelectorValueDto } from './dto';

@ApiTags('Selectors')
@ApiBearerAuth()
@Controller('selectors')
export class SelectorController {
  constructor(private readonly selectorService: SelectorService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new selector' })
  create(
    @Body() createSelectorDto: CreateSelectorDto,
    @GetUser() user: AuthUser,
  ) {
    return this.selectorService.create(createSelectorDto, user);
  }

  @Get('by-page/:pageId')
  @Auth()
  @ApiOperation({ summary: 'Get all selectors for a page' })
  findAllByPage(
    @Param('pageId', ParseUUIDPipe) pageId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.selectorService.findAllByPage(pageId, user);
  }

  @Get('check-duplicate')
  @Auth()
  @ApiOperation({ summary: 'Check if a selector name exists on a page' })
  checkDuplicates(
    @Query('pageId', ParseUUIDPipe) pageId: string,
    @Query('name') name: string,
    @GetUser() user: AuthUser,
  ) {
    return this.selectorService.checkDuplicates(pageId, name, user);
  }

  @Get('check-duplicate-value')
  @Auth()
  @ApiOperation({ summary: 'Check if a selector value already exists on a page' })
  checkDuplicateValue(
    @Query('pageId', ParseUUIDPipe) pageId: string,
    @Query('selectorValue') selectorValue: string,
    @Query('excludeId') excludeId: string | undefined,
    @GetUser() user: AuthUser,
  ) {
    return this.selectorService.checkDuplicateValue(pageId, selectorValue, user, excludeId);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get a selector by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: AuthUser) {
    return this.selectorService.findOne(id, user);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update a selector' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSelectorDto: UpdateSelectorDto,
    @GetUser() user: AuthUser,
  ) {
    return this.selectorService.update(id, updateSelectorDto, user);
  }

  @Patch(':id/set-value')
  @Auth()
  @ApiOperation({ summary: 'Set selector strategy and value from inspector' })
  setValue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() setSelectorValueDto: SetSelectorValueDto,
    @GetUser() user: AuthUser,
  ) {
    return this.selectorService.setValue(id, setSelectorValueDto, user);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete a selector' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: AuthUser) {
    return this.selectorService.remove(id, user);
  }
}
