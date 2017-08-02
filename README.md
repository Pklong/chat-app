# Node.js Chat App

## Overview

This project involves writing a minimalist chatting app, and the
frequent small events involved in chatting functionality make it a
great fit for Node.js.

## Phase I: Setup

Start with the following directory structure:

```
//ChatApp/
//|
//--app.js
//--lib/
//  |
//  --chatServer.js
//--public/
//  |
//  --javascripts/
//    |
//    --chatUI.js
//    --chat.js
//  --index.html
```

Node.js doesn't require any specific structure for your app, but we
are going to follow convention by using this structure.

### `package.json`

`npm init -y`
`npm install --save socket.io express`
`npm install --save-dev nodemon`

## Phase II: Serving Static Files

**You will use the [express library][express-static] to serve static files.**

```javascript
// lib/app.js
const express = require('express')
const app = express()
const path = require('path')

app.use(express.static('public'))

const PORT = 8000

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
})
```

[express-static]: http://expressjs.com/en/starter/static-files.html

### `public/index.html`

Add an `index.html` file to act as the root page for your app. Check out the [Socket.io docs][socket-io] 
to see how to load their library client-side. You'll want to load your webpack bundle as well.

Add some html to create a place to display messages and a form for inputing messages.

Test out the static file serving: Start up the server with `npm run start:dev` and visit `http://localhost:3000`.

[socket-io]: https://socket.io/docs/client-api/


## Phase III: Basic Chat Functionality

We'll be using Socket.IO to implement chatroom functionality. Socket.IO
is composed of two parts.

1.  A server that integrates with (or mounts on) the Node.JS HTTP Server.
2.  A client library that loads on the browser side.

Let's start with the server.

### `lib/chatServer.js`

Start a file for the Socket.IO server, and require the `socket.io`
library.  You'll set up your server in this file and then export a
`createChat` function that can be called in the main `app.js` file.

The [Socket.IO documentation][socket-io-docs-server] has many examples of
setting up a server.

The `socket.io` server piggybacks off of a `server`
defined with `http` such as the one you defined in `app.js` using express. In our code, we'll separate the logic for the
socket.io server into a `chatServer.js` file.

Because *your* socket.io server is in another file, you will need to
`require('./chatServer')` in your `app.js` file.  In
`chatServer.js`, define a function `createChat` that takes a server
and "runs" socket.IO on it like the example does with "server". In your
`app.js` file, you're going to call this function, passing in the
server that you made.

What is a socket?  A **socket** is a connection between the client and
server that is always open, in which either the client or the server
can send data.

The callback for connections to the `socket.io` server is defined in
the `io.on('connection'...` line.

The `socket.emit` command sends a message to the socket that just
connected.  To send a message to all sockets, use
`io.emit('message', { text: 'this is the text' })`.  The first
argument of `emit` is the name of the event it is emitting, and the
second argument is data to send along with that event.

In our application, we want listen for a `message` event and respond
by broadcasting the `message` text to the chatroom.  Use the same
`socket.on('event', callback)` pattern to set a callback for the
`message` event that will be raised when a message is sent.

For now, all this callback has to do is `emit` the received message to
all the connected sockets.

What does all this mean?  We now have two separate parts of our node
app waiting for different types of requests:

1. Our http server listening for standard http requests (this delivers
   our index.html page).
2. Our socket.io server listening for socket requests (this will send
   messages back and forth).

Test that your code works!

[socket-io-docs-server]: https://socket.io/docs/server-api/

## [Client-side](https://socket.io/docs/client-api/)

Next, we need the client-side JavaScript to support sending messages
to the server and displaying messages received from the server.

Require the socket.io library in your webpack entry file.

Open your index page, and run `io()` in the chrome developer
console. See if you can make the server print something out when it
connects.


### `public/javascripts/chat.js`


In a new file `public/javascripts/chat.js`, make a class constructor
`Chat` that receives socket as an attribute and stores it for later.

Add a `sendMessage` method to the `Chat` class for transmitting a
message to all users.  Use the `emit` method to emit the `message`
event with the text of the message.

### `public/javascripts/chatUI.js`

In a separate file we'll write the code to actually interact with the
HTML user interface.

You'll be using an instance of the `Chat` class to send messages to
the server.

Write some helper functions that will:
 * get the message from the input form
 * send the message to other users (calling the `sendMessage` method
   of the Chat object,)
 * add it to the top of the display area for that user

## Phase IV: Nicknames for Users

In this app, the client-side and server-side javascript each listen
for and respond to events.  To implement any feature, you must add the
logic on each side to listen for and respond to the event.

The chat room right now is totally anonymous, and our users are
clamoring for the ability to use a handle.  Let's add a feature giving
them a default username and allowing them to switch once they connect
to the application.  Users should be able to enter `/nick
desired_nickname_here` in order to switch nicknames.

### changes to `lib/chatServer.js`

We will add the logic for keeping track of and changing nicknames to
the `chat_server.js` file.  Use helper functions as needed.

* Add two variables in `chat_server.js` that will track nickname data.
  `guestnumber` should start at 1 and track the number of users who
  connect.  `nicknames` should be a hash, and will store the names of
  connected users. You can use the user's socket object's `.id`
  property as the key.

