package com.skillchange.demo.entity;

import com.skillchange.demo.entity.id.MuteId;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;

@Entity
@IdClass(MuteId.class)
public class Mute {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "chat_id")
    private Long chatId;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }
}
