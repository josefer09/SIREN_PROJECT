import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ example: 'LoginPage', description: 'Page name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '/login', description: 'URL path' })
  @IsString()
  path: string;

  @ApiPropertyOptional({ example: 'Login page', description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid-here', description: 'Project ID' })
  @IsUUID()
  projectId: string;
}
