import * as WebSocket from "ws";
const ws = new WebSocket.WebSocket("ws://localhost:8080");
import {AuthenticationData, NewMessage} from "./service/websocket-service";

ws.on("open", () => {
    console.log("Connected to server");

    const message: AuthenticationData = {
        login: "John Doe",
        password: "john@example.com",
        subject: "authenicate"
    };
    message.login = "ian";
    message.password = "ian";
    ws.send(JSON.stringify(message));
});

ws.on("message", (message: string) => {
    console.log(`Received message from server: ${message}`);
    if (message == "authentication successful") {
        const message: NewMessage = {
            salt: Date.now().toString(),
            content: "hi dan",
            subject: "new-message"
        };
        ws.send(JSON.stringify(message));
    }
});

ws.on("close", () => {
    console.log("Disconnected from server");
});
