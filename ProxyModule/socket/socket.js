const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require("../repository/userRepository");
const ioClient = require('socket.io-client');
let socketClient;

function verify(socket, next) {
    let token = socket.handshake.query.token;
    jwt.verify(token, config.jwtApiAccessToken, (error, user) => {
        if (error) {
            return next(new Error('Authentication error'));
        }
        next();
    });
}

function connection(socket) {
    let token = socket.handshake.query.token;
    let userId = jwt.decode(token).id;
    socket.username = userId;
    global.connections.push(socket);

    console.log("Connected" + socket);

    socketClient.on('chat', function(data) {
        let userIdTo = data.userIdTo;
        sendNotificationData(data, userIdTo, 'GetMessage');
    });

    socket.on('SendMessage', function(data) {
        console.log("sent to spring: " + data);
        data.userId = userId;
        let stringDataInfo;
        if (data.dataInfo == null || data.dataInfo == 'null') {
            stringDataInfo = '';
        } else {
            stringDataInfo = JSON.stringify(data.dataInfo);
        }
        data.dataInfo = stringDataInfo;
        socketClient.emit('chat', data);
    });

    socket.on('disconnect', function(data) {
        global.connections.splice(connections.indexOf(socket), 1);
        console.log('Socket disconnected: ' + socket);
    });
}

function sendNotificationData(data, userId, key) {
    let socketId;
    global.connections.forEach(socket => {
        if (socket.username == userId) {
            socketId = socket.id;
        }
    });
    if (socketId) {
        io.to(socketId).emit(key, data);
    }
}

function init() {
    io.use(verify)
        .on('connection', connection);
    socketClient = ioClient("http://localhost:8081/ws", {
        reconnection: true
    });
}

module.exports = {
    init,
    sendNotificationData
};
