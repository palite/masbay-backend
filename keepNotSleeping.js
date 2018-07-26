function keepNotSleeping() {
    var request = require("request");
    var options = {
        method: 'GET',
        url: 'https://intense-inlet-67504.herokuapp.com/faq',
        headers: 
        { 'Cache-Control': 'no-cache' }
    };
    request(options, function (error, response, body) {
        console.log(body);
    })
}
function stop() {
    //date = new Date();
    //console.log(date);
    process.exit();
}

keepNotSleeping();
setInterval(stop, 10000);