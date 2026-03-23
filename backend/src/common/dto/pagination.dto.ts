import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ example: 10, description: 'Number of items per page' })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ example: 0, description: 'Number of items to skip' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
