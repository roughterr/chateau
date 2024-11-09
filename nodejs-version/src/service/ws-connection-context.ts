import { UserService } from "./user-service";
import { WebSocket } from "ws";

export class WsConnectionContext {
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
