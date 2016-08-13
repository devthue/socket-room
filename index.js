var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var usernames = {};
var status = {};
var rooms = {};
var empty_room;

var questionlist = [
	{
		question : "How are you?",
		answer : [
			"I'm fine thanks",
			"Oke",
			"i love you",
			"See you again!",
		],
		correct : 0
	},
	{
		question : "What your name?",
		answer : [
			"I'm fine, thanks!",
			"My name Bang",
			"This is love",
			"Oke! and you?"
		],
		correct : 1
	}
];

io.sockets.on('connection', function(socket) {
    socket.on('adduser', function(username) {
        socket.username = username;
        socket.room = 'Global';
        socket.join('Global');
		usernames[username] = {
			name : socket.username,
			avatar : 'images/avatar.png',
			level : 50,
			status : 'online',
			socketId : socket.id,
		};
        socket.emit('updatechat', 'SERVER', 'you have connected to Global. ID: ' + socket.id);
        socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected to Global. ID: ' + socket.id);
		socket.broadcast.emit('updateuser',usernames);
		socket.emit('updateuser',usernames);
    });
	socket.on('switchRoom', function(newroom) {
		if(empty_room != null){
			newroom = empty_room;
		}
		var oldroom;
		oldroom = socket.room;
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
		socket.room = newroom;
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has connected to ' + newroom);
		socket.broadcast.emit('updateroom', newroom);
		socket.emit('updateroom', newroom);
		if(empty_room != null){
			socket.emit('question', questionlist);
			socket.broadcast.to(newroom).emit('question', questionlist);
			empty_room = null;
		}else{
			empty_room = newroom;
		}
    });
	socket.on('disconnect', function() {
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
		socket.broadcast.emit('updateuser',usernames);
		if(socket.username == null){
			socket.username = 'guest'
		}
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
