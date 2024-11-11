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
        if (websockets) {
            websockets.push(ws);
        } else {
            this.connectedUsers.set(login, [ws]);
        }
        // JSON.stringify won't work on a Map
        for (let [login, sessions] of this.connectedUsers) {
            console.log(`There is a connected user with login: ${login} and number of open sessions: ${sessions.length}`);
        }
    }
}
