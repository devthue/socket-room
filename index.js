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
		question : "What your's name?",
		answer : [
			"Oke! and you?",
			"My name's Bang",
			"This is love",
			"I'm fine, thanks!"
		],
		correct : 1
	},
	{
		question : "1+1 = ? ",
		answer : [
			"2",
			"3",
			"0",
			"4"
		],
		correct : 0
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
		socket.emit('roomCurrent', socket.room);
		socket.emit('joinRoom', {
			room : socket.room,
			name : socket.username
		});
		socket.broadcast.emit('joinRoom', {
			room : socket.room,
			name : socket.username
		});
		if(empty_room != null){
			socket.emit('question', questionlist);
			socket.broadcast.to(newroom).emit('question', questionlist);
			empty_room = null;
		}else{
			empty_room = newroom;
		}
    });
	socket.on('answer', function(room){
		socket.broadcast.to(room).emit('updatescore',1);
	});
	socket.on('invate', function(data){
		io.sockets.in(data.userB).emit('invate', data.userA);
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

http.listen(8080, function(){
	console.log('listening on *:8080');
});
