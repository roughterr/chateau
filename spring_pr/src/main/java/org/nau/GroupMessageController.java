package org.nau;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Controller
public class GroupMessageController {
    private final SimpMessagingTemplate messagingTemplate;
    /**
     * Service for working with groups.
     */
    private GroupService groupService = new GroupService();

    @Autowired
    public GroupMessageController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Sends a message to a group of users.
     *
     * @param messageToGroup message
     * @param principal      user identifier
     */
    @MessageMapping("/message2group")
    public void messageToGroup(MessageToGroup messageToGroup, Principal principal) {
        System.out.println("GroupMessageController. messageToGroup.");
        List<String> usersOfGroup = groupService.getUsersOfGroup(messageToGroup.getGroupId());
        for (String userName : usersOfGroup) {
            // We should not send a message to a user who sent the message.
            if (!principal.getName().equals(userName)) {
                System.out.println("Sending to " + userName);
                MessageFromGroup messageFromGroup = new MessageFromGroup();
                messageFromGroup.setUsername(principal.getName());
                messageFromGroup.setContent(messageToGroup.getContent());
                messageFromGroup.setDate(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
                messageFromGroup.setGroupId(messageToGroup.getGroupId());
                messagingTemplate.convertAndSendToUser(userName, "/message2group", messageFromGroup);
            }
        }
    }
}
