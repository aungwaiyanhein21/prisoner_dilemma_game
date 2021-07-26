const NOGAME_STATE = 0;
const GAMEOPTION_STATE = 1;
const INGAME_STATE = 2;
const ENDGAME_STATE = 3;


const NO_OF_ROUND = 3;

const MAX_TIMER = 30; //in seconds

var hasCreatedTable = false;

var game = {
    state: NOGAME_STATE,
    players: [],
    board: null,
    footPrints: ["Player 1","Player 2"],
    currRound: 1,
    currentPlayerID: 0,

    countDownID: undefined,

    questionCounter: 0,

    scores: {}, //scores for each question and for each player
    restartState: false, //tells whether the game is new or restarted game

    gameOption: undefined, // game option that both players play

    renderer: new DOMRenderer(),

    init: function (players)
	{		
        this.state = INGAME_STATE;
        this.players[0] = new Player (1, players[0].name,  this.footPrints[0]);
        this.players[1] = new Player(2, players[1].name, this.footPrints[1]);
		
        this.currentPlayerID = 0;	

        this.displayTurn();	
    },	
    
    nextPlayer: function()
	{
		this.currentPlayerID++;
		if (this.currentPlayerID === this.players.length)
			this.currentPlayerID = 0;		
	},

    getRoom: function() {
        this.renderer.changeToRoomOptionScreen();
    },
    
    startGame: function(game) {
       
        if (game !== undefined) {
            var board = game.board;

            // set data from server
            this.questionCounter = game.questionCounter;
            this.currRound = game.currRound;
            this.scores = game.scores;
        }
        

        if (this.board === null) { //if the board object has not been created before
            this.board = new Board ();

            this.board.questions = board.questions.slice(0,board.questions.length);
            
            this.board.questionRuleArr = board.questionRuleArr.slice(0,board.questionRuleArr.length);
            
        }
    
        this.updateQuestion(this.questionCounter, this.board.questions[this.questionCounter], this.board.questionRuleArr[this.questionCounter]);
    
        this.countDownTimer();

        this.renderer.displayGameBoard();

        this.renderer.showPlayerNames(this.players[0].name, this.players[1].name); 

        if (this.restartState === true || hasCreatedTable === true) {
            this.renderer.removeScoreTable();
        }
    
        this.renderer.createScoreTable(this.board.questions.length, this.scores);

        this.renderer.changeRound(this.currRound,NO_OF_ROUND);

        hasCreatedTable = true;
    },

    updateQuestion: function(questionCounter, question, questionRule) {
        this.renderer.changeQuestion(questionCounter,question);
        this.renderer.changePayOffTable(questionRule);
    },

    changeGameState: function  (updatedData)
	{		
        //console.log("In Change Game State");
        //console.log(updatedData);
        clearInterval(this.countDownID);

        var currentPlayerID = updatedData["currentPlayerID"]; 
        var answersArr = updatedData["answers"];
        var canShowedAnswers = updatedData["showAnswers"];
      	
		this.currentPlayerID = currentPlayerID;
        
        this.renderer.showCard(this.currentPlayerID, "", this.players[this.currentPlayerID].name);

        this.nextPlayer();

        this.displayTurn();

        if (canShowedAnswers) {
            this.renderer.fillAnswer(answersArr);

            this.renderer.hideGameButtons(true);
            // after 1 second, flip the cards
            setTimeout(function(){
                game.renderer.flipCards();

                // after 2 seconds, go to next round
                setTimeout(clientConnectionManager.requestNextRound, 2000);
            }, 1000);
        }
        else {
            this.countDownTimer();
        }
        		
    },
    
    nextRound: function(updatedData) {

        this.renderer.hideGameButtons(updatedData["hideGameButtons"]);

        this.board.cardsArr = [];

        this.currRound = updatedData["currRound"];
        
        this.renderer.resetCards(this.players.length);
       
        this.scores = updatedData["scores"];
    
        this.renderer.updateScore(this.questionCounter,this.players.length);

        if (updatedData["isFinishedRound"]) {
            if (updatedData["notLastQuestion"]) {
                this.currRound = 1;
                this.questionCounter = updatedData["questionCounter"];
                
                this.updateQuestion(this.questionCounter, this.board.questions[this.questionCounter], this.board.questionRuleArr[this.questionCounter]);

                this.countDownTimer();
            }
            else {
                this.currRound = NO_OF_ROUND;
                this.state = ENDGAME_STATE;

                clearInterval(this.countDownID);
                var message = updatedData["message"];

                this.renderer.displayEndGame(message);
            }
        }
        else {
            this.countDownTimer();
        }

        console.log("inside next round");
        console.log("Curr Round: "+ this.currRound);
        this.renderer.changeRound(this.currRound,NO_OF_ROUND);

    },

    updateScore: function() {
        var player1Decision = this.players[0].gameMove;
        var player2Decision = this.players[1].gameMove;
        var twoPlayersDecision = player1Decision + ((player2Decision).charAt(0).toUpperCase() + player2Decision.slice(1));

        var payOffObj = this.board.questionRuleArr[this.questionCounter];
        var key = "Q"+(this.questionCounter + 1);

        for (var i=0; i < this.players.length; i++) {
            this.scores[key][i] +=  payOffObj[twoPlayersDecision][i];  
            this.scores["total"][i] += payOffObj[twoPlayersDecision][i];        
        }
    },

    countDownTimer: function() {
        var timeLeftCounter = MAX_TIMER;
        this.countDownID = setInterval(function() {
            if (game.state !== INGAME_STATE) {
                clearInterval(game.countDownID);
                return;
            }

            if(timeLeftCounter < 0){
                timeLeftCounter = MAX_TIMER;
                //console.log(timeLeftCounter);
                
                clearInterval(game.countDownID);

                var randomChoice = Math.floor(Math.random() * 2);

                if (randomChoice === 0) {
                    clientConnectionManager.requestUpdateGameState('cooperate');
                }
                else {
                    clientConnectionManager.requestUpdateGameState('defect');
                }
            }

            if (game.state === INGAME_STATE) {
                console.log("TimeLeft:"+timeLeftCounter);
                clientConnectionManager.requestUpdateCountDown(timeLeftCounter);

                //game.renderer.updateTimer(timeLeftCounter);
                timeLeftCounter -= 1;
            }
           
        }, 1000);
    },

    restartGame: function() {
        this.board.cardsArr = []; //empty the cards array

        this.state = INGAME_STATE;
        this.currRound = 1;
        this.questionCounter = 0;
        this.scores = {};
    
        this.initializeScores();

        this.restartState = true;

        this.renderer.hideEndGame();

        this.startGame();
        
    },

    updateTimer: function(updatedData) {
        var timeLeftCounter = updatedData['updatedTime'];
        game.renderer.updateTimer(timeLeftCounter);
    },

    initializeScores: function() {
        for (var i =1; i <= this.board.questions.length; i++) {
            var key = "Q"+ i;
            this.scores[key] = [];
            for (var j=0; j < this.players.length; j++) {
                this.scores[key].push(0);
            }
        }

        this.scores["total"] = [0,0];
    },

    default: function() {
        this.state = NOGAME_STATE;
        this.players = [];
        this.board = null;
        this.currRound = 1;
        this.currentPlayerID = 0;

        clearInterval(this.countDownID);
        this.countDownID = undefined;
        this.questionCounter = 0;
        this.scores = {};
        this.restartState = false;
        //sthis.renderer = new DOMRenderer();

        this.renderer.removeScoreTable();
        hasCreatedTable = false;
        this.renderer.removeAllCards();

        this.renderer.hideEndGame();

    },

    displayTurn: function ()
	{
		var turnElem = document.getElementById("turn");
		turnElem.innerHTML = "Turn: " + this.players [this.currentPlayerID].name;
	},
};
