
import * as HumanGuiStrategy from './HumanGuiStrategy.js';
import * as HumanCliStrategy from './HumanCliStrategy.js';
import * as ComputerStrategy from './ComputerStrategy.js';

import * as Timer from './Timer.js';

import * as Settings from './Settings.js';

/**
 * Player can be a human or a computer type
 * Its strategy will be updated according its type
 * 
 * a Strategy must looks like:
 *  {
 *      isHuman
 *      Promise selectColumn(model) //the promise is resolved when the player choose a column. The promise return the choosen column number
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
     * @param {*} settings : isHuman, level
     */
    constructor(config, settings){
        
        this.settings = Settings.init(settings);

        let isHuman = this.settings.listen('isHuman', (newval)=>{
            this._changeStrategy(newval);
            this.timer.enable(config.timerEnabled && newval);
        }, false);

        this.settings.listen('level', (newval)=>{
            this.strategy.depth = newval;
        }, 3);

        this.timer = new Timer.Timer(config.timerEnabled && isHuman);
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


    _changeStrategy(isHuman){
        if ( isHuman ){
            if (this.board){
                this.strategy = new HumanGuiStrategy.HumanGuiStrategy(this.board);
            }else{
                this.strategy = new HumanCliStrategy.HumanCliStrategy();
            }
        }else{
            this.strategy = new ComputerStrategy.ComputerStrategy(this, this.settings.level);
        }
    }

    isHuman(){
        return this.settings.isHuman;
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
     * @returns a Promise with the choosen column number 
     */
    selectColumn(model){
        this.timer.resume();
        return this.strategy.selectColumn(model)
        .finally(()=>{
            this.timer.suspend();
        });
    } 

    /**
     * this player become the curent player and 'otherPlayer' will be the next
     * initialize players in order to both players to know who is the next one
     * @param {*} otherPlayer 
     */
    initPlayer(otherPlayer){
        this.nextPlayer = otherPlayer;
        otherPlayer.nextPlayer = this;

        this.isCurrentPlayer = true;
        otherPlayer.isCurrentPlayer = false;

        this.timer.reset();
        otherPlayer.timer.reset();
    }

    /**
     * 
     */
    switchToNextPlayer(){
        if (! this.isCurrentPlayer) console.error("The player", this.name, "is not the current one. switchToNextPlayer() must not be called")
        this.isCurrentPlayer = false;
        this.nextPlayer.isCurrentPlayer = true;
        
        return this.nextPlayer;
    }

    /** interrupt a player while playing 
     * @returns Promise when the player is interrupted
    */
    interrupt(){
       return this.strategy.interrupt();
    }
};

export {Player};