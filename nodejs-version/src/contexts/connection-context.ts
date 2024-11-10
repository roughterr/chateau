import { UserService } from "../service/user-service";
import { WebSocket } from "ws";

/**
 * This class will contain data specific to one WebSocket connection.
 */
export class ConnectionContext {
    /**
     * Whether the user has authenticated.
     */
    authenticated: boolean = false;
    /**
     * makes sense ony when "authenticated" is true
     */
    currentUserLogin: string;

    /**
     * The WebSocket connection object.
     */
    private ws: WebSocket;

    constructor(ws: WebSocket) {
        this.ws = ws;
    }

    closeConnection() {
        this.ws.close;
        //maybe later we will implement removing it from a pool of connections
    }

    sendJsonToServer(json: any) {
        this.sendStringToServer(JSON.stringify(json));
    }

    sendStringToServer(message: string) {
        this.ws.send(message);
    }
}
