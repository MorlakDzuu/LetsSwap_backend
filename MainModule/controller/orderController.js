const orderRepository = require('../repository/orderRepository');
const tagRepository = require('../repository/tagRepository');
const favoriteRepository = require('../repository/favoriteRepository');
const userRepository = require('../repository/userRepository');

const fileService = require('../service/fileService');
const orderOutput = require('../output/orderOutput');

const logger = require('../service/logService');
const authenticator = require('../controller/security/authenticator');
const jwt = require('jsonwebtoken');
const fileRepository = require("../repository/fileRepository");

async function addOrder(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    try {
        let orderId = await orderRepository.addOrder(userId, req.body);
        let tags = req.body.tags;
        for (let i = 0; i < tags.length; i++) {
            let tagData = await tagRepository.getTagByName(tags[i]);
            await tagRepository.addTagToOrder(orderId, tagData.id);
        }
        let photoUrls = req.body.urls;
        if (photoUrls) {
            for(let i = 0; i < photoUrls.length; i++) {
                await fileService.addPhotoToOrder(photoUrls[i], orderId);
            }
        }
        res.json({message: 'success'});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't save order data"});
    }
}

async function getOrder(req, res) {
    let orderId = req.params.orderId;
    let order;
    try {
        order = await orderRepository.getOrderById(orderId);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't find this order"});
        return;
    }
    try {
        let photoUrls = await fileService.getOrderUrls(orderId);
        let tags = await tagRepository.getTagsByOrderId(orderId);
        res.json({
            orderId: order.id,
            title: order.title,
            description: order.description,
            counterOffer: order.counter_offer,
            isFree: order.is_free,
            tags: tags,
            photoAttachments: photoUrls,
            isHidden: order.is_hidden
        });
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: err.message});
    }
}

async function addTag(req, res) {
    try {
        await tagRepository.addTag(req.body.tag);
        res.json({message: "success"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't add this tag"});
    }
}

async function changeHidden(req, res) {
    let orderId = req.params.orderId;
    try {
        let isHidden = await orderRepository.isOrderHidden(orderId);
        if (isHidden) {
            await orderRepository.setIsHidden(orderId, false);
        } else {
            await orderRepository.setIsHidden(orderId, true);
        }
        res.json({newState: !isHidden});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't change"});
    }
}

async function deleteOrder(req, res) {
    let orderId = req.params.orderId;
    try {
        let photoUrls = await fileService.getOrderUrls(orderId);
        if (photoUrls) {
            for (let i = 0; i < photoUrls.length; i++) {
                await fileService.deletePhoto(photoUrls[i]);
                console.log('deleted file ' + photoUrls[i]);
            }
        }
        await tagRepository.deleteTagToOrderByOrderId(orderId);
        await orderRepository.deleteOrder(orderId);
        res.json({message: "success"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't delete"});
    }
}

async function updateOrder(req, res) {
    try {
        let orderId = req.params.orderId;
        await orderRepository.updateOrder(orderId, req.body);
        await tagRepository.updateOrderTags(orderId, req.body.tags);
        await fileService.updateOrderPhotos(orderId, req.body.urls);
        res.json({message: "success"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't update order"});
    }
}

async function getOrdersFeed(req, res) {
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        let user = await userRepository.getUserById(userId);
        let orders = await orderRepository.getAllOrdersForUser(userId, user.city);
        let ordersFeed = [];
        for (let item of orders) {
            let order = await orderOutput.getOrderFeedOutput(userId, item);
            ordersFeed.push(order);
        }
        res.json({
            items: ordersFeed,
            city: user.city,
            nextFrom: ""
        });
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function getOrderFeed(req, res) {
    let orderId = req.params.orderId;
    try {
        let orderInfo = await orderOutput.getOrderFeedModelOutput(orderId);
        res.json(orderInfo);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function addFavorite(req, res) {
    let orderId = req.params.orderId;
    let userId = jwt.decode(req.headers.authorization).id;
    try {
        let order = await orderRepository.getOrderById(orderId);
        if (order.user_id != userId) {
            await favoriteRepository.addFavorite(userId, orderId);
            res.json({message: "success"});
        } else {
            res.status(500);
            res.json({message: "user can't make favorite own order"});
        }
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function deleteFavorite(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    let orderId = req.params.orderId;
    try {
        await favoriteRepository.deleteFavoriteOrder(userId, orderId);
        res.json({message: "success"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function getUserFavorite(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    try {
        let orders = await favoriteRepository.getFavoriteOrdersByUserId(userId);
        let ordersOutput = [];
        for (let order of orders) {
            let ordOutput = await orderOutput.getOrderFeedOutput(userId, order);
            ordersOutput.push(ordOutput);
        }
        res.json({
            items: ordersOutput,
            nextFrom: ""
        });
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function search(req, res) {
    let tags = req.body.tags;
    let city = req.body.city;
    let searchString = req.body.searchString;
    let userId = jwt.decode(req.headers.authorization).id;
    try {
        let orders = await orderRepository.getOrdersBySearchStringAndTags(searchString, tags, city, userId);
        let ordersOutput = [];
        for (let order of orders) {
            let ordOutput = await orderOutput.getOrderFeedOutput(userId, order);
            ordersOutput.push(ordOutput);
        }
        res.json({
            items: ordersOutput,
            nextFrom: ""
        });
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

module.exports = function (app) {
    //app.use('/order', authenticator.apiAuthenticateJWT);
    app.post('/security/order/makeNew', addOrder);
    app.post('/security/order/addTag', addTag);
    app.get('/security/order/:orderId', getOrder);
    app.get('/security/order/changeHidden/:orderId', changeHidden);
    app.get('/security/order/delete/:orderId', deleteOrder);
    app.post('/security/order/update/:orderId', updateOrder);
    app.get('/security/order/feed/getFeed', getOrdersFeed);
    app.get('/security/order/feed/getOrderFeed/:orderId', getOrderFeed);
    app.get('/security/order/favorite/addFavorite/:orderId', addFavorite);
    app.get('/security/order/favorite/getFavorite', getUserFavorite);
    app.get('/security/order/favorite/deleteFavorite/:orderId', deleteFavorite);
    app.post('/security/order/search', search);
};