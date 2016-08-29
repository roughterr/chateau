package org.nau.config;

import com.fasterxml.jackson.databind.ObjectMapper;
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
    public static final String MESSAGEID_PARAMETER_NAME = "id";
    /**
     * Name of parameter that is a frame name.
     */
    public static final String FRAME_PARAM_NAME = "frame";
    /**
     * Name of a frame that is to confirm a message has been received.
     */
    public static final String ACK_FRAME_NAME = "ACK";
    /**
     * Name of a frame that is to confirm a message has not been consumed.
     */
    public static final String NACK_FRAME_NAME = "NACK";
    /**
     * Name of a frame that commands to clean a channel.
     */
    public static final String CLEAN_FRAME_NAME = "CLEAN";
    /**
     * Name of a frame that says that the channel has been cleaned.
     */
    public static final String CLEANED_FRAME_NAME = "CLEANED";

    private static Map<String, Object> destinationBinding = new HashMap<>();

    /**
     * Map with indices of last messages sent to destinations.
     * Map [ user_id, Map [ session_id, Map [ destination, DestinationMessages ] ] ]
     */
    private static Map<String, Map<String, Map<String, DestinationMessages>>> lastMessageIndices = new HashMap<>();

    /**
     * Returns an object that one can use to manage the channel's data.
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
     *
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
     */
    public static DestinationMessages getDestinationMessagesObj(String userID, String sessionID, String destination) {
        final Map<String, Map<String, DestinationMessages>> userMap = getMapFromMap(userID, lastMessageIndices);
        final Map<String, DestinationMessages> sessionMap = getMapFromMap(sessionID, userMap);
        return getDestinationMessagesFromSession(destination, sessionMap);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable throwable) throws Exception {
        System.out.println("handleTransportError.");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Map<String, Map<String, DestinationMessages>> userData =
                lastMessageIndices.get(session.getPrincipal().getName());
        if (userData != null) {
            userData.remove(session.getId());
        }
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
            final int channelNumber = parsed.containsKey(CHANNEL_PARAMETER_NAME) ?
                    Integer.parseInt(parsed.get(CHANNEL_PARAMETER_NAME).toString()) : 0;
            final String destination = parsed.containsKey(DESTINATION_PARAMETER_NAME) ?
                    parsed.get(DESTINATION_PARAMETER_NAME).toString() : "";
            final String frame = parsed.containsKey(FRAME_PARAM_NAME) ?
                    parsed.get(FRAME_PARAM_NAME).toString() : "";
            if (frame.equals(CLEAN_FRAME_NAME)) {
                System.out.println("Clean frame received.");
                DestinationMessages destinationMessages = getDestinationMessagesObj(session.getPrincipal().getName(),
                        session.getId(), destination);
                destinationMessages.cleanChannel(channelNumber);
                Map<String, Object> mapToSend = new HashMap<>();
                mapToSend.put(DESTINATION_PARAMETER_NAME, destination);
                mapToSend.put(CHANNEL_PARAMETER_NAME, channelNumber);
                mapToSend.put(FRAME_PARAM_NAME, CLEANED_FRAME_NAME);
                final String json = new ObjectMapper().writeValueAsString(mapToSend);
                session.sendMessage(new TextMessage(json));
            } else {
                parsed.remove(CHANNEL_PARAMETER_NAME);
                final int messageid = parsed.containsKey(MESSAGEID_PARAMETER_NAME) ?
                        Integer.parseInt(parsed.get(MESSAGEID_PARAMETER_NAME).toString()) : 0;
                parsed.remove(MESSAGEID_PARAMETER_NAME);
                int updateLastMessageResult = getDestinationMessagesObj(session.getPrincipal().getName(),
                        session.getId(), destination).registerMessage(channelNumber, messageid);
                Map<String, Object> mapToSend = new HashMap<>();
                mapToSend.put(DESTINATION_PARAMETER_NAME, destination);
                if (channelNumber == 1) {
                    mapToSend.put(CHANNEL_PARAMETER_NAME, 1);
                }
                if (updateLastMessageResult == -1) {
                    mapToSend.put(FRAME_PARAM_NAME, ACK_FRAME_NAME);
                } else {
                    mapToSend.put(FRAME_PARAM_NAME, NACK_FRAME_NAME);
                }
                mapToSend.put(MESSAGEID_PARAMETER_NAME, messageid);
                final String json = new ObjectMapper().writeValueAsString(mapToSend);
                session.sendMessage(new TextMessage(json));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}