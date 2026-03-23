import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RawHeaders = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.rawHeaders;
  },
);
