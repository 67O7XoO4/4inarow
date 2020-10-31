
class HumanStrategy  {

    constructor(){
        this.isHuman = true;
    }

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
        
            let removeEventListeners = (isInterrupted)=>{
                canvasConfig.boardCanvas.removeEventListener('mousemove', mousemove, false);
                canvasConfig.boardCanvas.removeEventListener('click', click, false);
                if(isInterrupted){
                    reject();
                }else{
                    resolve();
                }
            };
            this.removeEventListeners = removeEventListeners;

            let click = ()=> {
                if (model.selectedColumn){

                    //current player has played, let's see if he wins 
                    removeEventListeners(false);
                }
            };

            canvasConfig.boardCanvas.addEventListener('click', click, false);
        });
    } 

    interrupt(){
        this.removeEventListeners(true);
    }
};

export {HumanStrategy};