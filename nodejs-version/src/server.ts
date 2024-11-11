import bodyParser from "body-parser";
import express, { Express } from "express";
import { WebSocket } from "ws";
import { ConnectionContext } from "./contexts/connection-context";
import { ServerContext } from "./contexts/server-context";
import { AuthenticationHandler } from "./service/authentication-handler";
import { NewMessageHandler } from "./service/new-message-handler";
import { MessageHandler } from "./service/message-handler";
import { Subject } from "./service/subject";

const port = 8080;
const app: Express = express();

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

wsServer.on("connection", function (ws: WebSocket) {
    console.log("New client connected");
    const connectionContext = new ConnectionContext(serverContext, ws);
    // listening to new messages
    ws.on("message", (messageStr: string) => {
        console.log(`the raw message string is "${messageStr}"`);
        const parsedMessage: Subject = JSON.parse(messageStr);
        subjectHandlerMap.get(parsedMessage.subject)!.handleMessage(serverContext, connectionContext, parsedMessage);
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
