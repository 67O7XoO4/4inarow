
import * as HumanStrategy from './HumanStrategy.js';
import * as ComputerStrategy from './ComputerStrategy.js';

/**
 * Player can be a human or a computer type
 * Its strategy will be updated according its type
 * 
 * a Strategy must looks like:
 *  {
 *      isHuman
 *      Promise atYourTurn(model) //the promise is resolved when the player played
 *      interrupt()
 *  }
 * 
 */
class Player {
    
    /**
     * 
     * @param {*} config if a String then it will be the name of the player else
     * {
     *      key :''         // to identify the player
     *      name : ''       // name of the player
     *      color : ''      // color of the player
     * }
     * @param {*} isHuman human or computer
     */
    constructor(config, isHuman){
        
        this.nextPlayer = null;
        this.isCurrentPlayer = false;
        //color

        this.suspended = false;

        this._changeStrategy(isHuman);

        if (typeof config == "string"){
            this.name = config;
        }else{
            Object.assign(this, config);
        }
    }

    /**
     * change the strategy and, thus, the type of player (human/computer)
     */
    changeStrategy(){
        this._changeStrategy( ! this.isHuman())
    }

    _changeStrategy(isHuman){
        if ( isHuman ){
            this.strategy = new HumanStrategy.HumanStrategy(this.board);
        }else{
            this.strategy = new ComputerStrategy.ComputerStrategy(this);
        }
    }

    isHuman(){
        return this.strategy.isHuman;
    }

    /**human need a board to play */
    setBoard(board){
        this.board = board;
        //update strategy with the new board
        this._changeStrategy(this.isHuman())
    }

    /**
     * Call by the app when the player is the current player and should play
     * 
     * @param {*} model 
     */
    atYourTurn(model){
        return this.strategy.atYourTurn(model);
    } 

    /**
     * this player become the curent player and 'otherPlayer' will be the next
     * initialize players in order to both players to know who is the next one
     * @param {*} otherPlayer 
     */
    setNextPlayer(otherPlayer){
        this.nextPlayer = otherPlayer;
        otherPlayer.nextPlayer = this;

        this.isCurrentPlayer = true;
        otherPlayer.isCurrentPlayer = false;
    }

    switchToNextPlayer(){
        if (! this.isCurrentPlayer) console.error("The player", this.name, "is not the current one. switchToNextPlayer() must not be called")
        this.isCurrentPlayer = false;
        this.nextPlayer.isCurrentPlayer = true;
        
        return this.nextPlayer;
    }

    /** interrupt a playe while playing */
    interrupt(){
        this.strategy.interrupt();
    }
};

export {Player};