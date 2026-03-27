import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode?: number }>();
    const statusCode = response.statusCode ?? HttpStatus.OK;

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message: 'Request successful',
        data,
      })),
    );
  }
}
