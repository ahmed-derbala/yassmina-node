/**
 * this file has the logging system
 * logging system written in seperate file to make it easy to integrates in other projects and to be extensible as possible 
 */

const appRootPath = require('app-root-path');
const winston = require('winston');//logging module
const Transport = require('winston-transport');//winston custom transport
const packagejson = require(`${appRootPath}/package.json`);
const nodemailer = require("nodemailer");
const tColors = require('colors/safe');
const prefs = require(`${appRootPath}/config/prefs`);

const emailSignature = `<br><br>------------------------
${prefs.company.name} ${prefs.company.description} ------------------------<br>
telephone: ${prefs.company.phone}  email: ${prefs.company.email}<br><br>
address: ${prefs.company.address}<br><br>
${prefs.company.logo}`

//log(name_of_file).level() to save the log in /logs/name_of_file.log
//log().level() to save the log in /logs/project_name.log
let log = exports.log = (logFilename) => {
    //console.log('\n');//to make console more readable
    /*const myFormat2 = winston.format.printf(({ ip, userAgent, level, message, label, route, where, page, search, count, decoded, info, timestamp, token,request }) => {
        return JSON.stringify({ timestamp, level, message, decoded, info, where, page, search, count, route, ip, userAgent, token,request })
    });*/
    const myFormat = winston.format.printf(
        (msg) => JSON.stringify(msg)
    );

    if (!logFilename) logFilename = `${packagejson.name}`

    let options = {
        file: {
            level: 'verbose',
            filename: `${appRootPath}/logs/${logFilename}.log`,
            //timestamp: true,
            handleExceptions: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            json: true,
            format:
                winston.format.combine(
                    winston.format.timestamp({
                        format: 'YYYY-MM-DD--HH:mm:ss.SSS'
                    }),
                    myFormat
                )
        },
        console: {
            level: 'debug',
            json: true,
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD--HH:mm:ss.SSS'
                }),
                //myFormat,
                winston.format.colorize(),
                winston.format.json(),
                winston.format.simple()
            )
        },
    };
    console.log();//to make terminal more readable
    // instantiate a new Winston Logger with the settings defined above
    if (prefs.emails.sendLogs == true) {
        return winston.createLogger({
            transports: [
                new winston.transports.File(options.file)/*({ 'timestamp': true })*/,
                new winston.transports.Console(options.console),
                new EmailTransport()
            ],
            exitOnError: false, // do not exit on handled exceptions
        });
    } else {
        return winston.createLogger({
            transports: [
                new winston.transports.File(options.file),
                new winston.transports.Console(options.console),
            ],
            exitOnError: false,
        });
    }
}

//streams are the output to console
//attached to morgan, express logger (app.js)
log.streamDevelopment = {
    write: function (request, encoding) {
        let statusCode = request.slice(0, 1)
        /*if (statusCode == 2) {
            log().verbose({ message: tColors.bgGreen(request.white) });
        }
        else if (statusCode == 3) {
            log().verbose({ message: tColors.bgCyan(request.white) });
        }
        else*/ if (statusCode == 4) {
            log().warn({ message: tColors.bgYellow(request.white) });
        } else {
            log().error({ message: tColors.bgRed(request.white) });
        }
        //checkin responsetimealert
        let rt = request.slice(request.indexOf('[*') + 2, request.indexOf('*]')) //rt like response time
        if (parseInt(rt) > prefs.responseTimeAlert) {
            log().warn({ message: `request taking more than ${prefs.responseTimeAlert} ms`, request })
        }
        console.log();//to make console more readable
    },
};

log.streamStaging = {
    write: function (request, encoding) {
        let statusCode = request.slice(0, 1)
       /* if (statusCode == 2) {
           // log().verbose({ message: tColors.bgGreen(request.white) });// can be removed to have least logs
        }
        else if (statusCode == 3) {
          //  log().verbose({ message: tColors.bgCyan(request.white) });// can be removed to have least logs
        }
        else*/ if (statusCode == 4) {
            log().warn({ message: tColors.bgYellow(request.white) });
        } else {
            log().error({ message: tColors.bgRed(request.white) });
        }
        //checkin responsetimealert
        let rt = request.slice(request.indexOf('[*') + 2, request.indexOf('*]')) //rt like response time
        if (parseInt(rt) > prefs.responseTimeAlert) {
            log().warn({ message: `request taking more than ${prefs.responseTimeAlert} ms`, request })
        }
        console.log();//to make console more readable
    },
};

