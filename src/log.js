const winston = require('winston');
const Promise = require('bluebird');
var loggerOpts = {
  levels: {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  colors: {
    silent: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'grey',
  },
  transports: [
    new (winston.transports.Console)({
      handleExceptions: false,
      colorize: true,
      handleExceptions: false,
      prettyPrint: true,
      colorize: true,
      silent: false,
      timestamp: function() {
        var currentdate = new Date(); 
        var datetime = "[" + currentdate.getDate() + "/"
              + (currentdate.getMonth()+1)  + "/" 
              + currentdate.getFullYear() + " "  
              + currentdate.getHours() + ":"  
              + currentdate.getMinutes() + ":" 
              + currentdate.getSeconds() + "]";
        return datetime;
      },
    }),
  ],
  exitOnError: false,
}
var logger = new (winston.Logger)(loggerOpts);
Promise.onPossiblyUnhandledRejection(function(e, promise) {
  logger.log('error', e);
});
module.exports = logger;