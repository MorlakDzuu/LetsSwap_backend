const chatRepository = require('../repository/chatRepository');
const userRepository = require('../repository/userRepository');
const messageRepository = require('../repository/messageRepository');
const fileService = require('../service/fileService');

async function getChatsArrayOutput(userId) {
    let chatIds = await chatRepository.getChatsIdsByUserId(userId);
    let chatsInfo = [];
    for (let i = 0; i < chatIds.length; i++) {
        let chatOutput = await getChatOutput(chatIds[i].id, userId);
        chatsInfo.push(chatOutput);
    }
    return chatsInfo;
}

async function getChatOutput(chatId, userId) {
    let chatInfo = await chatRepository.getChatInfo(chatId);
    let otherUserId;
    if (chatInfo.user1_id == userId) {
        otherUserId = chatInfo.user2_id;
    } else {
        otherUserId = chatInfo.user1_id;
    }
    let user = await userRepository.getUserById(otherUserId);
    let photoUrl = await fileService.getUserPhotoUrl(otherUserId);
    let lastMessageInfo = await messageRepository.getLastMessage(chatId);
    let lastMessage = "";
    let lastMessageDate = "";
    if (lastMessageInfo != null) {
        lastMessage = lastMessageInfo.message;
        lastMessageDate = lastMessageInfo.date;
    }
    return {
        name: user.name,
        lastName: user.lastname,
        friendAvatarStringURL: photoUrl,
        lastMessageContent: lastMessage,
        friendId: otherUserId,
        missedMessagesCount: 0,
        date: lastMessageDate,
        chatId: chatId
    }
}

async function getChatMessagesOutput(chatId, userId) {
    let chatInfo = await chatRepository.getChatInfo(chatId);
    let otherUserId;
    if (chatInfo.user1_id == userId) {
        otherUserId = chatInfo.user2_id;
    } else {
        otherUserId = chatInfo.user1_id;
    }
    let user = await userRepository.getUserById(otherUserId);
    let photoUrl = await fileService.getUserPhotoUrl(otherUserId);
    let messagesInfo = await messageRepository.getChatMessages(chatId);
    let messages = [];
    for (let message of messagesInfo) {
        let messageOutput = await getMessageOutput(message);
        messages.push(messageOutput);
    }
    // поменять
    return {
        messages: messages,
        friendUsername: user.name + " " + user.lastname,
        friendAvatarStringURL: photoUrl,
        friendId: otherUserId,
        chatId: chatId,
        userId: userId,
        lastMessageContent: "test"
    };
}

async function getMessageOutput(message) {
    let user = await userRepository.getUserById(message.user_id_from);
    let content = message.content;
    if (content == "") {
        content = null;
    }
    let fileId = 0;
    let fileName = null;
    let filePath = null;
    let fileExtension = null;

    if (message.data_info != "null") {
        let dataInfoJson = JSON.parse(message.data_info);
        fileId = dataInfoJson.fileId;
        fileName = dataInfoJson.fileName;
        filePath = dataInfoJson.filePath;
        fileExtension = dataInfoJson.fileName.split('.')[1];
    }
    return {
        senderId: message.user_id_from,
        messageText: content,
        senderName: user.name + " " + user.lastname,
        messageId: message.id_string,
        date: message.date,
        fileId: fileId,
        fileName: fileName,
        filePath: filePath,
        fileExtension: fileExtension
    }
}

module.exports = {
    getChatsArrayOutput,
    getChatMessagesOutput
}