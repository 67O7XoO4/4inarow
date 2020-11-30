

//TODO should be in the board class
const config = {
    columnWidth : 65,
    rowHeight   : 65,
    cellRadius  : 25,
    hMargin      : 22,
    vMargin      : 22,
    edgeCurve   : 15,
    boardColor  : "rgb(30, 130, 220)" //#1E82DC
};


function getXinf(column){
    return config.hMargin + column.num * config.columnWidth;
}

function getXSup(column){
    return getXinf(column) + config.columnWidth; 
}
 
function getX(column){
    return getXinf(column) + config.columnWidth/2; 
}

function getY(cell){    
    return config.vMargin + cell.num * config.rowHeight +  config.rowHeight/2; 
}

//from MDN, 
function rectArrondi(ctx, x, y, largeur, hauteur, rayon) {
    ctx.beginPath();
    ctx.moveTo(x, y + rayon);
    ctx.lineTo(x, y + hauteur - rayon);
    ctx.quadraticCurveTo(x, y + hauteur, x + rayon, y + hauteur);
    ctx.lineTo(x + largeur - rayon, y + hauteur);
    ctx.quadraticCurveTo(x + largeur, y + hauteur, x + largeur, y + hauteur - rayon);
    ctx.lineTo(x + largeur, y + rayon);
    ctx.quadraticCurveTo(x + largeur, y, x + largeur - rayon, y);
    ctx.lineTo(x + rayon,y);
    ctx.quadraticCurveTo(x, y, x, y + rayon);
    ctx.fill();
}

/**
 * Board of the game. It must be drawned in a canvas
 */
class Board {
    
    model = null;

    constructor(boardModel, canvasId){
        this.model = boardModel; 

        this.model.onSizeChange( ()=>{
            this.resize();
        });
 
        //init board and its related canvas
            
        // canvas config (Size,...). These get updated after browser loading.
        this.canvas = document.getElementById( canvasId );
        this.ctx = this.canvas.getContext("2d");
    
        let board = this;

        this.resize = ()=>{
            // Clear the canvas and redraw all the board 
            board.ctx.clearRect(0, 0, this.getXRight(), this.getHeight());

            //map the canvas size to the displayed size
            board.canvas.width = board.canvas.parentElement.clientWidth;
            board.canvas.height = board.canvas.parentElement.clientHeight;

            //size 500
            config.columnWidth = Math.round(board.canvas.width  / (board.model.getConfig().nbColumns+1 ) ); //65
            config.rowHeight   = Math.round(board.canvas.height / (board.model.getConfig().nbRows+1 ) ); //65

            config.cellRadius = (Math.min( config.columnWidth, config.rowHeight) / 2) * (8/10) ;

            config.vMargin     = config.cellRadius;
            config.hMargin     = config.cellRadius ;

            //set Y=0 at the bottom of the board
            board.ctx.translate(0, board.getHeight() );
            board.ctx.scale (1, -1);
        }
        
        this.resize();

        window.addEventListener("resize", this.resize, false);
    }
    
    forEachCell(callback){
        this.model.columns.forEach((column)=>{
            column.cells.forEach((cell)=>callback(column, cell))
        });
    }

    setSelectedColumn(x){
        let col = this.model.columns.find(column => getXinf(column) < x && x <= getXSup(column) );
        if (col) this.model.setSelectedColumn(col.num);
        return this.selectedColumn;
    }


    /**
     * 
     */    
    display(currentPlayer) {
        let ctx = this.ctx;
        // Clear the canvas and redraw all the board 
        ctx.clearRect(0, 0, this.getXRight(), this.getHeight());

        ctx.fillStyle = config.boardColor;
            
        rectArrondi(ctx,
            this.getXLeft(), 
            this.getYBottom(), 
            this.getInnerWidth(),
            this.getInnerHeight(),
            config.edgeCurve
        );

        this.model.forEachCell((column, cell)=>{
            
                ctx.shadowColor = "black";
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                ctx.fillStyle = cell.value.color;

                ctx.beginPath();

                ctx.arc(
                    getX(column),
                    getY(cell),
                    config.cellRadius,
                    0, 
                    Math.PI * 2, 
                    true);    
        
                ctx.fill();
                // ctx.fillText(column.num + "/" + cell.num, column.x, cell.y); 

                if (cell.isWinning){

                    ctx.lineWidth = 3;
                    ctx.beginPath();
        
                    ctx.arc(
                        getX(column),
                        getY(cell),
                        config.cellRadius + 1,
                        0, 
                        Math.PI * 2, 
                        true);    
            
                    ctx.stroke();
                }

                if (this.model.getLastPlayedCell() === cell){
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.strokeStyle = cell.value.color;
                    ctx.arc(
                        getX(column),
                        getY(cell),
                        config.cellRadius + 1,
                        0, 
                        Math.PI * 2, 
                        true);    
            
                    ctx.stroke();
                }
                ctx.shadowColor='rgba(0,0,0,0)';
        
        });

        this._displaySelectedColumn(currentPlayer);
    }


    /**
     * private
     */
    _displaySelectedColumn(currentPlayer){
        let ctx = this.ctx;
        //show column selection 
        if (this.model.selectedColumn){

            ctx.fillStyle = currentPlayer.color;
            ctx.beginPath();
            ctx.arc(
                getX(this.model.selectedColumn), 
                this.getYUp(), 
                config.cellRadius,
                0 , 
                Math.PI);
            ctx.fill();
        }
    }

    getXLeft(){
        return config.hMargin;
    }

    getYBottom(){
        return config.vMargin;
    }
    
    getInnerWidth(){
        return config.columnWidth * this.model.getConfig().nbColumns;
    }

    getInnerHeight(){
        return config.rowHeight * this.model.getConfig().nbRows;
    }

    getHeight(){
        return 2*config.vMargin + config.rowHeight * this.model.getConfig().nbRows;
    }

    getXRight(){
        return config.hMargin + this.model.getConfig().nbColumns * config.columnWidth;
    }

    getYUp(){
        return config.vMargin + config.rowHeight * this.model.getConfig().nbRows;
    }

}

export { Board };
