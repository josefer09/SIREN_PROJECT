import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class EmailDto {
  @ApiProperty({ example: 'user@email.com', description: 'User email' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;
}
