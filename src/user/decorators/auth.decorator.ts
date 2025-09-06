import { SignedInAuthObject } from '@clerk/backend/internal';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Auth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SignedInAuthObject => {
    const request = ctx.switchToHttp().getRequest();
    return request.auth;
  },
);
