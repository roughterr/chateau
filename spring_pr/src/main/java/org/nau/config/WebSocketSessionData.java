package org.nau.config;

import org.springframework.web.socket.WebSocketSession;

import java.util.HashMap;
import java.util.Map;

/**
 * Contains data that belong to one WebSocket session.
 */
public class WebSocketSessionData {
    /**
     * Key is a destination. Value is indices of incoming messages that belong to the specific destination.
     */
    private Map<String, DestinationMessages> receivedMessagesIndices;

    /**
     * Constructor.
     */
    public WebSocketSessionData() {
        this.receivedMessagesIndices = new HashMap<>();
    }

    /**
     * Returns an object with data about indices of received messages that belong to one destination and one WebSocket
     * session.
     *
     * @param destination
     * @return DestinationMessages object
     */
    public DestinationMessages getDestinationObj(String destination) {
        if (receivedMessagesIndices.containsKey(destination)) {
            return receivedMessagesIndices.get(destination);
        } else {
            final DestinationMessages destinationObj = new DestinationMessages();
            receivedMessagesIndices.put(destination, destinationObj);
            return destinationObj;
        }
    }
}
