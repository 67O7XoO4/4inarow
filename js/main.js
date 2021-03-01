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


import i18n from './i18n/I18n.js';
 
import qrcode from 'qrcode-generator';

import UserBoard from './components/UserBoard.vue';
import DrawerContent from './components/DrawerContent.vue';
import MsgBox from './components/MsgBox.vue';
import SpaceBlock from './components/SpaceBlock.vue';



const NO_PLAYER = {key : ''};


/** display a message in a snackbar */
function displayMsg(msgKey, params){    
    
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
    red             : { isHuman       : true , level : 4},
    yellow          : { isHuman       : false, level : 4},
    board           : {
        nbCellsToWin    : 4,
        nbRows          : 6,
        nbColumns       : 7,
    }
});

let game = new Game.Game(event=>{
    if (actions[event]) actions[event].call();
}, settings, i18n);

let remoteManager = new RemoteManager.RemoteManager();

i18n.locale = settings.listen('lang', (newval)=>{
    i18n.locale = newval;
}, 'en');

Vue.use(VueMaterial); 


var fourInARowApp = new Vue({
    i18n,
    el: '#fourInARowApp',
    components: {
        UserBoard, DrawerContent, MsgBox, SpaceBlock
      },
    data: {
        game            : game,
        players         : game.players,
        winner          : NO_PLAYER,
        
        settings        : settings,
        remoteManager   : remoteManager,

        // GUI only
        snackbar : {msg : "", show : false, 
                    onClose : function(){
                        setTimeout(()=>{
                            //pop remaining messages. see displayMsg()
                            if (this.queue && this.queue.length > 0){
                                displayMsg.apply(null, this.queue.shift());
                            } 
                        }, 250);
                    }
        },
        menu: {  show : false},
        confirm : { show        : false ,
                    title       : '',
                    onConfirm   : ()=>{
                        // no confirm 
                    } },

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

        //resume game after a player has been suspended
        resume(player){
            // relaunch game if it was waiting for the suspended user
            if (game.currentPlayer == player) game.nextMove();
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
                    remoteManager.onClose(()=>{
                        displayMsg('remoteGameClosed');    
                    });
        
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
           
            let div = document.getElementById("invitationUrl");
            
            if (document.selection) {
                let range = document.body.createTextRange();
                range.moveToElementText(div);
                range.select().createTextRange();
                document.execCommand("copy");
              } else if (window.getSelection) {
                let range = document.createRange();
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
            remoteManager.onClose(()=>{
                displayMsg('remoteGameClosed');    
            });

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