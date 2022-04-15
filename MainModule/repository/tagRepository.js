const database = require('../database/database');

async function addTag(tag) {
    await database.db.none('INSERT INTO tags (tag_name) VALUES ($1)', [tag]);
}

async function getTagByName(tag) {
    let tagData = await database.db.oneOrNone('SELECT * FROM tags WHERE tag_name = $1', [tag]);
    return tagData;
}

async function addTagToOrder(orderId, tagId) {
    await database.db.none('INSERT INTO tag_to_order (order_id, tag_id) VALUES ($1, $2)', [orderId, tagId]);
}

async function getTagsByOrderId(orderId) {
    let tags = await database.db.manyOrNone('SELECT (tag_name) FROM tag_to_order INNER JOIN tags ON ' +
        '(tag_to_order.tag_id = tags.id) WHERE order_id = $1', [orderId]);
    let tagNames = [];
    tags.forEach(elem => tagNames.push(elem.tag_name));
    return tagNames;
}

async function updateOrderTags(orderId, tags) {
    let oldTags = await getTagsByOrderId(orderId);
    let oldTagsSet = new Set(oldTags);
    for (const item of tags) {
        if (!oldTagsSet.has(item)) {
            let tag = await getTagByName(item);
            await addTagToOrder(orderId, tag.id);
        } else {
            oldTagsSet.delete(item);
        }
    }
    for (const item of oldTagsSet) {
        let tag = await getTagByName(item);
        await deleteTagToOrderByOrderIdAndTagId(orderId, tag.id);
    }
}

async function deleteTagToOrderByOrderId(orderId) {
    await database.db.none('DELETE FROM tag_to_order WHERE order_id = $1', [orderId]);
}

async function deleteTagToOrderByOrderIdAndTagId(orderId, tagId) {
    await database.db.none('DELETE FROM tag_to_order WHERE order_id = $1 AND tag_id = $2', [orderId, tagId]);
}

module.exports = {
    addTag,
    getTagByName,
    addTagToOrder,
    getTagsByOrderId,
    deleteTagToOrderByOrderId,
    updateOrderTags,
    deleteTagToOrderByOrderIdAndTagId
};