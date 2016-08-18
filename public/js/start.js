var socket = io();

const TIME_PER_QUESTION = 10000;
const TIME_WAIT_TO_PLAY = 5000;

var interval = setInterval(function() {
    if(document.readyState === 'complete') {
        clearInterval(interval);
		$('#loading').fadeOut('slow', function(){
			$('#logo').fadeIn('slow');
		});

    }
}, 2000);

socket.on('updatechat', function (username, data) {
	$('#debug-log').prepend('<p><b>'+ username + ':</b> ' + data + '<br></p>');
});

socket.on('updateroom', function (room) {
	$('#debug-room').prepend('<p>'+ room +'</p>');
});

socket.on('updateuser', function(usernames){
	$('#friends .list').html('');
	$.each(usernames, function(username, data) {
		$('#friends .list').prepend(createUser(data));
	});
});

socket.on('roomCurrent', function(room){
	socket.room = room;
});

socket.on('joinRoom', function(data){
    if(data.room == data.name){
        $('#wait .name.user1').html(data.name);
        $('#wait .name.user2').html('Đang chờ...');
    }else{
        $('#wait .name.user1').html(data.room);
        $('#wait .name.user2').html(data.name);
    }
});

$('#btn-login').click(function(){
	socket.username = $('#username').val();
	socket.emit('adduser', socket.username);
	$('#logo').fadeOut('slow',function(){
		$('#control').fadeIn('slow', function(){
			$('#search').fadeIn('slow', function(){
				$('#friends').fadeIn('slow');
			});
		});

	});
});

$('#autoplay').click(function(){
	play();
});

socket.on('question', function (questionlist) {
	var second = TIME_WAIT_TO_PLAY / 1000;
	$('#wait .vs-icon img').fadeOut('slow', function(){
		$('#wait .vs-icon span').fadeIn('slow', function(){
			countdownTime(second, '#wait .vs-icon span');
			setTimeout(function(){
				$('#wait').fadeOut('slow',function(){
					$('#wait .vs-icon img').css('display','block');
					$('#wait .vs-icon span').css('display','none');
					$('#wait .vs-icon span').html('5');
					$('#play').fadeIn("slow", function(){
						updateQuestion(questionlist, 0, TIME_PER_QUESTION);
					});
				});
			},TIME_WAIT_TO_PLAY);
		});
	});
});

socket.on('updatescore', function(score){
	var scoreUser2 = $('#play .score.user2');
	scoreUser2.html(parseInt(scoreUser2.html()) + score);
});

$('#invate .close').click(function(){
	$('#invate').fadeOut('slow');
});

$('.btn-invate').click(function(){

});

socket.on('invate', function(userInvate){
	$('#invate p span.name').html(userInvate);
	$('#invate').fadeIn('slow');
});

function createUser(data){
	var html = '';
	html += '<li>';
	html += '<img class="avatar" src="' + data.avatar + '">';
	html += '<div class="info">';
	html += '<p class="name">' + data.name + '</p>';
	html += '<p class="level">' + data.level +'</p>';
	html += '</div>';
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
	html += '<button class="btn-invite" data-id="' + data.socketId + '" onclick="invate(this)"><img  src="' + imgvs + '"></button>';
	html += '</li>';
	return html;
}

function updateQuestion(questionlist, number, time){
        var char = 'A';
    	$('#play .question').html('');
    	$('#play .answer').html('');
    	$('#play .question').append('<p class="text" data-id="' + number + '" data-correct="' + questionlist[number].correct + '">' + questionlist[number].question +'</p>');
    	$.each(questionlist[number].answer, function(key, value) {
    		$('#play .answer').append('<button class="text" data-id="' + key + '" onclick="answer(this)">' + char + '. '+ value +'</button>');
    		char = String.fromCharCode(char.charCodeAt() + 1);
    	});
    	var second = time / 1000;
        $('#play .board').fadeIn('slow', function(){
            $('#play .countdown span').fadeIn();
    	    countdownTime(second, '#play .countdown span');
        });
	if(number < questionlist.length - 1 ){
        setTimeout(function(){
            setTimeout(function(){
                $('#play .countdown span').fadeOut();
                $('#play .board').fadeOut('slow',function(){
                    number++;
                    updateQuestion(questionlist, number, time);
                });
            },2000);
        }, time);
	}else{
        setTimeout(function(){
    		setTimeout(function(){
    			$('#play').slideUp('slow', function(){
    				var myScore = $('#play .score.user1').html();
    				var yourScore = $('#play .score.user2').html();
    				$('#over .score').html(myScore);
    				if(parseInt(myScore) > parseInt(yourScore)){
    					$('#over .status').html('Xin chúc mừng! Bạn là người chiến thắng!');
    				}else if(parseInt(myScore) < parseInt(yourScore)){
    					$('#over .status').html('Bạn đã thua! Hãy chơi lại để trả thù!');
    				}else{
    					$('#over .status').html('Hòa nhau!');
    				}
    				$('#over').fadeIn('slow');
    			});
    		}, 2000);
        }, time);
	}
}

function switchRoom(room){
	socket.emit('switchRoom', room);
}

function answer(button){
	var answer = $(button).data('id');
	var correct = $('#play .question p.text').data('correct');
	if(answer == correct){
        $(button).addClass('success');
		var scoreUser1 = $('#play .score.user1');
		scoreUser1.html(parseInt(scoreUser1.html()) + 1);
		socket.emit('answer',socket.room);
	}
}

function countdownTime(second, display){
	if(second >= 0){
        $(display).html(second);
		setTimeout(function(){
            second--;
			countdownTime(second, display);
		}, 1000);
	}
}

function play(){
	$('#friends').fadeOut('slow', function(){
		$('#search').fadeOut('slow',function(){
			$('#control').fadeOut('slow',function(){
				$('#wait').fadeIn("slow", function(){
					socket.emit('switchRoom', socket.username);
				});
			});
		});
	});
}

function invate(button){
	socket.emit('invate',{
		userA : socket.username,
		userB : $(button).data('id')
	});
}
