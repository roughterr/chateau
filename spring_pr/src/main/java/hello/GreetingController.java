package hello;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Controller
public class GreetingController {
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public GreetingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/bzzz")
    @SendTo("/topic/greetings")
    public Greeting greeting(HelloMessage message, Principal principal) throws Exception {
        System.out.println("Got HelloMessage: " + message.toString() +
                ". principal.getName() is " + principal.getName());
        Thread.sleep(3000); // simulated delay
        System.out.println("messagingTemplate is " + messagingTemplate);
        for (int i = 1; i < 10; i++) {
            Map<String, String> map1 = new HashMap<String, String>();
            map1.put("Don't you know #" + i, "Nothing");
            Thread.sleep(1000);
            //the map will be converted to JSON
            messagingTemplate.convertAndSendToUser("ian", "/topic/greetings", map1);
        }
        return new Greeting("Hello, " + message.getName() + "!");
    }
}