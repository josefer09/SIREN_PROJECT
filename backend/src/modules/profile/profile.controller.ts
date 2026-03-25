import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Auth, GetUser } from '@auth/decorators';
import { AuthUser } from '@auth/interfaces';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, ChangeOwnPasswordDto } from './dto';

@ApiTags('Profile')
@Auth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  getProfile(@GetUser() user: AuthUser) {
    return this.profileService.getProfile(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update authenticated user profile' })
  updateProfile(@GetUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, dto);
  }

  @Patch('password')
  @ApiOperation({ summary: 'Change own password' })
  changePassword(@GetUser() user: AuthUser, @Body() dto: ChangeOwnPasswordDto) {
    return this.profileService.changePassword(user.id, dto);
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload or update user avatar' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Avatar image (jpg, png, webp)' },
      },
      required: ['file'],
    },
  })
  uploadAvatar(@GetUser() user: AuthUser, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file was provided');
    }
    return this.profileService.uploadAvatar(user.id, file);
  }
}
