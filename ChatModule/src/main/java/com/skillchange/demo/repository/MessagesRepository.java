package com.skillchange.demo.repository;

import com.skillchange.demo.entity.Messages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessagesRepository extends JpaRepository<Messages, Long> {

    @Query(value = "select * from messages where chat_id = :#{#chatId} ORDER BY date", nativeQuery = true)
    List<Messages> getMessagesByChatId(@Param("chatId") Long chatId);

    @Query(value = "SELECT * FROM messages WHERE chat_id = :#{#chatId} ORDER BY date DESC LIMIT 1", nativeQuery = true)
    Messages getLastMessage(@Param("chatId") Long chatId);
}
