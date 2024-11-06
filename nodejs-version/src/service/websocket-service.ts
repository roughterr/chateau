import { UserService } from "./user-service";
import { WebSocket } from "ws";

export interface SubjectData {
    subject: string;
}

/**
 * Represents data format for an authentication message sent by a WebSocket channel.
 */
export interface AuthenticationData extends SubjectData {
    login: string;
    password: string;
}

/**
 * Represent a data structure that represents a message that a user sends to another user.
 */
export interface NewMessage extends SubjectData {
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

export function wsHandler(ws: WebSocket) {
    console.log("New client connected");
    const context = new WebSocketConnectionContext(ws);
    // listening to new messages
    ws.on("message", (messageStr: string) => {
        console.log(`the raw message string is "${messageStr}"`);
        
        const parsedMessage = JSON.parse(messageStr);
        const subject: string = parsedMessage.subject;
        const handler: MessageHandler = subjectHandlerMap.get(subject);
        handler.handleMessage(context, parsedMessage);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
}

class WebSocketConnectionContext {
    /**
     * Whether the user has authenticated.
     */
    authenticated: boolean = false;
    /**
     * makes sense ony when "authenticated" is true
     */
    currentUserLogin: string;
    /**
     * Service class to work with users authentication.
     */
    userService = new UserService();
    /**
     * The WebSocket connection object.
     */
    ws: WebSocket;

    constructor(ws: WebSocket) {
        this.ws = ws;
    }
}

interface MessageHandler {
    handleMessage(context: WebSocketConnectionContext, parsedMessage: any): void;
}

class AuthenticationHandler implements MessageHandler {
    handleMessage(context: WebSocketConnectionContext, parsedMessage: any): void {
        const aData: AuthenticationData = parsedMessage;
        if (aData.login &&
            aData.password &&
            context.userService.areCredentialsCorrect(aData.login, aData.password)) {
            context.authenticated = true;
            context.currentUserLogin = aData.login;
            context.ws.send("authentication successful");
        } else {
            context.ws.send("provide correct login and password for authentication");
            context.ws.close;
        }
    }
}

class NewMessageHandler implements MessageHandler {
    handleMessage(context: WebSocketConnectionContext, parsedMessage: any): void {
        const newMessage: NewMessage = parsedMessage;
        console.log(`new message: ${newMessage}`);
        //TODO
    }
}

const subjectHandlerMap = new Map<string, MessageHandler>([
    ["authenicate", new AuthenticationHandler()],
    ["new-message", new NewMessageHandler()],
]);
