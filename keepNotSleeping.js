function keepNotSleeping() {
    var request = require("request");
    var options = {
        method: 'GET',
        url: 'https://intense-inlet-67504.herokuapp.com/',
        headers: 
        { 'Cache-Control': 'no-cache' }
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
    })
}
keepNotSleeping();
setInterval(keepNotSleeping, 60000);