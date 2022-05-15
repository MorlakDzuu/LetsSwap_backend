const userRepository = require('../repository/userRepository');
const userService = require('../service/userService');

const logger = require('../service/logService');
const jwt = require('jsonwebtoken');
const User = require('../domain/User');

async function updateUser(req, res) {
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        let user = new User(0, req.body.name, req.body.lastname, req.body.city,
            null, null, null, null);
        await userService.updateUser(userId, user, req.body.url);
    } catch (e) {
        logger.log(e);
        res.status(500);
        res.json({message: "error"});
        return;
    }
    res.json({message: "success"});
}

async function getUser(req, res) {
    try {
        let userId = req.query.id;
        let myId = jwt.decode(req.headers.authorization).id;
        if (userId == null) {
            userId = myId;
        }
        let dto = await userService.getUserDto(userId, myId);
        res.json(dto);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't give info by this id"});
    }
}

async function getUserEditing(req, res) {
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        let profileDto = await userService.getUserProfileEditingDto(userId);
        res.json(profileDto);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't give info"});
    }

}

async function getUserOrders(req, res) {
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        let ordersDto = await userService.getUserOrdersDto(userId);
        res.json(ordersDto);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: err.message});
    }
}

async function setUserDeviceToken(req, res) {
    try {
        let token = req.body.token;
        let userId = jwt.decode(req.headers.authorization).id;
        let result = await userService.setUserDeviceToken(userId, token);
        if (!result) {
            res.json({message: "token already exists"});
        }
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: err.message});
        return;
    }
    res.json({message: "success"});
}

async function removeDeviceToken(req, res) {
    let token = req.body.token;
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        await userRepository.deleteDeviceToken(userId, token);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: err.message});
    }
    res.json({message: "success"});
}

module.exports = function (app) {
    app.post('/security/user/update', updateUser);
    app.get('/security/user/getProfile', getUser);
    app.get('/security/user/getProfileEditing', getUserEditing);
    app.get('/security/user/getOrders', getUserOrders);
    app.post('/security/user/setToken', setUserDeviceToken);
    app.post('/security/user/removeToken', removeDeviceToken);
};