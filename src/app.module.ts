import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ProctorModule from './proctor-violation/proctor.module';
import SocketModule from './socket/socket.module';

@Module({
  imports: [
    ProctorModule,
    SocketModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
