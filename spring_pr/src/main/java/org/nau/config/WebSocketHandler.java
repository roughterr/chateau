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
     * Name of a parameter for a channel.
     */
    public static final String CHANNEL_PARAMETER_NAME = "channel";
    /**
     * Name of a parameter for a destination.
     */
    public static final String DESTINATION_PARAMETER_NAME = "destination";
    /**
     * Name of a parameter for a message ID.
     */
    public static final String MESSAGEID_PARAMETER_NAME = "message-id";

    private static Map<String, Object> destinationBinding = new HashMap<>();

    /**
     * Map with indices of last messages sent to destinations.
     * Map [ user_id, Map [ session_id, Map [ destination, DestinationMessages ] ] ]
     */
    private static Map<String, Map<String, Map<String, DestinationMessages>>> lastMessageIndices = new HashMap<>();

    /**
     * Returns a value of an object of type Map<String, DestinationMessages>. If the object is not present, creates one.
     *
     * @param destination         key
     * @param sessionDestinations map
     * @return value
     */
    private static DestinationMessages getDestinationMessagesFromSession(String destination,
                                                                         Map<String, DestinationMessages> sessionDestinations) {
        if (sessionDestinations.containsKey(destination)) {
            return sessionDestinations.get(destination);
        } else {
            final DestinationMessages newDestinationMessagesObj = new DestinationMessages();
            sessionDestinations.put(destination, newDestinationMessagesObj);
            return newDestinationMessagesObj;
        }
    }

    /**
     * Returns a value from a map. The value is a map too. If the value is not present or null, the method creates a
     * new map and pushes it to the first map. In the last case, the new map is returned.
     * @param key key
     * @param map map
     * @param <A> type of the key of the value
     * @param <B> type of the value of the value
     * @return value that is of a map type
     */
    private static <A, B> Map<A, B> getMapFromMap(String key, Map<String, Map<A, B>> map) {
        if (map.containsKey(key)) {
            return map.get(key);
        } else {
            final Map<A, B> newMap = new HashMap<>();
            map.put(key, newMap);
            return newMap;
        }
    }

    /**
     * @param userID      user ID
     * @param sessionID   session ID
     * @param destination message destination. For example, /topic1
     * @param channel     channel in terms of 1 destination
     * @param messageID   message ID
     * @return -2 - error. -1 - sent successful. otherwise ID of the last message that was received.
     */
    public static int updateLastMessage(String userID, String sessionID, String destination, int channel, int messageID) {
        final Map<String, Map<String, DestinationMessages>> userMap = getMapFromMap(userID, lastMessageIndices);
        final Map<String, DestinationMessages> sessionMap = getMapFromMap(sessionID, userMap);
        final DestinationMessages destinationMessages = getDestinationMessagesFromSession(destination, sessionMap);
        int burnResult = destinationMessages.registerMessage(channel, messageID);
        return burnResult;
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
        final JsonParser parser = new BasicJsonParser();
        try {
            Map<String, Object> parsed = parser.parseMap(jsonTextMessage.getPayload());
            System.out.println("parsed: " + parsed);
            //absence of a channel number means the zero channel.
            int channelNumber = parsed.containsKey(CHANNEL_PARAMETER_NAME) ?
                    Integer.parseInt(parsed.get(CHANNEL_PARAMETER_NAME).toString()) : 0;
            System.out.println("channelNumber is " + channelNumber);
            parsed.remove(CHANNEL_PARAMETER_NAME);
            int messageid = parsed.containsKey(MESSAGEID_PARAMETER_NAME) ?
                    Integer.parseInt(parsed.get(MESSAGEID_PARAMETER_NAME).toString()) : 0;
            System.out.println("messageid is " + channelNumber);
            parsed.remove(MESSAGEID_PARAMETER_NAME);
            final String destination = parsed.containsKey(DESTINATION_PARAMETER_NAME) ?
                    parsed.get(DESTINATION_PARAMETER_NAME).toString() : "";
            int updateLastMessageResult = updateLastMessage(session.getPrincipal().getName(),
                    session.getId(), destination, channelNumber, messageid);
            System.out.println("updateLastMessageResult: " + updateLastMessageResult);
        } catch (Exception e) {
            System.out.println("Exception while parsing.");
            e.printStackTrace();
        }
    }
}