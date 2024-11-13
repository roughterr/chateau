import { ConnectionContext } from "../contexts/connection-context";
import { ServerContext } from "../contexts/server-context";
import { AbstractController } from "./abstract-controller";
import { messageFromServerToClient, NewMessage } from "../dto/message-dto";
import { Subject } from "../dto/subject";

export const newMessageSubject: string = "new-message";

export class NewMessageController implements AbstractController {
    handleMessage(serverContext: ServerContext, connectionContext: ConnectionContext, parsedMessage: any): void {
        const newMessage: NewMessage = parsedMessage;
        const messageToSend: messageFromServerToClient & Subject = {
            salt: "",
            content: newMessage.content,
            subject: "new-message",
            fromWhom: newMessage.toWhom
        };
        serverContext.sendJsonToUser(newMessage.toWhom, messageToSend);
    }
}
