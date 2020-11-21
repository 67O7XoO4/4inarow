

let mousePos = {x: 0, y:0, out: true}; //out = mouse over or not

/**
 * 
 */
class HumanStrategy  {

    constructor(board){
        this.isHuman = true;
        this.board = board;
    }

    atYourTurn(model){
    
        return new Promise((resolve, reject)=>{

            //reset the selected column to the current mouse position
            this.board.setSelectedColumn(mousePos.x);
        
            //listen to mouse event, find the selected column and play

            let mousemove = (evt)=>{
                var rect =  this.board.canvas.getBoundingClientRect();
        
                mousePos.out = false;
        
                mousePos.x = evt.clientX - rect.left;
                mousePos.y = evt.clientY - rect.top;
        
                this.board.setSelectedColumn(mousePos.x);
                //console.debug(mousePos);
            };
            this.board.canvas.addEventListener('mousemove', mousemove, false);
            let mouseout =  ()=> (mousePos.out = true);
            this.board.canvas.addEventListener('mouseout', mouseout, false);
            let click = ()=> {
                if (model.selectedColumn){

                    //current player has played, let's clean the listener and resolve the promise 
                    removeEventListeners(false);
                }
            };
            this.board.canvas.addEventListener('click', click, false);

            let removeEventListeners = (isInterrupted)=>{
                this.board.canvas.removeEventListener('mousemove', mousemove, false);
                this.board.canvas.removeEventListener('mouseout', mouseout, false);
                this.board.canvas.removeEventListener('click', click, false);

                 this.removeEventListeners = null;

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
        //we have been interrupted, we clean the listener (if exist) and abort (reject) the play
        if (this.removeEventListeners) this.removeEventListeners(true);
    }
};

export {HumanStrategy};