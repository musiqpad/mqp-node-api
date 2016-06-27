# MQP-API [![Version npm](https://img.shields.io/npm/v/mqp-api.svg)](https://www.npmjs.com/package/mqp-api) [![npm Downloads](https://img.shields.io/npm/dm/mqp-api.svg)](https://www.npmjs.com/package/mqp-api) [![Build Status](https://travis-ci.org/musiqpad/mqp-node-api.svg?branch=master)](https://travis-ci.org/musiqpad/mqp-node-api)

API for creating musiqpad bots

[![NPM](https://nodei.co/npm/mqp-api.png)](https://npmjs.org/package/mqp-api)

# Install

## NodeJS

```bash
npm install mqp-api -S
```

## Browser

```html
<script src="https://cdn.musiqpad.com/js/mqp-api.min.js"></script>
```

# Setting up your own bot

**Version 0.3.x changes how you connect to a pad, the old way still works for compatibility though!**

**Version 0.7.x changed bans to restrictions, check the docs below!**

Tip: Change your bot permissions in serverconfig.js to have the same as a co-owner if you want to avoid permissions errors. If you don't know the `() =>` syntax, google arrow functions!

The first thing you'll need to do is to create a new Bot. You can get these values by typing `config` into the DevTools console on your Pad (if the serverhost is empty, use your domain).

```javascript
const mqpAPI = require('mqp-api'); // Ignore this line if you are using the browser version

var bot = new mqpAPI({
  autoreconnect: true,     // Enabled by default, for other options check the wiki
  logging: {
    logLevel: 'info',      // Default is info, others are:
                           // silent, error, warn, info, verbose, debug, silly
    logFile: './logs.json' // Optional
  }
});
```

Now we connect to the Websockets Server and login

```javascript
bot.connect({
  room: 'tastycat',

  // If you don't have a room slug, you can also connect via port + domain:

  // useSSL: true,
  // socketDomain: 'example.com',
  // socketPort: 8082,
}).then(() => {
  return bot.login({
    email: 'mail@domain.tld',
    password: 'MyPassword',

    // You can also use a token to login:
    // token: '4f5a2e48-04c5-46e6-bd61-faeeeca69d6d',
  });
}).then(() => {
  console.log('Logged in!');
  // Do what ever you want to happen after you successfully logged in for the first time
  // ...
})

bot.on('reconnected', () => {
  // Do what ever you want to happen after you successfully reconnected
});
```

Now we create an Event-listener for chat messages. To see what every event does, check the wiki. Instead of `.on`, you can also use `.once` if you want the function to be only called once.

```javascript
bot.on('chat', function(data) { 
// We pass in a function as callback which accepts one argument, data.
// Everytime a chat message is received, this function will be called
// and useful information will be passed in via this first argument.

  // Check if data.msg contains '@bot'
  if (data.msg.indexOf('@bot') != -1)
    bot.sendMessage('Hey, ' + data.user.un + '!');

  // Check if msg contains !kill
  if (data.msg.indexOf('!kill ') != -1) { 
    // Remove !kill from the recieved message and save the
    // remaining string as user
    var user = data.msg.replace('!kill ', '');
    bot.sendMessage(user + ' got killed by '+ data.user.un + "! Oh no!");
  }
});
```

## Some other examples:

```javascript
// Add an event Listener for Chatevents
bot.on('chat', (data) => {
  if (data.msg.indexOf('@YourBot') != -1)   //If the message contains @YourBot
    //Send a private message: bot.sendPrivateMessage(uid, message)
    bot.sendPrivateMessage(data.user.uid, 'Hey, ' + data.user.un + '! \
    To check all of my commands, type "!help".');


  // If the message (data.msg) includes !help
  if (data.msg.indexOf('!help') != -1) {
    // Get the room infos
    bot.getRoomInfo().then(function (roomInfos) {
      //And .then() use those to send a Message
      bot.sendMessage("I can't help you. But I can give you \
      some Infos about the room: There are currently " +
      (Object.keys(bot.users).length + 1) + ' Users connected and ' + roomInfos.queue + ' users in the Queue');
      // (Object.keys(bot.users).length + 1) gets the number of online users
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

# Available functions:

## getUsers():

Example:

```javascript
bot.getUsers().then(function(data) {
    // ...
});
```

Returned Object:

```javascript
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

## getUser: (Also for getting playlists)

Example:

```javascript
var user = bot.getUser(uid);
var currentUser = bot.getUser();
```

Returned Object:

```javascript
{
    badge: {},
    banned: true,
    role: 'owner',
    un: 'Username',
    uid: 'uid'
    // If you get the current User, you also get
    activepl: 10,
    created: 1462378487408,
    playlists: {
      3: {
        id: 3,
        name: "playlist1",
        content: {
          [
            0: {
              SongObject
            },
          ]
        }
      }
    }
}
```

--------------------------------------------------------------------------------

## sendJSON:

Example:

```javascript
bot.sendJSON({type: 'getUsers'});
```

```javascript
    events.once('getUsersReceived', (data) => { // You can add 'Received' to every event to get the Server Response
      if (data.error)
        reject(data.error);
      resolve();
    });
```

--------------------------------------------------------------------------------

## getRoomInfo:

Example:

```javascript
bot.getRoomInfo().then(function(data) {
    // ...
});
```

Returned Object:

```javascript
{
    name: name,
    slug: slug,
    greet: greet,
    queue: queueLength,
    media: currentsong,
    staffroles: staffroles
}
```

--------------------------------------------------------------------------------

## sendPrivateMessage:

Example:

```javascript
bot.sendPrivateMessage(uid, msg)
```

```javascript
bot.sendPrivateMessage(7, "Hey, what's up?")
.then(function (data) {
 console.log('Private Message send!');
})
```

--------------------------------------------------------------------------------

## joinQueue, leaveQueue, lockQueue, unlockQueue, toggleLockQueue, cycle, skip:

```javascript
bot.joinQueue()
```

```javascript
bot.joinQueue()
.then(function (data) {
 console.log('Joined the DJ Queue!');
})
```

--------------------------------------------------------------------------------

## deleteChat():

Example:

```javascript
bot.deleteChat(cid, uid)
.then(function (data) {
 console.log('Deleted Chat Message!');
})
```

--------------------------------------------------------------------------------

## whois():

Usage:

```javascript
bot.whois(uid, un)
```

--------------------------------------------------------------------------------

## restrictUser(), getUserRestrictions()

Usage:

```javascript
restrictUser(uid, duration, reason, type);
getUserRestrictions(uid).then((data) => console.log(data));
unrestrictUser(uid, type);
```

--------------------------------------------------------------------------------

## .logger

Usage:

```javascript
bot.logger.log(logLevel, "Text");
bot.logger.log("silly", "LOL: " + JSON.stringify({
  error: {
    foo: "bar",
  }
}));
```

--------------------------------------------------------------------------------

## getConversations()

Usage:

```javascript
bot.getConversations().then((data) => {
  /* Data:
    conversations: {
      1: {
        messages: {
          0: {
            from: 1,
            message: 'Hi',
            time: "2016-05-15T20:48:35.081Z",
            unread: false,
          }
        }
      }
    }

  */
})
```

--------------------------------------------------------------------------------

## getHistory()

Usage:

```javascript
bot.history().then((data) => {
  /* Data:
    [
      {
        //Song Object
      }
    ]

  */
})
```

--------------------------------------------------------------------------------

## setLimit()

Usage:

```javascript
bot.setLimit(limit).then(() => {
})
```

There are also:

--------------------------------------------------------------------------------

## broadcast()

Usage:

```javascript
bot.broadcast(msg).then(() => {
})
```

--------------------------------------------------------------------------------

## removeDj()

Usage:

```javascript
bot.removeDj(uid).then(() => {
})
```

--------------------------------------------------------------------------------

## swap()

Usage:

```javascript
bot.swap(uid1, uid2).then(() => {
})
```

--------------------------------------------------------------------------------

## swap()

Usage:

```javascript
bot.move(uid, position).then(() => {
})
```

--------------------------------------------------------------------------------

## vote()

Usage:

```javascript
bot.vote(type).then(() => {
  //Types: like, dislike, grab
})
```

--------------------------------------------------------------------------------

## getPadBySlug()

Usage:

```javascript
bot.getPadBySlug(slug).then(() => {
  // You get  socketPort
  //          socketDomain
  //          useSSL
})
```

--------------------------------------------------------------------------------

## getDJ()

Usage:

```javascript
dj = bot.getDJ();
```

--------------------------------------------------------------------------------

## getMedia()

Usage:

```javascript
media = bot.getMedia();
```

--------------------------------------------------------------------------------

## getRoles()

Usage:

```javascript
roles = bot.getRoles();
```

--------------------------------------------------------------------------------

## getRoleOrder()

Usage:

```javascript
roleorder = bot.getRoleOrder();
```

--------------------------------------------------------------------------------

## getHistoryLimit()

Usage:

```javascript
historylimit = bot.getHistoryLimit();
```

--------------------------------------------------------------------------------

## getPadDescription()

Usage:

```javascript
description = bot.getPadDescription();
```

# Available Events:

- rawSocket
- reconnected
- error // Gets passed the error object
- closed
- chat ```

```
{

time: 'a timestamp',
msg: "HEEY",
uid: 12,
cid: 420,
user: { Same as getUser() },

}
```

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
