var socket = io();

socket.on('updatechat', function (username, data) {
	$('#debug-log').prepend('<p><b>'+ username + ':</b> ' + data + '<br></p>');
});

socket.on('updateroom', function (room) {
	$('#debug-room').prepend('<p>'+ room +'</p>');
});

$('#btn-login').click(function(){
	socket.username = $('#username').val();
	socket.emit('adduser', socket.username);
	$('#logo').slideUp('slow',function(){
		$('#control').show('slow');
		$('#friends').show('slow');
	});
});

$('#autoplay').click(function(){
	$('#control').slideUp('slow',function(){
		$('#search').slideUp('slow');
		$('#friends').slideUp('slow', function(){
			$('#wait').fadeIn("slow", function(){
				socket.emit('switchRoom', socket.username);
			});
		});
	});
});

socket.on('question', function (questionlist) {
	$('#wait').slideUp('slow',function(){
		var number = 0;
		var char = 'A';
		$('#play .question').append('<p class="text">' + questionlist[number].question +'</p>');
		$.each(questionlist[number].answer, function(key, value) {
			$('#play .answer').append('<p class="text">' + char + '. '+ value +'</p>');
			char = String.fromCharCode(char.charCodeAt() + 1)
		});
		$('#play').fadeIn("slow");
	});
});

$('#vs-mode').click(function(){
	$('#search').slideToggle(100);
});

function switchRoom(room){
	socket.emit('switchRoom', room);
}
