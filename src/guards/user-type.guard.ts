import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserTypeEnum } from '../enums/user-type.enum.js';
import { USER_TYPE_TOKEN } from '../tokens/user-type.token.js';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const possibleUserTypes = this.reflector.getAllAndOverride<UserTypeEnum[]>(
      USER_TYPE_TOKEN,
      [context.getHandler(), context.getClass()],
    );

    if (!possibleUserTypes) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<Request>();

    if (!user) {
      throw new UnauthorizedException();
    }

    return possibleUserTypes.includes(user.type);
  }
}
