import express from "express";
import events from "events";
import * as WebSocket from "ws";
import { UserService } from "./service/user-service";

const port = 8080;
const app = express();
const messageEventEmitter = new events.EventEmitter();

// without this the request body will appear empty
app.use(express.urlencoded({ extended: true }));

// make content of folder "public" available in the browser
app.use(express.static("public"));

app.get("/messages", (req, res) => {
    console.log(`Waiting for new message...`);
    messageEventEmitter.once("newMessage", (from, message) => {
        console.log(`Message Received - from: ${from} - message: ${message}`);
        res.send({ ok: true, from, message });
    });
});

app.post("/new-message", (req, res) => {
    const { from, message } = req.body;
    console.log(`New Message - from: ${from} - message: ${message}`);
    messageEventEmitter.emit("newMessage", from, message);
    res.send({ ok: true, description: "Message Sent!" });
});

// Configure routesroutes.register(app);
// start the express server
const httpServer = app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});

const wsServer = new WebSocket.Server({ noServer: true });

const userService = new UserService();

wsServer.on("connection", (ws: WebSocket) => {
    console.log("New client connected");
    // whether the user has authenticated
    let authenticated = false;
    // makes sense ony when "authenticated" is true
    let currentUserLogin: string;
    // listening to new messages
    ws.on("message", (messageStr: string) => {
        console.log(`Received message: ${messageStr}`);
        const message = JSON.parse(messageStr);
        // parsing is complete at this point
        if (authenticated) {
            handleAuthenticated(currentUserLogin, message);
        } else {
            const login = message.login;
            const password = message.password;
            if (
                login &&
                password &&
                userService.areCredentialsCorrect(login, password)
            ) {
                authenticated = true;
                currentUserLogin = login;
                ws.send("authentication successful");
            } else {
                ws.send(
                    "provide correct login and password for authentication"
                );
                ws.close;
            }
        }
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

/**
 * Represent a data structure that represents a message that a user sends to another user.
 */
class IncomingMessage {
    /**
     * Some data that are meaningful only to the sender - not to the receiver.
     * For example, it can be a date when the client sent the message.
     * Let's say it shouldn't be longer than 60 symbols.
     */
    private salt: string;
    private previousMessageSalt;
    private content: boolean;
}

function handleAuthenticated(currentUserLogin: string, message: any): number {
    return new Date().getTime();
}
