const database = require('../database/database');

async function addNewMessage(messageId, chatId, userId, contentType, forward, message, dataInfo) {
    await database.db.none('INSERT INTO messages (id_string, chat_id, user_id_from, content_type, forward, content, status, data_info, date) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (NOW())::TIMESTAMP)', [messageId, chatId, userId, contentType, forward, message, 'new', dataInfo]);
}

async function getLastMessage(chatId) {
    let data = await database.db.oneOrNone('SELECT * FROM messages WHERE chat_id = $1' +
        ' ORDER BY date DESC LIMIT 1', [chatId]);
    return data;
}

async function getChatMessages(chatId) {
    let messages = await database.db.manyOrNone('SELECT * FROM messages WHERE chat_id = $1 ORDER BY date',
        [chatId]);
    return messages;
}

async function getMessageById(id) {
    let message = await database.db.one('SELECT * FROM messages WHERE id = $1', [id]);
    return message;
}

async function getMessageByStringId(id) {
    let message = await database.db.one('SELECT * FROM messages WHERE id_string = $1', [id]);
    return message;
}

module.exports = {
    addNewMessage,
    getLastMessage,
    getChatMessages,
    getMessageById,
    getMessageByStringId
}