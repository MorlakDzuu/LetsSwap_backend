const orderRepository = require("../repository/orderRepository");
const tagRepository = require("../repository/tagRepository");
const fileService = require("./fileService");
const userRepository = require("../repository/userRepository");
const favoriteRepository = require("../repository/favoriteRepository");
const fileRepository = require("../repository/fileRepository");

async function addOrder(order, tags, photoUrls) {
    let orderId = await orderRepository.addOrder(order);
    for (let i = 0; i < tags.length; i++) {
        let tagData = await tagRepository.getTagByName(tags[i]);
        await tagRepository.addTagToOrder(orderId, tagData.id);
    }
    if (photoUrls) {
        for(let i = 0; i < photoUrls.length; i++) {
            await fileService.addPhotoToOrder(photoUrls[i], orderId);
        }
    }
}

async function getOrderDto(orderId) {
    let order = await orderRepository.getOrderById(orderId);
    let photoUrls = await fileService.getOrderUrls(orderId);
    let tags = await tagRepository.getTagsByOrderId(orderId);
    return {
        orderId: order.id,
        title: order.title,
        description: order.description,
        counterOffer: order.counterOffer,
        isFree: order.isFree,
        tags: tags,
        photoAttachments: photoUrls,
        isHidden: order.isHidden
    };
}

async function changeOrderHiddenParam(orderId) {
    let isHidden = await orderRepository.isOrderHidden(orderId);
    if (isHidden) {
        await orderRepository.setIsHidden(orderId, false);
    } else {
        await orderRepository.setIsHidden(orderId, true);
    }
    return !isHidden;
}

async function deleteOrder(orderId) {
    let photoUrls = await fileService.getOrderUrls(orderId);
    if (photoUrls) {
        for (let i = 0; i < photoUrls.length; i++) {
            await fileService.deletePhoto(photoUrls[i]);
        }
    }
    await tagRepository.deleteTagToOrderByOrderId(orderId);
    await orderRepository.deleteOrder(orderId);
}

async function updateOrder(order, tags, photoUrls) {
    await orderRepository.updateOrder(order);
    await tagRepository.updateOrderTags(order.id, tags);
    await fileService.updateOrderPhotos(order.id, photoUrls);
}

async function getOrdersFeedDto(userId) {
    let user = await userRepository.getUserById(userId);
    let orders = await orderRepository.getAllOrdersForUser(userId, user.city);
    let ordersFeed = [];
    for (let item of orders) {
        let order = await getOrderFeedDto(userId, item);
        ordersFeed.push(order);
    }
    return {
        items: ordersFeed,
        city: user.city,
        nextFrom: ""
    };
}

async function getOrderFeedModelDto(orderId) {
    let order = await orderRepository.getOrderById(orderId);
    let user = await userRepository.getUserById(order.userId);
    let photoUrls = await fileService.getOrderUrls(orderId);
    let tags = await tagRepository.getTagsByOrderId(orderId);
    let photoUrl = "";
    if (user.photoId) {
        let photoData = await fileRepository.getFileDataById(user.photoId);
        photoUrl = global.serverPath + photoData.download_path;
    }
    return {
        order: {
            orderId: order.id,
            title: order.title,
            description: order.description,
            counterOffer: order.counterOffer,
            isFree: order.isFree,
            tags: tags,
            photoAttachments: photoUrls
        },
        user: {
            userId: user.id,
            name: user.name,
            lastName: user.lastname,
            city: user.city,
            photo: photoUrl
        }
    };
}

async function makeOrderFavorite(orderId, userId) {
    let order = await orderRepository.getOrderById(orderId);
    if (order.userId != userId) {
        await favoriteRepository.addFavorite(userId, orderId);
        return true;
    }
    return false;
}

async function makeOrderNotFavorite(orderId, userId) {
    await favoriteRepository.deleteFavoriteOrder(userId, orderId);
}

async function getUserFavoriteOrders(userId) {
    let orders = await favoriteRepository.getFavoriteOrdersByUserId(userId);
    let ordersOutput = [];
    for (let order of orders) {
        let ordOutput = await getOrderFeedDto(userId, order);
        ordersOutput.push(ordOutput);
    }
    return {
        items: ordersOutput,
        nextFrom: ""
    };
}

async function getOrdersSearchDto(userId, searchString, tags, city) {
    let orders = await orderRepository.getOrdersBySearchStringAndTags(searchString, tags, city, userId);
    let ordersOutput = [];
    for (let order of orders) {
        let ordOutput = await getOrderFeedDto(userId, order);
        ordersOutput.push(ordOutput);
    }
    return {
        items: ordersOutput,
        nextFrom: ""
    };
}

async function getOrderProfileDto(orderId, userId) {
    let order = await orderRepository.getOrderById(orderId);
    let photoUrls = await fileService.getOrderUrls(orderId);
    let isFavorite = await favoriteRepository.isOrderFavorite(userId, order.id);
    return{
        orderId: order.id,
        title: order.title,
        description: order.description,
        counterOffer: order.counterOffer,
        photo: photoUrls.pop(),
        isFree: order.isFree,
        isFavorite: isFavorite,
        isHidden: order.isHidden
    };
}

async function getOrderFeedDto(userId, order) {
    let photoUrls = await fileService.getOrderUrls(order.id);
    let isFavorite = await favoriteRepository.isOrderFavorite(userId, order.id);
    return {
        orderId: order.id,
        title: order.title,
        description: order.description,
        counterOffer: order.counter_offer,
        isFavorite: isFavorite,
        photo: photoUrls.pop(),
        isFree: order.is_free
    }
}

module.exports = {
    addOrder,
    getOrderDto,
    changeOrderHiddenParam,
    deleteOrder,
    updateOrder,
    getOrdersFeedDto,
    getOrderFeedModelDto,
    makeOrderFavorite,
    makeOrderNotFavorite,
    getUserFavoriteOrders,
    getOrdersSearchDto,
    getOrderProfileDto
}