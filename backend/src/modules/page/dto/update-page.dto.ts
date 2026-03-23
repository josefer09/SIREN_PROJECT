import { OmitType, PartialType } from '@nestjs/swagger';

import { CreatePageDto } from './create-page.dto';

export class UpdatePageDto extends PartialType(
  OmitType(CreatePageDto, ['projectId'] as const),
) {}
