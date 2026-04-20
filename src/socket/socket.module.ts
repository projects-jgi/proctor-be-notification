import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { RedisModule } from 'src/redis/redis.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  providers: [SocketGateway],
  imports: [RedisModule, KafkaModule, S3Module],
  exports: [SocketGateway],
})
export default class SocketModule {}
