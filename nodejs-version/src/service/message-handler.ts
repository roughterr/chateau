import { WsConnectionContext } from "./ws-connection-context";
import { AuthenticationHandler} from "./authentication-handler";
import { NewMessageHandler } from "./new-message-handler";

export interface MessageHandler {
    handleMessage(context: WsConnectionContext, parsedMessage: any): void;
}

export const subjectHandlerMap = new Map<string, MessageHandler>([
    ["authenicate", new AuthenticationHandler()],
    ["new-message", new NewMessageHandler()],
]);