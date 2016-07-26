package org.nau.config;

import java.util.HashMap;
import java.util.Map;

/**
 * Contains all last messages from a destination's channels.
 */
public class LastDestinationMessages {
    /**
     * Key is a channel id. value is the last message of the channel.
     */
    private Map<Integer, Map<String, Object>> lastDestinationMessages;

    public LastDestinationMessages() {
        lastDestinationMessages = new HashMap<>();
    }

    /**
     * @return map, where key is a channel id. value is the last message of the channel.
     */
    public Map<Integer, Map<String, Object>> getLastDestinationMessages() {
        return lastDestinationMessages;
    }

    public void setLastDestinationMessages(Map<Integer, Map<String, Object>> lastDestinationMessages) {
        this.lastDestinationMessages = lastDestinationMessages;
    }
}