const createHash = require('sha.js');
const WebSocket = global.WebSocket || global.MozWebSocket || require("ws");
const https = require('https');
const Promise = require('bluebird');
const winston = require('winston');

const events = require('./events');
const API = require('./api');
const cmds = require('./cmds.js');
const apiKey = 'd0535c57-4a56-4b17-af54-3960031f0575';
const logger = require('./log.js'); 

var _this;

var app = function (args) {
  // TODO: use nconf for settings 
  var _this = this;
  if(typeof args.logging == "undefined") {
    args.logging = {
      logLevel: 'info',
    }
  }
  var settings = this.settings = {
    autoreconnect: typeof args.autoreconnect !== 'undefined' ? args.autoreconnect : true,
    useSSL: args.useSSL || null,
    socketDomain: args.socketDomain || null,
    socketPort: args.socketPort || null,
    password: null,
    email: null,
    token: null,
    room: args.room || null,
    logging: {
      logFile: typeof args.logging.logFile !== 'undefined' ? args.logging.logFile : null,
      logLevel: args.logging.logLevel,
    },
  };

  logger.level = settings.logging.logLevel;
  logger.log("info", "LogLevel: " + args.logging.logLevel);
  if(settings.logging.logFile)
    logger.add(winston.transports.File, {
      prettyPrint: false,
      level: 'debug',
      silent: false,
      colorize: true,
      timestamp: true,
      filename: settings.logging.logFile,
      maxFiles: 10,
      json: true,
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
    });

  this.getPadBySlug = function (slug) {
    logger.log('debug', "Getting pad by Slug: " + slug);
    return new Promise(function (resolve, reject) {
      https.get('https://api.musiqpad.com/pad/list?apikey=' + apiKey, function (res) {
        var output = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            logger.log('debug', "Got pad list");
            var obj = JSON.parse(output);
            for(var i = 0; i < obj.length; i++) {
              if(obj[i].slug == slug) {
                logger.log('debug', "Successfully extracted pad info from list");
                resolve({
                  socketPort: obj[i].socket_host.split(':')[1],
                  socketDomain: obj[i].socket_host.split(':')[0],
                  useSSL: obj[i].is_secure,
                })
              }
              if(obj.slug != slug && i == obj.lenght - 1) {
                reject("Couldn't find room");
              }
            }
        });
      }).on('error', function (e) {
        reject('Error getting Pad list: ' + e.message);
      });
    })
  }
  
  this.connect = function (opts) {
    logger.log('info', "Connecting to pad");
    if(opts) {
      _this.settings.socketDomain = opts.socketDomain || null;
      _this.settings.socketPort = opts.socketPort || null;
      _this.settings.room = opts.room || null;
      _this.settings.useSSL = opts.useSSL || null;
    }
    if(_this.settings.room)
      return new Promise(function (resolve) {
        _this.getPadBySlug(_this.settings.room).then(function (data) {
          _this.settings.socketPort = data.socketPort;
          _this.settings.socketDomain = data.socketDomain;
          _this.settings.useSSL = data.useSSL;

          _this.connectToSocket();
          events.once('joinRoomReceived', function () {
            resolve();
          });
        })
      });
    else
      return new Promise(function (resolve) {
        _this.connectToSocket();
        events.once('joinRoomReceived', function () {
          resolve();
        });
      });
  };

  this.connectToSocket = function () {
    logger.log('info', "Connecting to socket");

    _this.ws = new WebSocket((_this.settings.useSSL ? 'wss' : 'ws') + '://' +
    _this.settings.socketDomain + ':' + _this.settings.socketPort);
    _this.ws.onopen = function () {
      if (_this.reconnecting) {
        events.once('joinRoomReceived', function () {
          logger.log("info", "Reconnected");
          _this.reconnecting = 0;
          _this.login({
            email: _this.settings.email,
            password: _this.settings.password,
            token: _this.settings.token,
          }).then(function () {
            events.emit('reconnected');
          });
        });
      }
      _this.sendJSON({
        type: 'joinRoom',
        data: {},
      });
      _this.sendJSON({
        type: 'getUsers',
      });
    };

    _this.ws.onmessage = function (message) {
      _this.handleResponse(message.data);
      events.emit('rawSocket', message.data);
    };

    _this.ws.onerror = function (e) {
      logger.log('error', "Websocket error: " + e);
      events.emit('error', e);
      if (_this.settings.autoreconnect) {
        _this.reconnecting = 1;
        setTimeout(_this.connectToSocket, 5e3);
      }
    };

    _this.ws.onclose = function (e) {
      logger.log('error', "Websocket closed: " + e);
      events.emit('closed', e);
      if (_this.settings.autoreconnect) {
        _this.reconnecting = 1;
        setTimeout(_this.connectToSocket, 5e3);
        logger.log("info", 'Reconnecting...');
      }
    };
    return;
  };

  events.on('getUsersReceived', function (data) {
    _this.users = data.users;
    _this.guests = data.users;
  });

  events.on('joinRoomReceived', function (data) {
    logger.log('info', "Joined Room");
    _this.queue = data.queue.users;
    events.once('getUsersReceived', function () {
      logger.log('info', "Got connected Users");
      _this.currentdj = (data.queue.currentdj ? _this.getUser(data.queue.currentdj) : null);
    });

    _this.roles = data.roles;
    _this.roleOrder = data.roleOrder;
    _this.historylimit = data.historylimit;
    _this.description = data.description;
    _this.isQueueLocked = data.queue.lock;
  });
  logger.log('debug', "Creating new bot with " + JSON.stringify(args));

  for (var method in cmds) {
    app.prototype[method] = cmds[method].bind(this);
  }
  
  logger.log('debug', "Loaded commands");
};

