import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRoleEnum } from '../enums/user-role.enum.js';
import { ROLE_TOKEN } from '../tokens/role.token.js';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const possibleRoles = this.reflector.getAllAndOverride<string[]>(
      ROLE_TOKEN,
      [context.getHandler(), context.getClass()],
    );

    if (!possibleRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<Request>();

    if (!user) {
      throw new UnauthorizedException();
    }

    return possibleRoles.some((role) =>
      user.roles?.includes(role as UserRoleEnum),
    );
  }
}
