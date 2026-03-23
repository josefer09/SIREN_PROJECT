import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

import { DirectoryStrategy } from '@project/enums';

export class CreateProjectDto {
  @ApiProperty({ example: 'My App', description: 'Project name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'E2E tests', description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://myapp.com', description: 'Base URL of target app' })
  @IsUrl({}, { message: 'baseUrl must be a valid URL' })
  baseUrl: string;

  @ApiPropertyOptional({
    example: '/cypress/pages',
    description: 'Filesystem path for output',
  })
  @IsString()
  @IsOptional()
  projectPath?: string;

  @ApiPropertyOptional({
    enum: DirectoryStrategy,
    example: DirectoryStrategy.FLAT,
    description: 'Output directory strategy',
  })
  @IsEnum(DirectoryStrategy)
  @IsOptional()
  directoryStrategy?: DirectoryStrategy;
}
