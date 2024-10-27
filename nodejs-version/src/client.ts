import * as WebSocket from "ws";
const ws = new WebSocket.WebSocket("ws://localhost:8080");

ws.on("open", () => {
    console.log("Connected to server");

    const message: any = new Object();
    message.login = "ian";
    message.password = "ian";
    ws.send(JSON.stringify(message));
});

ws.on("message", (message: string) => {
    console.log(`Received message from server: ${message}`);
    if (message == "authentication successful") {
        const message: any = new Object();
        message.content = "hi dan";
        message.address = "dan";
        ws.send(JSON.stringify(message));
    }
});

ws.on("close", () => {
    console.log("Disconnected from server");
});
