const createHash = require('sha.js');
const Promise = require('bluebird');
const WebSocketClient = require('websocket').client;
const EventEmitter = require('events').EventEmitter;
const events = new EventEmitter();
events.emit = Promise.promisify(events.emit);
var API = require('./src/api');

var app = function (args) {
  var _this = this;
  this.settings = {
    useSSL: args.useSSL,
    socketDomain: args.socketDomain,
    socketPort: args.socketPort,
  };

  this.WsClient = new WebSocketClient();
  this.connect = function () {
    return new Promise(function (resolve, reject) {
      _this.WsClient.connect((_this.settings.useSSL ? 'wss' : 'ws') + '://' +
        _this.settings.socketDomain + ':' + _this.settings.socketPort, 'echo-protocol');

      _this.WsClient.on('connectFailed', function (error) {
        reject('Connection Error: ' + error.toString());
      });

      _this.WsClient.on('connect', function (connection) {
        _this.connection = connection;
        _this.sendJSON({
          type: 'joinRoom',
          data: {},
        });
        _this.sendJSON({
          type: 'getUsers',
        });
        events.on('getUsersReceived', function (data) {
          _this.users = data.users;
          _this.guests = data.users;
        });

        connection.on('error', function (error) {
          events.emit('error', error);
        });

        connection.on('close', function (e) {
          events.emit('closed', e);
        });

        connection.on('message', function (message) {
          events.emit('rawSocket', message);
          _this.handleResponse(message);
        });

        resolve();
      });
    });
  };
};

app.prototype.login = function (args) {
  var sha256 = createHash('sha256');
  var inEmail = args.email;
  var inPass = args.password;
  var token = args.token;
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
      resolve();
    });
  });
};

app.prototype.sendJSON = function (inObj) {
  this.connection.send(JSON.stringify(inObj));
};

app.prototype.getRoomInfo = function () {
  this.sendJSON({
    type: 'getRoomInfo',
  });
  return new Promise(function (resolve, reject) {
    events.once('getRoomInfoReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.sendPrivateMessage = function (uid, msg) {
  this.sendJSON({
    type: 'privateMessage',
    data: {
      uid: uid,
      message: msg,
    },
  });
  return new Promise(function (resolve, reject) {
    events.once('privateMessageReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.joinQueue = function () {
  this.sendJSON({
    type: 'djQueueJoin',
  });
  return new Promise(function (resolve, reject) {
    events.once('djQueueJoinReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.leaveQueue = function () {
  this.sendJSON({
    type: 'djQueueLeave',
  });
  return new Promise(function (resolve, reject) {
    events.once('djQueueLeaveReceived', function (data) {
      if (data.error)
      reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.lockQueue = function () {
  this.sendJSON({
    type: 'djQueueLock',
  });
  return new Promise(function (resolve, reject) {
    events.once('leaveQueueReceived', function (data) {
      if (data.error)
      reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.cycle = function () {
  this.sendJSON({
    type: 'djQueueCycle',
  });
  return new Promise(function (resolve, reject) {
    events.once('djQueueCycleReceived', function (data) {
      if (data.error)
      reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.skip = function () {
  this.sendJSON({
    type: 'djQueueModSkip',
  });
  return new Promise(function (resolve, reject) {
    events.once('djQueueModSkipReceived', function (data) {
      if (data.error)
      reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.deleteChat = function (cid, uid) {
  this.sendJSON({
    type: 'deleteChat',
    data: {
      cid: cid,
      mid: uid,
    },
  });
  return new Promise(function (resolve, reject) {
    events.once('deleteChatReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.move = function (uid, position) {
  this.sendJSON({
    type: 'djQueueModMove',
    data: {
      uid: uid,
      position: position,
    },
  });
  return new Promise(function (resolve, reject) {
    events.once('djQueueModMoveReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.swap = function (uid, uid) {
  this.sendJSON({
    type: 'djQueueModSwap',
    data: {
      uid1: uid1,
      uid2: uid2,
    },
  });
  return new Promise(function (resolve, reject) {
    events.once('djQueueModSwapReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.removeDj = function (uid) {
  this.sendJSON({
    type: 'djQueueModRemove',
    data: {
      uid: uid,
    },
  });
  return new Promise(function (resolve, reject) {
    events.once('djQueueModRemoveReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.broadcast = function (message) {
  this.sendJSON({
    type: 'broadcastMessage',
    data: {
      message: message,
    },
  });
  return new Promise(function (resolve, reject) {
    events.once('broadcastMessageReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.setLimit = function (limit) {
  this.sendJSON({
    type: 'djQueueLimit',
    data: {
      limit: limit,
    },
  });
  return new Promise(function (resolve, reject) {
    events.once('djQueueLimitReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.setRole = function (uid, role) {
  this.sendJSON({
    type: 'setRole',
    data: {
      uid: uid,
      role: role,
    },
  });
  return new Promise(function (resolve, reject) {
    events.once('setRoleReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.ban = function (uid, duration, reason) {
  this.sendJSON({
    type: 'banUser',
    data: {
      uid: uid,
      duration: duration,
      reason: reason,
    },
  });
  return new Promise(function (resolve, reject) {
    events.once('banUserReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.unban = function (uid) {
  this.sendJSON({
    type: 'unbanUser',
    data: {
      uid: uid,
    },
  });
  return new Promise(function (resolve, reject) {
    events.once('unbanUserReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.whois = function (uid, un) {
  this.sendJSON({
    type: 'whois',
    data: {
      uid: uid,
      un: un,
    },
  });
  return new Promise(function (resolve, reject) {
    events.once('whoisReceived', function (data) {
      if (data.error)
        reject('Room Info error: ' + data.error);
      resolve(data);
    });
  });
};

app.prototype.getUser = function (uid) {
  return this.users[uid];
};

app.prototype.on = function (type, value) {
  return events.on(type, value);
};

app.prototype.once = function (type, value) {
  return events.once(type, value);
};

app.prototype.sendMessage = function (message) {
  this.sendJSON({
    type: 'chat',
    data: {
      message: message,
    },
  });
};

app.prototype.handleResponse = function (e) {
  var _this = this;
  if (e.utf8Data == 'h')
    return;
  var data = null;

  try {
    data = JSON.parse(e.utf8Data);
  } catch (e) {
    return;
  }

  var message = data.data;
  switch (data.type) {
    case API.DATA.EVENTS.CHAT:
      events.emit(API.DATA.EVENTS.CHAT, {
        time: message.time,
        msg: message.message,
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
      events.emit(API.DATA.EVENTS.USER_JOINED_QUEUE, message);
      break;

    case API.DATA.EVENTS.USER_LEFT_QUEUE:
      events.emit(API.DATA.EVENTS.USER_LEFT_QUEUE, message);
      break;

    case API.DATA.EVENTS.ADVANCE:
      events.emit(API.DATA.EVENTS.ADVANCE, message);
      break;

    case API.DATA.EVENTS.DJ_QUEUE_LOCK:
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
      events.emit(API.DATA.EVENTS.DJ_QUEUE_MOD_SWAP, message);
      break;

    case API.DATA.EVENTS.DJ_QUEUE_MOD_MOVE:
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
