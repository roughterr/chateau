package org.nau.config;

/**
 * Contains data about registered messages' IDs.
 */
public class DestinationMessages {
    /**
     * ID of the last registered message of the first channel.
     */
    private int firstChannelLastMessageID = -1;
    /**
     * ID of the last registered message of the second channel.
     */
    private int secondChannelLastMessageID = -1;

    /**
     * Cleans a channel message ID history.
     *
     * @param channelIndex channel index
     */
    public void cleanChannel(int channelIndex) {
        if (channelIndex == 0) {
            firstChannelLastMessageID = -1;
        } else {
            secondChannelLastMessageID = -1;
        }
    }

    /**
     * Registers a new message.
     *
     * @param channelIndex channel index. Possible values are 0 and 1
     * @param messageID    ID of the new message
     * @return -1 means that the message has been successfully registered. any positive value means that the message
     * has not been registered because of a message whose ID is the returned value. value -2 means an error.
     */
    public int registerMessage(int channelIndex, int messageID) {
        System.out.println("registerMessage called. channelIndex=" + channelIndex + ", messageID=" + messageID);
        if (messageID < 0) {
            return -2;
        }
        if (channelIndex == 0) {
            if (firstChannelLastMessageID + 1 == messageID) {
                firstChannelLastMessageID++;
                return -1;
            }
            return firstChannelLastMessageID;
        } else if (channelIndex == 1) {
            if (secondChannelLastMessageID + 1 == messageID) {
                secondChannelLastMessageID++;
                return -1;
            }
            return secondChannelLastMessageID;
        }
        return -1;
    }
}
