import { UserService } from "./user-service";
import { WebSocket } from "ws";

export class WebsocketService {
    // whether the user has authenticated
    private authenticated: boolean = false;
    // makes sense ony when "authenticated" is true
    private currentUserLogin: string;

    private userService = new UserService();

    constructor(private readonly ws: WebSocket) {
    }

    /**
     * Handles WebSocket messages.
     */
    public onMessage(parsedMessage): void {
        // parsing is complete at this point
        if (this.authenticated) {
            this.handleAuthenticated(this.currentUserLogin, parsedMessage);
        } else {
            const aData: AuthenticationData = parsedMessage;
            // const login = parsedJson.login;
            // const password = parsedJson.password;
            if (aData.login &&
                aData.password &&
                this.userService.areCredentialsCorrect(aData.login, aData.password)) {
                this.authenticated = true;
                this.currentUserLogin = aData.login;
                this.ws.send("authentication successful");
            } else {
                this.ws.send("provide correct login and password for authentication");
                this.ws.close;
            }
        }
    }

    private handleAuthenticated(currentUserLogin: string, message: any): number {
        return new Date().getTime();
    }
}

interface AuthenticationData {
    login: string;
    password: string;
}

/**
 * Represent a data structure that represents a message that a user sends to another user.
 */
class IncomingMessage {
    /**
     * Some data that are meaningful only to the sender - not to the receiver.
     * For example, it can be a date when the client sent the message.
     * Let's say it shouldn't be longer than 60 symbols.
     */
    salt: string;
    /**
     * Salt of the previous message. If all the previous message are acknowlegled by the client, it will probably not put anything here.
     */
    previousMessageSalt: string;
    /**
     * The content of the message.
     */
    content: string;
}