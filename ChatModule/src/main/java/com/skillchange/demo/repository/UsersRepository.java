package com.skillchange.demo.repository;

import com.skillchange.demo.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UsersRepository extends JpaRepository<Users, Long> {
    @Query(value = "select u from Users u where u.id = :#{#id}")
    List<Users> findUserById(@Param("id") Long id);
}
