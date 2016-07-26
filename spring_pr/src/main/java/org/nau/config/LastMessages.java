package org.nau.config;

import java.util.HashMap;
import java.util.Map;

/**
 * All last messages.
 */
public class LastMessages {
    /**
     * Key is a user id. value is his last messages.
     */
    private Map<String, LastUserMessages> lastMessages;

    public LastMessages() {
        lastMessages = new HashMap<>();
    }

    public Map<String, LastUserMessages> getLastMessages() {
        return lastMessages;
    }

    public void setLastMessages(Map<String, LastUserMessages> lastMessages) {
        this.lastMessages = lastMessages;
    }
}