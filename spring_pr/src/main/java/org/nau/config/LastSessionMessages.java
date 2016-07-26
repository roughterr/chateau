package org.nau.config;

import java.util.HashMap;
import java.util.Map;

/**
 * Contains all last messages from a session's destinations.
 */
public class LastSessionMessages {
    /**
     * Key is a destination id. value is the last messages of the destination.
     */
    private Map<String, LastDestinationMessages> sessionLastMessages;

    public LastSessionMessages() {
        sessionLastMessages = new HashMap<>();
    }

    public Map<String, LastDestinationMessages> getSessionLastMessages() {
        return sessionLastMessages;
    }

    public void setSessionLastMessages(Map<String, LastDestinationMessages> sessionLastMessages) {
        this.sessionLastMessages = sessionLastMessages;
    }
}