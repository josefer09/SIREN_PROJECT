import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'user@email.com', description: 'User email' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'Password123', description: 'User password' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}
