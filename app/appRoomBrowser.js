//appRoomBrowser - manipulates users and rooms

var userdef=require("./users");

// users.UserStats;
// users.User
var roomdef=require("./rooms");

var db = require ("./db"); 

const MAX_PLAYERS = 2;

var appRoomBrowser = {	
	users: {} ,  //of class User - complete user information of currently logged in users	- User object by unique user name
	rooms: {}, //of class Room -  hash table key - room alias	- room plus roomOwner name
	
	init: function ()  //is called when server starts - from connection initialize
	{
		//load users, games 
		this.dbManager = require ("./db");	
		
		//read users into users object
		this.users= this.dbManager.getUsers();		
	},

	getUser: function (clientData)
	{
		var name = clientData.name;
		
		//new user
		if (!this.users.hasOwnProperty (name))
		{
			console.log("First-time user - not in database");
			this.users[name] = new userdef.User(name);			
			this.users[name].stats = new userdef.UserStats();	
			db.updateUsers(this.users);	
		}		
		
		return this.users[name];
	},
	
	getRooms: function ()
	{
		return this.rooms;
	},	
	
	addRoom: function (ownerName, gameOption) 
	{
		var newAlias="room"+ownerName;
		if (this.rooms.hasOwnProperty(newAlias))
			return null;
		this.rooms[newAlias]=new roomdef.Room(newAlias);								
			
		this.rooms[newAlias].players.push (this.users[ownerName]);
		this.rooms[newAlias].title = "Room of "+ownerName;
		this.rooms[newAlias].status="open";		
		this.rooms[newAlias].gameOption = gameOption;
		
		this.users[ownerName].assignedRoomAlias=newAlias;
		return this.rooms[newAlias];
	},
	
	removeRoom: function (roomAlias) 
	{
		if(this.rooms[roomAlias])
		{
			for(var i=0; i<this.rooms[roomAlias].players; i++)
				this.rooms[roomAlias].players[i].assignedRoomAlias="";
			delete this.rooms[roomAlias];
		}
	},
	
	joinRoom: function (roomAlias, name) 
	{
		var room=this.rooms[roomAlias];
		if(room.players.length === MAX_PLAYERS)
			return null;
			
		var user=this.users[name];	
		
		room.players.push (user);
		if(room.players.length === MAX_PLAYERS)
			room.status = "full";
		
		return this.rooms[roomAlias];
	},

	leaveRoom: function (roomAlias, name) 
	{
		var room=this.rooms[roomAlias];
					
		var user=this.users[name];	
		
		var userFound = false;
		for (var i=0;i<room.players.length && !userFound; i++)
		{
			if (room.players[i].name === name)
			{
				room.players.splice(i,1);
				userFound = true;
			}
		}
		
		room.status = "open";
		this.rooms[roomAlias] =room;
		return room;
	},

	startGameInRoom: function (roomAlias, gameOption)
	{
		var room = this.rooms[roomAlias];
		var gamedef = require ("./appGame");
		room.game = new gamedef.Game ();
		room.game.init (room.players);
		room.game.setupGame(gameOption);

		return room;
	},
	
	updateGameInRoom: function (roomAlias, clientData)
	{
		var room = this.rooms[roomAlias];
		
		var updatedData = room.game.update (clientData);
		return updatedData;  
		
	},

	updateRoundInRoom: function (roomAlias,clientData) {
		var room = this.rooms[roomAlias];
		var updatedData = room.game.nextRound(clientData);
		return updatedData;
	},

	updateTimerInRoom: function(roomAlias,clientData) {
		var room = this.rooms[roomAlias];
		var updatedData = room.game.updateTimer(clientData);
		return updatedData;
	},
	
	leaveGame: function (name)
	{
		//this.users[name].stats.addStats(false, true);			
		//db.updateUsers(this.users);	
	}
};

module.exports = appRoomBrowser;