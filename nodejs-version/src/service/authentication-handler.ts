import { WsConnectionContext } from "./ws-connection-context";
import { MessageHandler} from "./message-handler";
import { Subject } from "./subject";

export class AuthenticationHandler implements MessageHandler {
    handleMessage(context: WsConnectionContext, parsedMessage: any): void {
        const aData: AuthenticationData = parsedMessage;
        if (
            aData.login &&
            aData.password &&
            context.userService.areCredentialsCorrect(
                aData.login,
                aData.password
            )
        ) {
            context.authenticated = true;
            context.currentUserLogin = aData.login;
            context.ws.send("authentication successful");
        } else {
            context.ws.send(
                "provide correct login and password for authentication"
            );
            context.ws.close;
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
