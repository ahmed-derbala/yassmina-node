#!/usr/bin/env node
// loading initialization
require('./utils/init')
// server launch time
const appStartedAt = Date(Date.now());
exports.appStartedAt = appStartedAt;
// ip address of the server
const ip = require("ip");
exports.ip = ip.address()

var app = require('./app');
var debug = require('debug')('yassmina-node:server');
var http = require('http');
const packagejson = require(`${appRootPath}/package.json`);
const prefs = require(`${appRootPath}/config/prefs`)
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort('3000');
app.set('port', port);

/**
 * Create HTTP server.
 */
let server = http.createServer(app);


/**
 * Listen on provided port, on all network interfaces.
 */

if (prefs.cluster.cpuCount > 0 && prefs.cluster.enable == true) {
  let cluster = require('cluster');
  if (cluster.isMaster) {
    log().verbose({ message: `cluster is enabled. ${prefs.cluster.cpuCount} cpus are in use` })
    // Create a worker for each CPU
    for (let c = 1; c <= prefs.cluster.cpuCount; c++) {
      log().verbose({ message: `forking cluster ${c}` })
      cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function () {
      log().verbose({ message: `cluster exited` })
      cluster.fork();
    });

  } else {
    //launching the server
    //server.listen(port, log().verbose(`******** ${packagejson.name} ${packagejson.version} ${prefs.httpMode}://${ip.address()}:${port}/ NODE_ENV=${process.env.NODE_ENV} fork ${cluster.worker.id} pid ${cluster.worker.process.pid} ********`.white.bgBlue));
    server.listen(port, log().verbose(`******** ${packagejson.name} ${packagejson.version} http://${ip.address()}:${port}/ NODE_ENV=${process.env.NODE_ENV} fork ${cluster.worker.id} pid ${cluster.worker.process.pid} ********`.black.bgBlue));

    server.on('error', onError);
    server.on('listening', onListening);
  }
} else {
  //launching the server without cluster
  // server.listen(port, log().verbose(`******** ${packagejson.name} ${packagejson.version} ${prefs.httpMode}://${ip.address()}:${port}/ NODE_ENV=${process.env.NODE_ENV} ********`.white.bgBlue))
  server.listen(port, log().verbose(`******** ${packagejson.name} ${packagejson.version} http://${ip.address()}:${port}/ NODE_ENV=${process.env.NODE_ENV} ********`.black.bgBlue))
  server.on('error', onError);
  server.on('listening', onListening);
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  debug('Listening on ' + bind);
}