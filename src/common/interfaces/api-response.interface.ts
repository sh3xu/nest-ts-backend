export interface ApiSuccessResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  data?: unknown;
  stack?: string;
  timestamp?: string;
  path?: string;
}
