package org.nau.config;

/**
 * Contains data about sent messages to a client to one destination.
 */
public class DestinationSentMessagesData {
    /**
     * ID of the current channel. Possible values are: 0, 1.
     */
    private boolean currentChannel = false;
    /**
     * An object with data of the first channel.
     */
    private ChannelSentMessagesData firstChannel = new ChannelSentMessagesData();
    /**
     * An object with data of the second channel.
     */
    private ChannelSentMessagesData secondChannel = new ChannelSentMessagesData();

    /**
     * Constructor.
     */
    public DestinationSentMessagesData() {
    }

    /**
     * Returns a current channel number in boolean format.
     *
     * @return false - 0, true - 1
     */
    public boolean getCurrentChannel() {
        return currentChannel;
    }

    /**
     * Sets a current channel number with a boolean value.
     *
     * @param currentChannel false - 0, true - 1
     */
    public void setCurrentChannel(boolean currentChannel) {
        this.currentChannel = currentChannel;
    }

    /**
     * ID of the current channel in the numeric format. Possible values are: 0, 1.
     *
     * @return
     */
    public int getCurrentChannelIntValue() {
        return currentChannel ? 1 : 0;
    }

    public ChannelSentMessagesData getFirstChannel() {
        return firstChannel;
    }

    public ChannelSentMessagesData getSecondChannel() {
        return secondChannel;
    }

    /**
     * Returns a boolean value of a channel number by a given int value.
     *
     * @param channelNumber 0 or 1. otherwise a RuntimeException will be thrown
     * @return false - 0, true - 1
     */
    public static boolean getChannelBoolValueByIntValue(int channelNumber) {
        if (channelNumber == 0) {
            return false;
        } else if (channelNumber == 1) {
            return true;
        } else {
            throw new RuntimeException("channel number has a not allowed value.");
        }
    }
}