//servConnectionManager.js
var port = 8888;
var httplibrary, socketlibrary, urllibrary, pathlibrary, fslibrary;

var httpserver;
var socketRouter;
var appRoomBrowser;


var sessions = {}; //hash table of all connected users per session id - the corresponding index in the array users  is assigned upon successful login, default guest ID -1, 
	//no features	
console.log(sessions);
	
function start () {
	httplibrary = require("http");
	urllibrary = require("url");
	pathlibrary = require("path");
	fslibrary = require("fs");
	appRoomBrowser = require ("./appRoomBrowser");	
	//loads into memory users 
	appRoomBrowser.init();
	
	//create http server and set up request handler
	httpserver = httplibrary.createServer( 
					function(request, response) {									
						httpRequestHandler(request, response); 
					}
				);

	httpserver.listen(port);  //http://127.0.0.1:8888/index.html?
	console.log("Server listening on port "+ port);	
		
	//set up socket listener
	socketlibrary = require("socket.io");
	
	socketRouter = socketlibrary.listen(httpserver);
	
	socketRouter.sockets.on ('connection', function (currentSocket) {
									socketEventHandler(currentSocket);
								} 
							);
	
}

//file extensions to add content-type to a header of the returning reaponse
var extensions =	{
						".html": "text/html",
						".css": "text/css",
						".js": "application/javascript",
						".png": "image/png",
						".gif": "image/gif",
						".jpg": "image/jpeg",
						".eot":"font/opentype",
						".ttf":"font/opentype",
						".woff":"font/opentype",
						".svg":"image/svg+xml"
					};


//some session-related util functions, which could have been better in a separate utils.js 
function alreadyLoggedIn(allsessions, name) {
	for (var session_id in allsessions) {
		// check if the property/key is defined in the object itself, not in parent
		console.log(session_id);
		if (allsessions.hasOwnProperty(session_id)) {           
			user = allsessions[session_id];
			if (user.name === name)
				return true;
		}
	}
	return false;
}	
	
