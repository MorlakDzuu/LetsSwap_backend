package com.skillchange.demo.module;

import com.corundumstudio.socketio.HandshakeData;
import com.corundumstudio.socketio.SocketIONamespace;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.skillchange.demo.dto.MessageAddDto;
import com.skillchange.demo.dto.MessageSendDto;
import com.skillchange.demo.service.MessagesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class ChatModule {
    private static final Logger log = LoggerFactory.getLogger(ChatModule.class);

    private final SocketIONamespace namespace;

    @Autowired
    private MessagesService messagesService;

    @Autowired
    public ChatModule(SocketIOServer server) {
        this.namespace = server.addNamespace("/ws");
        this.namespace.addConnectListener(onConnected());
        this.namespace.addDisconnectListener(onDisconnected());
        this.namespace.addEventListener("chat", MessageAddDto.class, onChatReceived());
    }

    private DataListener<MessageAddDto> onChatReceived() {
        return (client, data, ackSender) -> {
            MessageSendDto messageSendDto = messagesService.getMessageSendDto(data);
            System.out.println("Client[{}] - Received chat message '{}'" + client.getSessionId().toString() + data);
            namespace.getBroadcastOperations().sendEvent("chat", messageSendDto);
        };
    }

    private ConnectListener onConnected() {
        return client -> {
            HandshakeData handshakeData = client.getHandshakeData();
            System.out.println("Client[{}] - Received chat message '{}'" + client.getSessionId().toString() + handshakeData.getUrl());
            log.debug("Client[{}] - Connected to chat module through '{}'", client.getSessionId().toString(), handshakeData.getUrl());
        };
    }

    private DisconnectListener onDisconnected() {
        return client -> {
            System.out.println("Client[{}] - Received chat message '{}'" + client.getSessionId().toString());
            log.debug("Client[{}] - Disconnected from chat module.", client.getSessionId().toString());
        };
    }
}
