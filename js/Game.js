import { Board } from './Board.js';
import * as Player from './Player.js';

import * as Settings from './Settings.js';

const RED_CONFIG = {   color : "rgb(255, 100, 100)", key : "RED"   }; //#FF6464
const YELLOW_CONFIG = { color : "rgb(255, 255, 0)" , key : "YELLOW"  };

const EVENTS = {
    GAME_STARTED        : 'GAME_STARTED',
    JUST_PLAYED         : 'JUST_PLAYED',
    PLAYER_WIN          : 'PLAYER_WIN',
    DRAW_GAME           : 'DRAW_GAME',
    PLAYER_SUSPENDED    : 'PLAYER_SUSPENDED'
};

class Game {
    
    players = [];
    currentPlayer = null;

    constructor(gameListener, settings, i18n){

        this.gameListener =  ()=>{} ;
        if(gameListener){
            this.gameListener = gameListener;
        } 
        //init players
        if (i18n){
            RED_CONFIG.name = i18n.t(RED_CONFIG.key);
            YELLOW_CONFIG.name = i18n.t(YELLOW_CONFIG.key);    
        }else{
            RED_CONFIG.name = RED_CONFIG.key;
            YELLOW_CONFIG.name = YELLOW_CONFIG.key;    
        }

        settings = Settings.init(settings);

        let timerEnabled = settings.listen('timerEnabled', (newval)=>{
            this.players[0].timer.enable(newval);
            this.players[1].timer.enable(newval );
        }, true);

        RED_CONFIG.timerEnabled = timerEnabled;
        YELLOW_CONFIG.timerEnabled = timerEnabled;

        this.players.push(new Player.Player(RED_CONFIG, settings.red));
        this.players.push(new Player.Player(YELLOW_CONFIG, settings.yellow));

        this.currentPlayer = this.players[0];
        this.currentPlayer.initPlayer(this.players[1]);
    }
    
    /**
     * 
     */
    isStarted(){
        return this.model != null && ! this.model.isEmpty()
    }

    /**
     * 
     */
    isOver(){
        return this.model != null && (this.model.isComplete() || this.model.checkIfLastPlayWin());
    }

    /**
     * 
     */
    isDraw(){
        return this.model != null 
                && this.model.isComplete()
                && ! this.model.checkIfLastPlayWin();
    }
    
    /**
     * 
     */
    isWon(){
        return this.model != null && this.model.checkIfLastPlayWin();
    }

    isBeingPlayed(){
        return this.isStarted()  && ! this.isOver();
    }

    /**
     * 
     */
    start(board){
        
        return this.currentPlayer.interrupt()
        .finally(()=>{
            
            this.players[0].timer.reset();
            this.players[1].timer.reset();
            
            if (board){
                //if no board, then we must already have the model
                //For instance, if the player start a new game after a first one
                if (board instanceof Board){
                    //human need a board to play
                    this.players[0].setBoard(board);
                    this.players[1].setBoard(board);
                
                    this.model = board.model;
                }else{
                    //we assume it is a boardModel 
                    //(useful for Game without GUI, in CLI mode)
                    this.model = board;        
                }
            }
            this.model.clearAll();
            //restart the game
            this.nextMove();

            this.gameListener.call(null, EVENTS.GAME_STARTED);
        });
    }

        
    /**
     * private
     * 
     * Let's make the current player play at the selected column
     * Chek if he wins
     * or else ask the next user to play
     */
    _play(colnum){
        
        this.model.playAtSelectedColumn(colnum, this.currentPlayer);

        if ( this.model.checkIfLastPlayWin()){

            this.gameListener.call(null, [EVENTS.PLAYER_WIN]);

        }else if ( this.model.isComplete()){
            //draw game
            this.gameListener.call(null, [EVENTS.DRAW_GAME]);
            
        }else{
            //switch to next player 
            this.currentPlayer = this.currentPlayer.switchToNextPlayer();

            this.nextMove(this.model);
        }
    }

    /**
     * check for player suspension and ask him to play otherwise
     */
    nextMove(){

        if ( ! this.currentPlayer.suspended){
                
            this.currentPlayer.selectColumn(this.model)
            //when ready, play the next move
            .then((columnNumber)=> {
                this._play(columnNumber);
                this.gameListener.call(null, EVENTS.JUST_PLAYED, this.currentPlayer.nextPlayer);
            },
             ()=>{console.log("interrupted", arguments);} )

        }else{
            this.gameListener.call(null, [EVENTS.PLAYER_SUSPENDED]);
        }
    }

    undoLastMove(){
        this.currentPlayer.interrupt()
        .finally(()=>{
            let wasWinning = this.model.undoLastMove();
            if ( ! wasWinning){
                //in fact, it should be previousPlayer() but it's the same !
                this.currentPlayer = this.currentPlayer.switchToNextPlayer();
            }
        });
    }

}
export { Game, EVENTS };