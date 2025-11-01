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
}