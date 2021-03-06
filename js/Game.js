import { Board } from './Board.js';
import * as Player from './Player.js';

import * as Settings from './util/Settings.js';
import * as Observable from './util/Observable.js';


const RED_CONFIG = {   color : "rgb(255, 100, 100)", key : "RED"   }; //#FF6464
const YELLOW_CONFIG = { color : "rgb(255, 255, 0)" , key : "YELLOW"  };

const EVENTS = {
    GAME_STARTED        : 'GAME_STARTED',
    JUST_PLAYED         : 'JUST_PLAYED',
    PLAYER_WIN          : 'PLAYER_WIN',
    DRAW_GAME           : 'DRAW_GAME',
    PLAYER_SUSPENDED    : 'PLAYER_SUSPENDED',
    UNDO                : 'UNDO'
};

class Game {
    
    players = [];
    currentPlayer = null;

    $observable = new Observable.Observable();

    /**
     * 
     * @param {*} gameListener(event, currentPlayer) optional function callback to listen game event 
     * @param {*} settings optional game settings 
     * @param {*} i18n 
     */
    constructor(gameListener, settings, i18n){

        this.$observable.addAllEventsListener( gameListener );

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

        this.isDraw = false;
        this.isWon = false;
        
    }
    
    /**
     * 
     * @param {*} event 
     * @param {*} listener 
     */
    listen(event, listener){
        return this.$observable.addListener(event, listener );
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
        return this.isDraw   || this.isWon;
    }

    isBeingPlayed(){
        return this.isStarted()  && ! this.isOver();
    }

    /**
     * set a board or a model for the game
     * 
     * @param {*} boardOrModel 
     */
    init(boardOrModel){
        
        this.isDraw = false;
        this.isWon = false;

        if (boardOrModel){
            //if no board, then we must already have the model
            //For instance, if the player start a new game after a first one
            if (boardOrModel instanceof Board){
                //human need a board to play
                this.players[0].setBoard(boardOrModel);
                this.players[1].setBoard(boardOrModel);
            
                this.model = boardOrModel.model;
            }else{
                //we assume it is a boardModel 
                //(useful for Game without GUI, in CLI mode)
                this.model = boardOrModel;        
            }
        }
    }

    /**
     * start the game. one can provide a board (or a model)
     * 
     * @param board optional if a board has already been provided by calling init() function
     */
    start(board){
        
        this.currentPlayer.interrupt()
        
        this.players[0].timer.reset();
        this.players[1].timer.reset();

        this.init(board);
        
        this.model.clearAll();

        this.$observable.emit(EVENTS.GAME_STARTED);

        //launch the first move
        this.nextMove();
    }

    /**
     * check for player suspension and ask him to play otherwise
     */
    nextMove(){
        // console.log("nextMove", this.currentPlayer.name);
        if ( ! this.currentPlayer.suspended){
                
            this.currentPlayer.selectColumn(this.model)
            //when ready, play the next move
            .then((columnNumber)=> {    
                if (columnNumber == null) {
                    console.log("interrupted");
                    return;
                }
                // console.log("nextMove columnNumber",columnNumber, this.currentPlayer.name);
                // Let's make the current player play at the selected column
                // Chek if he wins
                // or else ask the next user to play
                this.model.playAtSelectedColumn(columnNumber, this.currentPlayer);

                if ( this.model.checkIfLastPlayWin()){
        
                    this.isWon = true;
                    this.$observable.emit( EVENTS.PLAYER_WIN, this.currentPlayer);

                }else if ( this.model.isComplete()){
                    //draw game
                    this.isDraw = true;
                    this.$observable.emit( EVENTS.DRAW_GAME);
                }else{
                    this.$observable.emit( EVENTS.JUST_PLAYED, this.currentPlayer);
                    
                    //switch to next player 
                    this.currentPlayer = this.currentPlayer.switchToNextPlayer();
        
                    this.nextMove(this.model);
                }
            } )

        }else{
            // console.log("nextMove PLAYER_SUSPENDED", this.currentPlayer.name);
            this.$observable.emit( EVENTS.PLAYER_SUSPENDED);
        }
    }

    /**
     * 
     */
    undoLastMove(){
        this.currentPlayer.interrupt();

        let wasWinning = this.model.undoLastMove();
        if ( ! wasWinning){
            //in fact, it should be previousPlayer() but it's the same !
            this.currentPlayer = this.currentPlayer.switchToNextPlayer();
        }
        this.$observable.emit( EVENTS.UNDO);

    }

}
export { Game, EVENTS };