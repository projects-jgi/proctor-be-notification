import { HttpService } from "@nestjs/axios";
import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import ProctorService from "./proctor.service";
import { SocketGateway } from "src/socket/socket.gateway";

@Controller()
export default class ProctorController{

    constructor(
        private readonly http: HttpService,
        private readonly service: ProctorService,
        private readonly socket: SocketGateway
    ){}

    @EventPattern("exam")
    async handleExam(@Payload() message: any){
        try{
            const response = await lastValueFrom(
                this.http.get("http://localhost:8000/analyze_enhanced?image_url=" + message.resource_url)
            )
            
            const violation_data = {
                ...message,
                data: response.data
            }
            // console.log(violation_data)

            this.service.send_exam_violation(violation_data)
            if(violation_data.data.is_violation){
                this.socket.send_exam_violation(violation_data)
            }
        }catch(err){
            console.log(err)
        }
    }
}