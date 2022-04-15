const userRepository = require("../repository/userRepository");
const orderRepository = require("../repository/orderRepository");
const orderOutput = require("../output/orderOutput");
const fileRepository = require("../repository/fileRepository");

async function getUserProfileOutput(userId, myId) {
    let user = await userRepository.getUserById(userId);
    let photoUrl = "";
    if (user.photo_id != null) {
        let photoData = await fileRepository.getFileDataById(user.photo_id);
        photoUrl = global.serverPath + photoData.download_path;
    }
    let orders = await orderRepository.getAllOrdersByUserId(userId);
    let ordersOutput = [];
    if (orders) {
        for (let i = 0; i < orders.length; i++) {
            let orderOut = await orderOutput.getOrderProfileOutput(orders[i].id, myId);
            ordersOutput.push(orderOut);
        }
    }
    return {
        personInfo: {
            profileImage: photoUrl,
            name: user.name,
            lastname: user.lastname,
            cityName: user.city,
            swapsCount: user.swaps_count,
            raiting: user.raiting
        },
        feedInfo: ordersOutput
    };
}

async function getUserProfileEditingOutput(userId) {
    let user = await userRepository.getUserById(userId);
    let photoUrl = "";
    if (user.photo_id != null) {
        let photoData = await fileRepository.getFileDataById(user.photo_id);
        photoUrl = global.serverPath + photoData.download_path;
    }
    return {
        login: user.phone_number,
        name: user.name,
        lastname: user.lastname,
        city: user.city,
        url: photoUrl
    };
}

module.exports = {
    getUserProfileOutput,
    getUserProfileEditingOutput
}