app.prototype.login = function (args) {
  logger.log('debug', "Logging in with " + JSON.stringify(args));

  var _this = this;
  var sha256 = createHash('sha256');
  var inEmail = args.email;
  this.settings.email = args.email;
  var inPass = args.password;
  this.settings.password = args.password;
  var token = args.token;
  this.settings.token = args.token;
  var obj = {
    type: 'login',
    data: {
      email: inEmail,
      pw: inPass ? sha256.update(inPass, 'utf8').digest('hex').toString() : null,
      token: token,
    },
  };

  this.sendJSON(obj);
  return new Promise(function (resolve, reject) {
    events.once('loginReceived', function (data) {
      if (data.error) {
        reject('Login error:' + data.error);
      }
      logger.log('info', "Logged in!");

      _this.user = data.user;
      _this.users[data.user.uid] = data.user;
      resolve();
    });
  });
};

app.prototype.sendJSON = function (inObj) {
  logger.log('silly', "Sending JSON Object: " + JSON.stringify(inObj));
  this.ws.send(JSON.stringify(inObj));
  return;
};

app.prototype.on = function (type, value) {
  logger.log('silly', "Registered event listener: " + JSON.stringify(type));
  return events.on(type, value);
};

app.prototype.once = function (type, value) {
  logger.log('silly', "Registered event listener: " + JSON.stringify(type));
  return events.once(type, value);
};

app.prototype.getQueue = app.prototype.getDJs = function () {
  return this.queue;
}
app.prototype.getDJ = function () {
  return this.currentdj;
}

app.prototype.getMedia = function () {
  return this.media;
}

app.prototype.getRoles = function () {
  return this.roles;
}

app.prototype.getRoleOrder = function () {
  return this.roleOrder;
}

app.prototype.getHistoryLimit = function () {
  return this.historylimit;
}

app.prototype.getPadDescription = function () {
  return this.description;
}

