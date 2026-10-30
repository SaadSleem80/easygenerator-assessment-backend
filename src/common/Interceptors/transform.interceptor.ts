import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Response } from 'express';
import { RESPONSE_MESSAGE_KEY } from '@src/common/decorators/response-message.decorator.js';

export interface ApiResponse<T> {
  message: string;
  code: number;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    // Handlers opt into a specific message with @ResponseMessage('messages.x');
    // everything else falls back to a generic localized "Success".
    const messageKey =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Success';

    const message = messageKey;

    return next.handle().pipe(
      map((data) => ({
        message: typeof message === 'string' ? message : 'Success',
        code: response.statusCode,
        data,
      })),
    );
  }
}
