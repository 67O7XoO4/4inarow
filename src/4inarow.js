import * as Board from './Board.js';
import * as BoardModel from './BoardModel.js';

import * as Player from './Player.js';

import i18n from './i18n/I18n.js'


const RED_CONFIG = {   color : "rgb(255, 100, 100)", nameKey : "RED"   };
const YELLOW_CONFIG = { color : "rgb(255, 255, 0)" , nameKey : "YELLOW"  };

let players = [];
let currentPlayer = null;

let board = null;
let boardModel = new BoardModel.BoardModel();

// canvas config (Size,...). These get updated after browser loading.
let canvasConfig = {};
let mousePos = {x: 0, y:0, out: true}; //out = mouse over or not


/**
 * 
 */
function initCanvas() {

    board = new Board.Board(boardModel);

    canvasConfig.boardCanvas = document.getElementById("boardCanvas");
    canvasConfig.ctx = canvasConfig.boardCanvas.getContext("2d");
    
    let resize = ()=>{
        //map the canvas size to the displayed size
        let size = Math.min(canvasConfig.boardCanvas.parentElement.clientWidth,
                            canvasConfig.boardCanvas.parentElement.clientHeight)
        
        canvasConfig.boardCanvas.width = size;
        canvasConfig.boardCanvas.height = size;

        board.setSize(size);

        //set Y=0 at the bottom of the board
        canvasConfig.ctx.translate(0, board.getHeight() );
        canvasConfig.ctx.scale (1, -1);
    
    };

    resize();

    window.addEventListener("resize", resize, false);
}

function nextPlayer(){
    currentPlayer = currentPlayer.nextPlayer;
    currentPlayer.isCurrentPlayer = true;
    currentPlayer.nextPlayer.isCurrentPlayer = false;

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
        nextPlayer();

        nextMove(boardModel);
    }
    Vue.forceUpdate();
}

function nextMove(boardModel){

    if ( ! currentPlayer.suspended){
            
        currentPlayer.atYourTurn(boardModel, board, canvasConfig.boardCanvas, mousePos)
        //when ready, play the next move
        .then(()=> play(boardModel) )
        .catch(()=>{
            console.log("interrupted");
        })
    }else{
        displayMsg('playerPaused', {name: currentPlayer.name});
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
    fourInARowApp.snackbar =  {msg: i18n.t(msgKey, params), show : true };
}

RED_CONFIG.name = i18n.t(RED_CONFIG.nameKey);
YELLOW_CONFIG.name = i18n.t(YELLOW_CONFIG.nameKey);

players.push(new Player.Player(RED_CONFIG, true));
players.push(new Player.Player(YELLOW_CONFIG, false));

currentPlayer = players[0];
currentPlayer.isCurrentPlayer = true;
currentPlayer.setNextPlayer(players[1]);
currentPlayer.nextPlayer.isCurrentPlayer = false;

// init GUI
Vue.component('user-board', {
    template: '#user-board-template',
    data: () => ({
        dialogSettings : {show : false}
    }),
    props: ['player'],
     
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

Vue.use(VueMaterial.default);

var fourInARowApp = new Vue({
    i18n,
    el: '#fourInARowApp',
    data: {
        players: players,
        boardModel : boardModel,
        langs : i18n. availableLocales,
        snackbar : {msg : "", show : false},
        menu: {  show : false},
        showRestartConfirm : false,
    },
    computed: {
        isUndoDisabled() {
            return boardModel.isEmpty();
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
                nextPlayer();
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

        checkRestart: function () {
            
            currentPlayer.interrupt();
            
            if (board.model.isComplete()
                || board.model.isEmpty()
                || board.model.checkIfLastPlayWin()){
                this.onConfirmRestart();
            }else{
                this.showRestartConfirm = true
            }
        },

        onConfirmRestart: function () {
            
            currentPlayer.interrupt();
            
            board.model.clearAll();
            //restart the game
            nextMove(board.model);

            displayMsg('newGameMsg', {name: currentPlayer.name});
        },
    }
})


//bootstrap display
window.onload = () => {

    initCanvas();

    //start the game
    nextMove(board.model);
   displayMsg('newGameMsg', {name: currentPlayer.name});

    // Schedule the main animation loop
    window.requestAnimationFrame(animationLoop);

};