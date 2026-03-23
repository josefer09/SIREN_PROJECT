import { SetMetadata } from '@nestjs/common';

import { ValidRoles } from '@auth/enums';

export const META_ROLES = 'roles';

export const RoleProtected = (...roles: ValidRoles[]) =>
  SetMetadata(META_ROLES, roles);
