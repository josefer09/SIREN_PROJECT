import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { Match } from '@common/decorators/match.decorator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123', description: 'Current password' })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123', description: 'New password' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must have an uppercase letter, a lowercase letter, and a number or special character',
  })
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Confirm new password',
  })
  @IsString()
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword: string;
}
