package com.skillchange.demo.controller;

import com.skillchange.demo.dto.ChatsInfoDto;
import com.skillchange.demo.entity.Chats;
import com.skillchange.demo.fabrica.ChatsFabrica;
import com.skillchange.demo.service.ChatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ChatsController {

    @Autowired
    private ChatsService chatsService;

    @Autowired
    private ChatsFabrica chatsFabrica;

    @PostMapping("/chat/create/{id}")
    boolean createChat(@PathVariable("id") Long userId, @RequestBody Map<String, String> payload) {
        try {
            payload.put("myId", String.valueOf(userId));
            Chats chat = chatsFabrica.createChat(payload);
            chatsService.createChat(chat);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @GetMapping("/chat/getAll/{id}")
    ChatsInfoDto getAllChats(@PathVariable("id") Long userId) {
        return chatsService.getChatsInfoDto(userId);
    }
}
