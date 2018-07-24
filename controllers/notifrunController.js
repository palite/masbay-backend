var notif_controller = require('../controllers/notifController');
notif_controller.notif();
setInterval(notif_controller.notif, 300000);