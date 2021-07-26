function DOMRenderer () {
    DOMRenderer.prototype.displayLoginAlert = function(toBeDisplayed) {
        if (toBeDisplayed) {
            document.getElementById("loginAlert").style.display = "block";
        }
        else {
            document.getElementById("loginAlert").style.display = "none";
        }  
    };
    
    DOMRenderer.prototype.checkInput = function() {
        if (document.getElementById("name").value === "") {
            return true;
        } 
        else {
            return false;
        }
    };

    DOMRenderer.prototype.clearInputs = function() {
        document.getElementById("name").value ="";
    };

    DOMRenderer.prototype.hideLogin = function () {
        var loginTopPanel = document.querySelector(".login-toppanel");
        loginTopPanel.style.display = "none";

        var loginContainer = document.querySelector(".login-container");
        loginContainer.style.display = "none";
    };

    DOMRenderer.prototype.hideRoom = function() {
        var roomContainerElement = document.querySelector(".room-browser");
        roomContainerElement.style.display = "none";

        var loginTopPanel = document.querySelector(".login-toppanel");
        loginTopPanel.style.display = "none";
    };

    DOMRenderer.prototype.hideGame = function() {
        this.hideGameButtons(false); //for case when users quit when the cards are flipping.

        var gameContainer = document.querySelector(".flex-container");
        gameContainer.style.display = "none";

        var loginTopPanel = document.querySelector(".login-toppanel");
        loginTopPanel.style.display = "flex";

        var gameTopPanel = document.querySelector(".game-toppanel");
        gameTopPanel.style.display = "none";
    };

    DOMRenderer.prototype.showRoom = function() {
        var roomContainerElement = document.querySelector(".room-browser");
        roomContainerElement.style.display = "flex";

        var loginTopPanel = document.querySelector(".login-toppanel");
        loginTopPanel.style.display = "flex";
    };

    DOMRenderer.prototype.roomHeading = function(title){
        document.getElementById("roomHeading").innerHTML = title;
    };

    DOMRenderer.prototype.showCreateJoinButtons = function(status) {
        if (status) {
            document.getElementById("createJoinButtons").style.display = "block";
        }
        else {
            document.getElementById("createJoinButtons").style.display = "none";
        }
        
    };

    DOMRenderer.prototype.showStartLeaveButtons = function(status) {
        if (status) {
            document.getElementById("startLeaveButtons").style.display = "block";
        }
        else {
            document.getElementById("startLeaveButtons").style.display = "none";
        }
       
    };

    DOMRenderer.prototype.changeToGameOptionScreen = function() {
        var loginSectionElement = document.getElementById("loginSectionContainer");
        loginSectionElement.style.display = "none";

        var gameOptionsElement = document.getElementById("gameOptionsContainer");
        gameOptionsElement.style.display = "flex";
    };

    DOMRenderer.prototype.changeToRoomOptionScreen = function() {
        var loginContainerElement = document.querySelector(".login-container");
        loginContainerElement.style.display = "none";

        var roomContainerElement = document.querySelector(".room-browser");
        roomContainerElement.style.display = "flex";
    };

    DOMRenderer.prototype.getGameOption = function() {
        var gameOptionsSelectBoxElement = document.getElementById("gameOptions");
        var option = gameOptionsSelectBoxElement.value;
        
        return option;
    };

    DOMRenderer.prototype.displayGameBoard = function() {
        var gameTopPanel = document.querySelector(".game-toppanel");
        gameTopPanel.style.display = "flex";

        var gameContainer = document.querySelector(".flex-container");
        gameContainer.style.display = "flex";
    };

    DOMRenderer.prototype.showPlayerNames = function(p1Name, p2Name) {
        var player1NameElement = document.querySelectorAll(".player1Name");
        for (var i=0; i < player1NameElement.length; i++) {
            var eachElement = player1NameElement[i];
            eachElement.innerHTML = p1Name;
        }

        var player2NameElement = document.querySelectorAll(".player2Name");
        for (var i=0; i < player2NameElement.length; i++) {
            var eachElement = player2NameElement[i];
            eachElement.innerHTML = p2Name;
        }
    };

    DOMRenderer.prototype.changePayOffTable = function(payOffObj) {
        var payOffObjKeys = Object.keys(payOffObj);

        for (var i=0; i < payOffObjKeys.length; i++) {
            var key = payOffObjKeys[i];

            var element = document.getElementById(key);
            element.innerHTML = payOffObj[key][0] + ", " + payOffObj[key][1];
        }
    };

    DOMRenderer.prototype.changeQuestion = function(questionCounter, question) {
        var questionElement = document.getElementById("question");
        questionElement.innerHTML = "Question "+ (questionCounter+1) + ": " + question;
    };

    DOMRenderer.prototype.createScoreTable = function(questionLength, scoresObj) {
        var scoreTableElement = document.getElementById("scoreTable");

        for (var i = 1; i <= questionLength + 1; i++) {
            var trElement = document.createElement("tr");

            for (var j=0; j <= 2; j++) {
                var tdElement = document.createElement("td"); 
                if (i === questionLength + 1 && j === 0) {
                    tdElement.innerHTML = "total";
                }
                else if (i === questionLength + 1) {
                    tdElement.id = "total"+"player"+(j-1);
                    tdElement.innerHTML = scoresObj["total"][j-1];
                }
                else if (j === 0) {
                    tdElement.innerHTML = "Q"+i;
                }
                else {
                    tdElement.id = "Q"+i+"player"+(j-1);
                    tdElement.innerHTML = scoresObj["Q"+i][j-1];
                }
                
                       
                trElement.appendChild(tdElement)
            }

            scoreTableElement.appendChild(trElement);
        }    
    };

    DOMRenderer.prototype.removeScoreTable = function() {
        var scoreTableElement = document.getElementById("scoreTable");
        
        var noOfRows = scoreTableElement.rows.length;
        for (var i = noOfRows - 1; i > 0; i--) {
            scoreTableElement.deleteRow(i);
        }
    };

    DOMRenderer.prototype.changeRound = function(currentRound, totalRound) {
        var gameRoundElement = document.getElementById("gameRound");
        gameRoundElement.innerHTML = "Round "+ currentRound + " out of "+ totalRound;
    };

    DOMRenderer.prototype.showCard = function(playerID, status, playerName) {
        var cardContainerElement = document.getElementsByClassName("cardcontainer")[playerID];
        cardContainerElement.style.display = "block";

        var backsideElement = document.getElementsByClassName("backside")[playerID];
        backsideElement.innerHTML = playerName + ": " + status;
    };

    DOMRenderer.prototype.removeAllCards = function() {
        var allCardContainerElement = document.getElementsByClassName("cardcontainer");
        for (var i = 0; i < allCardContainerElement.length; i++) {
            allCardContainerElement[i].style.display = "none";
        }
    };

    DOMRenderer.prototype.fillAnswer = function(answersArr) {
        var all_backside_containers = document.getElementsByClassName("backside");
        for (var i = 0; i < all_backside_containers.length; i++) {
            all_backside_containers[i].innerHTML += answersArr[i];
        }
    };

    DOMRenderer.prototype.flipCards = function() {
        var cardArr = document.querySelectorAll('.playercard');

        for (var i=0; i < cardArr.length; i++) {
            var card = cardArr[i];
            card.classList.toggle('isflipped');
        }
    };

    DOMRenderer.prototype.resetCards = function(playerIDArrLength) {
        //remove class name
        var cardArr = document.querySelectorAll('.playercard');

        for (var i=0; i < cardArr.length; i++) {
            var card = cardArr[i];
            card.classList.remove('isflipped');
        }

        for (var i=0; i < playerIDArrLength; i++) {
            var cardContainerElement = document.getElementsByClassName("cardcontainer")[i];
            cardContainerElement.style.display = "none";
        }
    };

    DOMRenderer.prototype.updateScore = function(questionNumber,playerArrLength) {
        for (var i=0; i < playerArrLength; i++) {
            var scoreID = "Q"+(questionNumber+1)+"player"+i;
            console.log(scoreID); 
            var scoreElement = document.getElementById(scoreID);

            scoreElement.innerHTML = game.scores["Q"+(questionNumber + 1)][i] ;
            
            var totalID = "total"+"player"+i;
            var totalElement = document.getElementById(totalID);
            totalElement.innerHTML = game.scores["total"][i];
        }
    
    };

    DOMRenderer.prototype.updateTimer = function(timeLeft) {
        var timerElement = document.getElementById("timer");
        timerElement.innerHTML = "Timer: " + timeLeft; 
    };

    DOMRenderer.prototype.displayEndGame = function(message) {
        var gameBoardElement = document.querySelector(".gameboard");
        gameBoardElement.style.display = "none";

        var endGameBoardElement = document.querySelector(".endgame");
        endGameBoardElement.style.display = "flex";

        var gameMessageElement = document.getElementById("gameMessage");
        gameMessageElement.innerHTML = message;
    };

    DOMRenderer.prototype.hideEndGame = function() {
        var gameBoardElement = document.querySelector(".gameboard");
        gameBoardElement.style.display = "flex";

        var endGameBoardElement = document.querySelector(".endgame");
        endGameBoardElement.style.display = "none";
    };

    DOMRenderer.prototype.hideGameButtons = function(hideGameButton) {
        var gameButtonElement = document.querySelector(".gamebuttons");
        if (hideGameButton) {
            gameButtonElement.style.visibility = "hidden";
        }
        else {
            gameButtonElement.style.visibility = "visible";
        }
    };
}