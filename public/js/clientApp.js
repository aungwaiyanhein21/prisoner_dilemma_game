//manages actions of a particular client, while he naviagates rooms

const STATE_DISCONNECTED = "disconnected";
const STATE_CONNECTED = "connected";
const STATE_ROOM_BROWSER = "roombrowser";
const STATE_IN_ROOM = "inroom";
const STATE_IN_GAME = "ingame";

var appClient = 
{
	state:STATE_DISCONNECTED,
	me: null,
	room: null,
	game:null,

	renderer: new DOMRenderer(),
	
	displayRooms: function (rooms)
	{
		this.renderer.showRoom();

		
		this.renderer.roomHeading("Room Browser");

		var browserElem = document.getElementById ("roomBrowser");

		var html = '';
		console.log(rooms);
		for(var alias in rooms){
				var currentRoom = rooms [alias];
				if(currentRoom)
				{
					if(currentRoom.status === "open")
						html+= '<p><input type="radio" id="rooms" name="rooms" value="'+alias + '" /><strong>' + currentRoom.title + '</strong>: '+ currentRoom.players.length + ' players. '+currentRoom.status + '. GameOption: ' + currentRoom.gameOption + '</p>';
					else  //cannot join -  do not display radio button	
						html+= '<p><strong>' + currentRoom.title + '</strong>: '+ currentRoom.players.length + ' players. '+currentRoom.status + '</p>';
					
				}					
		}

		html += '<h4>Select Game Option Before Creating Room</h4>';

		html += '<select id="gameOptions"><option value="highestScoreOption">Get highest total score</option><option value="sameScoreOption">Get same total score(win-win situation)</option></select>';

		this.renderer.showCreateJoinButtons(true);
		this.renderer.showStartLeaveButtons(false);
		
		browserElem.innerHTML = html;
	},
	
	dosplayLoginError: function(msg)
	{
		var loginErrElem = document.getElementById("loginAlert");		
		loginErrElem.innerHTML = msg;

		this.renderer.displayLoginAlert(true);

		this.renderer.clearInputs();
	},
	
	hideLoginPane: function()
	{
		this.renderer.hideLogin();

	},
	
	hideRoomBrowser: function()
	{
		this.renderer.hideRoom();
	},
	
	hideGameHTML: function ()
	{
		this.renderer.hideGame();

	},
	
	displayRoom: function (newRoom)
	{
		this.room = newRoom

		this.renderer.roomHeading(newRoom.title);

		var browserElem = document.getElementById ("roomBrowser");
		var html = '';

		html +='<div class="room">Room status: <em>'+newRoom.status +'</em> <br>Total players: '+newRoom.players.length+'</div>';
		
		html += '<p>GameOption: ' + newRoom.gameOption + '</p>';
		browserElem.innerHTML = html;

		this.renderer.showCreateJoinButtons(false);
		this.renderer.showStartLeaveButtons(true);
	},
	
	getSelectedRoomAlias: function ()
	{
		var radioButtons = document.getElementsByName('rooms');
		if(!radioButtons)
			return null;
        for(var k=0;k<radioButtons.length;k++)
		{
			if(radioButtons[k].checked){
				return radioButtons[k].value;
			}
		}
		return null;
	},
	
	setupGame: function (gameRoom)
	{
		var roomplayers = gameRoom.players;

		this.game = game;
		this.game.init (roomplayers);
		this.game.startGame(gameRoom.game);

		this.renderer.showCreateJoinButtons(false);
	}
};