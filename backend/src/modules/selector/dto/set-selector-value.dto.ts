import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { SelectorStrategy } from '@selector/enums';

export class SetSelectorValueDto {
  @ApiProperty({ enum: SelectorStrategy, example: SelectorStrategy.ID })
  @IsEnum(SelectorStrategy)
  selectorStrategy: SelectorStrategy;

  @ApiProperty({ example: '#username', description: 'The selector value' })
  @IsString()
  selectorValue: string;
}
