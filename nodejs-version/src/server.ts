import bodyParser from "body-parser";
import express from "express";
import { WebSocket } from "ws";
import { ConnectionContext } from "./contexts/connection-context";
import { ServerContext } from "./contexts/server-context";
import { AuthenticationHandler } from "./service/authentication-handler";
import { NewMessageHandler } from "./service/new-message-handler";
import { MessageHandler } from "./service/message-handler";

const port = 8080;
const app = express();

// without this the request body in Websocket will appear empty
app.use(express.urlencoded({ extended: true }));

// make content of folder "public" available in the browser
app.use(express.static("public"));

// for HTTP
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Configure routesroutes.register(app);
// start the express server
const httpServer = app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});

const wsServer = new WebSocket.Server({ noServer: true });
const serverContext = new ServerContext(wsServer);

export const subjectHandlerMap = new Map<string, MessageHandler>([
    ["authenicate", new AuthenticationHandler()],
    ["new-message", new NewMessageHandler()],
]);

wsServer.on("connection", function(ws: WebSocket) {
    console.log("New client connected");
    const connectionContext = new ConnectionContext(ws);
    // listening to new messages
    ws.on("message", (messageStr: string) => {
        console.log(`the raw message string is "${messageStr}"`);
        const parsedMessage = JSON.parse(messageStr);
        const subject: string = parsedMessage.subject;
        const handler: MessageHandler = subjectHandlerMap.get(subject);
        handler.handleMessage(serverContext, connectionContext, parsedMessage);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

httpServer.on("upgrade", (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, (ws) => {
        wsServer.emit("connection", ws, req);
    });
});

