import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IAccessTokenPayload } from '../interfaces/access-token.payload.js';
import { SHOULD_NOT_BE_AUTHENTICATED_TOKEN } from '../tokens/should-not-be-authenticated.token.js';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject()
  private readonly jwtService!: JwtService;

  @Inject()
  private readonly reflector!: Reflector;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const shouldNotBeAuthenticated = this.reflector.getAllAndOverride<boolean>(
      SHOULD_NOT_BE_AUTHENTICATED_TOKEN,
      [context.getHandler(), context.getClass()],
    );

    const token = this.#extractTokenFromHeader(request);

    if (token === null) {
      if (shouldNotBeAuthenticated) {
        return true;
      } else {
        throw new UnauthorizedException();
      }
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<IAccessTokenPayload>(token);

      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  #extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : null;
  }
}
