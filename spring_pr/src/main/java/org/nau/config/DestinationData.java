package org.nau.config;

/**
 * Contains data about messages - received and sent.
 */
public class DestinationData {
    private DestinationMessages destinationMessages;

    private DestinationSentMessagesData destinationSentMessagesData;

    public DestinationData() {
        this.destinationMessages = new DestinationMessages();
        this.destinationSentMessagesData = new DestinationSentMessagesData();
    }

    public DestinationMessages getDestinationMessages() {
        return destinationMessages;
    }

    public DestinationSentMessagesData getDestinationSentMessagesData() {
        return destinationSentMessagesData;
    }
}