log.streamProduction = {
    write: function (request, encoding) {
        let statusCode = request.slice(0, 1)
       /* if (statusCode == 2) {
          //  log().debug({ message: request.white.bgGreen }); // can be removed to have least logs
        }
        else if (statusCode == 3) {
          //  log().debug({ message: request.white.bgCyan });// can be removed to have least logs
        }
        else*/ if (statusCode == 4) {
            log().warn({ message: request.white.bgYellow });//morgan logging
        } else {
            log().error({ message: request.white.bgRed });//morgan logging
        }
        //checkin responsetimealert
        let rt = request.slice(request.indexOf('[*') + 2, request.indexOf('*]')) //rt like response time
        if (parseInt(rt) > prefs.responseTimeAlert && prefs.systemWarnings == true) {
            log().warn({ message: `request taking more than ${prefs.responseTimeAlert} ms`, request })
        }
        console.log();//to make console more readable
    },
};

log.streamLocal = {
    write: function (request, encoding) {
        let statusCode = request.slice(0, 1)
        if (statusCode == 2) {
            log().verbose({ message: tColors.bgGreen(request.black) });
        }
        else if (statusCode == 3) {
            log().verbose({ message: tColors.bgCyan(request.black) });
        }
        else if (statusCode == 4) {
            log().verbose({ message: tColors.bgYellow(request.black) });
        } else {
            log().error({ message: tColors.bgRed(request.black) });
        }
        //checkin responsetimealert
        let rt = request.slice(request.indexOf('[*') + 2, request.indexOf('*]')) //rt like response time
        if (parseInt(rt) > prefs.responseTimeAlert) {
            log().warn({ message: `request taking more than ${prefs.responseTimeAlert} ms`, request })
        }
        console.log();//to make console more readable
    },
};

//sending emails with winston on production
class EmailTransport extends Transport {
    constructor(opts) {
        super(opts);
    }
    async log(info, callback) {
        /*setImmediate(() => {
            this.emit('logged', info);
        });*/

        let transporter = nodemailer.createTransport({
            host: prefs.emails.host,
            port: prefs.emails.port,
            secure: false, // true for 465, false for other ports
            auth: {
                user: prefs.emails.noreply.email,
                pass: prefs.emails.noreply.password
            }
        });
        let to;
        switch (info.level) {
            case 'error':
                if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'testing') {
                    //    if (process.env.NODE_ENV != 'development') {
                    to = prefs.emails.error;
                } else {
                    to = prefs.emails.developer;
                }
                break;
            case 'warn':
                if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'testing') {
                    //    if (process.env.NODE_ENV != 'development') {
                    to = prefs.emails.warn;
                } else {
                    to = prefs.emails.developer;
                }
                break;
            case 'info':
                if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'testing') {
                    //    if (process.env.NODE_ENV != 'development') {
                    to = prefs.emails.info;
                } else {
                    to = prefs.emails.developer;
                }
                break;
            case 'verbose':
                return
        }
        return transporter.sendMail({
            from: `${packagejson.name}  <${prefs.emails.noreply.email}>`, // sender address
            to,
            subject: `${info.level} | ${process.env.NODE_ENV} | ${packagejson.version}`,
            html: `
            ${packagejson.name} ${packagejson.version} <br>
            ${info.level.toString()} <br><br>
            message     : ${info.message} <br>
            route     : ${info.route} <br><br><br>
            NODE_ENV  : ${process.env.NODE_ENV} <br>
            path      : ${appRootPath} <br>
            front     : ${prefs.frontBaseUrl} <br>
            back      : ${prefs.backBaseUrl} <br>
            ${emailSignature}
            `
        }, (error, emailInfo) => {
            if (error)
                return log().error({ route: 'log.EmailTransport', message: error });
            if (process.env.NODE_ENV == 'production') {
                log().verbose({ message: `[${info.level.toUpperCase()}_EMAIL] sent to ${to}`.white.bgGrey, emailInfo, label: 'email_success' });
            } else {
                log().verbose({ message: `[${info.level.toUpperCase()}_EMAIL] sent to ${to}`.white.bgGrey, label: 'email_success' });
            }
            // only needed when using pooled connections
            return transporter.close();
        });
        // Perform the writing to the remote service
        //callback();
    }
};