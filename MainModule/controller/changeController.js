const changeRepository = require('../repository/changeRepository');
const logger = require('../service/logService');
const changeService = require('../service/changeService');
const Deal = require('../domain/Deal');
const jwt = require('jsonwebtoken');

async function addChange(req, res) {
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        let deal = new Deal(0, req.body, userId, req.body.orderId, req.body.comment, "new");
        await changeService.addChange(deal);
        res.json({message: "success"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function confirmChange(req, res) {
    try {
        let dealId = req.body.changeId;
        let userId = jwt.decode(req.headers.authorization).id;
        await changeService.confirmChange(dealId, userId);
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
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        let data = await changeService.getChangeOutputArray(userId);
        res.json(data);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "error"});
    }
}

async function cancelChange(req, res) {
    try {
        let dealId = req.body.changeId;
        let userId = jwt.decode(req.headers.authorization).id;
        await changeService.cancelChange(dealId, userId);
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