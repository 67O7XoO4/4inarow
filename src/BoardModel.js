
//Empty cell
const EMPTY = { color : "rgb(245, 245, 245)", name : '-'};

const config = {
    nbCellsToWin: 4,
    nbRows      : 6,
    nbColumns   : 7,
};

class Cell {
    constructor(column, num){
        this.num = num;
        this.column = column;

        this.value = EMPTY;
        this.isWinning = false;
    }

    isEmpty(){
        return this.value === EMPTY;
    }
}

class Column {
    constructor(num){
        this.num = num;
        //fill column with nbRows cells
        this.cells = Array(config.nbRows).fill().map((v,i)=>(new Cell(this, i)));
    }

    isEmpty(){
        return  this.cells[0].isEmpty();
    }

    isComplete(){
        return  ! this.cells.find((cell)=> cell.isEmpty() );
    }

    getLastPlayedCell(){
        return  this.cells
                        .slice()
                        .reverse()
                        .find((cell)=> ! cell.isEmpty() );
    }
    
    getFirstCell(){
        return  this.cells[0];
    }

    removeLastPlay(){
        let foundCell = this.getLastPlayedCell();
        if (foundCell){
            foundCell.value = EMPTY;
        }
    }
}

class BoardModel {
    selectedColumn = null;
    columns = null;
    playedCells = [];

    constructor(){
        //fill board with columns
        this.columns = Array(config.nbColumns).fill().map((v,i)=>(new Column(i)));
    }

    clone(){
        let otherBoard = new BoardModel();
       
        //clone columns
        this.forEachCell((column, cell)=>{
            otherBoard.columns[column.num].cells[cell.num].value = cell.value;
        });
        
        this.playedCells.forEach((cell)=>{
            otherBoard.playedCells.push(otherBoard.columns[cell.column.num].cells[cell.num]);
        }) ;

        return otherBoard;
    }

    /**
     * only for unit test.
     * initialize the board with the given array
     * awaited format example (only the first 3 rows are described, the left ones are still empty):
     * [
     * [0, player1, player1, 0, 0,      0, 0],
     * [0, player1, player2, 0, 0,      0, 0],
     * [0, player1, player2, 0, 0, player2, 0]
     * ]
     * 
     * @param {*} array [[]] 
     */
    init(array){
        let rowNum = 0;

        //empty the board
        this.forEachCell((column, cell)=>{
            this.columns[column.num].cells[cell.num].value = EMPTY;
            this.columns[column.num].cells[cell.num].isWinning = false;
        });

        //forEach Right
        for(let i=array.length-1; i>=0; i--){

            array[i].forEach((value, colNum)=>{

                if ( ! value) {
                    value = EMPTY;
                }
                this.columns[colNum].cells[rowNum].value = value;
            })
            rowNum++;
        }
        this.selectedColumn =null;
        this.playedCells = [];
    }

    clearAll(){
        this.init([[]]);
    }

    key(){
        let key = "";
        this.forEachCell((column, cell)=>{
            key += cell.value.name;
        });
        return key;
    }

    getLastPlayedCell(){
        if(this.playedCells.length == 0) return null;
        return  this.playedCells[this.playedCells.length - 1];
    }

    undoLastPlay(){

        let isWinning = this.checkIfLastPlayWin();
        let cell = this.playedCells.pop();
        cell.value = EMPTY;

        if (isWinning){
            this.forEachCell((column, cell)=>{
                this.columns[column.num].cells[cell.num].isWinning = false;
            });    
            return true;
        }


        return false;
    }

    isEmpty(){
        return  this.columns.every((column)=>{
            return column.isEmpty();
        });
    }

    /**
     * 
     * @param {*} callback(column, cell)
     */    
    forEachCell(callback){
        this.columns.forEach((column)=>{
            column.cells.forEach((cell)=>callback(column, cell))
        });
    }

    /**
     * 
     * @param {*} num 
     */
    setSelectedColumn(num){
        this.selectedColumn = this.columns[num];
        return this.selectedColumn;
    }

    /**
     * 
     * @param {*} player 
     */
    playAtSelectedColumn(player){
        this.play(this.selectedColumn, player);
    }
    
