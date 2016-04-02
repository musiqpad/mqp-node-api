# MQP-API

**API for creating musiqpad bots**

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
  socketDomain: 'myServerHost.tld',
  socketPort: 1234,
});
```

Now we connect to the Websockets Server and login

```js
bot.connect()
  .then(function() {
    //This needs to be returned because the function itself retuns a Promise!
    return bot.login({
      email: 'mail@domain.tld',
      password: 'MyPassword', //Instead Of mail and pw, you can also use a token
    });
  })
  .then(function() {
    console.log('Logged in!');
    // Do what ever you want to happen after you successfully logged in
    // ...
  })
  //Catch errors, you can do that after every .then
  //If you don't do that, errors get logged to the console.
  .catch(function(e) {
    console.log('ERROR: ' + JSON.stringify(e));
  });
```

Now we create an Event-listener for chat messages. To do that, you can also .once . if you want the function to be only called once.

```js
bot.on('chat', function(data) {
  if (data.msg.indexOf('@bot') != -1)
    bot.sendMessage('Hey, ' + data.user.un + '!');

  if (data.msg.indexOf('!kill') != -1) {
    var user = data.msg.replace('!kill ', '');
    bot.sendMessage(user + 'got killed by '+ data.user.un + "! Oh no!");
  }
});
```

Some other Examples:

```js
// Add an event Listener for Chatevents
bot.on('chat', (data) => {
  //If the message contains @YourBot
  if (data.msg.indexOf('@YourBot') != -1)
    //Send a
    bot.sendPrivateMessage(data.user.uid, 'Hey, ' + data.user.un + '! To check all of my commands, type "!help".');


  // IF the message (data.msg) includes !help
  if (data.msg.indexOf('!help') != -1) {
    //Get the Room Infos
    bot.getRoomInfo().then(function (data2) {
      //And .then() use those (data2) to send a Message
      bot.sendMessage("I can't help you. But I can give you some Infos about the room: There are currently " +
      // (Object.keys(bot.users).length + 1) get the number of online users (Works everywhere)
      (Object.keys(bot.users).length + 1) + ' Users connected and there are ' + data2.queue + ' people in the Queue');
    });
  }
});

bot.on('userJoined', function (data) {
  if (data.user)
    setTimeout(function () {
      bot.sendMessage('Welcome to PadPlus, @' + data.user.un + ' !');
    }, 5000);
});

bot.on('privateMessage', function (data) {
  if (data.message.indexOf('help') != -1)
    bot.sendPrivateMessage(data.uid, 'Hey, ' + bot.users[data.uid].un + '! To check all of my commands, type "!help".');
});
```

The API also contains a lot of useful functions:

--------------------------------------------------------------------------------

getUsers():

```js
bot.getUsers()
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
bot.getUser(uid)
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
bot.sendJSON({type: 'getUsers'})
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
bot.getRoomInfo()
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
bot.sendPrivateMessage(uid, msg)
```

```js
bot.sendPrivateMessage(7, "Hey, what's up?")
.then(function (data) {
 console.log('Private Message send!');
})
```

--------------------------------------------------------------------------------

joinQueue(): //leaveQueue, lockQueue, cycle and skip are the same.

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

deleteChat():

```js
bot.deleteChat()
```

```js
bot.deleteChat(uid, cid)
.then(function (data) {
 console.log('Deleted Chat Message!');
})
```

--------------------------------------------------------------------------------

whois():

```js
bot.whois(uid, un)
```

--------------------------------------------------------------------------------

unban() / ban():

```js
bot.ban(uid, duration, reason);
bot.ban(uid);
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
