import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class TokenDto {
  @ApiProperty({ example: 'a1b2c3', description: '6-character verification token' })
  @IsString()
  @Length(6, 6, { message: 'Token must be exactly 6 characters' })
  token: string;
}
