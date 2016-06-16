package org.nau;

/**
 * Message sent from a group of users.
 */
public class MessageFromGroup {
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
}
