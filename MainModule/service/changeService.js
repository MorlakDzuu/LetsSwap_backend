const changeRepository = require("../repository/changeRepository");
const orderRepository = require("../repository/orderRepository");
const pushService = require("./pushService");
const dealRepository = require("../repository/changeRepository");
const userRepository = require("../repository/userRepository");
const fileRepository = require("../repository/fileRepository");

async function addChange(deal) {
    await changeRepository.addDeal(deal);
    let order = await orderRepository.getOrderById(deal.orderId);
    await pushService.sendPushNotification(order.userId, deal.userId, "хочет с вами махнуться");
}

async function confirmChange(dealId, userId) {
    let isItMyOrder = await changeRepository.isItUserDeal(dealId, userId);
    if (isItMyOrder) {
        await changeRepository.confirmDeal(dealId);
    }
    let changeEntity = await changeRepository.getDealById(dealId);
    let orderEntity = await  orderRepository.getOrderById(changeEntity.orderId);
    await pushService.sendPushNotification(changeEntity.userId, orderEntity.userId, "подтвердил обмен!")
}

async function getChangeOutputArray(userId) {
    let deals = await dealRepository.getAllNewGivenDeals(userId);
    let changeOutput = [];
    for (let deal of deals) {
        let data = await getChangeOutput(deal.id);
        changeOutput.push(data);
    }
    return {offers: changeOutput};
}

async function cancelChange(dealId, userId) {
    let deal = await changeRepository.getDealById(dealId);
    await changeRepository.deleteChange(dealId);
    await pushService.sendPushNotification(deal.userId, userId, "отклонил обмен");
}

async function getChangeOutput(changeId) {
    let deal = await dealRepository.getDealById(changeId);
    let user = await userRepository.getUserById(deal.userId);
    let order = await orderRepository.getOrderById(deal.orderId);
    let imageUrl = "";
    if (user.photoId) {
        let fileData = await fileRepository.getFileDataById(user.photoId);
        imageUrl = global.serverPath + fileData.download_path;
    }
    return {
        name: user.name,
        lastname: user.lastname,
        image: imageUrl,
        description: order.description,
        comment: deal.comment,
        orderId: order.id,
        userId: user.id,
        status: deal.status,
        swapId: changeId
    };
}

module.exports = {
    addChange,
    confirmChange,
    cancelChange,
    getChangeOutputArray
}