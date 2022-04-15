package com.skillchange.demo.dto;

public class MessageSendDto {
    public Long chatId;
    public Long senderId;
    public Long userIdTo;
    public String messageText;
    public String senderName;
    public String messageId;
    public String date;
    public Integer fileId;
    public String fileName;
    public String filePath;
    public String fileExtension;

    public MessageSendDto() {
    }
}