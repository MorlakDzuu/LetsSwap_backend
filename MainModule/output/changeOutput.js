const dealRepository = require('../repository/changeRepository');
const userRepository = require('../repository/userRepository');
const orderRepository = require('../repository/orderRepository');
const fileRepository = require('../repository/fileRepository');

async function getChangeOutputArray(userId) {
    let deals = await dealRepository.getAllNewGivenDeals(userId);
    let changeOutput = [];
    for (let deal of deals) {
        let data = await getChangeOutput(deal.id);
        changeOutput.push(data);
    }
    return {offers: changeOutput};
}

async function getChangeOutput(changeId) {
    let deal = await dealRepository.getDealById(changeId);
    let user = await userRepository.getUserById(deal.user_id);
    let order = await orderRepository.getOrderById(deal.order_id);
    let imageUrl = "";
    if (user.photo_id) {
        let fileData = await fileRepository.getFileDataById(user.photo_id);
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
    getChangeOutputArray,
    getChangeOutput
}