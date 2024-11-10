import { ConnectionContext } from "../contexts/connection-context";
import { ServerContext } from "../contexts/server-context";
import { MessageHandler } from "./message-handler";
import { Subject } from "./subject";

export class NewMessageHandler implements MessageHandler {
    handleMessage(serverContext: ServerContext,
        connectionContext: ConnectionContext,
        parsedMessage: any): void {
        const newMessage: NewMessage = parsedMessage;
        console.log(`new message: ${newMessage}`);
        //TODO
    }
}

/**
 * Represent a data structure that represents a message that a user sends to another user.
 */
export interface NewMessage extends Subject {
    /**
     * Some data that are meaningful only to the sender - not to the receiver.
     * For example, it can be a date when the client sent the message.
     * Let's say it shouldn't be longer than 60 symbols.
     */
    salt: string;
    /**
     * Salt of the previous message. If all the previous message are acknowlegled by the client, it will probably not put anything here.
     */
    previousMessageSalt?: string;
    /**
     * The content of the message.
     */
    content: string;
}