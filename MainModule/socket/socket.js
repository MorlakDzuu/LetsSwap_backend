const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../service/logService');
const chatRepository = require("../repository/chatRepository");
const messageRepository = require("../repository/messageRepository");
const userRepository = require("../repository/userRepository");

function verify(socket, next) {
    let token = socket.handshake.query.token;
    jwt.verify(token, config.jwtApiAccessToken, (error, user) => {
        if (error) {
            logger.log(error);
            return next(new Error('Authentication error'));
        }
        next();
    });
}

function connection(socket) {
    let token = socket.handshake.query.token;
    let userId = jwt.decode(token).id;
    socket.username = userId;
    global.connections.push(socket);

    socket.on('disconnect', function(data) {
        global.connections.splice(connections.indexOf(socket), 1);
        //console.log('Socket disconnected: ' + socket);
    });
    socket.on('SendMessage', async function(data) {
        let stringId = data.messageId;
        let chatId = data.chatId;
        let chatInfo = await chatRepository.getChatInfo(chatId);
        let content = data.messageText;
        let dataInfo = data.dataInfo;
        let forward = data.forward;
        let userIdTo;

        if (content == null) {
            content = "";
        }
        let contentType = "mock";

        try {
            let user = await userRepository.getUserById(userId);
            await messageRepository.addNewMessage(stringId, chatId, userId, contentType, forward, content, JSON.stringify(dataInfo));
            let messageInfo = await messageRepository.getMessageByStringId(stringId);
            if (chatInfo.user1_id == userId) {
                userIdTo = chatInfo.user2_id;
            } else {
                userIdTo = chatInfo.user1_id;
            }

            let data = {
                chatId: chatId,
                senderId: userId,
                messageText: content,
                senderName: user.name + " " + user.lastname,
                messageId: stringId,
                date: messageInfo.date,
                fileId: 0,
                fileName: null,
                filePath: null,
                fileExtension: null
            }

            if (dataInfo != null) {
                data.fileId = dataInfo.fileId;
                data.fileName = dataInfo.fileName;
                data.filePath = dataInfo.filePath;
                data.fileExtension = dataInfo.fileName.split('.').reverse()[0];
            }
            sendNotificationData(data, userIdTo, 'GetMessage');
            //sendNotificationData(data, userId, 'GetMessage');
        } catch (err) {
            logger.log(err);
            socket.emit('error', err);
        }
    });
}

function sendNotificationData(data, userId, key) {
    let socketId;
    global.connections.forEach(socket => {
        if (socket.username == userId) {
            socketId = socket.id;
        }
    });
    if (socketId) {
        io.to(socketId).emit(key, data);
    }
}

function init() {
    io.use(verify)
        .on('connection', connection);
}

module.exports = {
    init,
    sendNotificationData
};
