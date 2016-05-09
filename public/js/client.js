$(document).ready(function (){
	var socket = io.connect();
	var $nickForm = $('#setNick');
	var $nickBox = $('#nickname');
	var $nickError = $('#nickError');
	var $users = $('#userlist');
	var $messageForm = $('#send-message');
	var $messageBox = $('#message');
	var $chat = $('#chat');
	var connected = false;
		
	/*---Navigation through website start---*/
	$("#about-link").click(function(){
		if($(this).hasClass("active")){
			$("#aboutpage").show(2000);
			$(".welcome-page").hide();
			$("body").css("background-image", "none");
			$("#chat-container").hide();
		}
	});

	$("#home-link").click(function(){
		if($(this).hasClass("active")){
			$(".welcome-page").show(2000);
			$("#chat-container").hide();
			$("body").css("background-image", "url('http://njtod.org/wp-content/uploads/2015/03/INDG_coworkingspacewlibrary_3-copy.jpg')");
		}
	});

	$("#enterchat").click(function(e){	
		e.preventDefault();
		if(!connected){
			$("#main-content").show(2000);
			$("#aboutpage").hide();
			$(".welcome-page").hide(2000);
			$("#chat-container").hide();
			$("#nickname").focus();
		}
		else{
			e.preventDefault();
			$("#main-content").hide();
			$("#aboutpage").hide();
			$(".welcome-page").hide();
			$("#chat-container").show(2000);
			$("#message").focus();
		}
	});
	/*---Navigation through website end---*/
			
	//adds red font to the error message when a username is taken
	document.getElementById("nickError").style.color = "red";
			
	//scrolls conversation screen to bottom upon data input
	$("#chat").bind("DOMSubtreeModified",function(){
		$("#chat").animate({
			scrollTop: $("#chat")[0].scrollHeight
		});
	});
	
	//function that eliminates special characters on the username input screen
	$('#nickname').bind('keypress', function (event){
		var regex = new RegExp(/[a-zA-Z0-9]+/);
		var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
		if (!regex.test(key)){
			event.preventDefault();
			
			return false;
		}
	});
	
	//Username create button functionality
	$nickForm.submit(function(e){
		e.preventDefault();
		socket.emit('new user', $nickBox.val(), function(data){
			if(data){
				$("#main-content").hide();
				$("#chat-container").show(2000);
				$("#message").focus();
				connected = true;
			}
			else{
				$nickError.html('Invalid username!');
			}
		});
		$nickBox.val('');
	});
			
	//Function that deals with the message sent by a user in the chat
	$messageForm.submit(function(e){
		e.preventDefault();
		socket.emit('send message', $messageBox.val(), function(data){
			$chat.append('<span class = "error"><b>' +data+ "</span><br/>");
		});
		$messageBox.val('');
	});
			
	socket.on('usernames', function(data){ //take the nickname array and add/delete in userlist window
		var html = '';
		for(i=0; i < data.length; i++){
			html += '<li class=\"list-group-item\"><span>' + '<b>' + data[i] + '</b>' + '</span> <i class=\"fa fa-' + '\"></i> ' + '<br/>';
		}
		$users.html(html);
	});
			
	socket.on("update1", function(msg){
		$chat.append("<b>" + msg + "</b><br>");
	});
			
	socket.on("update2", function(msg){
		if (connected)
			$chat.append('<span class = "update2"><b>' +msg+ "</span><br>");
	});
			
	socket.on("dcupdate", function(msg){
		if (connected)
			$chat.append('<span class = "update2"><b>' +msg+ "</span><br>");
	});
			
	socket.on('new message', function(data){
		$chat.append("<li id = 'msg'><strong><span class='text-success'>" + data.nick + ":</span></strong> " + data.msg + "</li>"); //sends to the chat window Username: Message
	});
	
	socket.on('whisper', function(data){
		$chat.append("<span class='whisper'><li id = 'whisper'><strong><span class='text-success'>" + data.nick + ":</span></strong> " + data.msg + "</li></span>");
	});
});	