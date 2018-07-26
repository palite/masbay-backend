// writefile.js

const fs = require('fs');
var rand = Math.floor((Math.random()*8999)+1000);


// write to a new file named 2pac.txt
fs.writeFile('kocing.txt', rand, (err) => {  
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('kocing!');
});