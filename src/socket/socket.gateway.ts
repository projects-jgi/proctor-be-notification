import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
export class SocketGateway{
    @WebSocketServer()
    server: Server

    @SubscribeMessage("custom-event")
    findAll(@MessageBody() data: any){
        return {
            "message": data
        }
    }

    send_exam_violation(data){
        const emit_name = "exam-attempt-violation_exam-" + data.exam_id + "_attempt-" + data.attempt_id
        this.server.emit(emit_name, data)
    }
}