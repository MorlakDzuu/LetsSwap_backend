const changeRepository = require('../repository/changeRepository');
const orderRepository = require('../repository/orderRepository');
const changeOutput = require('../output/changeOutput');
const logger = require('../service/logService');
const pushService = require('../service/pushService');
const jwt = require('jsonwebtoken');

async function addChange(req, res) {
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        let changeId = await changeRepository.addDeal(req.body, userId);
        let order = await orderRepository.getOrderById(req.body.orderId);
        let data = await changeOutput.getChangeOutput(changeId);
        await pushService.sendPushNotification(order.user_id, userId, "хочет с вами махнуться");
        await socket.sendNotificationData("serverNotifications", data, order.user_id);
        res.json({message: "success"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function confirmChange(req, res) {
    let dealId = req.body.changeId;
    let userId = jwt.decode(req.headers.authorization).id;
    try {
        let isItMyOrder = await changeRepository.isItUserDeal(dealId, userId);
        if (isItMyOrder) {
            await changeRepository.confirmDeal(dealId);
        }
        let changeEntity = await changeRepository.getDealById(dealId);
        let orderEntity = await  orderRepository.getOrderById(changeEntity.order_id);
        console.log(changeEntity.user_id);
        console.log(orderEntity.user_id);
        await pushService.sendPushNotification(changeEntity.user_id, orderEntity.user_id, "подтвердил обмен!")
        res.json({changeStatus: "confirmed"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({error: "error"});
    }
}

async function canAddChange(req, res) {
    let orderId = req.params.orderId;
    try {
        let canMakeChange = await changeRepository.canMakeChange(orderId);
        res.json({result: canMakeChange});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({error: "error"});
    }
}

async function getNotifications(req, res) {
    let id = jwt.decode(req.headers.authorization).id;
    try {
        let data = await changeOutput.getChangeOutputArray(id);
        res.json(data);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function cancelChange(req, res) {
    let dealId = req.body.changeId;
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        let changeInfo = await changeRepository.getDealById(dealId);
        await changeRepository.deleteChange(dealId);
        await pushService.sendPushNotification(changeInfo.user_id, userId, "отклонил обмен");
        socket.sendNotificationData({
            message: "swap canceled"
        }, changeInfo.user_id, 'swapCancel');
        res.json({message: "success"});
    } catch (error) {
        logger.log(error);
        res.status(500);
        res.json({message: "error"});
    }
}

module.exports = function (app) {
    app.post('/security/change/addChange', addChange);
    app.post('/security/change/confirm', confirmChange);
    app.get('/security/change/getNotifications', getNotifications);
    app.get('/security/change/canMakeChange/:orderId', canAddChange);
    app.post('/security/change/cancel', cancelChange);
}