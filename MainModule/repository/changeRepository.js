const database = require('../database/database');

async function addChange(deal, userId) {
    let data = await database.db.one('INSERT INTO deals (order_id, user_id, comment, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [deal.orderId, userId, deal.comment, "new"]);
    return data.id;
}

async function getAllNotifications(userId) {
    let deals = await database.db.manyOrNone('SELECT deals.* FROM deals INNER JOIN orders ON ' +
        '(deals.order_id = orders.id) WHERE orders.user_id = $1', [userId]);
    return deals;
}

async function getAllNewGivenChanges(userId) {
    let deals = await database.db.manyOrNone('SELECT deals.* FROM deals INNER JOIN orders ON ' +
        '(deals.order_id = orders.id) WHERE orders.user_id = $1 AND deals.status = $2', [userId, "new"]);
    return deals;
}

async function getAllTakenChanges(userId) {
    let deals = await database.db.manyOrNone('SELECT * FROM deals WHERE user_id = $1', [userId]);
    return deals
}

async function confirmChange(dealId) {
    await database.db.none('UPDATE deals SET status = $1 WHERE id = $2', ['confirmed', dealId]);
}

async function isItUserChange(dealId, userId) {
    let order = await database.db.one('SELECT orders.* FROM deals INNER JOIN orders ON ' +
        '(deals.order_id = orders.id) WHERE deals.id = $1', [dealId]);
    return  order.user_id == userId;
}

async function canMakeChange(orderId) {
    let deal = await database.db.oneOrNone('SELECT * FROM deals WHERE order_id = $1 AND status = $2',
        [orderId, 'confirmed']);
    if (deal == null) {
        return true;
    }
    return false;
}

async function getChangeById(dealId) {
    let data = await database.db.one('SELECT * FROM deals WHERE id = $1', [dealId]);
    return data;
}

async function deleteChange(changeId) {
    await database.db.none('DELETE FROM deals WHERE id = $1', [changeId]);
}

module.exports = {
    addDeal: addChange,
    confirmDeal: confirmChange,
    getAllTakenDeals: getAllTakenChanges,
    getAllNewGivenDeals: getAllNewGivenChanges,
    isItUserDeal: isItUserChange,
    canMakeChange,
    getDealById: getChangeById,
    deleteChange
}