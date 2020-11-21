import * as Player from './Player.js';

const RED_CONFIG = {   color : "rgb(255, 100, 100)", key : "RED"   }; //#FF6464
const YELLOW_CONFIG = { color : "rgb(255, 255, 0)" , key : "YELLOW"  };

const EVENTS = {
    GAME_STARTED        : 'GAME_STARTED',
    PLAYER_WIN          : 'PLAYER_WIN',
    DRAW_GAME           : 'DRAW_GAME',
    PLAYER_SUSPENDED    : 'PLAYER_SUSPENDED'
};

class Game {
    
    players = [];
    currentPlayer = null;

    constructor( gameListener, i18n){

        this.gameListener =  ()=>{} ;
        if(gameListener){
            this.gameListener = gameListener;
        } 
        //init players
        RED_CONFIG.name = i18n.t(RED_CONFIG.key);
        YELLOW_CONFIG.name = i18n.t(YELLOW_CONFIG.key);

        this.players.push(new Player.Player(RED_CONFIG, true));
        this.players.push(new Player.Player(YELLOW_CONFIG, false));

        this.currentPlayer = this.players[0];
        this.currentPlayer.setNextPlayer(this.players[1]);
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

    /**
     * 
     */
    start(board){
        
        this.currentPlayer.interrupt();
        
        if (board){
            //human need a board to play
            this.players[0].setBoard(board);
            this.players[1].setBoard(board);
            
            this.model = board.model;
        }
        this.model.clearAll();
        //restart the game
        this.nextMove();

        this.gameListener.call(null, [EVENTS.GAME_STARTED]);

    }

        
    /**
     * private
     * 
     * Let's make the current player play at the selected column
     * Chek if he wins
     * or else ask the next user to play
     */
    _play(){
        
        this.model.playAtSelectedColumn(this.currentPlayer);

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
                
            this.currentPlayer.atYourTurn(this.model)
            //when ready, play the next move
            .then(()=> this._play(), ()=>{console.log("interrupted", arguments);} )

        }else{
            this.gameListener.call(null, [EVENTS.PLAYER_SUSPENDED]);
        }
    }

    undoLastMove(){
        this.currentPlayer.interrupt();

        let wasWinning = this.model.undoLastMove();
        if ( ! wasWinning){
            //in fact, it should be previousPlayer() but it's the same !
            this.currentPlayer = this.currentPlayer.switchToNextPlayer();
        }
    }

}
export { Game, EVENTS };