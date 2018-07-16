const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const bodyParser = require('body-parser'); 
const app = express();
const session = require('express-session');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({secret: 'avidlinda'}));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static('public'));
app.use('/', routes);

module.exports = app;
