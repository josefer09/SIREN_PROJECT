import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Match } from '@common/decorators/match.decorator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'user@email.com', description: 'User email' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'a1b2c3', description: '6-character reset token' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  token: string;

  @ApiProperty({ example: 'NewPassword123', description: 'New password' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must have an uppercase letter, a lowercase letter, and a number or special character',
  })
  password: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Confirm new password',
  })
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
