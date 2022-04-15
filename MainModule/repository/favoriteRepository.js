const database = require('../database/database');

async function addFavorite(userId, orderId) {
    await database.db.none('INSERT INTO favorite_orders (user_id, order_id) VALUES ($1, $2)',
        [userId, orderId]);
}

async function getFavoriteOrdersByUserId(userId) {
    let orders = await database.db.manyOrNone('SELECT * FROM favorite_orders INNER JOIN orders ON ' +
        '(favorite_orders.order_id = orders.id) WHERE favorite_orders.user_id = $1', [userId]);
    return orders;
}

async function deleteFavoriteOrder(userId, orderId) {
    await database.db.none('DELETE FROM favorite_orders WHERE user_id = $1 AND order_id = $2',
        [userId, orderId]);
}

async function isOrderFavorite(userId, orderId) {
    let favoriteData = await database.db.oneOrNone('SELECT * FROM favorite_orders WHERE user_id = $1 AND ' +
        'order_id = $2', [userId, orderId]);
    if (favoriteData == null) {
        return false;
    } else {
        return true;
    }
}

module.exports = {
    addFavorite,
    getFavoriteOrdersByUserId,
    deleteFavoriteOrder,
    isOrderFavorite
}