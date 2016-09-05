package org.nau.config;

/**
 * Contains data about sent messages to a client to one destination.
 */
public class DestinationSentMessagesData {
    /**
     * ID of the current channel. Possible values are: 0, 1.
     */
    private int currentChannel;
    /**
     * An object with data of the first channel.
     */
    private ChannelSentMessagesData firstChannel;
    /**
     * An object with data of the second channel.
     */
    private ChannelSentMessagesData secondChannel;

    /**
     * Constructor.
     */
    public DestinationSentMessagesData() {
        this.currentChannel = 0;
        this.firstChannel = new ChannelSentMessagesData();
        this.secondChannel = new ChannelSentMessagesData();
    }

    public int getCurrentChannel() {
        return currentChannel;
    }

    public ChannelSentMessagesData getFirstChannel() {
        return firstChannel;
    }

    public ChannelSentMessagesData getSecondChannel() {
        return secondChannel;
    }
}