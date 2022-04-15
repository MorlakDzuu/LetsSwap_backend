package com.skillchange.demo.entity.id;

import java.io.Serializable;
import java.util.Objects;

public class MuteId implements Serializable {
    private Long userId;

    private Long chatId;

    public MuteId(Long userId, Long chatId) {
        this.userId = userId;
        this.chatId = chatId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MuteId muteId = (MuteId) o;
        return userId.equals(muteId.userId) &&
                chatId.equals(muteId.chatId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, chatId);
    }
}
