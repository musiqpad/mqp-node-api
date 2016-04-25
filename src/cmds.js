const Promise = require('bluebird');

module.exports = {
  getRoomInfo: function () {
    var _this = this;
    this.sendJSON({
      type: 'getRoomInfo',
    });
    return new Promise(function (resolve, reject) {
      _this.once('getRoomInfoReceived', function (data) {
        if (data.error)
          reject('getRoomInfo error: ' + data.error);
        resolve(data);
      });
    });
  },

  sendPrivateMessage: function (uid, msg) {
    var _this = this;
    this.sendJSON({
      type: 'privateMessage',
      data: {
        uid: uid,
        message: msg,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('privateMessageReceived', function (data) {
        if (data.error)
          reject('privateMessage error: ' +
            data.error);
        resolve(data);
      });
    });
  },

  joinQueue: function () {
    var _this = this;
    this.sendJSON({
      type: 'djQueueJoin',
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueJoinReceived', function (data) {
        if (data.error)
          reject('djQueueJoin error: ' + data
            .error);
        resolve(data);
      });
    });
  },

  leaveQueue: function () {
    var _this = this;
    this.sendJSON({
      type: 'djQueueLeave',
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueLeaveReceived', function (data) {
        if (data.error)
          reject('djQueueLeave error: ' +
            data.error);
        resolve(data);
      });
    });
  },

  lockQueue: function () {
    if (this.isQueueLocked == true)
      return Promise.reject('Queue is already locked');
    var _this = this;
    this.sendJSON({
      type: 'djQueueLock',
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueLockReceived', function (data) {
        if (data.error)
          reject('djQueueLock error: ' + data
            .error);
        resolve(data);
      });
    });
  },

  unlockQueue: function () {
    if (this.isQueueLocked == false)
      return Promise.reject('Queue is already unlocked');
    var _this = this;
    this.sendJSON({
      type: 'djQueueLock',
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueLockReceived', function (data) {
        if (data.error)
          reject('djQueueLock error: ' + data
            .error);
        resolve(data);
      });
    });
  },

  toggleLockQueue: function () {
    var _this = this;
    this.sendJSON({
      type: 'djQueueLock',
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueLockReceived', function (data) {
        if (data.error)
          reject('djQueueLock error: ' + data
            .error);
        resolve(data);
      });
    });
  },

  cycle: function () {
    var _this = this;
    this.sendJSON({
      type: 'djQueueCycle',
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueCycleReceived', function (data) {
        if (data.error)
          reject('djQueueCycle error: ' +
            data.error);
        resolve(data);
      });
    });
  },

  skip: function () {
    var _this = this;
    this.sendJSON({
      type: 'djQueueModSkip',
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueModSkipReceived', function (data) {
        if (data.error)
          reject('djQueueModSkip error: ' +
            data.error);
        resolve(data);
      });
    });
  },

  deleteChat: function (cid, uid) {
    var _this = this;
    this.sendJSON({
      type: 'deleteChat',
      data: {
        cid: cid,
        mid: uid,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('deleteChatReceived', function (data) {
        if (data.error)
          reject('deleteChat error: ' + data.error);
        resolve(data);
      });
    });
  },

  move: function (uid, position) {
    var _this = this;
    this.sendJSON({
      type: 'djQueueModMove',
      data: {
        uid: uid,
        position: position,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueModMoveReceived', function (data) {
        if (data.error)
          reject('djQueueModMove error: ' +
            data.error);
        resolve(data);
      });
    });
  },

  swap: function (uid1, uid2) {
    var _this = this;
    this.sendJSON({
      type: 'djQueueModSwap',
      data: {
        uid1: uid1,
        uid2: uid2,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueModSwapReceived', function (data) {
        if (data.error)
          reject('djQueueModSwap error: ' +
            data.error);
        resolve(data);
      });
    });
  },

  addDj: function (uid) {
    var _this = this;
    this.sendJSON({
      type: 'djQueueModAdd',
      data: {
        uid: uid,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueModAddReceived', function (data) {
        if (data.error)
          reject('djQueueModAdd error: ' +
            data.error);
        resolve(data);
      });
    });
  },

  removeDj: function (uid) {
    var _this = this;
    this.sendJSON({
      type: 'djQueueModRemove',
      data: {
        uid: uid,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueModRemoveReceived', function (
        data) {
        if (data.error)
          reject('djQueueModRemove error: ' +
            data.error);
        resolve(data);
      });
    });
  },

  broadcast: function (message) {
    var _this = this;
    this.sendJSON({
      type: 'broadcastMessage',
      data: {
        message: message,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('broadcastMessageReceived', function (
        data) {
        if (data.error)
          reject('broadcastMessage error: ' +
            data.error);
        resolve(data);
      });
    });
  },

  setLimit: function (limit) {
    var _this = this;
    this.sendJSON({
      type: 'djQueueLimit',
      data: {
        limit: limit,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('djQueueLimitReceived', function (data) {
        if (data.error)
          reject('djQueueLimit error: ' +
            data.error);
        resolve(data);
      });
    });
  },

  setRole: function (uid, role) {
    var _this = this;
    this.sendJSON({
      type: 'setRole',
      data: {
        uid: uid,
        role: role,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('setRoleReceived', function (data) {
        if (data.error)
          reject('setRole error: ' + data.error);
        resolve(data);
      });
    });
  },

  ban: function (uid, duration, reason) {
    var _this = this;
    this.sendJSON({
      type: 'banUser',
      data: {
        uid: uid,
        duration: duration,
        reason: reason,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('banUserReceived', function (data) {
        if (data.error)
          reject('banUser error: ' + data.error +
            (data.text ? ' - ' + data.text :
              ''));
        resolve(data);
      });
    });
  },

  unban: function (uid) {
    var _this = this;
    this.sendJSON({
      type: 'unbanUser',
      data: {
        uid: uid,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('unbanUserReceived', function (data) {
        if (data.error)
          reject('unbanUser error: ' + data.error);
        resolve(data);
      });
    });
  },

  whois: function (uid, un) {
    var _this = this;
    this.sendJSON({
      type: 'whois',
      data: {
        uid: uid,
        un: un,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('whoisReceived', function (data) {
        if (data.error)
          reject('whois error: ' + data.error);
        resolve(data);
      });
    });
  },

  vote: function (voteType) {
    var _this = this;
    this.sendJSON({
      type: 'vote',
      data: {
        voteType: voteType,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('voteReceived', function (data) {
        if (data.error)
          reject('vote error: ' + data.error);
        resolve(data);
      });
    });
  },
  
  getUser: function (uid) {
    if (!uid)
      return this.user;
    return this.users[uid] ? this.users[uid] : null;
  },

  getMedia: function () {
    return this.media;
  },

  getUsers: function () {
    return this.users;
  },

  sendMessage: function (message) {
    var _this = this;
    this.sendJSON({
      type: 'chat',
      data: {
        message: message,
      },
    });
    return new Promise(function (resolve, reject) {
      _this.once('chatReceived', function (data) {
        resolve(data);
      });
    });
  },
};
