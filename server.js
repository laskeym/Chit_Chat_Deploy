var express = require('express');
var	app = express();
var server = require('http').createServer(app);
var	io = require('socket.io').listen(server);
var url = require('url');
var	users = {};
	
var port = Number(process.env.PORT || 3000);
server.listen(port, function(){
	console.log('Listening on port: ' + port);
});

//define the public folder for the app
app.use(express.static(__dirname + '/public'));

//define the webpage routes
function app(req, res){
	var path = url.parse(req.url).pathname;

	switch(path){
		case '/about':
			break;
		default:
			app.get('/', function(req, res){
				res.send(__dirname + '\public\index.html');
			});
			break;
	}
}

//server code start
io.sockets.on('connection', function(socket){
	socket.on('new user', function(data, callback){
		if(data in users){	//if the nickname(data) entered exists in array, emit error 
			callback(false);
		} 
		else if (data.trim() === '')
			callback(false);
		else{ 
			callback(true);
			socket.nickname = data; //assign the nickname
			users[socket.nickname] = socket;
			//nicknames.push(socket.nickname); //push the nickname to the array
			socket.emit("update1", "You have connected to the server.");
			io.sockets.emit("update2", socket.nickname + " has connected to the server.");
			io.sockets.emit('usernames', Object.keys(users)); //send data to client side
		}
	});
	
	socket.on('send message', function(data, callback){
		var msg = data.trim();// takes care of empty white space before a message is sent
			//start
			/*if(msg.substr(0,3) === '/w '){
				msg = msg.substr(3);
				var ind = msg.indexOf(' ');
				if(ind !== -1){
					var name = msg.substr(0, ind);
					msg = msg.substr(ind + 1);
					if (name in users){
						users[name].emit('whisper', {msg: msg, nick: socket.nickname
						});
					}
					else{
						callback("error!  Enter a valid user!");
					}
				}
				else{
					callback("Error! Please enter a message for your whisper.");
				}
			}*/
			//end
			if(msg.substr(0) === ''){   //if the message being sent is equal to 0 characters
				callback('Error! Invalid Message');
			}
			else{
				io.sockets.emit('new message', {msg: msg, nick: socket.nickname}); //sends multiple data.  first argument is the message currently being sent by the client, the second argument is the username of the client
			}
			
	}); //Revisit to fix callback functionalities
	
	socket.on('disconnect', function(data){
		if(!socket.nickname) //if data doesn't match, return to initial state
			return;
		
		delete users[socket.nickname];
		//nicknames.splice(nicknames.indexOf(socket.nickname), 1); //delete the user from list by grabbing the element in the array where particular user's data is located 
		io.sockets.emit("dcupdate", socket.nickname + " has disconnected from the server.")
		io.sockets.emit('usernames', users); //send data to client side
	});
});

