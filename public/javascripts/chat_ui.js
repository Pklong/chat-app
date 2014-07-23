/*globals $, _ */

(function (root) {
  var App = root.App = (root.App || {});

  var ChatUI = App.ChatUI = function (chat) {
    this.chat = chat;
    this.$messages = $('#messages');
    this.$rooms = $('#rooms');
    this.$newMessage = $('#new-message');
    this.messageTemplate = _.template($('#message-tmpl').html());
    this.roomTemplate = _.template($('#room-tmpl').html());

    this.registerHandlers();
  };

  _.extend(ChatUI.prototype, {
    registerHandlers: function () {
      var chatUi = this;

      this.chat.socket.on('message', function (message) {
        var msg = chatUi.messageTemplate(message);
        chatUi.$messages.append(msg);
      });

      this.chat.socket.on('nicknameChangeResult', function (result) {
        if (result.success) {
          var $div = $('<div>');
          $div.text(result.text);
          chatUi.$messages.append($div);
        }
      });

      this.chat.socket.on('roomList', function (roomData) {
        console.log(roomData);
        chatUi.updateRoomList(roomData);
      });

      $('#send-form').on('submit', function (event) {
        event.preventDefault();
        chatUi.processInput();
      });
    },

    processInput: function () {
      var text = this.$newMessage.val();
      if (text[0] === '/') {
        this.chat.processCommand(text.slice(1));
      } else {
        this.chat.sendMessage(text);
      }
      this.$newMessage.val('');
    },

    updateRoomList: function (roomData) {
      this.$rooms.empty();
      console.log(roomData);
      for(var room in roomData) {
        var content = this.roomTemplate({
          name: room,
          usernames: roomData[room]
        });
        this.$rooms.append(content);
      }
    }
  });
}(this));
