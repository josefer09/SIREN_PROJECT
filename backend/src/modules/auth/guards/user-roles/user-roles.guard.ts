import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthUser } from '@auth/interfaces';
import { META_ROLES } from '@auth/decorators';

@Injectable()
export class UserRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles || validRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    const hasRole = user.roles.some((role) => validRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `User ${user.email} does not have the required role(s): [${validRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
