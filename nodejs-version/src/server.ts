import express from "express";
import * as WebSocket from "ws";
import { wsHandler } from "./service/websocket-service";
import bodyParser from "body-parser";

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

wsServer.on("connection", wsHandler);

httpServer.on("upgrade", (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, (ws) => {
        wsServer.emit("connection", ws, req);
    });
});

