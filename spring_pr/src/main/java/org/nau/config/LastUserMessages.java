package org.nau.config;

import java.util.HashMap;
import java.util.Map;

/**
 * Contains all last messages from a user's clients.
 */
public class LastUserMessages {
    /**
     * Last messages of all sessions of the user. Key is a session ID. value is the session's last messages.
     */
    private Map<String, LastSessionMessages> lastUserMessages;

    public LastUserMessages() {
        lastUserMessages = new HashMap<>();
    }

    /**
     * Returns last messages of all sessions of the user. Key is a session ID. value is the session's last messages.
     */
    public Map<String, LastSessionMessages> getLastUserMessages() {
        return lastUserMessages;
    }

    public void setLastUserMessages(Map<String, LastSessionMessages> lastUserMessages) {
        this.lastUserMessages = lastUserMessages;
    }
}
