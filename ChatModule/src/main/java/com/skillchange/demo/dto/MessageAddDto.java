package com.skillchange.demo.dto;

public class MessageAddDto {
    public String messageId;
    public Long chatId;
    public String messageText;
    public String dataInfo;
    public String date;
    public String forward;
    public Long userId;

    public MessageAddDto() {
    }

    @Override
    public String toString() {
        return "MessageAddDto{" +
                "messageId='" + messageId + '\'' +
                ", chatId=" + chatId +
                ", messageText='" + messageText + '\'' +
                ", dataInfo='" + dataInfo + '\'' +
                ", date='" + date + '\'' +
                ", forward='" + forward + '\'' +
                ", userId=" + userId +
                '}';
    }
}