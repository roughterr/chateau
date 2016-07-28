package org.nau.config;

/**
 * Contains indices of successfully delivered messages that belong to one destinations.
 */
public class DestinationMessages {
    /**
     * A channel for a message flow.
     */
    private static class ChannelI {
        /**
         * ID of the last message successfully sent to the channel.
         */
        private int lastMessageID = -1;

        /**
         * Returns ID of the last message successfully sent to the channel.
         */
        int getLastMessageID() {
            return lastMessageID;
        }

        /**
         * Sets ID of the last message successfully sent to the channel.
         */
        void setLastMessageID(int lastMessageID) {
            this.lastMessageID = lastMessageID;
        }
    }

    /**
     * ID of the last message of the first destination.
     */
    private ChannelI firstChannel = new ChannelI();
    /**
     * ID of the last message of the second destination.
     */
    private ChannelI secondChannel = new ChannelI();
    /**
     * ID of the last message of the third destination.
     */
    private ChannelI thirdChannel = new ChannelI();

    /**
     * Tells if the message is new or not. If it is, then makes a corresponding entry in the cache.
     *
     * @param channel   ID of a channel. Allowed values are: 0, 1, 2
     * @param messageID IDs start from 0
     * @return value -2 means an error. -1 - means the new message successfully pushed. otherwise ID of the last message.
     */
    public int burnMessage(int channel, int messageID) {
        final ChannelI channelObj;
        final ChannelI cleanChannelObj;
        if (channel == 0) {
            channelObj = firstChannel;
            cleanChannelObj = secondChannel;
        } else if (channel == 1) {
            channelObj = secondChannel;
            cleanChannelObj = thirdChannel;
        } else if (channel == 2) {
            channelObj = thirdChannel;
            cleanChannelObj = firstChannel;
        } else {
            return -2;
        }
        if (cleanChannelObj.getLastMessageID() != -1)
            cleanChannelObj.setLastMessageID(-1);
        if (messageID == (channelObj.getLastMessageID() + 1)) {
            //increment
            channelObj.setLastMessageID(channelObj.getLastMessageID() + 1);
            return -1;
        }
        return channelObj.getLastMessageID();
    }
}
