const database = require('../database/database');

async function addNewFileData(originalName, downloadPath) {
    const data = await database.db.one('INSERT INTO files (original_name, download_path) VALUES ($1, $2) RETURNING id',
        [originalName, downloadPath]);
    return data.id;
}

async function getFileDataById(id) {
    const file = await database.db.one('SELECT * FROM files WHERE id = $1', [id]);
    return file;
}

async function updateFileData(id, originalName, downloadPath) {
    await database.db.none('UPDATE files SET original_name = $1, download_path = $2 WHERE id = $3',
        [originalName, downloadPath, id]);
}

async function getFileDataByDownloadPath(downloadPath) {
    const fileData = await database.db.oneOrNone('SELECT * FROM files WHERE download_path = $1', [downloadPath]);
    return fileData;
}

async function deleteFileDataByDownloadPath(downloadPath) {
    await database.db.oneOrNone('DELETE FROM files WHERE download_path = $1', [downloadPath]);
}

module.exports = {
    addNewFileData,
    getFileDataById,
    updateFileData,
    getFileDataByDownloadPath,
    deleteFileDataByDownloadPath
}