import { HttpService } from '@nestjs/axios';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import ProctorService from './proctor.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import type {
  KafkaExamAttemptFrameMessage,
  KafkaExamMessage,
} from 'src/types/type';
import { RedisService } from 'src/redis/redis.service';
import FormData from 'form-data';
import { S3Service } from 'src/s3/s3.service';
import { KafkaService } from 'src/kafka/kafka.service';

@Controller()
export default class ProctorController {
  constructor(
    private readonly http: HttpService,
    private readonly service: ProctorService,
    private readonly redis: RedisService,
    private readonly s3: S3Service,
    private readonly socket: SocketGateway,
    private readonly kafka: KafkaService,
    // private readonly socket: SocketGateway,
  ) {}

  // @EventPattern('exam')
  // async handleExam(@Payload() message: KafkaExamMessage) {
  //   try {
  //     const response = await lastValueFrom(
  //       this.http.get(
  //         process.env.PROCTOR_AI_URL +
  //           '/analyze_enhanced?image_url=' +
  //           message.resource_url,
  //       ),
  //     );

  //     const violation_data = {
  //       ...message,
  //       data: response.data,
  //     };
  //     // console.log(violation_data)

  //     //   this.service.send_exam_violation(violation_data);
  //     if (violation_data.data.is_violation) {
  //       this.socket.send_exam_violation(violation_data);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  @EventPattern('exam-attempt-frame')
  async handleExamAttemptFrame(
    @Payload() message: KafkaExamAttemptFrameMessage,
  ) {
    const image = await firstValueFrom(
      this.http.get(message.image_url, { responseType: 'arraybuffer' }),
    );

    const buffer = Buffer.from(image.data);

    try {
      const form = new FormData();
      form.append('file', buffer, {
        filename: 'frame.jpg',
        contentType: 'image/jpeg',
      });
      form.append('exam_id', String(message.exam_id));
      form.append('user_id', String(message.attempt_id));
      const response = await firstValueFrom(
        this.http.post(process.env.PROCTOR_AI_URL + '/api/v1/frame', form, {
          headers: form.getHeaders(),
        }),
      );

      /**
       * response format:
       * {
       *  timestamp: string,
       *  exam_id: string,
       *  user_id: string,
       *  detections: {
       *   person_count: number,
       *   face_count: number,
       *   phone_present: boolean
       *  },
       *  event: string,
       *  action: string,
       *  confidence: number,
       * }
       *
       */

      let violation_details = {
        status: false,
        description: '',
        violation_type: -1,
      };

      // multiple people or faces in the frame is a violation
      if (
        response.data.detections.person_count > 1 ||
        response.data.detections.face_count > 1
      ) {
        violation_details = {
          status: true,
          description: 'Multiple people or faces detected in the frame',
          violation_type: 0,
        };
      }

      // phone present in the frame is a violation
      if (response.data.detections.phone_present) {
        violation_details = {
          status: true,
          description: 'Phone detected in the frame',
          violation_type: 1,
        };
      }

      // no person or face detected or camera is obstrcuted
      if (
        response.data.detections.face_count === 0 ||
        response.data.detections.person_count === 0
      ) {
        violation_details = {
          status: true,
          description: 'No person or face detected or camera is obstructed',
          violation_type: 2,
        };
      }

      const redis_key_name = `violation:exam-${message.exam_id}:attempt-${message.attempt_id}:type-${violation_details.violation_type}`;
      const cached_violation = await this.redis.get(redis_key_name);

      if (violation_details.status && cached_violation === null) {
        // store the violation in redis with a TTL of 5 seconds, to prevent duplication of violation notifications for the same frame
        // if a violation of same type for the same exam attempt already exists in redis, do not send another notification
        await this.redis.set(redis_key_name, violation_details.description, 5);

        this.socket.send_exam_violation({
          exam_id: message.exam_id,
          attempt_id: message.attempt_id,
          ...violation_details,
        });
        this.kafka.emit('exam-attempt-violation', {
          exam_id: message.exam_id,
          attempt_id: message.attempt_id,
          ...violation_details,
          reference_url: message.external_image_url,
        });
      } else {
        this.s3.deleteExamAttemptFrame(message.image_key);
      }
      // const violation_data = {
      //   ...message,
      //   data: response.data,
      // };
      // console.log(violation_data);
      // this.service.send_exam_violation(violation_data);
      // if (violation_data.data.is_violation) {
      //   this.socket.send_exam_violation(violation_data);
      // }
    } catch (err: any) {
      console.log('ERROR STATUS:', err?.response?.status);
      console.log('ERROR DATA:', err?.response?.data);
      // console.log('FULL ERROR:', err.message.detail[0].loc);
    }
  }
}