app.prototype.handleResponse = function (e) {
  var _this = this;

  if (e == 'h')
    return;
  var data = null;

  try {
    data = JSON.parse(e);
  } catch (e) {
    return;
  }
  
  logger.log('silly', "Got Server Response: " + JSON.stringify(e));

  var message = data.data;
  switch (data.type) {
    case API.DATA.EVENTS.CHAT:
      events.emit(API.DATA.EVENTS.CHAT, {
            time: message.time,
            msg: message.message,
            message: message.message,
            cid: message.cid,
            uid: message.uid,
            user: _this.getUser(message.uid),
          });
      break;

    case API.DATA.EVENTS.SYSTEM_MESSAGE:
      events.emit(API.DATA.EVENTS.SYSTEM_MESSAGE, message);
      break;

    case API.DATA.EVENTS.BROADCAST_MESSAGE:
      events.emit(API.DATA.EVENTS.BROADCAST_MESSAGE, message);
      break;

    case API.DATA.EVENTS.USER_JOINED:
      events.emit(API.DATA.EVENTS.USER_JOINED, message);
      _this.sendJSON({
            type: 'getUsers',
          });
      break;

    case API.DATA.EVENTS.USER_LEFT:
      events.emit(API.DATA.EVENTS.USER_LEFT, message);
      _this.sendJSON({
            type: 'getUsers',
          });
      break;

    case API.DATA.EVENTS.USER_JOINED_QUEUE:
      _this.queue = data.data.queueList;
      events.emit(API.DATA.EVENTS.USER_JOINED_QUEUE, message);
      break;

    case API.DATA.EVENTS.USER_LEFT_QUEUE:
      _this.queue = data.data.queueList;
      events.emit(API.DATA.EVENTS.USER_LEFT_QUEUE, message);
      break;

    case API.DATA.EVENTS.ADVANCE:
      _this.currentdj = (data.data.next.uid ? _this.getUser(data.data.next.uid) : null);
      _this.queue.shift();
      _this.media = data.data.next.song;
      events.emit(API.DATA.EVENTS.ADVANCE, message);
      break;

    case API.DATA.EVENTS.DJ_QUEUE_LOCK:
      _this.isQueueLocked = message.state;
      events.emit(API.DATA.EVENTS.DJ_QUEUE_LOCK, message);
      break;

    case API.DATA.EVENTS.DJ_QUEUE_CYCLE:
      events.emit(API.DATA.EVENTS.DJ_QUEUE_CYCLE, message);
      break;

    case API.DATA.EVENTS.DJ_QUEUE_SKIP:
      events.emit(API.DATA.EVENTS.DJ_QUEUE_SKIP, message);
      break;

    case API.DATA.EVENTS.DJ_QUEUE_MOD_SKIP:
      events.emit(API.DATA.EVENTS.DJ_QUEUE_MOD_SKIP, message);
      break;

    case API.DATA.EVENTS.VOTE_UPDATE:
      events.emit(API.DATA.EVENTS.VOTE_UPDATE, message);
      break;

    case API.DATA.EVENTS.USER_UPDATE:
      events.emit(API.DATA.EVENTS.USER_UPDATE, message);
      break;

    case API.DATA.EVENTS.DELETE_CHAT:
      events.emit(API.DATA.EVENTS.DELETE_CHAT, message);
      break;

    case API.DATA.EVENTS.USER_BANNED:
      events.emit(API.DATA.EVENTS.USER_BANNED, message);
      break;

    case API.DATA.EVENTS.USER_UNBANNED:
      events.emit(API.DATA.EVENTS.USER_UNBANNED, message);
      break;

    case API.DATA.EVENTS.USER_ROLE_CHANGE:
      events.emit(API.DATA.EVENTS.USER_ROLE_CHANGE, message);
      break;

    case API.DATA.EVENTS.DJ_QUEUE_REMOVE:
      events.emit(API.DATA.EVENTS.DJ_QUEUE_REMOVE, message);
      break;

    case API.DATA.EVENTS.DJ_QUEUE_MOD_SWAP:
      _this.queue = data.data.queueList;
      events.emit(API.DATA.EVENTS.DJ_QUEUE_MOD_SWAP, message);
      break;

    case API.DATA.EVENTS.DJ_QUEUE_MOD_MOVE:
      _this.queue = data.data.queueList;
      events.emit(API.DATA.EVENTS.DJ_QUEUE_MOD_MOVE, message);
      break;

    case API.DATA.EVENTS.DJ_QUEUE_ADD:
      events.emit(API.DATA.EVENTS.DJ_QUEUE_ADD, message);
      break;

    case API.DATA.EVENTS.DJ_QUEUE_LIMIT:
      events.emit(API.DATA.EVENTS.DJ_QUEUE_LIMIT, message);
      break;

    case API.DATA.EVENTS.PRIVATE_MESSAGE:
      events.emit(API.DATA.EVENTS.PRIVATE_MESSAGE, message);
      break;

    case API.DATA.EVENTS.SERVER_RESPONSE:
      events.emit(data.requestType + 'Received', data.data);
      break;
  };
};
app.data = API.data;
module.exports = app;
