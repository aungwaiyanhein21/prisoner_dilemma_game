const NOGAME_STATE = 0;
const GAMEOPTION_STATE = 1;
const INGAME_STATE = 2;
const ENDGAME_STATE = 3;


const NO_OF_ROUND = 3;

const MAX_TIMER = 30; //in seconds

function Game()
{
	this.MAX_PLAYERS =2;

	this.state = NOGAME_STATE,
	this.players = [];
	this.currentPlayerID=0;

    this.board = null;
    this.currRound = 1;

    this.countDownID = undefined;

    this.questionCounter = 0;

    this.scores = {}; //scores for each question and for each player
    this.restartState = false; //tells whether the game is new or restarted game

	this.gameOption = undefined; // game option that both players play
	
	this.currRoundRequested = {};
	
	Game.prototype.init = function (roomPlayers)
	{
		var playerdef = require("./PDplayer");
		this.players [0] = new playerdef.Player (1, roomPlayers[0].name, "Player 1");
		this.players [1] = new  playerdef.Player (2, roomPlayers[1].name, "Player 2");
		
	};
	
	Game.prototype.setupGame = function (gameOption)
	{
		var board = require("./appBoard");

		this.currentPlayerID =0;
		this.questionCounter = 0;
		
		this.state = INGAME_STATE;
		
		if (this.board === null) { //if the board object has not been created before
			this.board = new board.Board ();
		}

		this.initializeScores();

		this.gameOption = gameOption;
		
	};

	Game.prototype.restartGame = function() {
		this.board.cardsArr = []; //empty the cards array

		this.currentPlayerID =0;
		this.questionCounter = 0;
		
        this.state = INGAME_STATE;
        this.currRound = 1;
        this.questionCounter = 0;
		this.scores = {};
		this.currRoundRequested = {};
		
		this.initializeScores();

        this.restartState = true;
	};
	
	Game.prototype.nextPlayer = function ()
	{
		this.currentPlayerID++;
		if (this.currentPlayerID === this.players.length)
			this.currentPlayerID = 0;		
	};
	
	Game.prototype.update = function  (clientData)
	{		
		if ( this.state !== INGAME_STATE)
			return;	

		var status = clientData.playOption;


        this.players[this.currentPlayerID].gameMove = status;

		this.board.cardsArr.push(this.currentPlayerID);

		clientData["playOption"] = ""; //setting playOption to empty string to avoid sending that option to clients
	
		clientData["currentPlayerID"]= this.currentPlayerID;
		clientData["state"] = this.state;
		clientData["answers"] = ["",""];
		clientData["showAnswers"] = false;
		
		
        this.nextPlayer();
        
      
        if (this.board.cardsArr.length === 2) {
			clientData["answers"]= [this.players[0].gameMove, this.players[1].gameMove];

			clientData["showAnswers"] = true;
           
		}
		
		return (clientData);
	};
	

	Game.prototype.initializeScores = function() {
        for (var i =1; i <= this.board.questions.length; i++) {
            var key = "Q"+ i;
            this.scores[key] = [];
            for (var j=0; j < this.players.length; j++) {
                this.scores[key].push(0);
            }
        }

        this.scores["total"] = [0,0];
	};

	Game.prototype.nextRound = function(clientData) {
		var updatedData = {};
		var clientQNum = clientData['questionNo'];
		var clientCurrRound = clientData['currRound'];
		var combination = "Q"+clientQNum+clientCurrRound;

		if (this.currRoundRequested[combination]) {
			return -1;
		}
		else {
			this.currRound ++;
			this.currRoundRequested[combination] = true;
		}
		
		updatedData["hideGameButtons"] = false;

		this.board.cardsArr = [];

		this.updateScore();
		updatedData["notLastQuestion"] = false;
		updatedData["isFinishedRound"] = false;
		updatedData["currRound"] = this.currRound;
		updatedData["questionCounter"] = this.questionCounter;
		updatedData["state"] = this.state;
		updatedData["message"] = "";
		updatedData["scores"] = this.scores;

		if (this.currRound > NO_OF_ROUND) {
			updatedData["isFinishedRound"] = true;
			if ((this.questionCounter+1) < this.board.questions.length) { //if not last question
				this.currRound = 1;

				updatedData["notLastQuestion"] = true;
				

                //go to next question
				this.questionCounter ++;
				updatedData["questionCounter"] = this.questionCounter;
    
			} 
			else {
                this.currRound = NO_OF_ROUND;
				this.state = ENDGAME_STATE;
				

				var message;
				if (this.gameOption === "highestScoreOption") {
					if (this.scores["total"][0] > this.scores["total"][1]) {
						message = this.players[0].name + " wins!";
					}
					else if (this.scores["total"][0] < this.scores["total"][1]) {
						message = this.players[1].name + " wins!";
					}
					else {
						message = "Draw!";
					}
				}
				else if (this.gameOption === "sameScoreOption") {
					if (this.scores["total"][0] === this.scores["total"][1]) {
                        message = "Best matched to be cofounders!";
                    }
                    else {
                        message = "Not matched to be cofounders!";
                    }
				}
				

				updatedData["message"] = message;

			}
			
		}
		return updatedData;
	};

	Game.prototype.updateScore =  function() {
        var player1Decision = this.players[0].gameMove;
        var player2Decision = this.players[1].gameMove;
        var twoPlayersDecision = player1Decision + ((player2Decision).charAt(0).toUpperCase() + player2Decision.slice(1));

        var payOffObj = this.board.questionRuleArr[this.questionCounter];
        var key = "Q"+(this.questionCounter + 1);

        for (var i=0; i < this.players.length; i++) {
            this.scores[key][i] +=  payOffObj[twoPlayersDecision][i];  
            this.scores["total"][i] += payOffObj[twoPlayersDecision][i];        
        }
    };

	Game.prototype.updateTimer = function(clientData) {
		if(clientData['updatedTime'] < 0){
			clientData['updatedTime'] = MAX_TIMER;
		
		}
		return clientData;
	};
}

exports.Game = Game;