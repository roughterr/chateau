// import { WebSocket } from "ws";

export class UserService {
    private userToPasswordMap = new Map<string, string>([
        ["ian", "ian"],
        ["dan", "dan"],
        ["chris", "chris"],
    ]);

    // private connectedUsers = new Map<string, User>();

    /**
     * Says whether the combination of login and password is correct.
     */
    areCredentialsCorrect(login: string, password: string): boolean {
        return this.userToPasswordMap.has(login) && this.userToPasswordMap.get(login) == password;
    }
}

// class User {
//     password: string;
//     activeConnections: WebSocket[] = [];
// }
