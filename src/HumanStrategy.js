
class HumanStrategy  {

    constructor(){
        this.isHuman = true;
    }

    atYourTurn(model, board,  boardCanvas, mousePos){
    
        return new Promise((resolve, reject)=>{

            //reset the selected column to the current mouse position
            board.setSelectedColumn(mousePos.x);
        
            let mousemove = (evt)=>{
                var rect =  boardCanvas.getBoundingClientRect();
        
                mousePos.out = false;
        
                mousePos.x = evt.clientX - rect.left;
                mousePos.y = evt.clientY - rect.top;
        
                board.setSelectedColumn(mousePos.x);
                //console.debug(mousePos);
            };
             boardCanvas.addEventListener('mousemove', mousemove, false);
            let mouseout =  ()=> (mousePos.out = true);
             boardCanvas.addEventListener('mouseout', mouseout, false);
            let click = ()=> {
                if (model.selectedColumn){

                    //current player has played, let's see if he wins 
                    removeEventListeners(false);
                }
            };
             boardCanvas.addEventListener('click', click, false);

            let removeEventListeners = (isInterrupted)=>{
                 boardCanvas.removeEventListener('mousemove', mousemove, false);
                 boardCanvas.removeEventListener('mouseout', mouseout, false);
                 boardCanvas.removeEventListener('click', click, false);
                if(isInterrupted){
                    reject();
                }else{
                    resolve();
                }
            };
            this.removeEventListeners = removeEventListeners;

        });
    } 

    interrupt(){
        this.removeEventListeners(true);
    }
};

export {HumanStrategy};