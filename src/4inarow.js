import * as Board from './Board.js';
import * as BoardModel from './BoardModel.js';
import * as Game from './Game.js';
import * as Settings from './Settings.js';

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

actions[Game.EVENTS.DRAW_GAME] = ()=>{
    displayMsg('drawGame');
}

actions[Game.EVENTS.PLAYER_SUSPENDED] = ()=>{
    //remind that the current player is paused
    displayMsg('playerPaused', {name: game.currentPlayer.name});
}

let settings = new Settings.Settings({
    timerEnabled    : true,
    lang            : navigator.language,
    red             : { isHuman       : true , level : 3},
    yellow          : { isHuman       : false, level : 3},
    board           : {
        nbCellsToWin    : 4,
        nbRows          : 6,
        nbColumns       : 7,
    }
});

let game = new Game.Game(event=>{
    actions[event].call();
}, settings, i18n);

i18n.locale = settings.listen('lang', (newval)=>{
    i18n.locale = newval;
}, 'en');


// init GUI
Vue.component('user-board', {
    template: '#user-board-template',
    data: () => ({
        dialogSettings : {show : false}
    }),
    props: ['player'],
    
    computed :{
        formattedTimePassed() {
            const timePassed = this.player.timer.timePassed / 1000;
            let minutes = Math.floor(timePassed / 60);
            let seconds = Math.floor(timePassed % 60);
            if (minutes < 10) {
                minutes = `0${minutes}`;
            }
            if (seconds < 10) {
                seconds = `0${seconds}`;
            }
            return `${minutes}:${seconds}`;
          },

    },
    methods : {
        resume : function(){
            this.player.suspended = false;
            this.$emit('resume');
        },
        
        pause : function(){ 
            this.player.suspended = true;
            this.$emit('pause');
        },

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
        settings :settings,

        // GUI only
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
        }
    },

    methods: {
        isUndoDisabled() {
            return ! game.isStarted() ;
        },

        isGameSettingsDisabled(){
            return game.isBeingPlayed() ;
        },

        //resume game after a player has been suspended
        resume(){
            game.nextMove();
        },

        //undo last move (even if won)
        undo() {

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

            if (game.isBeingPlayed() ){
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

    let board = new Board.Board(new BoardModel.BoardModel(settings.board), "boardCanvas");

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