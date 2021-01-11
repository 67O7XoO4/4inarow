

let mousePos = {x: 0, y:0, out: true}; //out = mouse over or not

/**
 * Human strategy when a GUI is available 
 */
class HumanGuiStrategy  {

    constructor(board){
        this.isHuman = true;
        this.board = board;
    }

    selectColumn(model){
    
        return new Promise((resolve, reject)=>{

            //reset the selected column to the current mouse position
            let selectedColumn = this.board.getColumn(mousePos.x);
            this.board.setSelectedColnum(selectedColumn);

            //listen to mouse event, find the selected column and play

            let mousemove = (evt)=>{
                var rect =  this.board.canvas.getBoundingClientRect();
        
                mousePos.out = false;
        
                mousePos.x = evt.clientX - rect.left;
                mousePos.y = evt.clientY - rect.top;
        
                selectedColumn = this.board.getColumn(mousePos.x);
                this.board.setSelectedColnum(selectedColumn);
                //console.debug(mousePos);
            };
            this.board.canvas.addEventListener('mousemove', mousemove, false);
            let mouseout =  ()=> (mousePos.out = true);
            this.board.canvas.addEventListener('mouseout', mouseout, false);
            let click = ()=> {
                if (selectedColumn != null){

                    //current player has played, let's clean the listener and resolve the promise 
                    removeEventListeners(false);
                }
            };
            this.board.canvas.addEventListener('click', click, false);

            let removeEventListeners = (isInterrupted)=>{
                this.board.canvas.removeEventListener('mousemove', mousemove, false);
                this.board.canvas.removeEventListener('mouseout', mouseout, false);
                this.board.canvas.removeEventListener('click', click, false);

                 this.$clearAll = null;

                if(isInterrupted){
                    selectedColumn = null;
                }
                resolve(selectedColumn);
                
            };
            this.$clearAll = removeEventListeners;
        });
    } 

    /**
     * 
     */
    interrupt(){
        //we have been interrupted, we clean the listener (if exist) and abort (reject) the play
        if (this.$clearAll) this.$clearAll(true);
    }
};

export {HumanGuiStrategy as HumanGuiStrategy};