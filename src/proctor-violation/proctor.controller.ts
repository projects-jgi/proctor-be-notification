import { HttpService } from "@nestjs/axios";
import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

@Controller()
export default class ProctorController{

    constructor(private readonly http: HttpService){}

    @EventPattern("exam")
    async handleExam(@Payload() message: any){
        console.log(message)
        const payload = message.value
            ? JSON.parse(message.value.toString())
            : message;
        
            console.log(payload)

        try{
            const response = await lastValueFrom(
                this.http.get("http://localhost:8000/analyze_enhanced?image_url=" + payload.image_url)
            )

            const { is_violation } = response.data

            if(!is_violation){
                return
            }
        }catch(err){
            console.log(err)
        }
    }
}