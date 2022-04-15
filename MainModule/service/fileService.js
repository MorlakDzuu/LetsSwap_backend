const fileRepository = require('../repository/fileRepository');
const orderRepository = require('../repository/orderRepository');
const userRepository = require('../repository/userRepository');

const fs = require('fs');

async function addPhotoToOrder(url, orderId) {
    let download_path = url.replace(global.serverPath, "");
    let fileData = await fileRepository.getFileDataByDownloadPath(download_path);
    let photoIds = await orderRepository.getPhotoIdsByOrderId(orderId);
    if (photoIds) {
        for (let i = 0; i < photoIds.length; i++) {
            if (photoIds[i] == fileData.id) {
                return;
            }
        }
    }
    await orderRepository.addPhotoToOrder(orderId, fileData.id);
}

async function addPhotoToUser(url, userId) {
    let download_path = url.replace(global.serverPath, "");
    let user = await userRepository.getUserById(userId);
    if (user.photo_id) {
        let oldFileData = await fileRepository.getFileDataById(user.photo_id);
        let filePath = __dirname.replace("service", "uploads/")
            + oldFileData.download_path.replace("/image/", "");
        fs.unlink(filePath, function (err) {
            if (err) {
                throw err;
            }
        });
    }
    let newFileData = await fileRepository.getFileDataByDownloadPath(download_path);
    await userRepository.updateUserPhotoId(userId, newFileData.id);
}

async function getOrderUrls(orderId) {
    let order = await orderRepository.getOrderById(orderId);
    let photoIds = order.photo_data;
    let photoUrls = [];
    if (photoIds) {
        for (let i = 0; i < photoIds.length; i++) {
            let fileData = await fileRepository.getFileDataById(photoIds[i]);
            photoUrls.push(global.serverPath + fileData.download_path);
        }
    }
    return photoUrls;
}

async function deletePhoto(url) {
    let filePath = __dirname.replace("service", "uploads/")
        + url.replace(global.serverPath + "/image/", "");
    let downloadPath = url.replace(global.serverPath, "");
    await fileRepository.deleteFileDataByDownloadPath(downloadPath);
    filePath = filePath.replace("/image/", "");
    fs.unlink(filePath, function (err) {
        if (err) {
            throw err;
        }
    });
}

async function updateOrderPhotos(orderId, photoUrls) {
    let oldUrls = await getOrderUrls(orderId);
    let photoUrlsSet = new Set(photoUrls);
    for (const item of oldUrls) {
        if (!photoUrlsSet.has(item)) {
            await deletePhoto(item);
        } else {
            photoUrlsSet.delete(item);
        }
    }
    for (const item of photoUrlsSet) {
        await addPhotoToOrder(item, orderId);
    }
    let photoIds = [];
    for (const url of photoUrls) {
        let downloadPath = url.replace(global.serverPath, "");
        let fileData = await fileRepository.getFileDataByDownloadPath(downloadPath);
        photoIds.push(fileData.id);
    }
    await orderRepository.updateOrderPhotos(orderId, photoIds);
}

async function getUserPhotoUrl(userId) {
    let user = await userRepository.getUserById(userId);
    if (user.photo_id == null) {
        return "";
    }
    let fileData = await fileRepository.getFileDataById(user.photo_id);
    let url = global.serverPath + fileData.download_path;
    return url;
}

module.exports = {
    addPhotoToOrder,
    addPhotoToUser,
    getOrderUrls,
    deletePhoto,
    updateOrderPhotos,
    getUserPhotoUrl
}