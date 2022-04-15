const express = require('express');
const bodyParser = require('body-parser');

let app = require('express')();
let http = require('http').Server(app);
//global.io = require('socket.io')(http);

const port = 3000;

global.serverPath = "http://92.63.105.87:3000";
global.connections = [];

app.use(bodyParser.json());
app.use(express.static('./public'));

//require('./controller/security/authController')(app);
require('./controller/changeController')(app);
require('./controller/userController')(app);
require('./controller/fileController')(app);
require('./controller/orderController')(app);
//require('./controller/chatController')(app);

http.listen(port, function() {
    console.log('Skill change started on port ' + port);
});

//require('./socket/socket').init();