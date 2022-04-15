const orderRepository = require("../repository/orderRepository");
const userRepository = require("../repository/userRepository");
const fileRepository = require("../repository/fileRepository");
const favoriteRepository = require("../repository/favoriteRepository");

const fileService = require("../service/fileService");
const tagRepository = require("../repository/tagRepository");

async function getUserOrderOutput(orderId) {
    let order = await orderRepository.getOrderById(orderId);
    let photoUrls = await fileService.getOrderUrls(orderId);
    let tags = await tagRepository.getTagsByOrderId(orderId);
    return{
        orderId: order.id,
        title: order.title,
        description: order.description,
        counterOffer: order.counter_offer,
        isFree: order.is_free,
        tags: tags,
        photoAttachments: photoUrls,
        isHidden: order.is_hidden
    };
}

async function getOrderProfileOutput(orderId, userId) {
    let order = await orderRepository.getOrderById(orderId);
    let photoUrls = await fileService.getOrderUrls(orderId);
    let isFavorite = await favoriteRepository.isOrderFavorite(userId, order.id);
    return{
        orderId: order.id,
        title: order.title,
        description: order.description,
        counterOffer: order.counter_offer,
        photo: photoUrls.pop(),
        isFree: order.is_free,
        isFavorite: isFavorite,
        isHidden: order.is_hidden
    };
}

async function getOrderFeedOutput(userId, order) {
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

async function getOrderFeedModelOutput(orderId) {
    let order = await orderRepository.getOrderById(orderId);
    let user = await userRepository.getUserById(order.user_id);
    let photoUrls = await fileService.getOrderUrls(orderId);
    let tags = await tagRepository.getTagsByOrderId(orderId);
    let photoUrl = "";
    if (user.photo_id) {
        let photoData = await fileRepository.getFileDataById(user.photo_id);
        photoUrl = global.serverPath + photoData.download_path;
    }
    return {
        order: {
            orderId: order.id,
            title: order.title,
            description: order.description,
            counterOffer: order.counter_offer,
            isFree: order.is_free,
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

module.exports = {
    getOrderOutput: getUserOrderOutput,
    getOrderProfileOutput,
    getOrderFeedOutput,
    getOrderFeedModelOutput
}