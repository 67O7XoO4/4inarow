
import * as HumanStrategy from './HumanStrategy.js';
import * as ComputerStrategy from './ComputerStrategy.js';
//interface
class Player {
    
    constructor(config, isHuman){
        this.suspended = false;
        if (isHuman){
            this.strategy = new HumanStrategy.HumanStrategy();
        }else{
            this.strategy = new ComputerStrategy.ComputerStrategy(this);
        }
        if (typeof config == "string"){
            this.name = config;
        }else{
            Object.assign(this, config);
        }
    }

    changeStrategy(){
        if ( ! this.isHuman()){
            this.strategy = new HumanStrategy.HumanStrategy();
        }else{
            this.strategy = new ComputerStrategy.ComputerStrategy(this);
        }
    }

    isHuman(){
        return this.strategy.isHuman;
    }

    //nextPlayer : null
    //color

    atYourTurn(model, board,  boardCanvas, mousePos){
        return this.strategy.atYourTurn(model, board,  boardCanvas, mousePos);
    } 

    setNextPlayer(otherPlayer){
        this.nextPlayer = otherPlayer;
        otherPlayer.nextPlayer = this;
    }

    interrupt(){
        this.strategy.interrupt();
    }
};

export {Player};