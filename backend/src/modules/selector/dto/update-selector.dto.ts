import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateSelectorDto } from './create-selector.dto';

export class UpdateSelectorDto extends PartialType(
  OmitType(CreateSelectorDto, ['pageId'] as const),
) {}
