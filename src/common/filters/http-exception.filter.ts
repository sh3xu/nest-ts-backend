import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? this.extractMessage(exception)
      : 'Internal server error';

    const payload: ApiErrorResponse = {
      statusCode,
      message,
    };

    if (statusCode >= 500) {
      payload.stack = exception instanceof Error ? (exception.stack ?? '') : '';
      payload.timestamp = new Date().toISOString();
      payload.path = request.url;
    } else if (isHttpException) {
      payload.data = this.extractData(exception);
    }

    response.status(statusCode).json(payload);
  }

  private extractMessage(exception: HttpException): string {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const responseWithMessage = exceptionResponse as {
        message?: string | string[];
      };
      const message = responseWithMessage.message;
      if (Array.isArray(message)) {
        return message.join(', ');
      }
      if (typeof message === 'string') {
        return message;
      }
    }

    return exception.message;
  }

  private extractData(exception: HttpException): unknown {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse !== 'object' || exceptionResponse === null) {
      return undefined;
    }

    const responseObject = exceptionResponse as Record<string, unknown>;
    const { message, statusCode, ...rest } = responseObject;

    if (Object.keys(rest).length > 0) {
      return rest;
    }

    if (Array.isArray(message)) {
      return { errors: message };
    }

    if (typeof statusCode === 'number') {
      return { statusCode };
    }

    return undefined;
  }
}
