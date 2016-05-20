package org.nau;

import java.io.IOException;
import java.nio.ByteBuffer;

import javax.websocket.OnMessage;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint("/echo")
public class WebSocketDemo {
    @OnMessage
    public void echoTextMessage(String msg, Session session) {
        System.out.println("Server got message: " + msg);
//        try {
//            if (session.isOpen()) {
//                session.getBasicRemote().sendText(msg, last);
//            }
//        } catch (IOException e) {
//            try {
//                session.close();
//            } catch (IOException e1) {
//                // Ignore
//            }
//        }
    }
}