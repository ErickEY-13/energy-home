import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetDispositivo = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const dispositivo = request.dispositivo;

    if (data) {
      return dispositivo?.[data];
    }

    return dispositivo;
  },
);
