import * as WebSocket from "ws";
import { AuthenticationData } from "../service/authentication-handler";
import { NewMessage } from "../service/new-message-handler";
const ws = new WebSocket.WebSocket("ws://localhost:8080");

ws.on("open", () => {
    console.log("Connected to server");

    const message: AuthenticationData = {
        login: "ian",
        password: "ian",
        subject: "authenicate"
    };
    ws.send(JSON.stringify(message));
});

ws.on("message", (message: string) => {
    console.log(`Received message from server: ${message}`);
    if (message == "authentication successful") {
        const message: NewMessage = {
            salt: Date.now().toString(),
            content: "hi dan",
            subject: "new-message",
            address: "dan"
        };
        ws.send(JSON.stringify(message));
    }
});

ws.on("close", () => {
    console.log("Disconnected from server");
});
