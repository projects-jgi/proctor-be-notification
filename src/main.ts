import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: "notification-service",
        brokers: ['localhost:9094']
      },
      consumer: {
        groupId: 'notification-consumer'
      }
    }
  })

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
