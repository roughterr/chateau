package org.nau;

/**
 * Message sent to a group of users.
 */
public class MessageToGroup {
    /**
     * ID of a group.
     */
    private String groupId;

    /**
     * Message content.
     */
    private String content;

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
}
