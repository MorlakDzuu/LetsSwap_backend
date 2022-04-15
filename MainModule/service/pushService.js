const userRepository = require('../repository/userRepository');

const apn = require('apn');

async function sendPushNotification(userId, userIdFrom, text) {
    try {
        let options = {
            token: {
                key: "/home/morlak/mainNode/SkillChange/AuthKey_Z9TWC759UK.p8",
                keyId: "Z9TWC759UK",
                teamId: "FUD5CPHJR9"
            },
            production: false
        };

        let apnProvider = new apn.Provider(options);
        let deviceTokens = await userRepository.getAllDeviceTokensByUserId(userId);
        let userFrom = await userRepository.getUserById(userIdFrom);
        let userName = userFrom.name + ' ' + userFrom.lastname;
        let note = new apn.Notification();
        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 3;
        note.sound = "ping.aiff";
        note.alert = userName + ' ' + text;
        note.payload = {'messageFrom': userName};
        note.topic = "su.brf.apps.mahnemsya";

        for (let i = 0; i < deviceTokens.length; i++) {
            apnProvider.send(note, deviceTokens[i]).then( (result) => {});
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    sendPushNotification
};