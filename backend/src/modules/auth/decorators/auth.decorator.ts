import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ValidRoles } from '@auth/enums';
import { UserRolesGuard } from '@auth/guards/user-roles/user-roles.guard';
import { RoleProtected } from './role-protected/role-protected.decorator';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard('jwt'), UserRolesGuard),
    ApiBearerAuth(),
  );
}
