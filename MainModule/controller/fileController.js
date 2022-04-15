const { v4: uuidv4 } = require('uuid');

const fileRepository = require('../repository/fileRepository');
const logger = require('../service/logService');


const multer = require('multer');
const upload = multer({dest:"uploads"});
const jwt = require('jsonwebtoken');
const fs = require('fs');

async function getPhoto(req, res) {
    try {
        let path = __dirname.replace("controller", "uploads/") + req.params.fileName;
        let fileData = await fileRepository.getFileDataByDownloadPath('/image/' + req.params.fileName);
        let originalFileName = fileData.original_name.toString();

        res.download(path, originalFileName);

    } catch (e) {
        res.status(404);
        res.json({message: "server doesn't have this file"});
    }
}

async function addPhoto(req, res) {
    let fileData = req.file;
    if(fileData == null) {
        res.status(500);
        res.json({message: "Exception while working with file"});
        return;
    }
    try {
        let download_path = "/image/" + fileData.filename;
        let photoId = await fileRepository.addNewFileData(fileData.originalname, download_path);
        let resString = global.serverPath + download_path;
        res.json({url: resString});
    } catch(err) {
        logger.log(err);
        res.status(500);
        res.json({message: "Can't save this photo"});
    }
}

async function addFile(req, res) {
    let fileData = req.file;
    console.log(req);
    if(fileData == null) {
        logger.log("FileData == null");
        res.status(500);
        res.json({message: "Exception while working with file"});
        return;
    }
    try {
        console.log(fileData.originalname);
        let download_path = "/image/" + fileData.filename;
        let photoId = await fileRepository.addNewFileData(fileData.originalname, download_path);
        let resJson = {
            id: photoId,
            name: fileData.originalname,
            path: download_path,
            type: fileData.originalname.split('.').reverse()[0]
        };

        let filePath = __dirname.replace("controller", "uploads/") + fileData.filename;
        fs.stat(filePath, (err, stats) => {
            if (err) {
                throw err;
            }
            //resJson.size = stats.size;
        });
        res.json(resJson);
    } catch(err) {
        logger.log(err);
        res.status(500);
        res.json({message: "Can't save this photo"});
    }
}

async function deletePhoto(req, res) {
    let filePath = __dirname.replace("controller", "uploads/") + req.params.fileName;
    try {
        fs.unlink(filePath, function (err) {
            if (err) {
                throw err;
            }
        });
        res.json({message: "success"});
    } catch (err) {
        logger.log(err);
        res.status(500);
        res.json({message: "can't delete this file"});
    }
}

async function getMetaData(req, res) {
    let fileName = "f224065730c3fafd8b9082ab180b02d2";
    let filePath = __dirname.replace("controller", "uploads/") + fileName;
    fs.stat(filePath, (err, stats) => {
        if (err) {
            throw err;
        }
        console.log(stats);
    });
}

module.exports = function(app) {
    app.get('/file/test', getMetaData);
    app.get('/image/:fileName', getPhoto);
    app.get('/image/delete/:fileName', deletePhoto);
    app.post('/image/upload', upload.single("fileData"), addPhoto);
    app.post('/image/uploadBinary', upload.single("dataFile"), addFile);
}