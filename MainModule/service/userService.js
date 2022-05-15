const userRepository = require("../repository/userRepository");
const fileRepository = require("../repository/fileRepository");
const fileService = require("./fileService");
const orderRepository = require("../repository/orderRepository");
const orderService = require("../service/orderService");

async function updateUser(userId, user, url) {
    let userEntity = await userRepository.getUserById(userId);
    if (userEntity.name != user.name) {
        await userRepository.updateUserName(userId, user.name);
    }
    if (userEntity.lastname != user.lastname) {
        await userRepository.updateUserLastname(userId, user.lastname);
    }
    if (userEntity.city != user.city) {
        await userRepository.updateUserCity(userId, user.city);
    }
    if (userEntity.photoId) {
        let oldFileData = await fileRepository.getFileDataById(user.photo_id);
        let photoDownloadPath = url.replace(global.serverPath, "");
        if (oldFileData.download_path != photoDownloadPath) {
            await fileService.addPhotoToUser(url, userId);
        }
    } else {
        if (url) {
            await fileService.addPhotoToUser(url, userId);
        }
    }
}

async function getUserDto(userId, myId) {
    let profileDto = await getUserProfileOutput(userId, myId);
    return profileDto;
}

async function getUserProfileEditingDto(userId) {
    let user = await userRepository.getUserById(userId);
    let photoUrl = "";
    if (user.photoId != null) {
        let photoData = await fileRepository.getFileDataById(user.photoId);
        photoUrl = global.serverPath + photoData.download_path;
    }
    return {
        login: user.phoneNumber,
        name: user.name,
        lastname: user.lastname,
        city: user.city,
        url: photoUrl
    };
}

async function getUserOrdersDto(userId) {
    let orders = await orderRepository.getAllOrdersByUserId(userId);
    let jsonOrders = [];
    if (orders) {
        for (let i = 0; i < orders.length; i++) {
            let orderOutput = await orderService.getOrderDto(orders[i].id);
            jsonOrders.push(orderOutput);
        }
    }
    return {orders: jsonOrders};
}

async function setUserDeviceToken(userId, token) {
    let isDeviceTokenAlreadyExists = await  userRepository.isDeviceTokenExists(userId, token);
    if (isDeviceTokenAlreadyExists) {
        return false;
    }
    await userRepository.setDeviceToken(userId, token);
    return true;
}

async function getUserProfileOutput(userId, myId) {
    let user = await userRepository.getUserById(userId);
    let photoUrl = "";
    if (user.photoId != null) {
        let photoData = await fileRepository.getFileDataById(user.photoId);
        photoUrl = global.serverPath + photoData.download_path;
    }
    let orders = await orderRepository.getAllOrdersByUserId(userId);
    let ordersOutput = [];
    if (orders) {
        for (let i = 0; i < orders.length; i++) {
            let orderOut = await orderService.getOrderProfileDto(orders[i].id, myId);
            ordersOutput.push(orderOut);
        }
    }
    return {
        personInfo: {
            profileImage: photoUrl,
            name: user.name,
            lastname: user.lastname,
            cityName: user.city,
            swapsCount: user.swapsCount,
            rating: user.rating
        },
        feedInfo: ordersOutput
    };
}

module.exports = {
    updateUser,
    getUserDto,
    getUserProfileEditingDto,
    getUserOrdersDto,
    setUserDeviceToken
}