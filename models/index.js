//MODEL require all models file
var normalizedPath = require("path").join(__dirname);
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./" + file);
})
