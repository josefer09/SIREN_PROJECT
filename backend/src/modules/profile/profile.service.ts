import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@user/entities/user.entity';
import { HashingAdapter, StorageAdapter } from '@common/adapters';
import { HttpResponseMessage } from '@common/utils';
import { UploadService } from '@upload/upload.service';
import { UpdateProfileDto, ChangeOwnPasswordDto } from './dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingAdapter: HashingAdapter,
    private readonly uploadService: UploadService,
    private readonly storageAdapter: StorageAdapter,
  ) {}

  async getProfile(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: { roles: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return HttpResponseMessage.success('Profile retrieved', user);
    } catch (error) {
      this.logger.error(`Error getting profile for user ${userId}: ${(error as Error).message}`);
      throw error;
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      Object.assign(user, dto);
      const updatedUser = await this.userRepository.save(user);

      return HttpResponseMessage.updated('Profile', updatedUser);
    } catch (error) {
      this.logger.error(`Error updating profile for user ${userId}: ${(error as Error).message}`);
      throw error;
    }
  }

  async changePassword(userId: string, dto: ChangeOwnPasswordDto) {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id: userId })
        .addSelect('user.password')
        .getOne();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isMatch = await this.hashingAdapter.compare(dto.currentPassword, user.password);

      if (!isMatch) {
        throw new BadRequestException('Current password is incorrect');
      }

      user.password = await this.hashingAdapter.hash(dto.newPassword);
      await this.userRepository.save(user);

      return HttpResponseMessage.success('Password changed successfully', null);
    } catch (error) {
      this.logger.error(`Error changing password for user ${userId}: ${(error as Error).message}`);
      throw error;
    }
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.avatar) {
        const oldPath = this.extractRelativePath(user.avatar);
        await this.uploadService.deleteFile(oldPath);
      }

      const uploadResult = await this.uploadService.uploadImage(file, 'avatars');
      user.avatar = uploadResult.url;
      const updatedUser = await this.userRepository.save(user);

      return HttpResponseMessage.updated('Avatar', updatedUser);
    } catch (error) {
      this.logger.error(`Error uploading avatar for user ${userId}: ${(error as Error).message}`);
      throw error;
    }
  }

  private extractRelativePath(url: string): string {
    const uploadsIndex = url.indexOf('/uploads/');
    if (uploadsIndex === -1) return url;
    return url.substring(uploadsIndex + 1);
  }
}
