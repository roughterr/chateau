package org.nau.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;

public class MessageImpl implements Message {
    private int messageID;

    private WebSocketSession webSocketSession;

    private Map messageMap;

    private int numberOfTimesSent = 0;

    private boolean isWaitingAckForLong = false;

    public MessageImpl(int messageID, WebSocketSession webSocketSession, Map messageMap) {
        this.messageID = messageID;
        this.webSocketSession = webSocketSession;
        this.messageMap = messageMap;
    }

    @Override
    public void sendMessage() throws Exception {
        if (numberOfTimesSent == 0) {
            new Thread(() -> {
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                isWaitingAckForLong = true;
            }).start();
        }
        final String json = new ObjectMapper().writeValueAsString(messageMap);
        webSocketSession.sendMessage(new TextMessage(json));
        synchronized (this) {
            numberOfTimesSent++;
        }
    }

    @Override
    public int getMessageID() {
        return messageID;
    }

    @Override
    public boolean isWaitingAckForLong() {
        return isWaitingAckForLong;
    }
}
