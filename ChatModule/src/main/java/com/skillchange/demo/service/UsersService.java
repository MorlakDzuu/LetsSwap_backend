package com.skillchange.demo.service;

import com.skillchange.demo.entity.Users;
import com.skillchange.demo.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsersService {

    @Autowired
    private final UsersRepository usersRepository;

    public UsersService(UsersRepository usersRepository){
        this.usersRepository = usersRepository;
    }

    @Transactional
    public Users findById(Long userId){
        return usersRepository.findUserById(userId).get(0);
    }
}
