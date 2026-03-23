import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

import { ElementType, SelectorStrategy } from '@selector/enums';

export class CreateSelectorDto {
  @ApiProperty({ example: 'usernameInput', description: 'Selector name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: ElementType, example: ElementType.INPUT })
  @IsEnum(ElementType)
  elementType: ElementType;

  @ApiPropertyOptional({ enum: SelectorStrategy, example: SelectorStrategy.ID })
  @IsEnum(SelectorStrategy)
  @IsOptional()
  selectorStrategy?: SelectorStrategy;

  @ApiPropertyOptional({ example: '#username', description: 'Selector value' })
  @IsString()
  @IsOptional()
  selectorValue?: string;

  @ApiPropertyOptional({ example: 'Username field', description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid-here', description: 'Page ID' })
  @IsUUID()
  pageId: string;
}
