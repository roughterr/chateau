package org.nau;

/**
 * Message sent from a group of users.
 */
public class MessageFromGroup {
    /**
     * message ID that the client generated.
     */
    private String messageClientId;
    /**
     * Text of the message.
     */
    private String content;
    /**
     * Author of the message.
     */
    private String username;
    /**
     * Date of the message.
     */
    private String date;
    /**
     * ID of a group.
     */
    private String groupId;

    public MessageFromGroup() {
    }

    public String getMessageClientId() {
        return messageClientId;
    }

    public void setMessageClientId(String messageClientId) {
        this.messageClientId = messageClientId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
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

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    @Override
    public String toString() {
        return "MessageFromGroup{" +
                "messageClientId='" + messageClientId + '\'' +
                ", content='" + content + '\'' +
                ", username='" + username + '\'' +
                ", date='" + date + '\'' +
                ", groupId='" + groupId + '\'' +
                '}';
    }
}
