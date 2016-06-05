package org.nau;

/**
 * Message that is being sent to a client.
 */
public class MessageFromServer {
    /**
     * Text of the message.
     */
    private String text;
    /**
     * Author of the message.
     */
    private String username;
    /**
     * Date of the message.
     */
    private String date;

    public MessageFromServer() {
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
