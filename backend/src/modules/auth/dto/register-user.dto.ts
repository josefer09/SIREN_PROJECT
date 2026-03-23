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

export class RegisterUserDto {
  @ApiProperty({ example: 'user@email.com', description: 'User email' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'Password123', description: 'User password' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must have an uppercase letter, a lowercase letter, and a number or special character',
  })
  password: string;

  @ApiProperty({ example: 'Password123', description: 'Confirm password' })
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;
}
