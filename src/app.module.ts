import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { S3Module } from './s3/s3.module';
import SocketModule from './socket/socket.module';
import ProctorModule from './proctor/proctor.module';

@Module({
  imports: [SocketModule, ProctorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
