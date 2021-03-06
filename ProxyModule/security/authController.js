const userRepository = require('../repository/userRepository');
const smsService = require('../service/smsService');
const validService = require('../service/validService');

const jwt = require('jsonwebtoken');
const config = require('../config');

async function register(req, res) {
    if (!validService.isValidPhoneNumber(req.body.login)) {
        res.status(406);
        res.json({error: 'phone number incorrect'});
        return;
    }
    let user = await userRepository.getUserByLogin(req.body.login);
    if (user != null) {
        res.status(406);
        res.json({error: 'this phone number exists'})
        return;
    }
    if (await userRepository.smsCodeVerify(req.body.smsCode, req.body.login)) {
        let id = 0;
        try {
            id = await userRepository.register(req.body);
        } catch (err) {
            console.log(err);
        }
        if (id > 0) {
            const token = jwt.sign({id: id}, config.jwtApiAccessToken);
            res.json({token: token});
            return;
        } else {
            res.status(500);
            res.json({error: 'register failed'});
            return;
        }
    }
    res.status(500);
    res.json({error: 'sms code expired or incorrect'});
}

async function login(req, res) {
    if (!validService.isValidPhoneNumber(req.body.login)) {
        res.status(406);
        res.json({error: 'phone number incorrect'});
        return;
    }
    if (await userRepository.smsCodeVerify(req.body.smsCode, req.body.login)) {
        let id = 0;
        try {
            id = (await userRepository.getUserByLogin(req.body.login)).id;
        } catch (err) {
            console.log(err);
        }
        if (id > 0) {
            const token = jwt.sign({id: id}, config.jwtApiAccessToken);
            res.json({token: token});
            return;
        } else {
            res.status(500);
            res.json({error: 'auth failed'});
            return;
        }
    }
    res.status(500);
    res.json({error: 'sms code expired or incorrect'});
}

async function smsSend(req, res) {
    //const code = generateCode();
    const code = "000000";
    try {
        await userRepository.saveSmsCode(code, req.body.login);
        //await smsService.sendSms(req.body.login, code);
        res.json({message: 'success'});
    } catch (e) {
        console.log(e);
        res.status(500);
        res.json({message: 'error'});
    }
}

function generateCode() {
    const low = 0;
    const high = 9;
    let code = "";
    for (let i = 0; i < 6; i++) {
        code = code + Math.round(Math.random() * (high - low) + low);
    }
    return code;
}

async function changeNumber(req, res) {

}

module.exports = function (app) {
    app.post('/register', register);
    app.post('/login', login);
    app.post('/smsSend', smsSend);
};