package org.nau.groupchat;

/**
 * A representation of a response about a sent message.
 */
public class MessageReceivedResponse {
    /**
     * message ID that the client generated.
     */
    private String messageClientID;
    /**
     * Date of the message.
     */
    private String date;
    /**
     * message ID that the server generated.
     */
    private String messageServerID;

    public String getMessageClientID() {
        return messageClientID;
    }

    public void setMessageClientID(String messageClientID) {
        this.messageClientID = messageClientID;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getMessageServerID() {
        return messageServerID;
    }

    public void setMessageServerID(String messageServerID) {
        this.messageServerID = messageServerID;
    }
}
