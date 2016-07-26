package org.nau.config;

import org.springframework.boot.json.BasicJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.Map;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    /**
     * Max number of channels allowed.
     */
    public static final int CHANNELS_NUMBER_LIMIT = 2;
    /**
     * Name of a parameter for a channel.
     */
    public static final String CHANNEL_PARAMETER_NAME = "channel";
    /**
     * Contains last WebSocket messages from all users.
     */
    private static LastMessages allLastMessages = new LastMessages();

    private static Map<String, Object> destinationBinding = new HashMap<>();

    /**
     * @param userID         user ID
     * @param sessionID      session ID
     * @param destination    message destination. For example, /topic1
     * @param channel        channel in terms of 1 destination
     * @param messagePayload map with parameters of the message
     * @return true - if the last message was different. false - if the last message was the same
     */
    public static boolean updateLastMessage(String userID, String sessionID, String destination, int channel,
                                            Map<String, Object> messagePayload) {
        if (channel > CHANNELS_NUMBER_LIMIT) {
            throw new RuntimeException("Channel overflow");
        }
        final LastUserMessages lastUserMessages;
        if (allLastMessages.getLastMessages().containsKey(userID)) {
            lastUserMessages = allLastMessages.getLastMessages().get(userID);
        } else {
            lastUserMessages = new LastUserMessages();
            allLastMessages.getLastMessages().put(userID, lastUserMessages);
        }
        final LastSessionMessages lastSessionMessages;
        if (lastUserMessages.getLastUserMessages().containsKey(sessionID)) {
            lastSessionMessages = lastUserMessages.getLastUserMessages().get(sessionID);
        } else {
            lastSessionMessages = new LastSessionMessages();
            lastUserMessages.getLastUserMessages().put(sessionID, lastSessionMessages);
        }
        final LastDestinationMessages lastDestinationMessages;
        if (lastSessionMessages.getSessionLastMessages().containsKey(destination)) {
            lastDestinationMessages = lastSessionMessages.getSessionLastMessages().get(destination);
        } else {
            lastDestinationMessages = new LastDestinationMessages();
            lastSessionMessages.getSessionLastMessages().put(destination, lastDestinationMessages);
        }
        if (lastDestinationMessages.getLastDestinationMessages().containsKey(channel)) {
            final Map<String, Object> existingLastMessage = lastDestinationMessages.getLastDestinationMessages().get(channel);
            if (existingLastMessage.equals(messagePayload)) {
                return false;
            } else {
                lastDestinationMessages.getLastDestinationMessages().put(channel, messagePayload);
                return true;
            }
        } else {
            lastDestinationMessages.getLastDestinationMessages().put(channel, messagePayload);
            return true;
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable throwable) throws Exception {
        System.out.println("handleTransportError.");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("afterConnectionClosed.");
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("afterConnectionEstablished.");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage jsonTextMessage) throws Exception {
        System.out.println("afterConnectionEstablished received. message = '" + jsonTextMessage.getPayload() +
                "', session.getPrincipal().getName()='" + session.getPrincipal().getName() + "'.");
        JsonParser parser = new BasicJsonParser();
        try {
            Map<String, Object> parsed = parser.parseMap(jsonTextMessage.getPayload());
            System.out.println("parsed: " + parsed);
            //absence of a channel number means the zero channel.
            int channelNumber = parsed.containsKey(CHANNEL_PARAMETER_NAME) ?
                    Integer.parseInt(parsed.get(CHANNEL_PARAMETER_NAME).toString()) : 0;
            parsed.remove(CHANNEL_PARAMETER_NAME);
            String destination = "/test123";
            System.out.println("channelNumber is " + channelNumber);
            boolean updateLastMessageResult = updateLastMessage(session.getPrincipal().getName(),
                    session.getId(), destination, channelNumber, parsed);
            System.out.println("updateLastMessageResult: " + updateLastMessageResult);
        } catch (Exception e) {
            System.out.println("Exception while parsing.");
        }
    }
}