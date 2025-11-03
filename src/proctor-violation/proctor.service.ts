import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientKafka, MessagePattern, Payload } from "@nestjs/microservices";

@Injectable()
export default class ProctorService implements OnModuleInit{
    constructor(@Inject('exam-violation-service') private readonly kafkaClient: ClientKafka){}

    async onModuleInit() {
        await this.kafkaClient.connect();
    }

    async send_exam_violation(payload: any){
        await this.kafkaClient.emit("exam-violations", payload);
    }
}