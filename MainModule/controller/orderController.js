const tagRepository = require('../repository/tagRepository');
const orderService = require('../service/orderService');

const logger = require('../service/logService');
const jwt = require('jsonwebtoken');
const Order = require("../domain/Order");

async function addOrder(req, res) {
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        let order = new Order(0, userId, req.body.title, req.body.description, req.body.counterOffer,
            req.body.isFree, false, null, null);
        await orderService.addOrder(order, req.body.tags, req.body.urls);
        res.json({message: 'success'});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't save order data"});
    }
}

async function getOrder(req, res) {
    try {
        let orderId = req.params.orderId;
        let orderDto = await orderService.getOrderDto(orderId);
        res.json(orderDto);
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
    try {
        let orderId = req.params.orderId;
        let newState = await orderService.changeOrderHiddenParam(orderId);
        res.json({newState: newState});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't change"});
    }
}

async function deleteOrder(req, res) {
    try {
        let orderId = req.params.orderId;
        await orderService.deleteOrder(orderId);
        res.json({message: "success"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't delete"});
    }
}

async function updateOrder(req, res) {
    try {
        let order = new Order(req.params.orderId, null, req.body.title, req.body.description, req.body.counterOffer,
            req.body.isFree, null, null, null);
        await orderService.updateOrder(order);
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
        let ordersFeedDto = await orderService.getOrdersFeedDto(userId);
        res.json(ordersFeedDto);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function getOrderFeed(req, res) {
    try {
        let orderId = req.params.orderId;
        let orderFeedModelDto = await orderService.getOrderFeedModelDto(orderId);
        res.json(orderFeedModelDto);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function addFavorite(req, res) {
    try {
        let orderId = req.params.orderId;
        let userId = jwt.decode(req.headers.authorization).id;
        let result = await orderService.makeOrderFavorite(orderId, userId);
        if (result) {
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
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        let orderId = req.params.orderId;
        await orderService.makeOrderNotFavorite(orderId, userId);
        res.json({message: "success"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function getUserFavorite(req, res) {
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        let dto = await orderService.getUserFavoriteOrders(userId);
        res.json(dto);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function search(req, res) {
    try {
        let tags = req.body.tags;
        let city = req.body.city;
        let searchString = req.body.searchString;
        let userId = jwt.decode(req.headers.authorization).id;
        let dto = await orderService.getOrdersSearchDto(userId, searchString, tags, city);
        res.json(dto);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

module.exports = function (app) {
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