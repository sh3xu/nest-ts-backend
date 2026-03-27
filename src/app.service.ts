import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): { status: string; service: string } {
    return {
      status: 'ok',
      service: 'nest-ts-backend',
    };
  }
}
