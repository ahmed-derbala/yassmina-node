/**
 * we have to make sure to load global variables and the constraints are satisfied before running the project
 */
const fs = require('fs');
const tColors = require('colors'); // color module to have colorful terminal, doesnt need to be loaded global
global.appRootPath = require('app-root-path'); // the root path of the project


/**
 * loading modules that are used often into global
 * DO NOT USE THE NAMES OF GLOBAL VARIABLES TO INITIATES NEW ONES IN OTHER FILES
 */
global.log = require(`${appRootPath}/utils/log`).log //loading log module
global.errorHandler = require(`${appRootPath}/utils/error`).errorHandler //loading general error handling module
global.sleep = require(`${appRootPath}/tools/dates`).sleep
// load database
require(`${appRootPath}/utils/db`) //loading db connection
global.models = require('../models') //loading models
/**
 * directories needed to ensure some functionalities
 */
const createDirectory = require(`${appRootPath}/tools/files`).createDirectory
createDirectory('logs')
createDirectory('uploads')

/**
 * loading cron
 */
require(`${appRootPath}/scripts/cron`)

/**
 * scripts that run once at startup
 */
