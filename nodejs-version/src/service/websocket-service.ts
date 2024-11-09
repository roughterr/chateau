import { WebSocket } from "ws";
import { WsConnectionContext } from "./ws-connection-context";
import { MessageHandler, subjectHandlerMap } from "./message-handler";

export function wsHandler(ws: WebSocket) {
    console.log("New client connected");
    const context = new WsConnectionContext(ws);
    // listening to new messages
    ws.on("message", (messageStr: string) => {
        console.log(`the raw message string is "${messageStr}"`);

        const parsedMessage = JSON.parse(messageStr);
        const subject: string = parsedMessage.subject;
        const handler: MessageHandler = subjectHandlerMap.get(subject);
        handler.handleMessage(context, parsedMessage);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
}