* Have the chat server listen for a `nicknameChangeRequest` event.
  The callback for this event will filter for allowed nicknames and
  then `emit` the appropriate `nicknameChangeResult` event.  Check
  that the requested nickname is not taken already, (you can iterate
  through the nicknames hash values,) and that is does not match the
  conventions of your guest nickname assignment. For example, if
  guests are given the nickname `guest_n_` with `n` being the
  incremented `guestnumber`, then a user should not be able to change
  their nickname to `guest123`.

  An example failure message could be sent like
  this:

  ```javascript
  socket.emit('nicknameChangeResult', {
    success: false,
    message: 'Names cannot begin with "Guest".'
  });
  ```

* When a user connects, you need to assign them a temporary guest
  nickname.  When doing this, increment the `guestnumber` variable,
  which you can then use when generating a unique guest nickname.  If
  this is successful, `emit` a `nicknameChangeResult` event and add
  the new nickname to the `nicknames` hash.
* Your users should be able to use special chat commands to do things
  like change nicknames.  To make a name change, a user should type
  `/nick newNicknameHere`, and that means your handler for the
  `message` event will now need to parse out regular chat input and
  commands prefixed with a `/`.  You can also append the user's
  nickname to their regular chat messages, grabbing it from the
  `nickNames` hash with `nickNames[socket.id]`.
* Lastly, when a user disconnects their nickname must be removed from
  the `nicknames` list and their departure announced to the room.

Test that guest nicknames are working before moving to the front-end
code.

Client side code needs to display a list of users in the room and
handle name change requests to the server.

### changes to `public/javascripts/chat.js`

* Add a function `processCommand` to run when the text input begins
  with a slash.  We want to allow for adding more commands in the
  future, but for now the function needs to `emit` a
  `nicknameChangeRquest` event if the command is `nick` or display an
  error message if the command is not recognized.

### changes to `public/javascripts/chat_ui.js`

* The function that processes user input should now delegate to
  `processCommand` rather than `sendMessage` if the input begins with
  a slash.

* Inside the `(document).ready(..)`, have the socket respond to the
  `nicknameChangeResult` event by logging the nickname change.

Once again, try out the new functionality and debug before moving on.

If you are working on a git branch for this phase, remember to merge
the branch into master and change to a new branch before starting
Phase 5.

## Phase V: Multiple Rooms

Up until now, all the messages have been sent to all users.  Socket.IO
supports splitting connections up between many *rooms*.

Here; have some [documentation about rooms in Socket.IO][socket-io-rooms-docs].

[socket-io-rooms-docs]: http://socket.io/docs/rooms-and-namespaces/#rooms

### Adding the functionality to `lib/chat_server.js`

* Just like we track the current nickname of each connected user in
  the `nicknames` variable, let's track the current room of each user
  in a `currentRooms` hash.
* Write a `joinRoom` helper method that will have a socket `join` the
  specified room and update the `currentRooms` hash.
* Automatically have connecting users `join` a `lobby` room when they
  first connect.

* Change all the `io.emit(...)` events to broadcast only to
  the room specified in the message data:

```javascript
  io.to('some room').emit('message', {
    text: (nicknames[socket.id] + ": " + message.text)
  });
  ```

* Add a helper function to `handleRoomChangeRequests`.  To start,
  let's assume that users can only subscribe to one room at a time.  A
  successful request to `/join room_name_here` will cause their socket
  to `leave` the old room and join the chosen room name.

### Adding to `public/javascripts/chat.js`

* Your `Chat` class should now store a reference to the room, send out
  the room as part of each `message`, and handle the command `/join
  room_name_here` as part of it's `processCommand` method.

### Who is in which room?

* Use the API for getting information about rooms to add a panel for
  displaying a list of users in each room.  You will need to have your
  client-side javascript listen for a `roomList` event to update the
  user interface.
* The server-side `chat-server` code will need to send the `roomList`
  event with data about rooms and users whenever a new socket connects
  and when a user changes rooms.

Being able to see what rooms users are in will make debugging and
testing much easier!

## Phase VI: More Features

* Refactor the nickname management functionality in the `chat_server.js`
  file to be a class `NicknameManager` with attributes and methods.

* CSS and styling (serve CSS and images as static files). Make a sidebar!
* Private messages between users.
* Allow users to subscribe to multiple chat rooms, and use client-side
  jQuery to allow them to switch between tabs for viewing the
  different rooms.

## Testing your chatroom from across the world (or room)

You can visit the chatroom from two machines on the same network, even
when the `node.js` server is just running on localhost.  Type the
command `ifconfig` into terminal, and note the number that is your IP
address.  (It will probably be next to the word `inet` and use a
format of `###.#+.#+.#+`.  It is not `127.0.0.1`: that is your
localhost address.)

Start up your server with `node lib/app.js`.  On another machine, visit
`http://__your_ip_address_here:your_port_here`, and test the basic
chat functionality.

If the other computer can't connect, you may not be connected to the
same access point. Instead, use [ngrok][ngrok] to allow anyone on the
internet to connect to your local server with a special URL.
Seriously, this thing is a gem.

[ngrok]: https://ngrok.com

####Heroku deployment
Deploying to Heroku is a breeze using [this guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs#prepare-the-app) except for one 'gotcha'.  When you declare a port to listen to in app.js, be sure to listen to the port Heroku gives you:
```javascript
server.listen(process.env.PORT || 8000);
```
This will check first if there is an environment variable for the PORT (automatically assigned by Heroku).  Lacking that, since you're probably running the app locally, it will set it the hardcoded port of your choosing.

