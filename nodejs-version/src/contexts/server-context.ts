import { UserService } from "../service/user-service";

/**
 * This class will contain data specific to one WebSocket server.
 */
export class ServerContext {
    /**
     * Service class to work with users authentication.
     */
    private userService = new UserService();

    constructor(private wsServer) {}

    getUserService(): UserService {
        return this.userService;
    }
}
