import * as Board from './Board.js';
import * as HumanPlayer from './HumanPlayer.js';
import * as ComputerPlayer from './ComputerPlayer.js';

const RED = {   color : "rgb(255, 100, 100)", name : "RED"   };

const YELLOW = { color : "rgb(255, 255, 0)" , name : "YELLOW"  };


let currentPlayer = null;

let board = new Board.Board();


// canvas config (Size,...). These get updated after browser loading.
let canvasConfig = {};
let mousePos = {x: 0, y:0, out: true}; //out = mouse over or not


/**
 * 
 * @param {*} player 
 * @param {*} isHuman 
 */
function initPlayer(playerConfig, isHuman){
    let player = new ComputerPlayer.ComputerPlayer();
    if (isHuman){
        player = new HumanPlayer.HumanPlayer();
    } 
    return Object.assign(player, playerConfig);
}


/**
 * 
 */
function initCanvas() {
    canvasConfig.boardCanvas = document.getElementById("boardCanvas");

    canvasConfig.boardCanvas.addEventListener('mouseout', ()=> (mousePos.out = true), false);

    canvasConfig.ctx = canvasConfig.boardCanvas.getContext("2d");
    //set Y=0 at the bottom of the board
    canvasConfig.ctx.translate(0, board.getHeight() );
    canvasConfig.ctx.scale (1, -1);
}

/**
 * Let's make the current player play at the selected column
 * Chek if he wins
 * or else ask the next user to play
 */
function play(boardModel){
    
    boardModel.playAtSelectedColumn(currentPlayer);

    if ( boardModel.checkIfLastPlayWin()){
        //
    }else if ( boardModel.isComplete()){
        //even game

    }else{
        //next  
        currentPlayer = currentPlayer.nextPlayer;

        currentPlayer.atYourTurn(boardModel, board, canvasConfig, mousePos)
        //when ready, play the next move
        .then(()=> play(boardModel) );
    }
}

// Main animation loop
function animationLoop() {
            
    board.display(canvasConfig.ctx);
    board.displayMousePosition(currentPlayer, mousePos, canvasConfig.ctx );

    // Schedule the next frame
    window.requestAnimationFrame(animationLoop);
}

//bootstrap
window.onload = () => {

    currentPlayer = initPlayer(RED, true);
    currentPlayer.setNextPlayer(initPlayer(YELLOW, false));

    initCanvas();

    //start the game
    currentPlayer.atYourTurn(board.model, board, canvasConfig, mousePos)
        .then(()=> play(board.model) );

    // Schedule the main animation loop
    window.requestAnimationFrame(animationLoop);
};

