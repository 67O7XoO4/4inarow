
//interface
class Player {
    
    constructor(name){
        this.name = name;
    }

    //nextPlayer : null
    //color

    isHuman(){
        return null;
    };

    atYourTurn(model, board,  canvasConfig, mousePos){
        return Promise.resolve();
    } 

    setNextPlayer(otherPlayer){
        this.nextPlayer = otherPlayer;
        otherPlayer.nextPlayer = this;
    }
};

export {Player};