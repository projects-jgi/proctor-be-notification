import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private EXAM_ATTEMTP_FRAME_BUCKET_NAME = 'exam-attempt-frames';

  private s3 = new S3Client({
    endpoint: process.env.S3_INTERNAL_ENDPOINT!,
    region: process.env.S3_REGION!,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });

  async uploadImage(buffer: Buffer, mimetype: string) {
    const key = randomUUID() + '.jpg';
    await this.s3.send(
      new PutObjectCommand({
        Bucket: 'testing-bucket',
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }),
    );

    return key;
  }

  async uploadExamAttemptFrame(bufer: Buffer, key: string) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.EXAM_ATTEMTP_FRAME_BUCKET_NAME,
        Key: key,
        Body: bufer,
        ContentType: 'image/jpeg',
      }),
    );

    return `/${this.EXAM_ATTEMTP_FRAME_BUCKET_NAME}/${key}`;
  }

  async deleteExamAttemptFrame(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.EXAM_ATTEMTP_FRAME_BUCKET_NAME,
        Key: key,
      }),
    );

    return true;
  }
}
