import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server } from 'socket.io';
import { KafkaService } from 'src/kafka/kafka.service';
import { RedisService } from 'src/redis/redis.service';
import { S3Service } from 'src/s3/s3.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly redis: RedisService,
    private readonly kafka: KafkaService,
    private readonly s3: S3Service,
  ) {}

  @SubscribeMessage('custom-event')
  findAll(@MessageBody() data: any) {
    return {
      message: data,
    };
  }

  @SubscribeMessage('ws-exam-attempt-frame')
  async test(@MessageBody() data: any) {
    const { exam_id, attempt_id, image } = data;

    // const base64 = image.split(',')[1]; // if base64
    // const buffer = Buffer.from(base64, 'base64');
    const buffer = Buffer.from(image);

    const key = `exam-${exam_id}/attempt-${attempt_id}/frame-${randomUUID()}.jpg`;
    const image_path = await this.s3.uploadExamAttemptFrame(buffer, key);

    const internal_image_url = `${process.env.S3_INTERNAL_ENDPOINT}${image_path}`;

    // console.log('Image uploaded to S3 with key:', internal_image_url);

    const kafka_message = {
      exam_id,
      attempt_id,
      image_url: internal_image_url,
      image_key: key,
      external_image_url: `${process.env.S3_ENDPOINT}${image_path}`,
    };

    // await this.redis.set(redis_key_name, buffer, 30);
    await this.kafka.emit('exam-attempt-frame', kafka_message);
  }

  send_exam_violation(data) {
    const emit_name =
      'exam-attempt-violation:exam-' +
      data.exam_id +
      ':attempt-' +
      data.attempt_id;
    console.log('Emit name: ' + emit_name);
    this.server.emit(emit_name, data);
  }
}
