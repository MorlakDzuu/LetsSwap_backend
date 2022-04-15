package com.skillchange.demo.service;

import com.skillchange.demo.dto.ChatDto;
import com.skillchange.demo.dto.ChatsInfoDto;
import com.skillchange.demo.entity.Chats;
import com.skillchange.demo.entity.Messages;
import com.skillchange.demo.entity.Users;
import com.skillchange.demo.repository.ChatsRepository;
import com.skillchange.demo.repository.MessagesRepository;
import com.skillchange.demo.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatsService {

    @Autowired
    private final ChatsRepository chatsRepository;

    @Autowired
    private final MessagesRepository messagesRepository;

    @Autowired
    private final UsersRepository usersRepository;

    public ChatsService(ChatsRepository chatsRepository, MessagesRepository messagesRepository, UsersRepository usersRepository) {
        this.chatsRepository = chatsRepository;
        this.messagesRepository = messagesRepository;
        this.usersRepository = usersRepository;
    }

    public List<Chats> getAllChatsByUserId(Long id) {
        return chatsRepository.getChatsByUserId(id);
    }

    public void createChat(Chats chat) {
        List<Chats> chats = chatsRepository.getChatByUser1AndUser2(chat.getUser1().getId(), chat.getUser2().getId());
        if (chats.size() == 0) {
            chatsRepository.save(chat);
        }
    }

    public Chats getChatById(Long chatId) {
        return chatsRepository.getChatById(chatId).get(0);
    }

    public ChatsInfoDto getChatsInfoDto(Long userId) {
        Users user = usersRepository.getById(userId);

        List<Chats> chats = chatsRepository.getChatsByUserId(userId);
        List<ChatDto> chatDtos = new ArrayList<>();

        for (Chats chat: chats) {
            chatDtos.add(getChatDto(chat, userId));
        }

        ChatsInfoDto chatsInfoDto = new ChatsInfoDto();
        chatsInfoDto.chats = chatDtos;
        chatsInfoDto.myId = userId;
        chatsInfoDto.myUserName = user.getName() + " " + user.getLastname();

        if(user.getFile() != null) {
            chatsInfoDto.myProfileImage = user.getFile().getDownloadPath();
        }

        return chatsInfoDto;
    }

    public ChatDto getChatDto(Chats chat, Long userId) {
        Users otherUser;
        if (chat.getUser1().getId() == userId) {
            otherUser = chat.getUser2();
        } else {
            otherUser = chat.getUser1();
        }
        Messages lastMessage = messagesRepository.getLastMessage(chat.getId());

        ChatDto chatDto = new ChatDto();
        chatDto.name = otherUser.getName();
        chatDto.lastName = otherUser.getLastname();
        chatDto.chatId = chat.getId();
        chatDto.friendId = otherUser.getId();
        chatDto.missedMessagesCount = 0;

        if(lastMessage != null) {
            chatDto.date = lastMessage.getDate().toString();
            chatDto.lastMessageContent = lastMessage.getContent();
        }

        if (otherUser.getFile() != null) {
            chatDto.friendAvatarStringURL = otherUser.getFile().getDownloadPath();
        }

        return chatDto;
    }
}
