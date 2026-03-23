import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Auth } from '@auth/decorators';
import { ValidRoles } from '@auth/enums';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Create a new role' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Get all roles' })
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Get a role by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Update a role' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Delete a role' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.remove(id);
  }
}
