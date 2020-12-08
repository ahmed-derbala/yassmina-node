
const appRootPath = require('app-root-path');
const jwt = require('jsonwebtoken');
const privateKey = "privatekey"
const deleteFromJson = require(`${appRootPath}/tools/objects`).deleteFromJson
//const invalidTokenLoginAttempt = require(`${appRootPath}/nremails/user_nremails`).invalidTokenLoginAttempt
const roles = require(`${appRootPath}/utils/clearance`).roles
const mongoose = require('mongoose');
const { errorHandler } = require('./error');
const User = mongoose.model('User');
const Account = mongoose.model('Account');


/**
 * make sure request data is valid 
 */
exports.reqSanitizer = (req, res, next) => {
    // GET requests doesnt have body, so we dont check them
    if (req.method == 'GET') {
        return next()
    }
    // make sure these attributes are not sent on the body
    // req.body = deleteFromJson(req.body, ['__v', 'createdAt', 'creationDate', 'updatedAt'])
    return next()
}

/**
 * a middleware to verify token and check if the user is able to access that route, this store the user infos in req.user and account in req.user.AccountId
 * @param {Boolean} tokenIsRequired specify if the token is required to grant access (optional, default true)
 * @param {Boolean} refreshUser specify if req.user needs to be equivalent to the data in db (optional, default true)
 * @param {Boolean} saveToUserDATA specify if the conencted user object should be saved to req.userDATA like the old way of validUser mw (optional, default false)
 */
exports.tokenAuth = (tokenIsRequired, refreshUser, saveToUserDATA) => {
    return function (req, res, next) {
        //we check headers and cookies for token
        if (req.headers.token == null) {
            if (req.cookies.token != null)
                req.headers.token = req.cookies.token

            else if (req.headers['x-access-token'] != null)
                req.headers.token = req.headers['x-access-token']

            else if (req.headers['authorization'] != null)
                req.headers.token = req.headers['authorization']
        }
        // if we still have no token
        if (req.headers.token == null && (tokenIsRequired == null || tokenIsRequired == true)) {
            log().verbose({ message: `[no_token]`, route: req.originalUrl, ip: req.ip, userAgent: req.headers["user-agent"] })
            if (process.env.NODE_ENV == 'production')
                return res.status(401).send('token error')
            return res.status(401).send('[no_token_on_headers_or_cookies]');
        }
        if (req.headers.token == null && tokenIsRequired == false) {
            return next()
        }
        req.headers.token = req.headers.token.replace('Bearer ', '')

        // a token was found, now we verify it
        return jwt.verify(req.headers.token, privateKey, function (err, decoded) {
            if (err) {
                log().warn({ message: err, route: req.originalUrl, ip: req.ip, userAgent: req.headers["user-agent"], token: req.headers.token });
                //clear cookies
                for (var prop in req.cookies) {
                    if (!req.cookies.hasOwnProperty(prop)) {
                        continue;
                    }
                    res.cookie(prop, '', { expires: new Date(0) });
                }
                if (process.env.NODE_ENV == 'production')
                    return res.status(401).send('token error')
                return res.status(401).send(err)
            }

            // the token was decoded and we have a user object on the token
            if (decoded.user != null) {
                req.user = decoded.user
            } else {
                req.user = {}
                req.user = decoded
            }
            // checking sessions and user
            return User.findOne({ _id: req.user._id })
                .select('-cryptDPASS -hash -salt -passLength')
                .then(async user => {
                    if (user == null) {
                        log().verbose({ message: `user._id=${req.user._id} was destroyed or never existed on the db` })
                        if (process.env.NODE_ENV == 'production')
                            return res.status(401).send('token error')
                        return res.status(401).send(`user._id=${req.user._id} was destroyed or never existed on the db`)
                    }

                    if (user.active == false) {
                        log().verbose({ message: `${user.email} is not active` })
                        if (process.env.NODE_ENV == 'production')
                            return res.status(401).send('token error')
                        return res.status(401).send(`${user.email} is not active`)
                    }

                    if (user.deleted == true) {
                        log().verbose({ message: `${user.email} is deleted` })
                        if (process.env.NODE_ENV == 'production')
                            return res.status(401).send('token error')
                        return res.status(401).send(`${user.email} is deleted`)
                    }
                    if (refreshUser != false) {
                        req.user = user
                    }
                    if (saveToUserDATA == true) {
                        req.userDATA = user
                    }
                    //retrieving the account the user associated to, we store it in AccountId cause will be adding AccountId to user model later
                    await Account.findOne({ users: req.user._id })
                        .lean()
                        .then(userAccount => {
                            return req.user.AccountId = userAccount
                        })
                        .catch(err => {
                            return errorHandler(err, req, res)
                        })
                    // checking user.sessions
                    // a valid token is a token that exists in sessions and its active == true
                    // when logging out the token is destroyed from user.sessions
                    // checking if the token is active, user can desactivate sessions(tokens) in future versions
                    // at the moment we bypass sessions checking if no session were found
                    if (user.sessions == null || user.sessions.length == 0) {
                        return next()
                    }
                    let tokenSession = user.sessions.filter(function (e) {
                        return (e.token === req.headers.token);
                    })
                    if (tokenSession != null) {
                        if (tokenSession[0].isActive == true) {
                            // checking ip and user agent if availabled
                            if (decoded.session != null) {
                                if (req.ip != decoded.session.ip || req.headers['user-agent'] != decoded.session.userAgent) {
                                    return res.status(401).send('token error')
                                }
                            }
                            else {
                                log().verbose({ message: `decoded.session == null` })
                                return next()
                            }
                        }
                        if (process.env.NODE_ENV == 'production')
                            return res.status(401).send('session error')
                        return res.status(401).send(`the session is not active`)
                    } else {
                        // token was not found in user.sessions
                        // TODO send a warning email to the user
                        if (process.env.NODE_ENV == 'production')
                            return res.status(401).send('token error')
                        return res.status(401).send(`${user.email} absolete token`)
                    }
                })
                .catch(error => {
                    return errorHandler(error, req, res)
                })
        });
    }
}

