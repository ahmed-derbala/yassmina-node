var express = require("express");
const useragent = require('express-useragent');
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
const expressEjsLayouts = require('express-ejs-layouts')
var cors = require("cors");
const bodyParser = require("body-parser");

//const auth = require('./utils/auth') //Middleware, must be after loading db
var app = express();
app.use(useragent.express());
app.disable('x-powered-by');
app.disable('etag');
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.static('public'))

// view engine setup
app.use(expressEjsLayouts)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//app.use(auth.reqSanitizer);


/**
 * display extra informations on terminal and calculate response time on production and testing envirements
 * must be before loading routes
 */
logger.token('userIp', (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress);
logger.token('userId', (req) => {
    if (req.user) { return req.user._id; }
    else if (req.userDATA) return req.userDATA._id
    else
        return '-';
});

logger.token('userEmail', (req) => {
    if (req.user) { return req.user.email; }
    else if (req.userDATA) return req.userDATA.email
    else
        return '-';
});

logger.token('browser', (req) => {
    return req.useragent.browser
});

logger.token('os', (req) => {
    return req.useragent.os
});

logger.token('platform', (req) => {
    return req.useragent.platform
});

logger.token('isBot', (req) => {
    return req.useragent.isBot
});

logger.token('referrer', (req) => {
    return req.headers.referrer || req.headers.referer
});

logger.token('body', (req) => {
    return JSON.stringify(req.body)
});
//new line
logger.token('nl', (req) => {
    return '\n'
});


if (process.env.NODE_ENV == 'development') {
    app.use(logger(`:status :method :url :nl userIp=:userIp userId=:userId userEmail=:userEmail :nl browser=:browser os=:os :nl referrer=:referrer isBot=:isBot :nl responseTime=[*:response-time*]`, { stream: log.streamDevelopment }));
} else if (process.env.NODE_ENV == 'staging') {
    app.use(logger(`:status :method :url :nl userIp=:userIp userId=:userId userEmail=:userEmail :nl browser=:browser os=:os :nl referrer=:referrer isBot=:isBot :nl responseTime=[*:response-time*]`, { stream: log.streamStaging }));
} else if (process.env.NODE_ENV == 'production') {
    app.use(logger(`:status :method :url :nl userIp=:userIp userId=:userId userEmail=:userEmail :nl browser=:browser os=:os :nl referrer=:referrer isBot=:isBot :nl responseTime=[*:response-time*]`, { stream: log.streamProduction }));
} else {
    app.use(logger(`:status :method :url :nl userIp=:userIp userId=:userId userEmail=:userEmail :nl browser=:browser os=:os :nl referrer=:referrer isBot=:isBot :nl responseTime=[*:response-time*]`, { stream: log.streamLocal }));
}

/**
 * default routes
 */
app.use(`/`, require('./routes/index'))

/**
 * documentation
 */
if (process.env.NODE_ENV != 'production' && process.env.NODE_ENV != 'staging') {
    app.use('/api/doc/jsdoc', express.static('docs/jsdocdir'))
}

/*
** start with elastic-search
** commented out since 15.04.2020 due to overloading server's CPU
*/

// 404 routes
//TO BE IMPROVED LATER
/*app.use(function(req,res){    
    return res.send('page not found')
});*/

module.exports = app;
