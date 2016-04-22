const createHash = require('sha.js');
const WebSocket = require('ws');

const events = require('./events');
const API = require('./api');
const cmds = require('./cmds.js');
var _this;

var app = function (args) {

  var _this = this;
  this.settings = {
    autoreconnect: typeof args.autoreconnect !== 'undefined' ? args.autoreconnect : true,
    useSSL: args.useSSL,
    socketDomain: args.socketDomain,
    socketPort: args.socketPort,
    password: null,
    email: null,
    token: null,
  };
  this.connect = function () {
    this.connectToSocket();
    return new Promise(function (resolve) {
      events.once('joinRoomReceived', function () {
        resolve();
      });
    });
  };

  this.connectToSocket = function () {
    _this.ws = new WebSocket((_this.settings.useSSL ? 'wss' : 'ws') + '://' +
    _this.settings.socketDomain + ':' + _this.settings.socketPort);
    events.emit('connectingToSocket');
    return;
  };

  events.on('connectingToSocket', function () {
    _this.ws.on('open', function () {
      _this.sendJSON({
        type: 'joinRoom',
        data: {},
      });
      _this.sendJSON({
        type: 'getUsers',
      });
      if (_this.reconnection) {
        _this.login({
          email: _this.settings.email,
          password: _this.settings.password,
          token: _this.settings.token,
        }).then(function () {
          events.emit('reconnected');
        });
      }
    });

    _this.ws.on('message', function (message) {
      _this.handleResponse(message);
      events.emit('rawSocket', message);
    });

    _this.ws.on('error', function (error) {
      events.emit('error', error);
      if (_this.settings.autoreconnect) {
        this.reconnection = 1;
        setTimeout(_this.connectToSocket, 5e3);
      }
    });

    _this.ws.on('close', function (e) {
      events.emit('closed', e);
      if (_this.settings.autoreconnect) {
        this.reconnection = 1;
        setTimeout(_this.connectToSocket, 5e3);
        console.log('Reconnecting...');
      }
    });
  });

  events.on('getUsersReceived', function (data) {
    _this.users = data.users;
    _this.guests = data.users;
  });

  events.on('joinRoomReceived', function (data) {
    _this.queue = data.queue.users;
    events.once('getUsersReceived', function () {
      _this.currentdj = (data.queue.currentdj ? _this.getUser(data.queue.currentdj) : null);
    });

    _this.roles = data.roles;
    _this.roleOrder = data.roleOrder;
    _this.historylimit = data.historylimit;
    _this.description = data.description;
    _this.isQueueLocked = data.queue.lock;
  });

  for (var method in cmds) {
    app.prototype[method] = cmds[method].bind(this);
  }
};

app.prototype.login = function (args) {
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
      if (data.error)
        reject('Login error:' + data.error);
      _this.user = data.user;
      _this.users[data.user.uid] = data.user;
      resolve();
    });
  });
};

app.prototype.sendJSON = function (inObj) {
  this.ws.send(JSON.stringify(inObj));
  return;
};

app.prototype.on = function (type, value) {
  return events.on(type, value);
};

app.prototype.once = function (type, value) {
  return events.once(type, value);
};

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

module.exports = app;
