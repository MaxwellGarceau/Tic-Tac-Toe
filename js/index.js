// Global Variables
var origBoard;
var gameState = "playing";
var huPlayer;
var aiPlayer;
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
];
const cells = document.querySelectorAll('.cell');
var victoryDefeatScreen = document.querySelector('.victory-defeat-screen');
var computerThinking = document.querySelector('.computer-thinking');

chooseTeam();

// Player Chooses X or O
function chooseTeam() {
    victoryDefeatScreen.style.display = "none";
    for (i = 0; i < cells.length; i++) {
        cells[i].innerHTML = "";
        cells[i].style.removeProperty("background-image");
        //cells[i].style.removeProperty("background-color");
    }

    $("#dialog-box").dialog({
        position: { my: "center top", at: "center center-100", of: window, collision: "none" },
        width: 700,
        modal: true,
        autoOpen: true,
        buttons: {
            "X": function() { //submit
                $(this).dialog("close");
                huPlayer = "x";
                aiPlayer = "o";
                $("#first-move-box").dialog('open');
            },
            "O": function() { //cancel
                $(this).dialog("close");
                huPlayer = "o";
                aiPlayer = "x";
                $("#first-move-box").dialog('open');
            }
        }
    });
    $("#first-move-box").dialog({
        position: { my: "center top", at: "center center-100", of: window, collision: "none" },
        width: 700,
        modal: true,
        autoOpen: false,
        buttons: {
            "Me": function() { //submit
                $(this).dialog("close");
                startGame();
            },
            "Computer": function() { //cancel                
                $(this).dialog("close");
                startGame();
                computerThinking.style.display = "block";
                computerThinking.style.animation = "fadein 1.5s";
                setTimeout(function() {
                    turn(bestSpot(), aiPlayer);
                }, 1);
            }
        }
    });
}
$(window).resize(function() {
    $("#dialog-box, #first-move-box").dialog("option", "position", { my: "center top", at: "center center-100", of: window });
});

// Start the game, clear last game
function startGame() {
    gameState = "playing";
    origBoard = Array.from(Array(9).keys());
    for (i = 0; i < cells.length; i++) {
        //cells[i].innerHTML = "";
        cells[i].addEventListener("click", turnClick, false);
        //cells[i].style.removeProperty("background-color");
    }
}

// When player clicks on square...
function turnClick(squareClick) {
    if (origBoard[squareClick.target.id] === huPlayer || aiPlayer) {
        for (i = 0; i < cells.length; i++) {
            cells[i].removeEventListener("click", turnClick, false);
        }
    }
    turn(squareClick.target.id, huPlayer);
    setTimeout(function() {
        if (gameState === "playing") {
            for (var i = 0; i < emptySquares().length; i++) {
                document.getElementById(emptySquares()[i].toString()).addEventListener("click", turnClick, false);
            }
            turn(bestSpot(), aiPlayer);
        }
    }, 1500);
}

//...it triggers the players symbol to be on board
function turn(squareId, player) {
    computerThinking.style.display = "none";
    origBoard[squareId] = player;
    document.getElementById(squareId).innerHTML = "<span class=\"fade-in\">" + player + "</span>";
    let gameWon = null;
    gameWon = checkWin(origBoard, player);
    if (gameWon) {
        gameState = "complete";
        gameOver(gameWon);
    }
    checkDraw(origBoard);
}

// Check to see if game has been won
function checkWin(currBoard, player) {
    var played = currBoard.reduce(function(acc, curVal, ind) {
        if (curVal === player) {
            return acc.concat(ind);
        } else {
            return acc;
        }
    }, []);

    // Function called in .every method 
    function winCondition(curVal) {
        return played.indexOf(curVal) !== -1;
    }
    for (i = 0; i < winCombos.length; i++) {
        if (winCombos[i].every(winCondition)) {
            let victoryPath = { index: winCombos[i], player: player };
            return victoryPath;
        }
    }
    return null;
}

// On gameover highlight victory path and make cells unclickable
function gameOver(gameWon) {
    for (i = 0; i < cells.length; i++) {
        cells[i].removeEventListener("click", turnClick, false);
    }
    setTimeout(function() {
        victoryDefeatScreen.style.display = "block";
        for (j = 0; j < gameWon.index.length; j++) {
            document.getElementById(gameWon.index[j]).style.backgroundImage = "url('https://dl.dropboxusercontent.com/s/0w3e6nu4mbfe8ih/32998832-abstract-pencil-scribbles-background-texture-Stock-Photo.jpg?dl=0')";
        }
        declareWinner(gameWon);
    }, 2500);
}

// Declare Winner and posts winner to board
function declareWinner(gameWon) {
    if (gameWon.player === huPlayer) {
        document.querySelector(".text").innerHTML = "You Win!";
    } else if (gameWon.player === aiPlayer) {
        document.querySelector(".text").innerHTML = "You Lose";
    } else if (gameWon.player === "Draw") {
        document.querySelector(".text").innerHTML = "Draw";
    }
}

// Figures out which squares are empty
function emptySquares() {
    return origBoard.filter(function(curElem) {
        return typeof curElem == 'number';
    });
}

// Calls minimax and returns index of best move
function bestSpot() {
    return minimax(origBoard, aiPlayer).index;
}

// Checks to see if there is a tie and displays Tie text on board
function checkDraw(origBoard) {
    if (emptySquares().length === 0) {
        gameState = "complete";
        let gameWon = { player: "Draw" };
        setTimeout(function() {
            victoryDefeatScreen.style.display = "block";
            for (i = 0; i < cells.length; i++) {
                cells[i].removeEventListener("click", turnClick, false);
                //cells[i].style.backgroundColor = "green";
                cells[i].style.backgroundImage = "url('https://dl.dropboxusercontent.com/s/0w3e6nu4mbfe8ih/32998832-abstract-pencil-scribbles-background-texture-Stock-Photo.jpg?dl=0')";
            }
        }, 2500);
        declareWinner(gameWon);
        return true;
    }
    return false;
}

// Minimax function for determining computer players best move
function minimax(tempBoard, player) {
    var availMoves = emptySquares();
    if (checkWin(tempBoard, huPlayer)) {
        return { score: -10 };
    } else if (checkWin(tempBoard, aiPlayer)) {
        return { score: 10 };
    } else if (availMoves.length === 0) {
        return { score: 0 };
    }

    var posMoves = [];

    for (var i = 0; i < availMoves.length; i++) {
        var move = {};
        move.index = tempBoard[availMoves[i]];
        tempBoard[availMoves[i]] = player;

        if (player == aiPlayer) {
            var result = minimax(tempBoard, huPlayer);
            move.score = result.score;
        } else {
            var result = minimax(tempBoard, aiPlayer);
            move.score = result.score;
        }

        // resets board to before looping
        tempBoard[availMoves[i]] = move.index;

        // adds move to moves possibles moves array
        posMoves.push(move);
    }

    // Best move for AI
    var aiGodMove;
    if (player === aiPlayer) {
        var highestScore = -1000;
        for (var i = 0; i < posMoves.length; i++) {
            if (posMoves[i].score > highestScore) {
                highestScore = posMoves[i].score;
                aiGodMove = posMoves[i];
            }
        }
    } else {
        var lowestScore = 1000;
        for (var i = 0; i < posMoves.length; i++) {
            if (posMoves[i].score < lowestScore) {
                lowestScore = posMoves[i].score;
                aiGodMove = posMoves[i];
            }
        }
    }
    return aiGodMove;
}