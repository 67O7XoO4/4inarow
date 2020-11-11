import * as Board from './Board.js';
import * as Player from './Player.js';

import i18n from './i18n/I18n.js'


const RED_CONFIG = {   color : "rgb(255, 100, 100)", nameKey : "RED"   };
const YELLOW_CONFIG = { color : "rgb(255, 255, 0)" , nameKey : "YELLOW"  };

let players = [];
let currentPlayer = null;

let board = new Board.Board();


// canvas config (Size,...). These get updated after browser loading.
let canvasConfig = {};
let mousePos = {x: 0, y:0, out: true}; //out = mouse over or not


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
        displayMsg('playerWin', {name: currentPlayer.name});

    }else if ( boardModel.isComplete()){
        //even game
        displayMsg('evenGame');
        
    }else{
        //next  
        currentPlayer = currentPlayer.nextPlayer;
        nextMove(boardModel);
    }
}

function nextMove(boardModel){

    if ( ! currentPlayer.suspended){
            
        currentPlayer.atYourTurn(boardModel, board, canvasConfig, mousePos)
        //when ready, play the next move
        .then(()=> play(boardModel) )
        .catch(()=>{
            console.log("interrupted");
        })
    }
}

// Main animation loop
function animationLoop() {
            
    board.display(canvasConfig.ctx);
    board.displayMousePosition(currentPlayer, mousePos, canvasConfig.ctx );

    // Schedule the next frame
    window.requestAnimationFrame(animationLoop);
}

function displayMsg(msgKey, params){
    
    let snackbarContainer = document.querySelector('#snackbarmsg');
    var data = {message: i18n.t(msgKey, params)};
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
}

RED_CONFIG.name = i18n.t(RED_CONFIG.nameKey);
YELLOW_CONFIG.name = i18n.t(YELLOW_CONFIG.nameKey);

players.push(new Player.Player(RED_CONFIG, true));
players.push(new Player.Player(YELLOW_CONFIG, false));

currentPlayer = players[0];
currentPlayer.setNextPlayer(players[1]);



Vue.component('user-board', {
    template: '#user-board-template',
    props: ['player'],
    computed: {
        isCurrentPlayer : function(){
            return this.player === currentPlayer;
        },
    },
    methods : {
        changeStrategy : function(){
            this.player.changeStrategy();
        },
        resume : function(){
            this.player.suspended = false;
            this.$emit('resume');
        },
        
        pause : function(){ 
            this.player.suspended = true;
            this.$emit('pause');
        }
    }
     ,
})

  

var fourInARowApp = new Vue({
    i18n,
    el: '#fourInARowApp',
    data: {
        title: '4 In a Row !!',
        players: players,
        boardModel : board.model,
        langs : i18n. availableLocales
    },
    computed: {
        isUndoDisabled() {
          return board.model.isEmpty();
        }
    },

    methods: {

        resume : function(){
            nextMove(board.model);
        },

        undo: function () {

            currentPlayer.interrupt();

            let wasWinning = board.model.undoLastPlay();
            
            if ( ! wasWinning){
                currentPlayer = currentPlayer.nextPlayer;
            }
            if ( ! currentPlayer.isHuman()){
                if (! currentPlayer.suspended){
                    currentPlayer.suspended = true;                
                    displayMsg('playerPaused', {name: currentPlayer.name});
                }
            }else{
                nextMove(board.model);
            }
        },
        start: function () {
            
            currentPlayer.interrupt();
            
            board.model.clearAll();
            //restart the game
            nextMove(board.model);

            displayMsg('newGame', {name: currentPlayer.name});
        },
    }
})

//bootstrap display
window.onload = () => {

    initCanvas();

    //start the game
    nextMove(board.model);
    displayMsg('newGame', {name: currentPlayer.name});

    // Schedule the main animation loop
    window.requestAnimationFrame(animationLoop);

};