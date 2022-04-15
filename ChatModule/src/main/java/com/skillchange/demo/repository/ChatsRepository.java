package com.skillchange.demo.repository;

import com.skillchange.demo.entity.Chats;
import com.skillchange.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatsRepository extends JpaRepository<Chats, Long> {

    @Query(value = "select * from chats where user1_id = ?1 OR  user2_id = ?1 ORDER BY last_message_date",
            nativeQuery = true)
    List<Chats> getChatsByUserId(Long id);

    @Query(value = "select * from chats where (user1_id = :#{#user1Id} AND " +
            "user2_id = :#{#user2Id}) OR (user1_id = :#{#user2Id} AND user2_id = :#{#user1Id})", nativeQuery = true)
    List<Chats> getChatByUser1AndUser2(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    @Query(value = "select * from chats where id = :#{#chatId}", nativeQuery = true)
    List<Chats> getChatById(@Param("chatId") Long chatId);
}