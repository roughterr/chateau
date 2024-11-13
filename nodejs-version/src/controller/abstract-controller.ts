import { ConnectionContext } from "../contexts/connection-context";
import { ServerContext } from "../contexts/server-context";
import { authenicateSubject, AuthenticationController } from "./authentication-controller";
import { NewMessageController, newMessageSubject } from "./new-message-controller";

export interface AbstractController {
    handleMessage(serverContext: ServerContext, connectionContext: ConnectionContext, parsedMessage: any): void;
}

/**
 * Map where the key is the path and the value is the handler.
 */
export const controllerMap = new Map<string, AbstractController>([
    [authenicateSubject, new AuthenticationController()],
    [newMessageSubject, new NewMessageController()],
]);
