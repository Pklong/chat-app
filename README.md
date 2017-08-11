# Node.js Chat App

## Overview

This project involves writing a minimalist chatting app. The
frequent events involved in chatting functionality make it a
great fit for Node.js. 

Events are an essential aspect of understanding Node, just as client-side JS deals with `click`, `submit`, `focus`, etc. events, your server-side code will deal with events both pre-determined and custom-built.

## Phase I: Setup

Start with the following directory structure:

```
//ChatApp/
//|
//--package.json (lists dependencies and provides scripts)
//--webpack.config.js (bundles our client-side javascript)
//--app.js (general application setup)
//--lib/
//  |
//  --chatServer.js (logic for server-side chat)
//--public/
//  |
//  --stylesheets/
//    --main.css 
//  --javascripts/
//    |
//    --chatUI.js (for updating the DOM)
//    --chat.js (for communicating with server)
//    --index.js (webpack entry)
//    dist/
//    |
//    --bundle.js
//  --index.html
```

Node.js doesn't require any specific structure for your app, but we
are going to follow convention by using this structure. In particular, notice that 
we're seperating client-side and server-side JavaScript.

### `package.json`

0. `npm init -y`
0. `npm install --save` [socket.io][socket-doc] `express webpack`
0. `npm install --save-dev` [nodemon][nodemon-doc]

[socket-doc]: https://socket.io/docs/
[nodemon-doc]: https://nodemon.io/

## Phase II: Serving index.html & Static Files

Use the [express library][express-intro] to simplify routing. We need to serve `index.html` whenever a user makes a `GET` request to `/`. Our `index.html` will source static assets such as css files and client-side javascript. [Look here][express-static] to learn how to handle serving static assets.


`lib/app.js`
1) require express
2) create a new app with express
3) make the app use express' static middleware
4) define a route and callback on the app
    * callback should send the index.html file as a response
5) tell app to listen on a port (you'll visit the url => localhost:{PORT_NUMBER})


[express-intro]: http://expressjs.com/en/starter/hello-world.html
[express-static]: http://expressjs.com/en/starter/static-files.html

### `public/javascripts/index.js & public/javascripts/dist/bundle.js`

Load the bundle output from your webpack entry file `index.js`. Check out the [Socket.io docs][socket-io] for how to require their library in your `index.js`.

Add some html to create a place to display messages and a form for inputing messages.

Test out the static file serving. `nodemon app.js`. Console.log the `socket.io` library you required in your `index.js` to test everything is working properly.

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
   

`lib/chatServer.js`
1) require socket.io
2) export an object with a single function: listen
3) listen takes an http server as an argument
    * provide the server to socket.io to create your socket server
4) define an event listener on the server for any 'connection'
    * For now, just console.log "connected" in the callback

`app.js`
1) require your chatServer and invoke listen


Test that your code works!

[socket-io-docs-server]: https://socket.io/docs/server-api/

### `public/javascripts/chat.js`

In a new file `public/javascripts/chat.js`, make a class constructor
`Chat` that receives and stores a socket.

Add a `sendMessage` method to the `Chat` class for transmitting a
message to all users.  Use the `emit` method on the socket to emit the `message`
event with the text of the message.

### `public/javascripts/chatUI.js`

In a separate file we'll write the code to interact with the DOM.

`public/javascripts/chatUI.js`
1) receive socket in constructor and instantiate a Chat
2) store references to DOM in constructor for ease of use
3) Write functions to:
    * retrieve user input
    * emit messages submitted by user
    * add received messages to the display


## Phase IV: Nicknames for Users

Client-side and server-side JS each listen
for and respond to events.  To implement any feature, you must add the
logic on each side to listen for and respond to the event.

The chat room right now is totally anonymous, add a feature giving
users a default username and allow them to switch once they connect
to the application.  Users should be able to enter `/nick
desired_nickname_here` in order to switch nicknames.

### changes to `lib/chatServer.js`

We will add the logic for keeping track of and changing nicknames to
the `chatServer.js` file.  Use helper functions as needed.

`lib/chatServer.js`
1) Add variables to track number of guests and nicknames
    * guestNum starts at 1 and increments with each new connection
    * nickNames is an object storing the name under the socket's id
2) Listen for a nicknameChangeRequest event.
    * filter for allowed nicknames (no duplicates or confusion with defaults)
    * emit nicknameChangeResult event: success or failure, the client must know!
3) Upon connection, assign a temporary guest name using the guestNum variable
    * Logic is akin to changing a nickname (store name in hash, emit event, etc.)
4) You are now able to preface a user's msg with their name!
5) On 'disconnect', remove the user's nickname and announce departure to room


Test this server-side code before moving client-side.

### changes to `public/javascripts/chat.js`

`lib/chat.js`
1) Add a processCommand function
    * We're checking for a 'nick' after '/', but more commands will come...
    * Emit the appropriate event!


### changes to `public/javascripts/chatUI.js`


`lib/chatUI.js`
1) Adjust the function which processes user input to account for commands


### changes to `public/javascripts/index.js`


`public/javascripts/index.js`
1) When document is ready, set up appropriate event handlers
    * So far we have message events and name change events...
    * What should your UI do when these events come from your chat server?


Try out the new functionality and debug before moving on.

## Phase V: Multiple Rooms

Currently, all messages are sent to all users. Socket.IO
supports splitting connections up between *rooms*.

[Documentation about rooms in Socket.IO][socket-io-rooms-docs].

[socket-io-rooms-docs]: http://socket.io/docs/rooms-and-namespaces/#rooms

### Adding the functionality to `lib/chatServer.js`


`lib/chatServer.js`
1) Track the current room of each user in an object (similar to nicknames object)
2) Write joinRoom helper:
    * have socket join the provided room and update the currentRoom object
    * new users should join 'lobby' automatically
3) Adjust your chat broadcasts to [emit to rooms][emit-to-room]
4) Write a helper handleRoomChangeRequest
    * Successfully '/join'-ing a room will cause you to leave your current room


[emit-to-room]: https://socket.io/docs/server-api/#socket-to-room

### Adding to `public/javascripts/chat.js`


`public/javascripts/chat.js`
1) Adjust sendMessage to take an additional argument: 'room'
2) Write a function to handle changing rooms
    * ChatUI's processCommand can delegate to this function if '/join' occurs


### Who is in which room?


`lib/chatServer.js`
1) Search Socket.IO docs for information about who is in a room...
    * [Look here][room-info] and emit an appropriate response for client-side
    * Emit this event whenever users change rooms (joining 'lobby' counts!)
2) Listen for events asking which rooms are available
    * Your client-side JS will be asking for this information...
    
`public/javascripts/index.js`
1) have your socket intermittently ping the server to see if any new rooms exist


### Who left?

`lib/chatServer.js`
1) [disconnect][disconnect] is a reserved event your server should handle
    * Clean up all traces of the departing socket, reverse your 'connection' code


Test your code!

[disconnect]: https://socket.io/docs/server-api/#event-disconnect
[room-info]: https://socket.io/docs/server-api/#namespace-clients-callback

## Phase VI: More Features

* Host your application on Heroku, AWS, Digital Ocean, etc.
* CSS and styling (serve CSS and images as static files). Make a sidebar!
* Private messages between users.
* Attach a DB and persist messages!
