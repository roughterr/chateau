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

    /**
     * Name of a frame that contains a message to send.
     */
    public static final String SEND_FRAME_NAME = "SEND";

    /**
     * Destination for sending messages of a group chat.
     */
    public static final String GROUPCHAT_DESTINATION = "group-chat";

    /**
     * Map [ user_id, Map [ WebSocketSession, WebSocketSessionData ]
     */
    private static Map<String, Map<WebSocketSession, WebSocketSessionData>> sessionsData = new HashMap<>();

    @Override
    public void handleTransportError(WebSocketSession session, Throwable throwable) throws Exception {
        System.out.println("handleTransportError.");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        final Map<WebSocketSession, WebSocketSessionData> oneUserData =
                sessionsData.get(session.getPrincipal().getName());
        if (oneUserData != null) {
            oneUserData.remove(session);
            // if it was the only active session of the user
            if (oneUserData.isEmpty()) {
                sessionsData.remove(session.getPrincipal().getName());
            }
        }
        System.out.println("afterConnectionClosed.");
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        final Map<WebSocketSession, WebSocketSessionData> oneUserData;
        if (sessionsData.containsKey(session.getPrincipal().getName())) {
            oneUserData = sessionsData.get(session.getPrincipal().getName());
        } else {
            oneUserData = new HashMap<>();
            sessionsData.put(session.getPrincipal().getName(), oneUserData);
        }
        if (!oneUserData.containsKey(session)) {
            oneUserData.put(session, new WebSocketSessionData());
        }
        System.out.println("afterConnectionEstablished.");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage jsonTextMessage) throws Exception {
        System.out.println("handleTextMessage. message = '" + jsonTextMessage.getPayload() +
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
            final DestinationMessages destinationMessages =
                    sessionsData.get(session.getPrincipal().getName()).get(session).getDestinationObj(destination);
            if (frame.equals(CLEAN_FRAME_NAME)) {
                System.out.println("Clean frame received.");
                destinationMessages.cleanChannel(channelNumber);
                Map<String, Object> mapToSend = new HashMap<>();
                mapToSend.put(DESTINATION_PARAMETER_NAME, destination);
                mapToSend.put(CHANNEL_PARAMETER_NAME, channelNumber);
                mapToSend.put(FRAME_PARAM_NAME, CLEANED_FRAME_NAME);
                final String json = new ObjectMapper().writeValueAsString(mapToSend);
                session.sendMessage(new TextMessage(json));
            } else if (frame.equals(SEND_FRAME_NAME)) {
                System.out.println("Send frame received.");
                parsed.remove(CHANNEL_PARAMETER_NAME);
                final int messageid = parsed.containsKey(MESSAGEID_PARAMETER_NAME) ?
                        Integer.parseInt(parsed.get(MESSAGEID_PARAMETER_NAME).toString()) : 0;
                parsed.remove(MESSAGEID_PARAMETER_NAME);
                int updateLastMessageResult = destinationMessages.registerMessage(channelNumber, messageid);
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
            } else {
                System.out.println("Unknown type of frame: " + frame);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Processes a message.
     *
     * @param addresseeID ID of the user to whom the message was addressed
     * @param destination message destination
     * @param messageMap  parameters of the message
     */
    void handleMessage(String addresseeID, String destination, Map messageMap) {
        if (destination.equals(GROUPCHAT_DESTINATION)) {
            // send the message to the addressee.
            if (sessionsData.containsKey(addresseeID)) {
                for (WebSocketSession webSocketSession : sessionsData.get(addresseeID).keySet()) {
                    sendMessageToDestination(GROUPCHAT_DESTINATION, messageMap, webSocketSession);
                }
            }
        } else {
            System.out.println("Unknown destination: " + destination);
        }
    }

    /**
     * Sends a message to a destination.
     *
     * @param destination      destination
     * @param messageMap       attributes of the message
     * @param webSocketSession WebSocket session to send a message to
     */
    public void sendMessageToDestination(String destination, Map messageMap, WebSocketSession webSocketSession) {

    }
}