package org.nau.config;

/**
 * This interface contains data about a sent message.
 */
public interface Message {
    /**
     * Sends a message to the server. Can be called more than once.
     *
     * @throws Exception
     */
    void sendMessage() throws Exception;

    /**
     * Returns a message ID.
     *
     * @return
     */
    int getMessageID();

    /**
     * Tells if the server has been waiting a ack for a long time.
     *
     * @return true - the server has been waiting a ack for a long time. false - the message has been sent not a long ago
     */
    boolean isWaitingAckForLong();
}
