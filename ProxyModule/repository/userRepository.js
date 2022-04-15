const database = require('../database/database');

async function register(client) {
    const data = await database.db.one('INSERT INTO users (name, lastname, raiting, swaps_count, phone_number, city) ' +
        'VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [client.name, client.lastname, 0, 0, client.login, client.city]);
    return data.id;
}

async function getUserByLogin(login) {
    const user = await database.db.oneOrNone('SELECT * FROM users WHERE phone_number = $1', [login]);
    return user;
}

async function getUserById(id) {
    const user = await database.db.one('SELECT * FROM users WHERE id = $1', [id]);
    return user;
}

async function updateUserName(id, name) {
    await database.db.none('UPDATE users SET name = $1 WHERE id = $2', [name, id]);
}

async function updateUserLastname(id, lastname) {
    await database.db.none('UPDATE users SET lastname = $1 WHERE id = $2', [lastname, id]);
}

async function updateUserRaiting(id, raiting) {
    await database.db.none('UPDATE users SET raiting = $1 WHERE id = $2', [raiting, id]);
}

async function updateUserSwapsCount(id, swapsCount) {
    await database.db.none('UPDATE users SET swaps_count = $1 WHERE id = $2', [swapsCount, id]);
}

async function updateUserCity(id, city) {
    await database.db.none('UPDATE users SET city = $1 WHERE id = $2', [city, id]);
}

async function updateUserPhotoId(id, photoId) {
    await database.db.none('UPDATE users SET photo_id = $1 WHERE id = $2', [photoId, id]);
}

async function saveSmsCode(code, login) {
    await database.db.none('INSERT INTO sms_auth_data (phone_number, sms_code, sms_expired_time) VALUES ($1, $2, (NOW() + interval \'3 minutes\')::TIMESTAMP) ' +
        'ON CONFLICT (phone_number) DO UPDATE SET sms_code = $2, sms_expired_time = (NOW() + interval \'3 minutes\')::TIMESTAMP',
        [login, code]);
}

async function smsCodeVerify(code, login) {
    const validity = await database.db.oneOrNone('SELECT * FROM sms_auth_data WHERE sms_code = $1 AND phone_number = $2 AND (sms_expired_time > NOW()::TIMESTAMP)',
        [code, login]);
    return !!validity;
}

module.exports = {
    register,
    getUserByLogin,
    getUserById,
    updateUserName,
    updateUserLastname,
    updateUserCity,
    updateUserPhotoId,
    saveSmsCode,
    smsCodeVerify
}