package com.skillchange.demo.controller;

import com.skillchange.demo.dto.ChatMessagesDto;
import com.skillchange.demo.service.MessagesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class MessagesController {

    @Autowired
    private MessagesService messagesService;

    @PostMapping("/chat/addNew/{id}")
    Boolean newMessage(@PathVariable("id") int userId, @RequestBody Map<String, String> payload) {
        try {
            payload.put("userId", String.valueOf(userId));
            messagesService.addMessage(payload);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @PostMapping("/chat/getChatMessages/{id}")
    ChatMessagesDto getChatMessages(@PathVariable("id") Long userId, @RequestBody Map<String, String> payload)
    {
        return messagesService.getChatMessagesDto(Long.parseLong(payload.get("chatId")), userId);
    }
}
