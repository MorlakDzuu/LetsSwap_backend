const database = require('../database/database');
const tagRepository = require('../repository/tagRepository');
const Order = require('../domain/Order');

async function addOrder(order) {
    let data = await database.db.one('INSERT INTO orders (user_id, title, description, is_free, is_hidden, counter_offer, date) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, (NOW())::TIMESTAMP) RETURNING id', [order.userId, order.title, order.description,
        order.isFree, order.isHidden, order.counterOffer]);
    return data.id;
}

async function getAllOrdersByUserId(userId) {
    const orders = await database.db.manyOrNone('SELECT * FROM orders WHERE user_id = $1', [userId]);
    return orders;
}

async function getOrderById(id) {
    const order = await database.db.one('SELECT * FROM orders WHERE id = $1', [id]);
    let orderEntity = new Order(order.id, order.user_id, order.title, order.description,
        order.counter_offer, order.is_free, order.is_hidden, order.photo_data, order.date);
    return orderEntity;
}

async function addPhotoToOrder(orderId, photoId) {
    let order = await getOrderById(orderId);
    let photos = order.photo_data;
    if (photos == null) {
        photos = [];
    }
    photos.push(photoId);
    await database.db.none('UPDATE orders SET photo_data = $1 WHERE id = $2', [photos, orderId]);
}

async function setIsHidden(orderId, isHidden) {
    await database.db.none('UPDATE orders SET is_hidden = $1 WHERE id = $2', [isHidden, orderId]);
}

async function isOrderHidden(orderId) {
    let order = await getOrderById(orderId);
    return order.is_hidden;
}

async function getPhotoIdsByOrderId(orderId) {
    let order = await getOrderById(orderId);
    return order.photo_data;
}

async function deleteOrder(orderId) {
    await database.db.none('DELETE FROM orders WHERE id = $1', [orderId]);
}

async function updateOrder(order) {
    await database.db.none('UPDATE orders SET title = $1, description = $2, is_free = $3, counter_offer = $4 ' +
        'WHERE id = $5', [order.title, order.description, order.isFree, order.counterOffer, order.id]);
}

async function updateOrderPhotos(orderId, photoIds) {
    await database.db.none('UPDATE orders SET photo_data = $1 WHERE id = $2', [photoIds, orderId]);
}

async function getAllOrdersForUser(userId, city) {
    let query = 'SELECT orders.* FROM orders INNER JOIN users ON (orders.user_id = users.id) WHERE orders.user_id <> ' + userId + ' AND users.city LIKE \'%' + city + '%\'';
    let orders = await database.db.manyOrNone(query);
    return orders;
}

async function getOrdersBySearchStringAndTags(searchString, tags, city, userId) {
    searchString = searchString.toLowerCase();
    let tagCondition = "";
    let query = "orders";
    if (tags.length > 0) {
        query = '(SELECT orders.* FROM tag_to_order INNER JOIN orders ON (tag_to_order.order_id = orders.id) WHERE ';
        for (let i = 0; i < tags.length; i++) {
            if (tagCondition != "") {
                tagCondition += " AND ";
            }
            let tagData = await tagRepository.getTagByName(tags[i]);
            tagCondition += "tag_id = " + tagData.id;
        }
        query += tagCondition + ')';
    }
    query = 'SELECT x.* FROM ' + query + ' AS x {USERS_INNER}WHERE {CITY_WHERE}x.user_id <> ' + userId;
    if (searchString != null && searchString != '') {
        query += ' AND (lower(x.title) LIKE \'%' + searchString + '%\' OR lower(x.description) LIKE \'%' +
            searchString + '%\' OR lower(x.counter_offer) LIKE \'%' + searchString + '%\')'
    }
    if (city != null) {
        let cityWhere = 'users.city LIKE \'%' + city + '%\' AND ';
        query = query.replace('{USERS_INNER}', 'INNER JOIN users ON (x.user_id = users.id) ')
            .replace('{CITY_WHERE}', cityWhere);
    } else {
        query = query.replace('{USERS_INNER}', '').replace('{CITY_WHERE}', '');
    }
    let orders = await database.db.manyOrNone(query);
    return orders;
}

module.exports = {
    addOrder,
    getAllOrdersByUserId,
    getOrderById,
    addPhotoToOrder,
    getPhotoIdsByOrderId,
    setIsHidden,
    isOrderHidden,
    deleteOrder,
    updateOrder,
    updateOrderPhotos,
    getAllOrdersForUser,
    getOrdersBySearchStringAndTags
}