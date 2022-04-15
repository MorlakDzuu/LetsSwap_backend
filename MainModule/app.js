const express = require('express');
const bodyParser = require('body-parser');

let app = require('express')();
let http = require('http').Server(app);

const port = 3000;

global.serverPath = "http://178.154.210.140:3000";
global.connections = [];

app.use(bodyParser.json());
app.use(express.static('./public'));

require('./controller/changeController')(app);
require('./controller/userController')(app);
require('./controller/fileController')(app);
require('./controller/orderController')(app);

http.listen(port, function() {
    console.log('Skill change started on port ' + port);
});

