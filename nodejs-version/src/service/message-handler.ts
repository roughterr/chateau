import { ConnectionContext } from "../contexts/connection-context";
import { ServerContext } from "../contexts/server-context";
import { AuthenticationHandler } from "./authentication-handler";
import { NewMessageHandler } from "./new-message-handler";

export interface MessageHandler {
    handleMessage(serverContext: ServerContext, connectionContext: ConnectionContext, parsedMessage: any): void;
}

export const subjectHandlerMap = new Map<string, MessageHandler>([
    ["authenicate", new AuthenticationHandler()],
    ["new-message", new NewMessageHandler()],
]);
