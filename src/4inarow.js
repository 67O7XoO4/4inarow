import * as Board from './Board.js';
import * as BoardModel from './BoardModel.js';

import * as Player from './Player.js';

import i18n from './i18n/I18n.js'

const RED_CONFIG = {   color : "rgb(255, 100, 100)", key : "RED"   }; //#FF6464
const YELLOW_CONFIG = { color : "rgb(255, 255, 0)" , key : "YELLOW"  };

const NO_PLAYER = {key : ''};

let players = [];
let currentPlayer = null;

let board = null;

/**
 * 
 */
function startGame(){
    
    currentPlayer.interrupt();
            
    board.model.clearAll();
    //restart the game
    nextMove(board.model);

    displayMsg('newGameMsg', {name: currentPlayer.name});
    fourInARowApp.winner = NO_PLAYER;
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
        fourInARowApp.winner = currentPlayer;

    }else if ( boardModel.isComplete()){
        //even game
        displayMsg('evenGame');
        
    }else{
        //switch to next player 
        currentPlayer = currentPlayer.switchToNextPlayer();

        nextMove(boardModel);
    }
}

/**
 * check for player suspension and ask him to play otherwise
 */
function nextMove(boardModel){

    if ( ! currentPlayer.suspended){
            
        currentPlayer.atYourTurn(boardModel, board)
        //when ready, play the next move
        .then(()=> play(boardModel) )
        .catch(()=>{
            console.log("interrupted");
        })
    }else{
        //remind that the current player is paused
        displayMsg('playerPaused', {name: currentPlayer.name});
    }
}

// Main animation loop
function animationLoop() {
            
    board.display();
    board.displaySelectedColumn(currentPlayer);

    // Schedule the next frame
    window.requestAnimationFrame(animationLoop);
}

function displayMsg(msgKey, params){    
    fourInARowApp.snackbar =  {msg: i18n.t(msgKey, params), show : true };
}


//init players
RED_CONFIG.name = i18n.t(RED_CONFIG.key);
YELLOW_CONFIG.name = i18n.t(YELLOW_CONFIG.key);

players.push(new Player.Player(RED_CONFIG, true));
players.push(new Player.Player(YELLOW_CONFIG, false));

currentPlayer = players[0];
currentPlayer.setNextPlayer(players[1]);


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
        winner : NO_PLAYER,
        langs : i18n.availableLocales,

        //
        snackbar : {msg : "", show : false},
        menu: {  show : false},
        showRestartConfirm : false,
    },
    computed: {
        winnerClass(){
            //what a fancy way to set CSS classes :(
            let classes = {'win' : this.winner.key != ''};
            classes[this.winner.key] = true;
            return classes;
        },
        isUndoDisabled() {
            return board != null && board.model.isEmpty();
        }
    },

    methods: {

        //resume game after a player has been suspended
        resume : function(){
            nextMove(board.model);
        },

        //undo last move (even if won)
        undo: function () {

            currentPlayer.interrupt();

            let wasWinning = board.model.undoLastMove();
            
            if ( ! wasWinning){
                //in fact, it should be previousPlayer() but it's the same !
                currentPlayer = currentPlayer.switchToNextPlayer();
            }
            if ( ! currentPlayer.isHuman()){
                if (! currentPlayer.suspended){
                    currentPlayer.suspended = true;                
                    displayMsg('playerPaused', {name: currentPlayer.name});
                }
            }else{
                nextMove(board.model);
            }
            this.winner = NO_PLAYER;
        },

        //cancel current game and restart a new after a confirm 
        checkRestart: function () {
            
            if (board.model.isComplete()
                || board.model.isEmpty()
                || board.model.checkIfLastPlayWin()){
                this.onConfirmRestart();
            }else{
                //ask for a confirm
                this.showRestartConfirm = true
            }
        },

        onConfirmRestart: function () {
            startGame();
        },
    }
})


//bootstrap display and start game
window.onload = () => {

    board = new Board.Board(new BoardModel.BoardModel(), "boardCanvas");

    startGame();

    // Schedule the main animation loop
    window.requestAnimationFrame(animationLoop);

};