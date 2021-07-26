function User(name)
{	
	this.name=name;
	// this.email="";
	// this.password="";	
	this.stats={}; //of type UserStats
	this.assignedRoomAlias ="";
	this.sessionID ="";
}

function UserStats()
{
	this.played = 0;
	this.won = 0;
	this.left = 0;
	
	UserStats.prototype.addStats = function ( won, left)
	{
		this.played ++;
		
		if (won)
			this.won ++;
		
		if (left)
			this.left ++;			
	};
}


exports.User = User;
exports.UserStats = UserStats;
