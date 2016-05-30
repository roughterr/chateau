package hello;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

/**
 * Chat that all users can send messages to.
 */
@Controller
public class CommonChat {
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public CommonChat(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/commonchat-incoming")
    @SendTo("/commonchat-outcoming")
    public Message commonchat(Message message, Principal principal) throws Exception {
        System.out.println("CommonChat. commonchat.");
        //Send the message to all the users.
        return message;
    }
}