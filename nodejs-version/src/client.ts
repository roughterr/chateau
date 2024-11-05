import * as WebSocket from "ws";
const ws = new WebSocket.WebSocket("ws://localhost:8080");
import {AuthenticationData, IncomingMessage} from "./service/websocket-service";

ws.on("open", () => {
    console.log("Connected to server");

    const message: AuthenticationData = {
        login: "John Doe",
        password: "john@example.com"
    };
    message.login = "ian";
    message.password = "ian";
    ws.send(JSON.stringify(message));
});

ws.on("message", (message: string) => {
    console.log(`Received message from server: ${message}`);
    if (message == "authentication successful") {
        const message: IncomingMessage = {
            salt: Date.now().toString(),
            content: "hi dan"
        };
        ws.send(JSON.stringify(message));
    }
});

ws.on("close", () => {
    console.log("Disconnected from server");
});
