var socket = io.connect();

var escapeDivText = function(text) {
	return $("<div></div>").text(text);
}

var processInput = function (chatApp) {
	var text = $('#send-message').val();
	if(text[0] === '/'){
    chatApp.processCommand(text.slice(1));	  
	} else {
  	chatApp.sendMessage(text); 
	}
	$("#send-message").val('');
}

$(document).ready(function() {
	var chatApp = new Chat(socket);
	socket.on('message', function(message) {
		var newElement = escapeDivText(message);
		$("#chat-messages").append(escapeDivText(message.text));
	});
	socket.on('nicknameChangeResult', function(result) {
	  if(result.success){
	    $("#chat-messages").append(escapeDivText(result.text)); 
	  }
	});
	$('.send-form').submit(function(e) {
		e.preventDefault();
		processInput(chatApp);
		return false;
	});
});