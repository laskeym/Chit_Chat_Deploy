var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	nicknames = [];
	
server.listen(3000);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public'));


io.sockets.on('connection', function(socket){
	socket.on('new user', function(data, callback){
		if(nicknames.indexOf(data) != -1){	//if the nickname(data) entered exists in array, emit error 
			callback(false);
		} 
		else if (data.trim() === '')
			callback(false);
		else{ 
			callback(true);
			socket.nickname = data; //assign the nickname
			nicknames.push(socket.nickname); //push the nickname to the array
			socket.emit("update1", "You have connected to the server.");
			io.sockets.emit("update2", socket.nickname + " has connected to the server.");
			io.sockets.emit('usernames', nicknames); //send data to client side
		}
	});
	
	socket.on('send message', function(data, callback){
		var msg = data.trim();// takes care of empty white space before a message is sent
		
			// Below is the whisper aka private message function
			if(msg.substr(0) === ''){   //if the message being sent is equal to 0 characters
				callback('Error! Invalid Message');
			}else{
			io.sockets.emit('new message', {msg: msg, nick: socket.nickname}); //sends multiple data.  first argument is the message currently being sent by the client, the second argument is the username of the client
			}
	
	
	}); //Revisit to fix callback functionalities
	
	socket.on('disconnect', function(data){
		if(!socket.nickname) //if data doesn't match, return to initial state
			return;
		nicknames.splice(nicknames.indexOf(socket.nickname), 1); //delete the user from list by grabbing the element in the array where particular user's data is located 
		io.sockets.emit("dcupdate", socket.nickname + " has disconnected from the server.")
		io.sockets.emit('usernames', nicknames); //send data to client side
	});
});

