import { WebSocket } from "ws";
import { UserPasswordService } from "../service/user-password-service";

/**
 * This class will contain data specific to one WebSocket server.
 */
export class ServerContext {
    /**
     * Service class to work with users authentication.
     */
    private userService = new UserPasswordService();

    /**
     * Map of connected users. The key is used is, the value is the list of his active connections.
     */
    private connectedUsers = new Map<string, WebSocket[]>();

    constructor(private wsServer) {}

    getUserService(): UserPasswordService {
        return this.userService;
    }

    public connectUser(login: string, ws: WebSocket): void {
        const websockets: WebSocket[] = this.connectedUsers.get(login);
        console.log(`login={login}, ws=${ws}, websockets={websockets}`);
        if (websockets) {
            websockets.push(ws);
        } else {
            this.connectedUsers.set(login, [ws]);
        }
        console.log(`this.connectedUsers=${this.connectedUsers}`);
    }
}
