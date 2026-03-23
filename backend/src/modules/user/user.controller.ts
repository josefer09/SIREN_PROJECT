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
import { ValidRoles } from '@auth/enums';
import { AuthUser } from '@auth/interfaces';
import { PaginationDto } from '@common/dto/pagination.dto';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.userService.findAll(paginationDto);
  }

  @Get(':id')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Get a user by ID (admin only)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Update a user (admin only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Delete a user (admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }

  @Patch(':id/block')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Block a user (admin only)' })
  block(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.block(id);
  }

  @Patch(':id/unblock')
  @Auth(ValidRoles.ADMIN)
  @ApiOperation({ summary: 'Unblock a user (admin only)' })
  unblock(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.unblock(id);
  }

  @Patch('change-password')
  @Auth()
  @ApiOperation({ summary: 'Change own password (authenticated)' })
  changePassword(
    @GetUser() user: AuthUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user, changePasswordDto);
  }
}
