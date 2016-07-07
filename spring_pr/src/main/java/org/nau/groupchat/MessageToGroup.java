package org.nau.groupchat;

/**
 * Message sent to a group of users.
 */
public class MessageToGroup {
    /**
     * message ID that the client generated.
     */
    private String messageClientID;
    /**
     * ID of a group.
     */
    private String groupID;

    /**
     * Message content.
     */
    private String content;

    public String getMessageClientID() {
        return messageClientID;
    }

    public void setMessageClientID(String messageClientID) {
        this.messageClientID = messageClientID;
    }

    public String getGroupID() {
        return groupID;
    }

    public void setGroupID(String groupID) {
        this.groupID = groupID;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return "MessageToGroup{" +
                "messageClientID='" + messageClientID + '\'' +
                ", groupID='" + groupID + '\'' +
                ", content='" + content + '\'' +
                '}';
    }
}
