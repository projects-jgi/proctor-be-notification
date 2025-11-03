import { Module } from "@nestjs/common";
import ProctorController from "./proctor.controller";
import ProctorService from "./proctor.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { HttpModule } from "@nestjs/axios";

@Module({
    controllers: [ProctorController],
    providers: [ProctorService],
    imports: [HttpModule]
})
export default class ProctorModule{ 

}