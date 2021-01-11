import Vue from 'vue';

import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';

import * as Board from './Board.js';
import * as BoardModel from './BoardModel.js';
import * as Game from './Game.js';

import * as RemoteManager from './remote/RemoteManager.js'; 
import * as GameHandler from './GameHandler.js'; 

import * as Settings from './util/Settings.js';


import i18n from './i18n/I18n.js'
 
import qrcode from 'qrcode-generator';

const NO_PLAYER = {key : ''};


/** display a message in a snackbar */
function displayMsg(msgKey, params){    
    //TODO a level (error, warn, info)
    if (fourInARowApp.snackbar.show){
        //put in snackbar queue if exists
        fourInARowApp.snackbar.queue = fourInARowApp.snackbar.queue || [];
        fourInARowApp.snackbar.queue.push(    [msgKey, params]    );
    }else{
        fourInARowApp.snackbar.msg = i18n.t(msgKey, params)
        fourInARowApp.snackbar.show = true ;    
    }
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
    if (actions[event]) actions[event].call();
}, settings, i18n);

i18n.locale = settings.listen('lang', (newval)=>{
    i18n.locale = newval;
}, 'en');

Vue.use(VueMaterial); 

// init GUI
Vue.component('user-board', {
    template: '#user-board-template',
    data: () => ({
        dialogSettings : {show : false}
    }),
    props: ['player', 'display-settings'],
    
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

let remoteManager = new RemoteManager.RemoteManager();

var fourInARowApp = new Vue({
    i18n,
    el: '#fourInARowApp',

    data: {
        game            : game,
        players         : game.players,
        winner          : NO_PLAYER,
        langs           : i18n.availableLocales,
        settings        : settings,
        remoteManager   : remoteManager,

        // GUI only
        snackbar : {msg : "", show : false, 
                    onClose : function(){
                        setTimeout(()=>{
                            if (this.queue && this.queue.length > 0){
                                displayMsg.apply(null, this.queue.shift());
                            } 
                        }, 250);
                    }
        },
        menu: {  show : false},
        confirm : { show        : false ,
                    title       : '',
                    onConfirm   : ()=>{} },

        dialogRemote : {show : false},
        stepper : {
            active : 'first',
            first : false,
            second : false
        }
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
                this.confirm.show = true;
                this.confirm.title = i18n.t('cancelRestartTitle');
                this.confirm.onConfirm = this.onConfirmRestart;

            }else{
                this.onConfirmRestart();
            }
        },

        checkRemote : function(){

            if (game.isBeingPlayed() ){
                //ask for a confirm
                this.confirm.show = true;
                this.confirm.title = i18n.t('remoteTitle');
                this.confirm.onConfirm = this.onConfirmRemote;
            }else{
                this.onConfirmRemote();
            }
        },

        onConfirmRemote : function(){
            this.dialogRemote.show = true;
            this.stepper.active = 'first';
        },

        inviteRemote : function(){
            
            this.stepper.active = 'second'
    
            //create a url and QR code to be shared
            //with the remote player
            this.remoteManager.invite()
            .then(()=>{

                //create the QR code 
                var typeNumber = 20;
                var errorCorrectionLevel = 'Q';
                var qr = qrcode(typeNumber, errorCorrectionLevel);
                qr.addData(this.remoteManager.invitationUrl);
                qr.make();
                document.getElementById('qrcodePlacHolder').innerHTML = qr.createImgTag();

                //once the invitation is shared, wait for connection
                this.remoteManager.waitForConnection(new GameHandler.GameHandler(game, true))
                .then(()=>{
                    this.dialogRemote.show = false;
                    displayMsg('remoteConnected');

                    game.start();
                });

            });


        },

        checkCancelRemote : function(){
            //ask for a confirm
            this.confirm.show = true;
            this.confirm.title = i18n.t('confirmCancelRemoteTitle');
            this.confirm.onConfirm = this.cancelRemote;
        },

        cancelRemote : function(){
            this.dialogRemote.show = false;
            this.remoteManager.cancel();
        },

        copyToClipboard() {
           
            var div = document.getElementById("invitationUrl");
            
            if (document.selection) {
                var range = document.body.createTextRange();
                range.moveToElementText(div);
                range.select().createTextRange();
                document.execCommand("copy");
              } else if (window.getSelection) {
                var range = document.createRange();
                range.selectNode(div);
                window.getSelection().removeAllRanges();  
                window.getSelection().addRange(range);
                document.execCommand("copy");
                displayMsg("textCopied");
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
    game.init(board);

    if (remoteManager.checkRemoteInvitation()){

        displayMsg("tryingToConnectToRemote");

        remoteManager.connectToRemoteInvitation()
        .then(()=>{
            //we are connected to a remote game
            displayMsg('connectedToRemoteGame');

            remoteManager.addHandler(new GameHandler.GameHandler(game, false)); 

        },(msg)=>{
            if (msg)  displayMsg(msg);
            //standard local game
            game.start();
        });

    }else{
        //standard local game
        game.start();
    }


    
    // Main animation loop
    function animationLoop() {
                
        board.display(game.currentPlayer);

        // Schedule the next frame
        window.requestAnimationFrame(animationLoop);
    }

    // Schedule the main animation loop
    window.requestAnimationFrame(animationLoop);

};