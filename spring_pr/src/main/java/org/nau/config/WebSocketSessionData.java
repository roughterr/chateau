package org.nau.config;

import java.util.HashMap;
import java.util.Map;

/**
 * Contains data that belong to one WebSocket session.
 */
public class WebSocketSessionData {
    /**
     * Key is a destination. Value is data of the destination.
     */
    private Map<String, DestinationData> receivedMessagesIndices;

    /**
     * Constructor.
     */
    public WebSocketSessionData() {
        this.receivedMessagesIndices = new HashMap<>();
    }

    /**
     * Returns an object with data about a destination.
     *
     * @param destination message destination
     * @return key is a destination. Value is data of the destination.
     */
    public DestinationData getDestinationObj(String destination) {
        if (receivedMessagesIndices.containsKey(destination)) {
            return receivedMessagesIndices.get(destination);
        } else {
            final DestinationData destinationObj = new DestinationData();
            receivedMessagesIndices.put(destination, destinationObj);
            return destinationObj;
        }
    }
}
