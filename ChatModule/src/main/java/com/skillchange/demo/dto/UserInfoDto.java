package com.skillchange.demo.dto;

public class UserInfoDto {
    public Long senderId;
    public String displayName;

    public UserInfoDto(Long senderId, String displayName) {
        this.senderId = senderId;
        this.displayName = displayName;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
}
