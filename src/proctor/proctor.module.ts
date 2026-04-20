import { Module } from '@nestjs/common';
import ProctorController from './proctor.controller';
import ProctorService from './proctor.service';
import {
  ClientsModule,
  MessagePattern,
  Payload,
  Transport,
} from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from 'src/redis/redis.module';
import { S3Module } from 'src/s3/s3.module';
import SocketModule from 'src/socket/socket.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  controllers: [ProctorController],
  providers: [ProctorService],
  imports: [HttpModule, RedisModule, S3Module, SocketModule, KafkaModule],
})
export default class ProctorModule {}
