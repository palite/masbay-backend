const settings = {
    gcm : {
        id: process.env.TOKENGCM,
    },
};

const PushNotifications = require('node-pushnotifications');
const push = new PushNotifications(settings);

module.exports = {
    sendNotification: async (tokens) => {
        const data = {
            title: 'Crossplattform push is working!',
            body: 'Powered by node.js and React Native',
        };
        try {
            const results = await push.send(tokens, data);
            debug('Results for sending notifications:', results);
            return results;
        } catch (err) {
            debug('Error while sending notifications:', err);
            throw err;
        }
    },
};