//db.js
//reads and writes from/to a persistent storage
var fs = require("fs");
var users=require("./users");

const USERS_FILE_NAME = "db/users.json";

function getUsers ()
{
	var data = fs.readFileSync(USERS_FILE_NAME);
    var dbusers={};
		
	if (!data)
		return users;
		
	try 
	{
		dbusers = JSON.parse(data);			
	}
	catch (err) 
	{
		console.log("There has been an error parsing "+USERS_FILE_NAME);
		console.log(err);
	}
	return dbusers;
}

function updateUsers (users)
{
	try
	{
		fs.writeFile(USERS_FILE_NAME, JSON.stringify(users), 'utf8',function () {console.log("UPDATED USERS DB.");});		
	}
	catch (err) 
	{
		console.log("There has been an ERROR WRITING USERS to file "+USERS_FILE_NAME);
		console.log(err);
	}
}

exports.getUsers = getUsers;
exports.updateUsers = updateUsers;