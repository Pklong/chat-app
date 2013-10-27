var socket = io.connect();

var escapeDivText = function(text) {
	return $("<div></div>").text(text);
}

var processInput = function (chatApp) {
	var text = $('#send-message').val();
	chatApp.sendMessage(text);
  // $("#chat-messages").append(escapeDivText(text));
	$("#send-message").val('');
}

$(document).ready(function() {
	var chatApp = new Chat(socket);
	socket.on('message', function(message) {
		var newElement = escapeDivText(message);
		$("#chat-messages").append(escapeDivText(message.text));
	});
	$('.send-form').submit(function(e) {
		e.preventDefault();
		processInput(chatApp);
		return false;
	})
});