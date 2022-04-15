const userRepository = require('../repository/userRepository');
const orderRepository = require('../repository/orderRepository');
const fileRepository = require('../repository/fileRepository');
const fileService = require('../service/fileService');
const pushService = require('../service/pushService');
const outputOrder = require('../output/orderOutput');
const userProfileOutput = require('../output/userProfileOutput');

const logger = require('../service/logService');
const authenticator = require('../controller/security/authenticator');
const jwt = require('jsonwebtoken');
const {user} = require("../database/database.properties");


async function updateUser(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    let user = await userRepository.getUserById(userId);

    try {
        if (user.name != req.body.name) {
            await userRepository.updateUserName(userId, req.body.name);
        }
        if (user.lastname != req.body.lastname) {
            await userRepository.updateUserLastname(userId, req.body.lastname);
        }
        if (user.city != req.body.city) {
            await userRepository.updateUserCity(userId, req.body.city);
        }
        if (user.photo_id) {
            let oldFileData = await fileRepository.getFileDataById(user.photo_id);
            let photoDownloadPath = req.body.url.replace(global.serverPath, "");
            if (oldFileData.download_path != photoDownloadPath) {
                await fileService.addPhotoToUser(req.body.url, userId);
            }
        } else {
            if (req.body.url) {
                await fileService.addPhotoToUser(req.body.url, userId);
            }
        }
    } catch (e) {
        logger.log(e);
        res.status(500);
        res.json({message: "error"});
        return;
    }
    res.json({message: "success"});
}

async function getUser(req, res) {
    let userId = req.query.id;
    let myId = jwt.decode(req.headers.authorization).id;
    if (userId == null) {
        userId = myId;
    }
    try {
        let output = await userProfileOutput.getUserProfileOutput(userId, myId);
        res.json(output);
        return;
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't give info by this id"});
    }
}

async function getUserEditing(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    try {
        let profile = await userProfileOutput.getUserProfileEditingOutput(userId);
        res.json(profile);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't give info"});
    }

}

async function getUserOrders(req, res) {
    let userId = jwt.decode(req.headers.authorization).id;
    try {
        let orders = await orderRepository.getAllOrdersByUserId(userId);
        let jsonOrders = [];
        if (orders) {
            for (let i = 0; i < orders.length; i++) {
                let orderOutput = await outputOrder.getOrderOutput(orders[i].id);
                jsonOrders.push(orderOutput);
            }
        }
        res.json({orders: jsonOrders});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: err.message});
    }
}

async function setUserDeviceToken(req, res) {
    let token = req.body.token;
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        console.log(userId);
        console.log(token);
        let isDeviceTokenAlreadyExists = await  userRepository.isDeviceTokenExists(userId, token);
        if (isDeviceTokenAlreadyExists) {
            res.json({message: "token already exists"});
            return;
        }
        await userRepository.setDeviceToken(userId, token);
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: err.message});
        return;
    }
    res.json({message: "success"});
}

async function sendPushNotification(req, res) {
    try {
        let userId = jwt.decode(req.headers.authorization).id;
        await pushService.sendPushNotification(userId, 3,"test message");
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: err.message});
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
    //app.use('/user', authenticator.apiAuthenticateJWT);
    app.post('/security/user/update', updateUser);
    app.get('/security/user/getProfile', getUser);
    app.get('/security/user/getProfileEditing', getUserEditing);
    app.get('/security/user/getOrders', getUserOrders);
    app.get('/security/user/sendPush', sendPushNotification);
    app.post('/security/user/setToken', setUserDeviceToken);
    app.post('/security/user/removeToken', removeDeviceToken);
};