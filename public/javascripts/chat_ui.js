var socket = io.connect();

var escapeDivText = function(text) {
	return $("<div></div>").text(text);
}

var processInput = function (chatApp, socket) {
	var text = $('#send-message').val();
	chatApp.sendMessage(text);
	$("#content").append(escapeDivText(text));
	$("#send-message").val('');
}

$(document).ready(function() {
	var chatApp = new Chat(socket);
	
	socket.on('message', function(message) {
		var newElement = escapeDivText(message.text);
		$('#content').append(newElement);
	});
	$('.send-form').submit(function(e) {
		e.preventDefault();
		processInput(chatApp, socket);
		return false;
	})
});