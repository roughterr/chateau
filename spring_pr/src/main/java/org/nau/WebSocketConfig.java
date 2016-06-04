package org.nau;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        //It simply allows destinations. No changins paths.
        config.enableSimpleBroker("/topic", "/commonchat-outcoming");
        //This address is used when a client wants to message to the server.
        //It's like the client sends to /app/hello but the server sees it as just /hello
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Sets an address that will be used when a client is connecting to the STOMP server.
     *
     * @param registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/hello").withSockJS();
    }
}