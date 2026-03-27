import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getStatus', () => {
    it('should return application status payload', () => {
      const appController = app.get(AppController);
      expect(appController.getStatus()).toEqual({
        status: 'ok',
        service: 'nest-ts-backend',
      });
    });
  });
});
