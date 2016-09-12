package org.nau.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.nau.groupchat.GroupChatController;
import org.springframework.boot.json.BasicJsonParser;
import org.springframework.boot.json.JsonParser;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.text.SimpleDateFormat;
import java.util.Date;
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
            final boolean channelBool = DestinationSentMessagesData.getChannelBoolValueByIntValue(channelNumber);
            final String destination = parsed.containsKey(DESTINATION_PARAMETER_NAME) ?
                    parsed.get(DESTINATION_PARAMETER_NAME).toString() : "";
            final String frame = parsed.containsKey(FRAME_PARAM_NAME) ?
                    parsed.get(FRAME_PARAM_NAME).toString() : "";
            final DestinationMessages destinationMessages =
                    sessionsData.get(session.getPrincipal().getName()).get(session).getDestinationObj(destination).getDestinationMessages();
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
                if (updateLastMessageResult == -1) {
                    handleMessage(session.getPrincipal().getName(), destination, parsed);
                }
            } else if (frame.equals(ACK_FRAME_NAME) || frame.equals(NACK_FRAME_NAME) || frame.equals(CLEANED_FRAME_NAME)) {
                final DestinationSentMessagesData destinationSentMessagesData =
                        sessionsData.get(session.getPrincipal().getName()).get(session).getDestinationObj(destination).getDestinationSentMessagesData();
                final ChannelSentMessagesData channelObj = channelNumber == 0 ?
                        destinationSentMessagesData.getFirstChannel() : destinationSentMessagesData.getSecondChannel();
                if (frame.equals(CLEANED_FRAME_NAME)) {
                    System.out.println("CLEANED frame received.");
                    channelObj.getWaitingList().clear();
                    channelObj.resetLastMessageID();
                } else if (frame.equals(ACK_FRAME_NAME)) {
                    System.out.println("ACK frame received.");
                    final int messageID = parsed.containsKey(MESSAGEID_PARAMETER_NAME) ?
                            Integer.parseInt(parsed.get(MESSAGEID_PARAMETER_NAME).toString()) : 0;
                    Message waitingMessageFound = null;
                    for (Message waitingMessage : channelObj.getWaitingList()) {
                        if (waitingMessage.getMessageID() == messageID) {
                            waitingMessageFound = waitingMessage;
                            System.out.println("Waiting message found.");
                            break;
                        }
                    }
                    if (waitingMessageFound == null) {
                        System.out.println("The client sent ACK about an unknown message ID.");
                    } else {
                        channelObj.getWaitingList().remove(waitingMessageFound);
                        final boolean otherChannel = !channelBool;
                        final ChannelSentMessagesData otherChannelObj = otherChannel ?
                                destinationSentMessagesData.getSecondChannel() : destinationSentMessagesData.getFirstChannel();
                        // if the other channel is fresh.
                        if (otherChannelObj.getLastMessageID() == -1) {
                            // Switching to the other channel.
                            System.out.println("Current channel is " + destinationSentMessagesData.getCurrentChannelIntValue() +
                                    ". Switching to the other channel.");
                            destinationSentMessagesData.setCurrentChannel(otherChannel);
                        }
                        // If the other channel already active and the current channel's waiting list is empty.
                        if (channelBool != destinationSentMessagesData.getCurrentChannel() && channelObj.getWaitingList().size() == 0) {
                            System.out.println("cleaning this channel.");
                            requestChannelClean(session, destination, channelBool);
                        }
                        // Clean the other channel if necessary.
                        if (otherChannelObj.getWaitingList().size() == 0 && otherChannelObj.getLastMessageID() > -1) {
                            System.out.println("Cleaning the other channel.");
                            requestChannelClean(session, destination, otherChannel);
                        }
                    }
                }
            } else {
                System.out.println("Unknown type of frame: " + frame);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Requests a channel cleaning from a client.
     *
     * @param session     WebSocket session object
     * @param destination destination
     * @param channel     channel number in boolean format. 0 - false. 1 - true
     * @throws Exception
     */
    private void requestChannelClean(WebSocketSession session, String destination, boolean channel) throws Exception {
        System.out.println("requestChannelClean called. destination='" + destination + "', channel='" + channel + "'.");
        Map messageMap = new HashMap();
        messageMap.put(FRAME_PARAM_NAME, CLEAN_FRAME_NAME);
        messageMap.put(CHANNEL_PARAMETER_NAME, channel ? 1 : 0);
        messageMap.put(DESTINATION_PARAMETER_NAME, destination);
        final String json = new ObjectMapper().writeValueAsString(messageMap);
        session.sendMessage(new TextMessage(json));
    }

    /**
     * Processes a message.
     *
     * @param senderUserID ID of the user who sent the message to the server
     * @param destination  message destination
     * @param messageMap   parameters of the message
     * @throws Exception
     */
    void handleMessage(String senderUserID, String destination, Map messageMap) throws Exception {
        if (destination.equals(GROUPCHAT_DESTINATION)) {
            String date = new SimpleDateFormat("HH:mm:ss").format(new Date());
            messageMap.put(GroupChatController.SENDER_USER_ID_PARAMETER_NAME, senderUserID);
            messageMap.put(GroupChatController.DATE_PARAMETER_NAME, date);
            // send a message to all users except the sender
            for (Map.Entry<String, Map<WebSocketSession, WebSocketSessionData>> entry : sessionsData.entrySet()) {
                if (!entry.getKey().equals(senderUserID)) {
                    final Map<WebSocketSession, WebSocketSessionData> val = entry.getValue();
                    for (Map.Entry<WebSocketSession, WebSocketSessionData> sessionEntry : val.entrySet()) {
                        sendMessageToDestination(GROUPCHAT_DESTINATION, messageMap, sessionEntry.getKey(),
                                sessionEntry.getValue());
                    }
                }
            }
        } else {
            System.out.println("Unknown destination: " + destination);
        }
    }

    /**
     * Sends a message to a destination.
     *
     * @param destination          destination
     * @param messageMap           attributes of the message
     * @param webSocketSession     WebSocket session to send a message to
     * @param webSocketSessionData
     * @throws Exception
     */
    public void sendMessageToDestination(String destination, Map messageMap, WebSocketSession webSocketSession,
                                         WebSocketSessionData webSocketSessionData) throws Exception {
        System.out.println("calling sendMessageToDestination with the following params: destination='" + destination +
                "', messageMap='" + messageMap + "', webSocketSession='" + webSocketSession + "', " + webSocketSessionData + "'.");
        final DestinationSentMessagesData destinationSentMessagesData =
                webSocketSessionData.getDestinationObj(destination).getDestinationSentMessagesData();
        final ChannelSentMessagesData channelObj = destinationSentMessagesData.getCurrentChannel() ?
                destinationSentMessagesData.getSecondChannel() : destinationSentMessagesData.getFirstChannel();
        final int newMessageID = channelObj.incrementLastMessageID();
        messageMap.put(FRAME_PARAM_NAME, SEND_FRAME_NAME);
        messageMap.put(CHANNEL_PARAMETER_NAME, destinationSentMessagesData.getCurrentChannelIntValue());
        messageMap.put(MESSAGEID_PARAMETER_NAME, newMessageID);
        final Message messageObj = new MessageImpl(newMessageID, webSocketSession, messageMap);
        channelObj.getWaitingList().add(messageObj);
        messageObj.sendMessage();
    }
}