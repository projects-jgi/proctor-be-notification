import { Module } from "@nestjs/common";
import ProctorController from "./proctor.controller";
import ProctorService from "./proctor.service";
import { ClientsModule, MessagePattern, Payload, Transport } from "@nestjs/microservices";
import { HttpModule } from "@nestjs/axios";
import { SocketGateway } from "src/socket/socket.gateway";

@Module({
    controllers: [
        ProctorController,
    ],
    providers: [
        ProctorService,
        SocketGateway
    ],
    imports: [
        HttpModule,
        ClientsModule.register([
            {
                name: "exam-violation-service",
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: "exam-violation-service",
                        brokers: ['localhost:9094']
                    },
                    producer: {
                        allowAutoTopicCreation: true
                    }
                }
            }
        ])
    ]
})
export default class ProctorModule{ 

}