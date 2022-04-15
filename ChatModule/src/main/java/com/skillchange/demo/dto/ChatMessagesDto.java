package com.skillchange.demo.dto;

import java.util.List;

public class ChatMessagesDto {
    public List<MessageDto> messages;
    public String friendUsername;
    public String friendAvatarStringURL;
    public Long friendId;
    public Long chatId;
    public Long userId;
    public String lastMessageContent;

    public ChatMessagesDto() {
    }
}
