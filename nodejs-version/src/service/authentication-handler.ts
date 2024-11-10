import { ConnectionContext } from "../contexts/connection-context";
import { ServerContext } from "../contexts/server-context";
import { MessageHandler } from "./message-handler";
import { Subject } from "./subject";

export class AuthenticationHandler implements MessageHandler {
    handleMessage(serverContext: ServerContext,
        connectionContext: ConnectionContext,
        parsedMessage: any): void {
        const aData: AuthenticationData = parsedMessage;
        if (
            aData.login &&
            aData.password &&
            serverContext.getUserService().areCredentialsCorrect(
                aData.login,
                aData.password
            )
        ) {
            connectionContext.authenticated = true;
            connectionContext.currentUserLogin = aData.login;
            connectionContext.sendStringToServer("authentication successful");
        } else {
            connectionContext.sendStringToServer(
                "provide correct login and password for authentication"
            );
            connectionContext.closeConnection();
        }
    }
}

/**
 * Represents data format for an authentication message sent by a WebSocket channel.
 */
export interface AuthenticationData extends Subject {
    login: string;
    password: string;
}