//***************** here is where messages are sent to a specific client and are received from a specific client, and sometimes broadcasted to all players, or to players in the same room
function socketEventHandler (socket) {
	var sessionID = socket.id;
	console.log("CLIENT CONNECTED with socket.id="+sessionID); 
	
	if (!sessions.hasOwnProperty (sessionID)) {
		sessions[sessionID]=-1; //guest id assigned		
		socketRouter.to(sessionID).emit('resp_session_id_assigned', sessionID); //resp_session_id_assigned - to specific client	- 
	}

	socket.on('req_login', function (clientData) {			
			console.log("Login requested for user: "+clientData.name);
			var newuser = appRoomBrowser.getUser(clientData);
			
			if (!alreadyLoggedIn(sessions, newuser.name)){
				sessions[sessionID] = newuser;
				socketRouter.to(sessionID).emit('resp_login', newuser, appRoomBrowser.getRooms());	//resp_login - to a specific client	
			}
			else {
				socketRouter.to(sessionID).emit('resp_login', null, null, "User with this name is already logged in.");
			}		
		}
	);	
	
	socket.on('req_new_room', function (clientData) {
		var gameOption = clientData['gameOption'];

		console.log(sessions[sessionID].name +" new room ");
		var newRoom=appRoomBrowser.addRoom(sessions[sessionID].name, gameOption);  //creates default room and adds to rooms hashtable, returns new room to the user		
		if (newRoom) {
			socket.join(newRoom.alias);
			socketRouter.sockets.emit('resp_browser_update',  appRoomBrowser.getRooms());	//resp_browser_update - to all clients
			socketRouter.to(sessionID).emit('resp_new_room', newRoom, null);	//resp_new_room - to a specific client 		
		}
		else {
			socketRouter.to(sessionID).emit('resp_new_room', null, 'User can create only one room' );	//resp_new_room - to a specific client 
		}
	});		
	
	socket.on('req_join_room', function (roomAlias) {
		var name = sessions[sessionID].name;
		var room=appRoomBrowser.joinRoom(roomAlias,name);
		if(room) {
			console.log(name +" joined room "+roomAlias);
			appRoomBrowser.users[name].assignedRoomAlias=roomAlias;
			socket.join(room.alias);		
			socketRouter.sockets.in(room.alias).emit('resp_room_update',room);
			socketRouter.to(sessionID).emit('resp_joined_room', room);	//resp_joined_room - to a specific client
			socket.emit('resp_browser_update',  appRoomBrowser.getRooms());	//resp_browser_update - to all clients			
		}
	});
	
	socket.on('req_leave_room', function (roomAlias) {
		var room=appRoomBrowser.rooms[roomAlias];
		var name = sessions[sessionID].name;
		var user = appRoomBrowser.users[name];
		
					
		console.log(sessions[sessionID].name +" left room ");
		if(room && room.players) { // simplifying - room is deleted and needs to be recreated

			for(var i = 0; i < room.players.length; i++) { //when all disconnected, room will be cleared automaticlly				
				room.players[i].roomAlias="";
			}
				
			appRoomBrowser.removeRoom(roomAlias);
			socketRouter.sockets.in(room.alias).emit('resp_room_deleted', appRoomBrowser.getRooms());							
			
		}
			
	});
	
	//USER DISCONNECTED
	socket.on('disconnect', function () {
		var user=sessions[sessionID];
		
		if(user && user.name && appRoomBrowser.users[user.name]) {
			var roomAlias=user.assignedRoomAlias;
			//find if he was a part of a room
			if (roomAlias)
			{
				var room=appRoomBrowser.rooms[roomAlias];
				if (room) {
					for(var i = 0; i < room.players.length; i++) //when all disconnected, room will be cleared automaticlly
					{					
						room.players[i].roomAlias="";
					}	
				}
				appRoomBrowser.removeRoom(roomAlias);
							
				socketRouter.sockets.in(roomAlias).emit('resp_room_deleted',appRoomBrowser.getRooms());
				
			}
			appRoomBrowser.users[user.name].sessionID="";
		}
		delete sessions[sessionID];	
		console.log("DISCONNECTED USER name="+user.name+" session="+sessionID);
	});
	
	socket.on('req_start_game', function (roomAlias, gameOption) {
		console.log("Game started in room " + roomAlias);
		var room=appRoomBrowser.startGameInRoom(roomAlias,gameOption);
		console.log("Room:"+ JSON.stringify(room));
		socketRouter.sockets.in(roomAlias).emit('resp_start_game',room);
						
	});

	socket.on('req_game_update', function (roomAlias, clientData) {
		var updatedData=appRoomBrowser.updateGameInRoom(roomAlias, clientData);
		
		socketRouter.sockets.in(roomAlias).emit('resp_updated_game',updatedData);				
	});	

	socket.on('req_restart_game', function (roomAlias) {
		var room=appRoomBrowser.rooms[roomAlias];
		room.game.restartGame(roomAlias);
		
		var name = sessions[sessionID].name;
		appRoomBrowser.leaveGame (name);
		socketRouter.sockets.in(roomAlias).emit('resp_restart_game',room);				
	});

	socket.on('req_back_room_browser', function (roomAlias) {  //destroyng the room
		appRoomBrowser.removeRoom(roomAlias);
		socketRouter.sockets.in(room.alias).emit('resp_bacto_browser',appRoomBrowser.getRooms());
		var room=appRoomBrowser.rooms[roomAlias];
		for(var i = 0; i < room.players.length; i++) { //when all disconnected, room will be cleared automaticlly
			socketRouter.sockets.socket(room.players[i].sessionID).disconnect();
			room.players[i].roomAlias="";
		}
		
		socketRouter.sockets.emit('resp_browser_update',  appRoomBrowser.getRooms());	
	});	

	socket.on('req_next_round',function(roomAlias, clientData) {
		//console.log("roomAliasNextRound: "+ roomAlias);
		var updatedData=appRoomBrowser.updateRoundInRoom(roomAlias,clientData);
		console.log("req_next_round");
		console.log(updatedData);
		socketRouter.sockets.in(roomAlias).emit('resp_next_round',updatedData);	
	});

	socket.on('req_timer_countdown', function(roomAlias,clientData) {
		var updatedData=appRoomBrowser.updateTimerInRoom(roomAlias,clientData);

		socketRouter.sockets.in(roomAlias).emit('resp_timer_countdown',updatedData);	
	});
}

	//*************************************
function httpRequestHandler (request, response) { //serves pages and files on request
	//get requested files from http request
	var requestedURL =  urllibrary.parse(request.url,true);
	
	var path = requestedURL.pathname;
	
	// look for a requested filename in the URL, default to index.html
	var filename = pathlibrary.basename(path) || "index.html";
	
	var ext = pathlibrary.extname(filename);
	
	var dir = pathlibrary.dirname(path).substring(1);
	
	var localPath =  'public/'; // public folder contains the publicly visible front-end content - index.html, client js and images
	
	if (extensions[ext]) 
	{			
		localPath += (dir ? dir + "/" : "") + filename;
		
		fslibrary.exists(localPath, function(exists) 
		{
			if (exists) 
			{
				getFile(localPath, extensions[ext], response);
			} 
			else 
			{
				response.writeHead(404);
				response.end();
			}
		});
	}
}
	
function getFile (localPath, mimeType, response) {
	fslibrary.readFile(localPath, function(err, contents) {
			if (!err) 
			{
				response.writeHead(200, {
				"Content-Type": mimeType,
				"Content-Length": contents.length
				});
				response.end(contents);
			} else {
				response.writeHead(500);
				response.end();
			}
		}
	);
}


exports.start = start;