//to verify if a user can access a specefic route
exports.authorize = (permittedRoles, level) => {
    return function (req, res, next) {
        if (permittedRoles) {
            if (!permittedRoles.includes(req.user.clearance.title)) {
                log(req.user._id).verbose({ label: `[ACCESS_DENIED]`, message: `user.email=${req.user.email} route=${req.originalUrl}` })
                // return res.status(403).send('[ACCESS_DENIED]')           
                return res.render('error', { message: '[ACCESS_DENIED]' })
            } else {
                return next()
            }
        }

        else if (level) {
            switch (level.sign) {
                case '>':
                    if (req.user.clearance.level > level.code) {
                        next()
                    } else {
                        log(req.user._id).verbose({ label: `[ACCESS_DENIED]`, message: `user.email=${req.user.email} route=${req.originalUrl}` })
                        return res.render('error', { message: '[ACCESS_DENIED]' })
                    }
                    break;
                case '>=':
                    if (req.user.clearance.level >= level.code) {
                        next()
                    } else {
                        log(req.user._id).verbose({ label: `[ACCESS_DENIED]`, message: `user.email=${req.user.email} route=${req.originalUrl}` })
                        return res.render('error', { message: '[ACCESS_DENIED]' })
                    }
                    break;
                case '<':
                    if (req.user.clearance.level < level.code) {
                        next()
                    } else {
                        log(req.user._id).verbose({ label: `[ACCESS_DENIED]`, message: `user.email=${req.user.email} route=${req.originalUrl}` })
                        return res.render('error', { message: '[ACCESS_DENIED]' })
                    }
                    break;
                case '<=':
                    if (req.user.clearance.level <= level.code) {
                        next()
                    } else {
                        log(req.user._id).verbose({ label: `[ACCESS_DENIED]`, message: `user.email=${req.user.email} route=${req.originalUrl}` })
                        return res.render('error', { message: '[ACCESS_DENIED]' })
                    }
                    break;
                case '=':
                    if (req.user.clearance.level == level.code) {
                        next()
                    } else {
                        log(req.user._id).verbose({ label: `[ACCESS_DENIED]`, message: `user.email=${req.user.email} route=${req.originalUrl}` })
                        return res.render('error', { message: '[ACCESS_DENIED]' })
                    }
                    break;
            }
        }
        else {
            return next()
        }
    }
}
