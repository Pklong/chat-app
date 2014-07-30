/*globals $, _ */

(function (root) {
  var App = root.App = (root.App || {});

  var Chat = App.Chat = function (socket) {
    this.socket = socket;
    this.room = "lobby"; // TODO: how to set from server?
  };

  _.extend(Chat.prototype, {
    sendMessage: function (text) {
      this.socket.emit('message', {
        text: text,
        room: this.room
      });
    },

    joinRoom: function (room) {
      this.room = room;
      this.socket.emit('roomChangeRequest', room);
      this.sendMessage('Switched to ' + room);
    },

    processCommand: function (command) {
      var commandArgs = command.split(' ');
      switch (commandArgs[0]) {
      case 'nick':
        var newName = commandArgs[1];
        this.socket.emit('nicknameChangeRequest', newName);
        break;
      case 'join':
        var newRoom = commandArgs[1];
        this.joinRoom(newRoom);
        break;
      default:
        this.socket.emit('message', {
          text: "unrecognized command"
        });
        break;
      }
    }
  });
}(this));
