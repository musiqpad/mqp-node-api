# MQP-API

API for creating musiqpad bots

[![Version npm](https://img.shields.io/npm/v/mqp-api.svg?style=flat-square)](https://www.npmjs.com/package/mqp-api)[![npm Downloads](https://img.shields.io/npm/dm/mqp-api.svg?style=flat-square)](https://www.npmjs.com/package/mqp-api) [![Build Status](https://travis-ci.org/musiqpad/mqp-node-api.svg?branch=master)](https://travis-ci.org/musiqpad/mqp-node-api)

[![NPM](https://nodei.co/npm/mqp-api.png)](https://npmjs.org/package/mqp-api)

# Install

## NodeJS

```bash
npm install mqp-api -S
```

# Setting up your own bot

Tip: Change your bot permissions in serverconfig.js to have the same as a co-owner if you want to avoid permissions errors.

The first thing you'll need to do is to create a new Bot. You can get these values by typing `config` into the DevTools console on your Pad (if the serverhost is empty, use your domain).

```js
const mqpBot = require('mqp-api');

var bot = new mqpBot({
  autoreconnect: true, // Enabled by default
  useSSL: true,
  socketDomain: 'domain.tld',
  socketPort: 8082,
});
```

Now we connect to the Websockets Server and login

```js
bot.connect()
  .then(function() {
    // This needs to be returned because the function itself retuns a Promise!
    return bot.login({
      email: 'mail@domain.tld',
      password: 'MyPassword', // You can also use a token to login
    });
  })
  .then(function() {
    console.log('Logged in!');
    // Do what ever you want to happen after you successfully logged in
    // ...
  })
  // Catch errors, you can do that after every .then
  .catch(function(e) {
    console.log('ERROR: ' + JSON.stringify(e));
  });
```

Now we create an Event-listener for chat messages. To do that, you can also use .once if you want the function to be only called once.

```js
bot.on('chat', function(data) { // We pass in a function as callback which accepts one argument, data.
                                // Everytime a chat message is recieved, this function will be called and
                                // useful informations will be passed in via this first argument.
  if (data.msg.indexOf('@bot') != -1) // Check if data.msg contains '@bot'
    bot.sendMessage('Hey, ' + data.user.un + '!');

  if (data.msg.indexOf('!kill ') != -1) { // Check if msg contains !kill
    var user = data.msg.replace('!kill ', ''); // Remove !kill from the recieved message and save the
                                               // remaining string as user
    bot.sendMessage(user + ' got killed by '+ data.user.un + "! Oh no!"); // 
  }
});
```

## Some other examples:

```js
// Add an event Listener for Chatevents
bot.on('chat', (data) => {
  if (data.msg.indexOf('@YourBot') != -1)   //If the message contains @YourBot
    //Send a private message: bot.sendPrivateMessage(uid, message)
    bot.sendPrivateMessage(data.user.uid, 'Hey, ' + data.user.un + '! To check all of my commands, type "!help".');


  // If the message (data.msg) includes !help
  if (data.msg.indexOf('!help') != -1) {
    // Get the room infos
    bot.getRoomInfo().then(function (roomInfos) {
      //And .then() use those to send a Message
      bot.sendMessage("I can't help you. But I can give you some Infos about the room: There are currently " +
      // (Object.keys(bot.users).length + 1) gets the number of online users
      (Object.keys(bot.users).length + 1) + ' Users connected and ' + roomInfos.queue + ' users in the Queue');
    });
  }
});

bot.on('userJoined', function (data) {
  if (data.user)
    setTimeout(function () {
      bot.sendMessage('Welcome to Pad_Name, @' + data.user.un + ' !');
    }, 5000);
});

bot.on('privateMessage', function (data) {
  if (data.message.indexOf('help') != -1)
    bot.sendPrivateMessage(data.uid, 'Hey, ' + bot.users[data.uid].un + '! To check all of my commands, type "!help".');
});
```

## API

Available functions:

--------------------------------------------------------------------------------

### getUsers():

Example:

```js
bot.getUsers().then(function(data) {
    // ...
});
```

Returned Object:

```js
{
    uid: {
        badge: {},
        banned: true,
        role: 'owner',
        un: 'Username',
        uid: 'uid'
    }
}
```

--------------------------------------------------------------------------------

### getUser:

Example:

```js
var user = bot.getUser(uid);
```

Returned Object:

```js
{
    badge: {},
    banned: true,
    role: 'owner',
    un: 'Username',
    uid: 'uid'
}
```

--------------------------------------------------------------------------------

### sendJSON:

Example:

```js
bot.sendJSON({type: 'getUsers'});
```

```js
    events.once('getUsersReceived', (data) => { //You can add Received to every event to get the Server Response
      if (data.error)
        reject(data.error);
      resolve();
    });
```

--------------------------------------------------------------------------------

### getRoomInfo:

Example:

```js
bot.getRoomInfo().then(function(data) {
    // ...
});
```

Returned Object:

```js
{
    name: name,
    slug: slug,
    greet: greet,
    bg: bg,
    people: userCount,
    queue: queueLength,
    media: currentsong,
    staffroles: staffroles
}
```

--------------------------------------------------------------------------------

### sendPrivateMessage:

Example:

```js
bot.sendPrivateMessage(uid, msg)
```

```js
bot.sendPrivateMessage(7, "Hey, what's up?")
.then(function (data) {
 console.log('Private Message send!');
})
```

--------------------------------------------------------------------------------

### joinQueue, leaveQueue, lockQueue, unlockQueue, toggleLockQueue, cycle, skip:

```js
bot.joinQueue()
```

```js
bot.joinQueue()
.then(function (data) {
 console.log('Joined the DJ Queue!');
})
```

--------------------------------------------------------------------------------

### deleteChat():

Example: 

```js
bot.deleteChat(cid, uid)
.then(function (data) {
 console.log('Deleted Chat Message!');
})
```

--------------------------------------------------------------------------------

### whois():

Usage:

```js
bot.whois(uid, un)
```

--------------------------------------------------------------------------------

### unban() / ban():

Usage:

```js
bot.ban(uid, duration, reason);
bot.ban(uid);
```

--------------------------------------------------------------------------------

There are also:

```js
.setLimit(limit);
.broadcast(msg);
.removeDj(uid);
.swap(uid1, uid2);
.move(uid, position);

// Don't change these, create new Objects:
.queue  // Array of users in Queue
.currentdj
.roles
.roleOrder
.historylimit
.description
.user //also includes Playlists
```

Avalible Events:

- rawSocket
- reconnected
- error // Gets passed the error object
- closed
- chat

```
    {

    time: 'a timestamp',
    msg: "HEEY",
    uid: 12,
    cid: 420,
    user: { Same as getUser() },

    }
```

All of these events get passed the same like the client api:

- advance
- broadcastMessage
- chatCommand
- deleteChat
- djQueueModAdd
- djQueueCycle
- djQueueLimit
- djQueueLock
- djQueueModMove
- djQueueModSkip
- djQueueModSwap
- djQueueModRemove
- djQueueSkip
- privateMessage
- response
- systemMessage
- userBanned
- userJoined
- userJoinedQueue
- userLeft
- userLeftQueue
- moderateSetRole
- userUnbanned
- userUpdate
- voteUpdate