    /**
     * 
     * @param {*} column 
     * @param {*} player 
     */
    play(column, player){
        let foundCell = column.cells.find((cell)=> cell.isEmpty() );
        if (foundCell) {
            foundCell.value = player;
        }else{
            throw "Can't play on complete column : "+column.num;
        }
        this.playedCells.push(foundCell);
    }

    isComplete(){
        return this.columns.every((column)=> column.isComplete());
    }

    /**
     * 
     */
    checkIfLastPlayWin(){
        // vertical
        let i=0;
        let cellToTest = this.getLastPlayedCell();
        let winningCells = [];

        for(; i<config.nbCellsToWin; i++){
            if (!cellToTest || cellToTest.value != this.getLastPlayedCell().value){
                break;
            }
            winningCells.push(cellToTest);  
            cellToTest = this.getPrevious(cellToTest);
        }
        if (i==config.nbCellsToWin){
            winningCells.forEach(cell=>cell.isWinning = true);
            return true;
        }
        
        //horizontal
        if (this._checkHorizontal(this.getLastPlayedCell(), this.getLeftSibling, this.getRightSibling)){
            return true;
        }
        //diag bottom to up
        if (this._checkHorizontal(this.getLastPlayedCell(), this.getLeftPreviousSibling, this.getRightNextSibling)){
            return true;
        }

        //diag up to bottom
        if (this._checkHorizontal(this.getLastPlayedCell(), this.getLeftNextSibling, this.getRightPreviousSibling)){
            return true;
        }
        return false;
    }

    //
    _checkHorizontal(cell, left, right){
        let winningCells = [];
        
        //check if there is at most 'nbCellsToWin' cells on the left side of the cell
        let nbLeft=0;
        var cellToTest = left.apply(this, [cell]);
        if (cellToTest){
            
            for(; nbLeft < config.nbCellsToWin-1; nbLeft++){
                if (!cellToTest || cellToTest.value != cell.value){
                    break;
                }
                winningCells.push(cellToTest);
                cellToTest = left.apply(this, [cellToTest]);
            }
        }

        //same thing on the right side
        let nbRight=0;
        cellToTest = right.apply(this, [cell]);
        if (cellToTest){
            for(; nbRight < config.nbCellsToWin-1; nbRight++){
                if (!cellToTest || cellToTest.value != cell.value){
                    break;
                }
                winningCells.push(cellToTest);
                cellToTest = right.apply(this, [cellToTest]);
            }
        }

        //
        let isWinning = (nbRight + nbLeft + 1 >= config.nbCellsToWin);

        if (isWinning){
            winningCells.push(cell);
            winningCells.forEach(cell=>cell.isWinning = true);
        }
        
        return isWinning;
    }

    getPrevious(cell){
        if (cell.num == 0) return null;
        return cell.column.cells[cell.num -1];
    }

    getNext(cell){
        if (cell.num + 1 == config.nbRows ) return null;
        return cell.column.cells[cell.num +1];
    }

    getLeftSibling(cell){
        if (cell.column.num == 0) return null;
        return  this.columns[cell.column.num -1].cells[cell.num];
    }

    getRightSibling(cell){
        if (cell.column.num + 1 == config.nbColumns ) return null;
        return  this.columns[cell.column.num +1].cells[cell.num];
    }
    
    getLeftPreviousSibling(cell){
        if (cell.column.num == 0 || cell.num == 0) return null;
        return  this.columns[cell.column.num -1].cells[cell.num-1];
    }

    getRightPreviousSibling(cell){
        if (cell.column.num + 1 == config.nbColumns || cell.num == 0) return null;
        return  this.columns[cell.column.num +1].cells[cell.num-1];
    }

    getLeftNextSibling(cell){
        if (cell.column.num == 0 || cell.num+1 == config.nbRows) return null;
        return  this.columns[cell.column.num -1].cells[cell.num+1];
    }

    getRightNextSibling(cell){
        if (cell.column.num + 1 == config.nbColumns || cell.num+1 == config.nbRows) return null;
        return  this.columns[cell.column.num +1].cells[cell.num+1];
    }

    getConfig(){
        return config;
    }
}

export { BoardModel };