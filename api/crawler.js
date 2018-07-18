exports.crawl = function (callback) {
    var request = require("request");
    var options = {
        method: 'GET',
        url: process.env.CRAWLER,
        headers: 
        { 'Cache-Control': 'no-cache' }
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        var cekmutasi = JSON.stringify(body);
        var errcrawler = cekmutasi.search("Kesalahan");
        if (errcrawler == 1) { //kesalahan crawler
            return callback('Kesalahan');
        } else {
            return callback(cekmutasi);
        }
    })
}