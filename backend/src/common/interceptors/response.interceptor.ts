import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

interface ResponseFormat<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        if (data && data.customResponse) {
          response.status(data.statusCode);
          return {
            statusCode: data.statusCode,
            message: data.message,
            data: data.data,
          };
        }

        const statusCode = response.statusCode;
        const message = this.getDefaultMessage(request.method);

        return {
          statusCode,
          message,
          data,
        };
      }),
    );
  }

  private getDefaultMessage(method: string): string {
    const messages: Record<string, string> = {
      GET: 'Request successful',
      POST: 'Resource created successfully',
      PATCH: 'Resource updated successfully',
      PUT: 'Resource updated successfully',
      DELETE: 'Resource deleted successfully',
    };
    return messages[method] || 'Request successful';
  }
}
