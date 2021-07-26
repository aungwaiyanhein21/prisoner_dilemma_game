//clientConnectionManager.js
//manages socket emissions from client
//communicates only with appClient

var clientConnectionManager =
{	
	socket:null,	
	
	init: function ()
	{
		//establish connection 
		this.socket = io.connect();
		
		//set up socket listeners	
		this.socket.on("resp_session_id_assigned",function (session_id)
			{
				appClient.clientState = STATE_CONNECTED;
				console.log ("my client id is: "+session_id);
			}
		);	

		this.socket.on ('resp_login', function(user,rooms,error)   //returns user object+rooms
			{ 													
				if(!error)
				{
					console.log (user.name);
					appClient.me = user;  //here can write to cookie, to remember on next time connect
					appClient.clientState = STATE_ROOM_BROWSER;
					appClient.hideLoginPane();
					appClient.displayRooms(rooms);	
				}
				else
				{
					appClient.dosplayLoginError(error);
				}
			}
		);	

		this.socket.on('resp_new_room', function(newRoom, error) 
			{ 													
				if(!error)
				{
					console.log("Inside resp_new_room: created new room for "+appClient.me.name);	
					appClient.room = newRoom;
					appClient.displayRoom(newRoom);	
					appClient.clientState = STATE_IN_ROOM;	
				}
				else {
					alert(error);
				}
			}
		);	
		
		this.socket.on('resp_browser_update', function(rooms) 
			{ 
				console.log("Received notification abour new rooms");	
				if(appClient.clientState === STATE_ROOM_BROWSER)
				{
					console.log("resp_browser_update");		
					appClient.displayRooms(rooms);	
				}				
			}
		);	
		
		this.socket.on('resp_left_room', function(rooms) 
			{ 													
				
				if(appClient.clientState === STATE_IN_ROOM)
				{
					console.log("resp_left_room"+appClient.me.name);
					appClient.clientState = STATE_ROOM_BROWSER;
					appClient.room  = null;
					appClient.displayRooms(rooms);	
				}				
			}
		);	
		
		this.socket.on('resp_joined_room', function(joinedRoom)
			{
				console.log("resp_joined_room"+appClient.me.name);
				appClient.room = joinedRoom;
				appClient.displayRoom(joinedRoom);	
				appClient.clientState = STATE_IN_ROOM;	
			}
		);	
		
		this.socket.on('resp_room_update', function(updatedRoom)
			{
				
				if(appClient.clientState === STATE_IN_ROOM)
				{
					console.log("resp Room update"+appClient.me.name);
					appClient.room = updatedRoom;					
					appClient.displayRoom(updatedRoom);						
				}
			}
		);	
		
		this.socket.on('resp_room_deleted', function(rooms)
			{
				
				console.log("Client state is: "+appClient.clientState);
				
				console.log("room deleted");
			
				appClient.clientState = STATE_ROOM_BROWSER;
				appClient.room = null;
				
				if (appClient.game) {
					/*
					appClient.game.restartGame();
					appClient.game.state = 0;
					*/
					appClient.game.default();
					appClient.game = null;
				}
				
				appClient.displayRooms(rooms);
				appClient.hideGameHTML();	
				
				
				/*
				if(appClient.clientState === STATE_IN_GAME)
				{	
					appClient.clientState = STATE_ROOM_BROWSER;
					
					appClient.room = null;
					appClient.game = null;
					appClient.hideGameHTML();
					appClient.displayRooms(rooms);
				}
				*/
				
			}
		);	
		
		this.socket.on('resp_start_game', function(gameroom)  
			{	
				if(appClient.clientState === STATE_IN_ROOM)
				{	
					appClient.room = gameroom;
					//console.log("gameroom="+JSON.stringify(gameroom));
					//console.log("players="+JSON.stringify(gameroom.players));
					appClient.setupGame (gameroom); 					
					appClient.hideRoomBrowser();					
					appClient.clientState = STATE_IN_GAME;
				}
			}
		);	

		this.socket.on('resp_updated_game', function(updatedData)   
			{ 
				if (updatedData === null) {
					return;
				}

				if(appClient.clientState === STATE_IN_GAME)
				{	
					//console.log("inside resp updated game");
					//console.log(updatedData);				
					appClient.game.changeGameState(updatedData);
				}
			}
		);

		this.socket.on('resp_next_round', function(updatedData) {
				
			
			if(appClient.clientState === STATE_IN_GAME)
			{			
				if (updatedData !== -1) {
					console.log("inside resp_next_round");
					console.log(JSON.stringify(updatedData));
					appClient.game.nextRound(updatedData);
				}		
			}
		});

		this.socket.on('resp_timer_countdown', function(updatedData){
			if(appClient.clientState === STATE_IN_GAME)
			{			
				appClient.game.updateTimer(updatedData);
			}
		}); 
				
		this.socket.on('resp_restart_game', function(data) 
			{ 
				if(appClient.clientState === STATE_IN_GAME)
				{	
					appClient.game.restartGame(data);
				}
			}
		);	

		this.socket.on('resp_bacto_browser', function(rooms) 
			{	
				if(appClient.clientState === STATE_IN_GAME)
				{	
					appClient.clientState = STATE_ROOM_BROWSER;
					
					appClient.room = null;
					appClient.game = null;
					appClient.hideGameHTML();
					appClient.displayRooms(rooms);
				}
								
			}
		);
		
	},	
		
	requestLogin: function ()  //ends up in roomBrowser panel on success, or the same login screen with errors
	{
		var name = document.getElementById("name").value;
		if (!name) {
			appClient.renderer.displayLoginAlert(true);
			//alert ("Enter your name to login");
			return;
		}
			
		var userData = {"name":name};
		
		this.socket.emit('req_login',userData);
		
	},	
	
	requestNewRoom: function()
	{
		var gameOption = appClient.renderer.getGameOption();

		this.socket.emit('req_new_room', {'gameOption':gameOption});		
	},
		
	requestRoomBrowser: function()
	{
		this.socket.emit('req_room_browser'); 		
	},
	
	requestJoinRoom: function()
	{
		var roomAlias = appClient.getSelectedRoomAlias();
		if(roomAlias) //quitely ignore mindless pressing
		{
			this.socket.emit('req_join_room',roomAlias);
		}										
	},
	
	requestLeaveRoom: function()
	{
		this.socket.emit('req_leave_room',appClient.room.alias);
		appClient.clientState = STATE_ROOM_BROWSER;
	},
	
	requestStartGame: function ()
	{
		console.log("start game");
		if(appClient.room && appClient.room.status === "full") //&& appClient.room.players[0].name === appClient.me.name
		{
			this.socket.emit('req_start_game',appClient.room.alias,appClient.room.gameOption);
		}
	},	
	
	requestUpdateGameState: function(playOption)
	{
		if (appClient.clientState === STATE_ROOM_BROWSER || !(appClient.game)) 
			return;

		if(appClient.game.state !== 2 || playOption === undefined || playOption === "")
			return;

		console.log("inside request update game state");
		console.log(playOption);

		if(appClient.game.players[appClient.game.currentPlayerID].name === appClient.me.name)
		{
			console.log("in here")
			this.socket.emit('req_game_update', appClient.room.alias,{"playOption":playOption});
		}
	},
	
	requestRestartGame: function()
	{
		this.socket.emit('req_restart_game',appClient.room.alias);
	},
	
	requestBacktoRoomBrowser: function()
	{
		this.socket.emit('req_back_room_browser', appClient.room.alias); 		
	},

	requestNextRound: function() {
		if (appClient.clientState === STATE_ROOM_BROWSER || !(appClient.game)) 
			return;
		if(appClient.game.state !== 2)
			return;
		console.log("requesting next round");
		console.log(appClient.room.alias);
		clientConnectionManager.socket.emit('req_next_round', appClient.room.alias,{'currRound':appClient.game.currRound, 'questionNo': appClient.game.questionCounter});
	},

	requestUpdateCountDown: function(updatedTime) {
		if (appClient.clientState === STATE_ROOM_BROWSER || !(appClient.game)) 
			return;
		if(appClient.game.state !== 2)
			return;
		
		if(appClient.game.players[appClient.game.currentPlayerID].name === appClient.me.name)
		{
			this.socket.emit('req_timer_countdown', appClient.room.alias,{"updatedTime":updatedTime});
		}
	}
}