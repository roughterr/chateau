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
    private List<Message> waitingList = new ArrayList<>();

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

    public List<Message> getWaitingList() {
        return waitingList;
    }

    /**
     * Returns ID of the last message in the channel.
     *
     * @return
     */
    public int getLastMessageID() {
        return lastMessageID;
    }

    /**
     * Returns the initial value to the last message ID variable.
     */
    public void resetLastMessageID() {
        lastMessageID = -1;
    }
}
