'use strict';
const test = require('ava');
const events = require('./../src/events');
var cmds = require('./../src/cmds');

test.before(t => {
  cmds.once = function (type, value) {
    return events.once(type, value);
  };

  cmds.sendJSON = (data) => {
    function handleResponse(msgObj) {
      if ((JSON.stringify(data.data) == JSON.stringify(msgObj)) || (!data.data && (data.type == msgObj.type)))
        events.emit(data.type + 'Received', data.type);
      else {
        events.emit(data.type + 'Received', 'Error');
      }
    }

    setTimeout(function () {
      var msgObj;
      switch (data.type) {
        case 'chat':
          handleResponse({ message: 'message' });
          break;
        case 'getRoomInfo':
          handleResponse({ type: 'getRoomInfo' });
          break;
        case 'privateMessage':
          handleResponse({ uid: 1, message: 'msg' });
          break;
        case 'djQueueJoin':
          handleResponse({ type: 'djQueueJoin' });
          break;
        case 'djQueueLeave':
          handleResponse({ type: 'djQueueLeave' });
          break;
        case 'djQueueLock':
          handleResponse({ type: 'djQueueLock' });
          break;
        case 'djQueueCycle':
          handleResponse({ type: 'djQueueCycle' });
          break;
        case 'djQueueModSkip':
          handleResponse({ type: 'djQueueModSkip' });
          break;
        case 'djQueueModMove':
          handleResponse({
            uid: 1,
            position: 2,
          });
          break;
        case 'deleteChat':
          handleResponse({
            cid: 1,
            mid: 2,
          });
          break;
        case 'djQueueModSwap':
          handleResponse({
            uid1: 1,
            uid2: 2,
          });
          break;
        case 'djQueueModAdd':
          handleResponse({
              uid: 1,
            });
          break;
        default:
          events.emit(data.type + 'Received', 'Error');
      };
    }, 0); // Promise needs to be registered first
  };
});

test('Successfully sends Message', t => {
  return cmds.sendMessage('message').then(data => {
    t.is(data, 'chat');
  });
});
test('Successfully gets RoomInfo', t => {
  return cmds.getRoomInfo().then(data => {
    t.is(data, 'getRoomInfo');
  });
});
test('Successfully sends privateMessage', t => {
  return cmds.sendPrivateMessage(1, 'msg').then(data => {
    t.is(data, 'privateMessage');
  });
});
test('Successfully joinQueue', t => {
  return cmds.joinQueue().then(data => {
    t.is(data, 'djQueueJoin');
  });
});
test('Successfully leaveQueue', t => {
  return cmds.leaveQueue().then(data => {
    t.is(data, 'djQueueLeave');
  });
});
test('Successfully lockQueue', t => {
  return cmds.lockQueue().then(data => {
    t.is(data, 'djQueueLock');
  });
});

test('Successfully unlockQueue', t => {
  return cmds.unlockQueue().then(data => {
    t.is(data, 'djQueueLock');
  });
});

test('Successfully toggleLockQueue', t => {
  return cmds.toggleLockQueue().then(data => {
    t.is(data, 'djQueueLock');
  });
});

test('Successfully cycleQueue', t => {
  return cmds.cycle().then(data => {
    t.is(data, 'djQueueCycle');
  });
});

test('Successfully skip', t => {
  return cmds.skip().then(data => {
    t.is(data, 'djQueueModSkip');
  });
});

test('Successfully deleteChat', t => {
  return cmds.deleteChat(1, 2).then(data => {
    t.is(data, 'deleteChat');
  });
});

test('Successfully djQueueModMove', t => {
  return cmds.move(1, 2).then(data => {
    t.is(data, 'djQueueModMove');
  });
});

test('Successfully djQueueModSwap', t => {
  return cmds.swap(1, 2).then(data => {
    t.is(data, 'djQueueModSwap');
  });
});

test('Successfully djQueueModAdd', t => {
  return cmds.addDj(1).then(data => {
    t.is(data, 'djQueueModAdd');
  });
});
