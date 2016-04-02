# MQP-API

**API for creating MusiqPad bots**

# Install

## NodeJS

```bash
npm install mqp-api -S
```

# Example

PLEASE SET THE BOT PERMISSIONS TO AT LEAST THE COOWNER PERMISSIONS IF YOU GET PERMISSION ERRORS!

The first thing you'll need to do is to create a new Bot. You can get these values by typing `config` into the DevTools console on your Pad (if the serverhost is empty, just use your domain).

```js
const mqpBot = require('mqp-api');

var bot = new mqpBot({
  useSSL: true,
  socketDomain: 'ws.explodingcamera.com',
  socketPort: 7001,
});
```

Now we connect to the Websockets Server and login

```js
bot.connect()
  .then(function() {
    return bot.login({
      email: 'mail@explodingcamera.com',
      password: 'MyPassword',
    });
  })
  .then(function() {
    console.log('Logged in!');
    // Do what ever you want to happen after you successfully logged in
    // ...
  })
  .catch(function(e) {
    console.log('ERROR: ' + JSON.stringify(e));
  });
```

Now we create an Event-listener for chat messages [more infos](). To do that, you can also .once if you want the function to be only called once.

```js
bot.on('chat', function(msg) {
  if (msg.msg.indexOf('@mybot') != -1)
    bot.sendMessage('Hey, ' + msg.user.un + '!');

  if (msg.msg.indexOf('!kill') != -1) {
    var user = msg.msg.replace('!kill', '');
    bot.sendMessage(user + 'got killed by '+msg.user.un + "! Oh no!");
  }
});
```

Some other Examples:

```js
MyBot.on('chat', (msg) => {
  if (msg.msg.indexOf('@explodingbot') != -1)
    MyBot.sendPrivateMessage(msg.user.uid, 'Hey, ' + msg.user.un + '! To check all of my commands, type "!help".');
  if (msg.msg.indexOf('!help') != -1) {
    MyBot.getRoomInfo().then(function (data) {
      MyBot.sendMessage("I can't help you. But I can give you some Infos about the room: There are currently " +
      (Object.keys(MyBot.users).length + 1) + ' Users connected and there are ' + data.queue + ' people in the Queue');
    });
  }
});

MyBot.on('userJoined', (user) => {
  MyBot.sendMessage('Welcome to PadPlus, ' + user.un + '!');
});

MyBot.on('privateMessage', (msg) => {
  if (msg.msg.indexOf('help') != -1)
    MyBot.sendPrivateMessage(msg.user.uid, 'Hey, ' + msg.user.un + '! To check all of my commands, type "!help".');
});
```

The API also contains a lot of useful functions:

--------------------------------------------------------------------------------

getUsers():

```js
myBot.getUsers()
```

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

getUser():

```js
myBot.getUser(uid)
```

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

sendJSON():

```js
myBot.sendJSON({type: 'getUsers'})
```

```js
    events.once('gotUsers', (data) => {
      if (data.error)
        reject(data.error);
      resolve();
    });
```

--------------------------------------------------------------------------------

getRoomInfo():

```js
myBot.getRoomInfo()
```

```js
{
    name: name,
    slug: slug,
    greet: greet,
    bg: bg,
    people: userCount,
    queue: queue,
    media: currentsong,
    staffroles: staffroles
}
```

--------------------------------------------------------------------------------

sendPrivateMessage():

```js
myBot.sendPrivateMessage(uid, msg)
```

```js
myBot.sendPrivateMessage(7, "Hey, what's up?")
.then(function (data) {
 console.log('Private Message send!');
})
```

--------------------------------------------------------------------------------

joinQueue(): //leaveQueue, lockQueue, cycle and skip are the same.

```js
myBot.joinQueue()
```

```js
myBot.joinQueue()
.then(function (data) {
 console.log('Joined the DJ Queue!');
})
```

--------------------------------------------------------------------------------

deleteChat():

```js
myBot.deleteChat()
```

```js
myBot.deleteChat(uid, cid)
.then(function (data) {
 console.log('Deleted Chat Message!');
})
```

--------------------------------------------------------------------------------

whois():

```js
myBot.whois(uid, un)
```

--------------------------------------------------------------------------------

unban() / ban():

```js
myBot.ban(uid, duration, reason);
myBot.ban(uid);
```

--------------------------------------------------------------------------------

There are also:

```js
setLimit(limit);
broadcast(msg);
removeDj(uid);
swap(uid1, uid2);
move(uid, position)
```

Avalible Events:

- login
- gotUsers
- rawSocket
- chat

```
    {

    time: 'a timestamp',
    msg: "HEEY",
    uid: 12,
    user: { Same as getUser() },

    }
```

- [All events from the CLient API](https://musiqpad.com/api/#musiqpad-client-data-api-events)
