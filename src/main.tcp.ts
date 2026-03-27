import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('TCPBootstrap');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: Number(process.env.TCP_PORT ?? 4001),
      },
    },
  );

  const configService = app.get(ConfigService);
  const tcpPort = configService.get<number>('TCP_PORT', 4001);
  await app.listen();
  logger.log(`TCP microservice listening on port ${tcpPort}`);
}

void bootstrap();
