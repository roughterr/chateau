package org.nau;

/**
 * Message that is being sent from a client to the server.
 */
public class MessageToServer {
    /**
     * Text of the message.
     */
    private String text;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
