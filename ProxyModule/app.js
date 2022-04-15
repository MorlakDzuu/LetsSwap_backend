const express = require("express");
const app = express();
const authenticator = require('./security/authenticator');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
let http = require('http').Server(app);

global.io = require("socket.io")(http);

global.connections = [];
let proxy = require('express-http-proxy');

app.use(bodyParser.json());
app.use(express.static('./public'));

const port = 3030;

require('./security/authController')(app);
app.use('/security', authenticator.apiAuthenticateJWT);
app.use('/chatModule', authenticator.apiAuthenticateJWT);

app.use('/chatModule', proxy('localhost:8080',
    {proxyReqPathResolver: function(req) {
            let userId = jwt.decode(req.headers.authorization).id;
            let updatePath = req.url + '/' + userId;
            return updatePath;
        }}));

app.use('/', proxy('localhost:3000'));

http.listen(port, function() {
    console.log('Skill change started on port ' + port);
});

require('./socket/socket').init();