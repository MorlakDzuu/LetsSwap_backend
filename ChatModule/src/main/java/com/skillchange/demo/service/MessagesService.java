package com.skillchange.demo.service;

import com.skillchange.demo.dto.*;
import com.skillchange.demo.entity.Chats;
import com.skillchange.demo.entity.Messages;
import com.skillchange.demo.entity.Users;
import com.skillchange.demo.fabrica.ChatsFabrica;
import com.skillchange.demo.repository.ChatsRepository;
import com.skillchange.demo.repository.MessagesRepository;
import com.skillchange.demo.repository.UsersRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MessagesService {
    @Autowired
    private MessagesRepository messagesRepository;

    @Autowired
    private ChatsRepository chatsRepository;

    @Autowired
    private ChatsFabrica chatsFabrica;

    @Autowired
    private UsersRepository usersRepository;

    public void addMessage(Map<String, String> payload) {
        messagesRepository.save(chatsFabrica.createMessage(payload));
    }

    public ChatMessagesDto getChatMessagesDto(Long chatId, Long userId) {
        Chats chat = chatsRepository.getById(chatId);
        Users otherUser;
        if (chat.getUser1().getId() == userId) {
            otherUser = chat.getUser2();
        } else {
            otherUser = chat.getUser1();
        }
        List<Messages> messages = messagesRepository.getMessagesByChatId(chatId);
        List<MessageDto> messageDtos = new ArrayList<>();
        for (Messages message: messages) {
            messageDtos.add(getMessageDto(message));
        }

        ChatMessagesDto chatMessagesDto = new ChatMessagesDto();
        chatMessagesDto.messages = messageDtos;
        chatMessagesDto.chatId = chatId;

        if (otherUser.getFile() != null) {
            chatMessagesDto.friendAvatarStringURL = otherUser.getFile().getDownloadPath();
        }

        chatMessagesDto.friendUsername = otherUser.getName() + " " + otherUser.getLastname();
        chatMessagesDto.friendId = otherUser.getId();
        chatMessagesDto.userId = userId;
        chatMessagesDto.lastMessageContent = "test";

        return chatMessagesDto;
    }

    private MessageDto getMessageDto(Messages message) {
        MessageDto messageDto = new MessageDto();

        messageDto.date = message.getDate().toString();
        messageDto.senderName = message.getUserFrom().getName() + " " + message.getUserFrom().getLastname();
        messageDto.senderId = message.getUserFrom().getId();
        messageDto.messageId = message.getIdString();
        messageDto.messageText = message.getContent();

        if (!message.getDataInfo().isEmpty()) {
            JSONObject json = new JSONObject(message.getDataInfo());
            messageDto.fileId = (int) json.get("fileId");
            messageDto.fileName = json.get("fileName").toString();
            messageDto.filePath = json.get("filePath").toString();
            messageDto.fileExtension = messageDto.fileName.split("\\.")[1];
        } else {
            messageDto.fileId = 0;
            messageDto.fileName = null;
            messageDto.filePath = null;
            messageDto.fileExtension = null;
        }

        return  messageDto;
    }

    public MessageSendDto getMessageSendDto(MessageAddDto messageAddDto) {
        Messages message = chatsFabrica.createMessageFromDto(messageAddDto);
        messagesRepository.save(message);

        Users user = message.getUserFrom();
        Chats chat = message.getChat();

        String lastMessageContent = "file";
        if (!message.getContent().isEmpty()) {
            lastMessageContent = message.getContent();
        }
        chat.setLastMessageContent(lastMessageContent);

        chat.setLastMessageDate(message.getDate());
        chatsRepository.save(chat);

        MessageSendDto messageSendDto = new MessageSendDto();

        if (chat.getUser1().getId() == messageAddDto.userId) {
            messageSendDto.userIdTo = chat.getUser2().getId();
        } else {
            messageSendDto.userIdTo = chat.getUser1().getId();
        }

        messageSendDto.chatId = messageAddDto.chatId;
        messageSendDto.messageId = messageAddDto.messageId;
        messageSendDto.senderId = messageAddDto.userId;
        messageSendDto.messageText = messageAddDto.messageText;
        messageSendDto.senderName = user.getName() + " " + user.getLastname();
        messageSendDto.date = message.getDate();

        if (!messageAddDto.dataInfo.isEmpty()) {
            JSONObject json = new JSONObject(messageAddDto.dataInfo);

            messageSendDto.fileId = Integer.parseInt(json.get("fileId").toString());
            messageSendDto.fileName = json.get("fileName").toString();
            messageSendDto.filePath = json.get("filePath").toString();

            List<String> list = Arrays.asList(messageSendDto.fileName.split("\\."));
            Collections.reverse(list);
            messageSendDto.fileExtension = list.get(0);
        } else {
            messageSendDto.fileId = 0;
            messageSendDto.fileName = null;
            messageSendDto.filePath = null;
            messageSendDto.fileExtension = null;
        }

        return messageSendDto;
    }
}
