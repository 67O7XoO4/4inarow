import * as Player from './Player.js';

class HumanPlayer extends Player.Player {

    constructor(){
        super();
    }
    
    isHuman(){
        return true;
    };

    atYourTurn(model, board,  canvasConfig, mousePos){
    
        return new Promise((resolve, reject)=>{

            //reset the selected column to the current mouse position
            board.setSelectedColumn(mousePos.x);
        
            let mousemove = (evt)=>{
                var rect = canvasConfig.boardCanvas.getBoundingClientRect();
        
                mousePos.out = false;
        
                mousePos.x = evt.clientX - rect.left;
                mousePos.y = evt.clientY - rect.top;
        
                board.setSelectedColumn(mousePos.x);
                //console.debug(mousePos);
            };
            canvasConfig.boardCanvas.addEventListener('mousemove', mousemove, false);
        
            let click = ()=> {
                if (model.selectedColumn){
                    canvasConfig.boardCanvas.removeEventListener('mousemove', mousemove, false);
                    canvasConfig.boardCanvas.removeEventListener('click', click, false);
                    
                    //current player has played, let's see if he wins 
                    resolve();
                }
            };
            canvasConfig.boardCanvas.addEventListener('click', click, false);
        });
    } 
};

export {HumanPlayer};