package com.skillchange.demo.fabrica;

import com.skillchange.demo.dto.MessageAddDto;
import com.skillchange.demo.entity.Chats;
import com.skillchange.demo.entity.Messages;
import com.skillchange.demo.entity.Users;
import com.skillchange.demo.service.ChatsService;
import com.skillchange.demo.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ChatsFabrica {

    @Autowired
    private UsersService usersService;

    @Autowired
    private ChatsService chatsService;

    public Chats createChat(Map<String, String> map) {
        Long user1Id = Long.parseLong(map.get("myId"));
        Long user2Id = Long.parseLong(map.get("userId"));
        Users user1 = usersService.findById(user1Id);
        Users user2 = usersService.findById(user2Id);
        Chats chat = new Chats(user1, user2);
        return chat;
    }

    public Messages createMessage(Map<String, String> map) {
        Messages message = new Messages();
        message.setContent(map.get("content"));
        message.setContentType(map.get("contentType"));
        message.setIdString(map.get("id"));
        message.setDataInfo(map.get("dataInfo"));
        Long userIdFrom = Long.parseLong(map.get("userId"));
        Users user = usersService.findById(userIdFrom);
        message.setUserFrom(user);
        Chats chat = chatsService.getChatById(Long.parseLong(map.get("chatId")));
        message.setChat(chat);
        message.setForward(map.get("forward"));
        message.setStatus("new");
        return message;
    }

    public Messages createMessageFromDto(MessageAddDto messageAddDto) {
        Messages message = new Messages();
        String content = "";

        if (messageAddDto.messageText != null) {
            content = messageAddDto.messageText;
        }
        message.setContent(content);
        message.setContentType("");
        message.setIdString(messageAddDto.messageId);
        message.setDataInfo(messageAddDto.dataInfo);
        message.setDate(messageAddDto.date);
        Users user = usersService.findById(messageAddDto.userId);
        message.setUserFrom(user);
        Chats chat = chatsService.getChatById(messageAddDto.chatId);
        message.setChat(chat);
        message.setForward(messageAddDto.forward);
        message.setStatus("new");

        return  message;
    }
}