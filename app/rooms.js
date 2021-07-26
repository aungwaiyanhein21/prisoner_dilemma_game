function Room(alias)
{	
	this.alias=alias; //key
	this.players=[];
	this.title="";	
	this.status="";  //"open", "waiting", "full", "playing"
	this.game = null;
}

exports.Room = Room;


