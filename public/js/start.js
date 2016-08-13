var socket = io();

socket.on('updatechat', function (username, data) {
	$('#debug-log').prepend('<p><b>'+ username + ':</b> ' + data + '<br></p>');
});

socket.on('updateroom', function (room) {
	$('#debug-room').prepend('<p>'+ room +'</p>');
});

socket.on('updateuser', function(usernames){
	console.log(usernames);
	$('#friends .list').html('');
	$.each(usernames, function(username, data) {
		$('#friends .list').append(createUser(data));
	});
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
			char = String.fromCharCode(char.charCodeAt() + 1);
		});
		$('#play').fadeIn("slow");
	});
});

$('#vs-mode').click(function(){
	$('#search').slideToggle(100);
});

$('#invite').click(function(){
	socket.emit('adduser', socket.username);
});

function createUser(data){
	var html = '';
	html += '<li>';
	html += '<div class="left">';
	html += '<img class="avatar" src="' + data.avatar + '">';
	html += '<p class="name">' + data.name + '</p>';
	html += '<p class="level">' + data.level +'</p>';
	html += '</div>';
	html += '<div class="right">';
	var imgvs;
	switch (data.status) {
		case 'online':
			imgvs = 'images/icon1.png';
			break;
		case 'waiting':
			imgvs = 'images/icon1.png';
			break;
		case 'offline':
			imgvs = 'images/icon1.png';
			break;
		default:
			imgvs = 'images/icon1.png';
	}
	html += '<img id="invite" src="' + imgvs + '" data-id="' + data.socketId + '">';
	html += '</div>';
	html += '</li>';
	return html;
}

function switchRoom(room){
	socket.emit('switchRoom', room);
}
