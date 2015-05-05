# Starting This App

0. `npm install`
0. `node .` 

# Node.js Chat App

## Overview

This project involves writing a minimalist chatting app, and the
frequent small events involved in chatting functionality make it a
great fit for Node.js.

## Phase I: Setup

Start with the following directory structure:

```
//my_chat_app/
//|
//--lib/
//  |
//  --app.js
//  --chat_server.js
//--public/
//  |
//  --javascripts/
//    |
//    --chat_ui.js
//    --chat.js
//  --index.html
```

Node.js doesn't require any specific structure for your app, but we
are going to follow convention by using this structure.

### `package.json`

Run `npm init` to build your package json (you can give the default
answer for most of the questions by just pressing enter for all of the
prompts).

Add a [package.json][package_json] file to your root
directory, and list "socket.io" version "1.3.x", "mime" version
"~1.2.7", and "node-static" version "^0.7.4" as dependencies.  We'll be using Socket.IO to add
cross-browser support for websockets, and the "mime" library will
allow us to set the MIME types when serving static files.  Once the
package.json file is complete, run `npm install` (think bundle
install) from the command line.

This will create a `node_modules` directory with your dependency
scripts.  Add a [`.gitignore`][gitignore] with `node_modules` in it;
we're not going to commit the vendor libraries to github.

[gitignore]: http://www.sujee.net/tech/articles/gitignore/
[package_json]: https://www.npmjs.org/doc/files/package.json.html

## Phase II: Serving Static Files

**You will use the [node-static library][node-static] to serve static files.**

Node has a very powerful http module which can be used to respond to http
requests. For today's project we'll be sending back the contents of some
static files. One great node module for serving static files is `node-static`.
The code below will serve up the files in the `public` directory.

```javascript
// lib/app.js
var http = require('http'),
  static = require('node-static');

var file = new static.Server('./public');

var server = http.createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
});

server.listen(8000);
```

[node-static]: https://github.com/cloudhead/node-static

### `public/index.html`

Add an `index.html` file to act as the root page for your app.
Include `jquery` to start with, and as we add client-side javascript
files be sure to include them in the `<head>` element of your html
page.

Add some html to create a place to display messages and a form for
inputing messages, but don't worry too much about styling or css.

Test out the static file serving: Start up the server with `node
lib/app.js` and visit `http://localhost:8000/`.

[node-js-synopsis]: http://nodejs.org/api/synopsis.html

## Phase III: Basic Chat Functionality

We'll be using Socket.IO to implement chatroom functionality. Socket.IO
is composed of two parts.

1.  A server that integrates with (or mounts on) the Node.JS HTTP Server.
2.  A client library that loads on the browser side.

Let's start with the server.

### `lib/chat_server.js`

Start a file for the Socket.IO server, and require the `socket.io`
library.  You'll set up your server in this file and then export a
`createChat` function that can be called in the main `app.js` file.

The [Socket.IO documentation][socket-io-docs] has many examples of
setting up a server.  Here's one:

```javascript
var io = require('socket.io')(server);

io.on('connection', function (socket) {
  socket.emit('some_event_name', { hello: 'world' });
  socket.on('some_other_event_name', function (data) {
    console.log(data);
  });
});
```

The `socket.io` server piggybacks off of a `server`
defined with `http` such as the one you defined in `app.js` using the
node-static library. In our code, we'll separate the logic for the
socket.io server into a `chat_server.js` file.

Because *your* socket.io server is in another file, you will need to
`require('./chat_server')` in your `app.js` file.  In
`chat_server.js`, define a function `createChat` that takes a server
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

Test that your code works by firing up your server with a special debug command:

```
$ DEBUG=socket.io:* node lib/app.js
```

You should see an output similar to the following:

```
$ DEBUG=socket.io:* node lib/app.js
  socket.io:server initializing namespace / +0ms
  socket.io:server creating engine.io instance with opts {"path":"/socket.io"} +4ms
  socket.io:server attaching client serving req handler +2ms
```

[socket-io-docs]: http://socket.io/docs/

## Client-side

Next, we need the client-side JavaScript to support sending messages
to the server and displaying messages received from the server.

Require the socket.io library in the head of your index.html file.
Check the docs on how to do this.  You should now have a global
function called `io` in your client-side code.

Test it out!  Open your index page, and run `io()` in the chrome developer
console. See if you can make the server print something out when it
connects. If all is well, invoking `io()` should log:
`Socket {io: Manager, nsp: "/", json: Socket, ids: 0, acks: Object…}`.


### `public/javascripts/chat.js`

Use the module pattern to namespace this client-side javascript.

In a new file `public/javascripts/chat.js`, make a class constructor
`Chat` that receives socket as an attribute and stores it for later.

Add a `sendMessage` method to the `Chat` class for transmitting a
message to all users.  Use the `emit` method to emit the `message`
event with the text of the message.

### `public/javascripts/chat_ui.js`

In a separate file we'll write the code to actually interact with the
HTML user interface.

You'll be using an instance of the `Chat` class to send messages to
the server.  Get the socket to pass into it by calling `var socket =
io();`.

Write some helper functions that will:
 * get the message from the input form
 * send the message to other users (calling the `sendMessage` method
   of the Chat object,)
 * add it to the top of the display area for that user

Make sure to add the necessary HTML to your index page as well.

When dealing with untrusted data, (which is any data input or affected
by the user), you must be careful to escape any HTML or JavaScript
characters.  Use the `jquery` `.text` rather than the `.html` method
to add untrusted data to your page.
[This JSFiddle][escaping-with-jquery] demonstrates why.

This file is a fine place to initialize a socket.io connection on
document ready and tell it to listen for the `message` event.  You
will need to append new messages to the chat window when they are
received.  This could also be implemented as a method on the `Chat`
class object.

Finally, bind the `submit` event of the `send-message` form to trigger
the processing of user input.  Remember to wait until the form is on
the page and the document is ready before attempting to bind events to it.

You'll need to require the scripts `chat.js` and `chat_ui.js` in your
`index.html` file, as well as requiring the `socket.io` library.

[escaping-with-jquery]: http://jsfiddle.net/b6PW2/


## Phase IV: Nicknames for Users

In this app, the client-side and server-side javascript each listen
for and respond to events.  To implement any feature, you must add the
logic on each side to listen for and respond to the event.

The chat room right now is totally anonymous, and our users are
clamoring for the ability to use a handle.  Let's add a feature giving
them a default username and allowing them to switch once they connect
to the application.  Users should be able to enter `/nick
desired_nickname_here` in order to switch nicknames.

### changes to `lib/chat_server.js`

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

