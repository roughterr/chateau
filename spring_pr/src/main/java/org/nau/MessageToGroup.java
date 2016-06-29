package org.nau;

/**
 * Message sent to a group of users.
 */
public class MessageToGroup {
    /**
     * message ID that the client generated.
     */
    private String messageClientId;
    /**
     * ID of a group.
     */
    private String groupId;

    /**
     * Message content.
     */
    private String content;

    public String getMessageClientId() {
        return messageClientId;
    }

    public void setMessageClientId(String messageClientId) {
        this.messageClientId = messageClientId;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
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
                "messageClientId='" + messageClientId + '\'' +
                ", groupId='" + groupId + '\'' +
                ", content='" + content + '\'' +
                '}';
    }
}
