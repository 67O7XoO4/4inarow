import * as Board from './Board.js';
import * as BoardModel from './BoardModel.js';
import * as Game from './Game.js';

import i18n from './i18n/I18n.js'


const NO_PLAYER = {key : ''};


function displayMsg(msgKey, params){    
    fourInARowApp.snackbar =  {msg: i18n.t(msgKey, params), show : true };
}
 

const actions ={};

actions[Game.EVENTS.GAME_STARTED] = ()=>{
    displayMsg('newGameMsg', {name: game.currentPlayer.name});
    fourInARowApp.winner = NO_PLAYER;
}

actions[Game.EVENTS.PLAYER_WIN] = ()=>{
    displayMsg('playerWin', {name: game.currentPlayer.name});
    fourInARowApp.winner = game.currentPlayer;
}

actions[Game.EVENTS.EVEN_GAME] = ()=>{
    displayMsg('drawGame');
}

actions[Game.EVENTS.PLAYER_SUSPENDED] = ()=>{
    //remind that the current player is paused
    displayMsg('playerPaused', {name: game.currentPlayer.name});
}


let game = new Game.Game(event=>{
    actions[event].call();
}, i18n);


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
        players: game.players,
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
            return ! game.isStarted() ;
        }
    },

    methods: {

        //resume game after a player has been suspended
        resume : function(){
            game.nextMove();
        },

        //undo last move (even if won)
        undo: function () {

            game.undoLastMove();

            if ( ! game.currentPlayer.isHuman()){
                if (! game.currentPlayer.suspended){
                    game.currentPlayer.suspended = true;                
                    displayMsg('playerPaused', {name: game.currentPlayer.name});
                }
            }else{
                game.nextMove();
            }

            //in case the last move was a winning one
            this.winner = NO_PLAYER;
        },

        //cancel current game and restart a new one after a confirm 
        checkRestart: function () {

            if (game.isStarted()  && ! game.isOver() ){
                //ask for a confirm
                this.showRestartConfirm = true
            }else{
                this.onConfirmRestart();
            }
        },

        onConfirmRestart: function () {
            game.start();
        },
    }
})

//bootstrap display and start game
window.onload = () => {

    let board = new Board.Board(new BoardModel.BoardModel(), "boardCanvas");

    game.start(board);

    
    // Main animation loop
    function animationLoop() {
                
        board.display(game.currentPlayer);

        // Schedule the next frame
        window.requestAnimationFrame(animationLoop);
    }

    // Schedule the main animation loop
    window.requestAnimationFrame(animationLoop);

};