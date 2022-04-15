const chatRepository = require('../repository/chatRepository');
const userRepository = require('../repository/userRepository');
const messageRepository = require('../repository/messageRepository');
const fileService = require('../service/fileService');
const chatOutput = require('./../output/chatOutput');
const logger = require('../service/logService');
const jwt = require('jsonwebtoken');
const authenticator = require('../controller/security/authenticator');
const socket = require('../socket/socket');

async function createNewChat(req, res) {
    try {
        let chatId = await chatRepository.addNewChat(jwt.decode(req.headers.authorization).id, req.body.userId);
        res.json({chatId:chatId});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: 'error'});
    }
}

async function makeMessage(req, res) {
    console.log(req.body);
    let userId = jwt.decode(req.headers.authorization).id;
    let chatId = req.body.chatId;
    let chatInfo = await chatRepository.getChatInfo(chatId);
    let forward = req.body.forward;
    let dataInfo = req.body.dataInfo;
    let contentType = req.body.contentType;
    let content = req.body.content;
    let stringId = req.body.id;

    let userIdTo;
    try {
        await messageRepository.addNewMessage(stringId, chatId, userId, contentType, forward, content, dataInfo);
        if (chatInfo.user1_id == userId) {
            userIdTo = chatInfo.user2_id;
        } else {
            userIdTo = chatInfo.user1_id;
        }
        socket.sendNotificationData({
            from: userId,
            contentType: contentType,
            message: content
        },
            userIdTo, 'chatMessage');
        res.json({message: "success"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        console.log(err);
        res.json({message: 'error'});
    }
}

async function getChatsInfo(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    try {
        let output = await chatOutput.getChatsArrayOutput(userId);
        let user = await userRepository.getUserById(userId);
        let photoUrl = await fileService.getUserPhotoUrl(userId);
        res.json({chats: output,
            myUserName: user.name + " " + user.lastname,
            myProfileImage: photoUrl,
            myId: userId
        });
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: 'error'});
    }
}

async function getChatMessages(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    let chatId = req.params.chatId;
    try {
        let chatOutputInf = await chatOutput.getChatMessagesOutput(chatId, userId);
        res.json(chatOutputInf);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: 'error'});
    }
}

module.exports = function (app) {
    app.use('/chat', authenticator.apiAuthenticateJWT);
    app.post('/chat/create', createNewChat);
    app.post('/chat/addNewMessage', makeMessage);
    app.get('/chat/getAllChats', getChatsInfo);
    app.get('/chat/getChatMessages/:chatId', getChatMessages);
}