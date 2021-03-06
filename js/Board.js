

const config = {
    columnWidth     : 65,
    rowHeight       : 65,
    cellRadius      : 25,
    hMargin         : 22,
    vMargin         : 22,
    edgeCurve       : 15,
    boardColor      : "rgb(30, 130, 220)", //#1E82DC
    fallingSpeed    : 30
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

/**
 * Board of the game. It must be drawned in a canvas
 */
class Board {
    
    model = null;

    constructor(boardModel, canvasId){
        this.model = boardModel; 

        this.model.onPlay((column, player)=>{
            this.fallingToken= {
                column : column,
                player : player,
                y : this.getYUp(), 
            }
        });

        //init board and its related canvas
            
        // canvas config (Size,...). These get updated after browser loading.
        this.canvas = document.getElementById( canvasId );
        this.ctx = this.canvas.getContext("2d");
    
        let board = this;

        this.resize = ()=>{
            // Clear the canvas and redraw all the board 
            board._clearDisplay();

            //map the canvas size to the displayed size
            board.canvas.width = board.canvas.parentElement.clientWidth;
            board.canvas.height = board.canvas.parentElement.clientHeight - 5;//minus 5 for the progress bar

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

        this.model.onSizeChange( ()=>{
            this.resize();
        });
    }
    
    forEachCell(callback){
        this.model.columns.forEach((column)=>{
            column.cells.forEach((cell)=>callback(column, cell))
        });
    }

    /** get column given the X position  */
    getColumn(x){
        return this.model.columns.find(column => getXinf(column) < x && x <= getXSup(column) );
    }


    /**
     * private
     */
    _displayBackground(){
        //from MDN rectArrondi  (ctx, x, y, largeur, hauteur, rayon) 
        let ctx = this.ctx;

        let x = this.getXLeft();
        let y = this.getYBottom();
        let largeur = this.getInnerWidth();
        let hauteur = this.getInnerHeight();
        let rayon = config.edgeCurve;

        ctx.fillStyle = config.boardColor;

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
     * private
     */
    _clearDisplay(){
        this.ctx.clearRect(0, 0, this.getXRight(), this.getHeight());
    }

    /**
     * private
     */
    _displayFallingToken(){
        let ctx = this.ctx;
        //display falling token
        if (this.fallingToken){
            let old  =  ctx.globalCompositeOperation ;
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = this.fallingToken.player.color; 
            ctx.beginPath();

            ctx.arc(
                getX(this.fallingToken.column),
                this.fallingToken.y,
                config.cellRadius,
                0, 
                Math.PI * 2, 
                true);    
    
            ctx.fill();
            ctx.globalCompositeOperation = old;
            
            //make de falling token falls
            this.fallingToken.y = this.fallingToken.y - config.fallingSpeed;

            //stop falling
            if ( getY(this.model.getLastPlayedCell()) > this.fallingToken.y){
                this.fallingToken = null;
            } 
        }
        
    }

    /**
     * Add a circle around the token
     * 
     * private
     */
    _displaySpecialCell(column, cell){
        let ctx = this.ctx;
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

    /**
     * 
     */    
    display(currentPlayer) {
        let ctx = this.ctx;
        // Clear the canvas and redraw all the board 
        this._clearDisplay();

        //draw background board
        this._displayBackground()

        //display cells
        this.model.forEachCell((column, cell)=>{
            
                let old  =  ctx.globalCompositeOperation ;
                if (cell.isEmpty() 
                    || (this.model.getLastPlayedCell() === cell && this.fallingToken)
                    ){
                    // empty cell
                    ctx.globalCompositeOperation = 'destination-out';
                }else{
                    //filled cell (with a token)
                    ctx.shadowColor = "grey";
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 1;
                    ctx.shadowOffsetY = 1;
                    ctx.fillStyle = cell.value.color;    
                    ctx.strokeStyle = cell.value.color;
                }
                //draw cell
                ctx.beginPath();
                ctx.arc(
                    getX(column),
                    getY(cell),
                    config.cellRadius,
                    0, 
                    Math.PI * 2, 
                    true);    
        
                ctx.fill();
                ctx.globalCompositeOperation = old;

                if (! this.fallingToken){

                    if (cell.isWinning || this.model.getLastPlayedCell() === cell ){
                        //draw special L&F for winning cells or for last played cell
                        this._displaySpecialCell(column, cell);
                    }
                }
                ctx.shadowColor='rgba(0,0,0,0)';
        
        });

        this._displayFallingToken();

        this._displaySelectedColumn(currentPlayer);
    }


    /**
     * set the currently selected column in the board.
     * (HumanGuiStrategy uses this to set column on mouse over)
     * @param {*} num 
     */
    setSelectedColnum(num){
        this.selectedColnum = num; 
    } 

    /**
     * private
     */
    _displaySelectedColumn(currentPlayer){
        if (this.fallingToken) return ;
        
        let ctx = this.ctx;
        //show column selection 
        if (this.selectedColnum != null){

            ctx.fillStyle = currentPlayer.color;
            ctx.beginPath();
            ctx.arc(
                getX(this.model.columns[this.selectedColnum]),
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
