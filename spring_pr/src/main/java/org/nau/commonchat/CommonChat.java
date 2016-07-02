package org.nau.commonchat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

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
    public MessageFromServer commonchat(MessageToServer messageToServer, Principal principal) throws Exception {
        System.out.println("CommonChat. commonchat.");
        listLoggedInUsers();
        MessageFromServer messageFromServer = new MessageFromServer();
        messageFromServer.setUsername(principal.getName());
        messageFromServer.setText(messageToServer.getText());
        messageFromServer.setDate(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        //Send the messageFromServer to all the users.
        //messagingTemplate.convertAndSend("/commonchat-outcoming", messageFromServer);
        return messageFromServer;
    }

    @Autowired
    private SessionRegistry sessionRegistry;

    public void listLoggedInUsers() {
        final List<Object> allPrincipals = sessionRegistry.getAllPrincipals();
        System.out.println("allPrincipals size is " + allPrincipals.size());
        for (final Object principal : allPrincipals) {
            System.out.println("There is a principal: " + principal.toString());
//            if(principal instanceof SecurityUser) {
//                final SecurityUser user = (SecurityUser) principal;
//
//                // Do something with user
//                System.out.println(user);
//            }
        }
        System.out.println("listLoggedInUsers finished.");
    }
}