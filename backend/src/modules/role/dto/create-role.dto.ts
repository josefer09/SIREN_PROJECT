import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'editor', description: 'Role name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'Can edit content', description: 'Role description' })
  @IsString()
  @IsOptional()
  description?: string;
}
