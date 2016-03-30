jQuery(function($){
			var socket = io.connect();
			var $nickForm = $('#setNick');
			var $nickBox = $('#nickname');
			var $nickError = $('#nickError');
			var $users = $('#userlist');
			var $messageForm = $('#send-message');
			var $messageBox = $('#message');
			var $chat = $('#chat');
			var height = 0;
			var connected = false;
			
			//adds red font to the error message when a username is taken
			document.getElementById("nickError").style.color = "red";
			
			
			//this function doesn't allow white space upon entering username
			$(function() {
				$('#nickname').on('keypress', function(e) {
					if (e.which == 32)
						return false;
				});
			});
			
			
			$('#chat_container').hide(); //hide the chat window until username is entered
			$nickForm.submit(function(e){
				e.preventDefault();
				socket.emit('new user', $nickBox.val(), function(data){
					if(data){
						$('#nickWrap').hide();
						$('#chat_container').show();
						$("body").css("background-image", "url('')");
						$("body").css("background-color", "#2c3e50")
						$('.lead').hide();
						connected = true;
					}else{
						$nickError.html('Invalid username!');
					}
				});
				$nickBox.val('');
			});
			
			$('#chat').each(function(i, value){
				height += parseInt($(this).height());
			});
			height += '';
			
			$messageForm.submit(function(e){
				e.preventDefault();
				
				socket.emit('send message', $messageBox.val(), function(data){
					$chat.append('<span class = "error"><b>' +data+ "</span><br/>");
					$('#chat').stop(true, false).animate({scrollTop: height});
				});
				$messageBox.val('');
				
			});
			
			socket.on('usernames', function(data){ //take the nickname array and add/delete in userlist window
				var html = '';
				for(i=0; i < data.length; i++){
					html += '<b>' + data[i] + '</b>' + '<br/>';
				}
				$users.html(html);
			});
			
			socket.on("update1", function(msg){
				$chat.append("<b>" + msg + "</b><br>");
			});
			
			socket.on("update2", function(msg){
				$chat.append('<span class = "update2"><b>' +msg+ "</span><br>");
				$('#chat').stop(true, false).animate({scrollTop: height});
			});
			
			
			socket.on("dcupdate", function(msg){
				if (connected){
				$chat.append('<span class = "update2"><b>' +msg+ "</span><br>");
				$('#chat').stop(true, false).animate({scrollTop: height});}
			});
			
			socket.on('new message', function(data){
				$chat.append("<li><strong><span class='text-success'>" + data.nick + "</span></strong>: " + data.msg + "</li>"); //sends to the chat window Username: Message
				$('#chat').stop(true, false).animate({scrollTop: height});
			});
		});	