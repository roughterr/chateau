package org.nau.config;

import java.util.ArrayList;
import java.util.List;

/**
 * An object with data of a channel.
 */
public class ChannelSentMessagesData {
    /**
     * A list of messages that are waiting to be confirmed by the server.
     */
    private List waitingList = new ArrayList();
    /**
     * ID of the last message that has been sent to the server.
     */
    private int lastMessageID = -1;

    /**
     * @return new value
     */
    public synchronized int incrementLastMessageID() {
        lastMessageID++;
        return lastMessageID;
    }

    public List getWaitingList() {
        return waitingList;
    }
}
