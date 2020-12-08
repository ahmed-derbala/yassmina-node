/**
 * The project settings
 */
const appRootPath = require('app-root-path');
const packagejson = require('../package.json');
const server = require('../server')
const numbers = require(`${appRootPath}/tools/numbers_tools`)

/**
 * default values for development mode
 */
const env = process.env.NODE_ENV || 'local';
let httpMode = 'http'
const backPort = numbers.normalizePort(process.env.PORT || '3000');
const frontPort = backPort - 1000
let frontBaseUrl = `${httpMode}://${server.ip}:${backPort}/`
let backBaseUrl = `${httpMode}://${server.ip}:${backPort}/`
let noreplyEmail = 'ahmed.nremail@gmail.com'
let db = {}
db.url = '127.0.0.1'
db.name = packagejson.name
//db.uri = `mongodb+srv://user1:123@cluster0-djizf.mongodb.net/test?retryWrites=true&w=majority`
db.uri = `mongodb://${db.url}/${db.name}`
let pagination = {}
pagination.limit = 2
let cluster = {
    enable: false,
    cpuCount: require('os').cpus().length
}


/**
 * values for testing mode
 */
if (process.env.NODE_ENV == 'testing') {
}


/**
 * values for production mode
 */
if (process.env.NODE_ENV == 'production') {
    // frontBaseUrl = `${httpMode}://${packagejson.name}.com`
    frontBaseUrl = `http://www.n3awen.com/`
    backBaseUrl = `${httpMode}://api.${packagejson.name}.com`
    // noreplyEmail = `noreply@${packagejson.name}.com`
    if (!process.env.MONGO_URI) {
        db.name = db.name.concat('_prod_heroku')
        db.uri = `mongodb+srv://user1:123@cluster0-djizf.mongodb.net/${db.name}?retryWrites=true&w=majority`
    } else {
        db.name = db.name.concat('_prod')
        db.uri = process.env.MONGO_URI
    }
    pagination.limit = 10
    cluster.enable = true
}
//"mongodb://mongo:qBL2c6gMrBBa2PBI@mongodb.databases.svc.cluster.local:27017/naawen"
//"mongodb+srv://user1:123@cluster0-djizf.mongodb.net/n3awen_prod?retryWrites=true&w=majority"
module.exports = {
    "company": {
        "name": "GOMYCODE",
        "url": "http://gomycode.co",
        "description": "Nous formons la prochaine génération de développeurs et les connectons avec les entreprises qui construisent le monde de demain.",
        "phone": "00216 31 314 570",
        "email": "hello@gomycode.co",
        "address": "GoMyCode Hackerspace, Immeuble NEO,2ème étage, Rue du lac lochness, Les Berges du Lac1",
        "logo": "<img src='https://server.google.com/url?sa=i&url=https%3A%2F%2Fserver.facebook.com%2Fgomycode%2F&psig=AOvVaw0qNXHmYTN9m3JeJ7jgnwNz&ust=1581698515963000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCJDeqaX8zucCFQAAAAAdAAAAABAD' alt='logo'>"
    },
    db,
    "signOptions": {
        "issuer": "gomycode",
        "subject": packagejson.name,
        "audience": "all",
        "expiresIn": "30 days",
        "algorithm": "HS256"
    },
    "emails": {
        "send": true,//send log emails on development mode, by default log emails are sent only in testing and production mode
        "host": "smtp.gmail.com",
        "port": 587,
        "verificationOnRegister": false,//true means when a user register an account it will not be activated unless the user click the link sent to his email
        "noreply": noreplyEmail,
        "error": "ahmed.derbala@gomycode.co",
        "warn": "ahmed.derbala@gomycode.co",
        "info": "ahmed.derbala@gomycode.co",
        "developer": "ahmed.derbala@gomycode.co",
        "support": "ahmed.derbala@esprit.tn"
    },
    env,
    httpMode,
    backPort,
    frontPort,
    frontBaseUrl,
    backBaseUrl,
    "responseTimeAlert": 20000,//number in milliseconds, if a request takes longer time than this value, a warn email will be sent
    "defaultLang": "fr",
    "systemWarnings": true, //prefer to send or not some warnings on production like  and responseTimeAlert
    "judge0": {
        "submissions": "http://127.0.0.1:3000/submissions/?base64_encoded=false&wait=true"
    },
    pagination,
    cluster
}

