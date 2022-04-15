const database = require('../database/database');

async function addNewChat(userId1, userId2) {
    let chat = await database.db.oneOrNone('SELECT * FROM chats WHERE (user1_id = $1 AND user2_id = $2) ' +
        'OR (user1_id = $2 AND user2_id = $1)', [userId1, userId2]);
    if (chat != null) {
        throw Error('Chat already exists');
    }
    let data = await database.db.one('INSERT INTO chats (user1_id, user2_id, date) VALUES ($1, $2, ' +
        '(NOW())::TIMESTAMP) RETURNING id', [userId1, userId2]);
    return data.id;
}

async function getChatInfo(chatId) {
    let data = await database.db.one('SELECT * FROM chats WHERE id = $1', [chatId]);
    return data;
}

async function getChatsIdsByUserId(userId) {
    let chatsIds = await database.db.manyOrNone('SELECT (id) FROM chats WHERE user1_id = $1 OR user2_id = $1', [userId]);
    return chatsIds;
}

module.exports = {
    addNewChat,
    getChatInfo,
    getChatsIdsByUserId
}