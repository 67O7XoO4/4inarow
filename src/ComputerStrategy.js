
const MAX_SCORE = 1000;
const CANT_PLAY_SCORE = MAX_SCORE + 1;

const DRAW_SCORE = 0;
const EMTPY_CELL_SCORE = 1;
const SAME_PLAYER_CELL_SCORE = 4;

let cachedScores = [];

class ComputerStrategy  {

    /**
     * 
     */
    depth = 5 ; 
 
    constructor(player){
        this.isHuman = false;
        this.player = player;
    }

    atYourTurn(model){
        let promise = new Promise((resolve) => {
            setTimeout(()=>{
                model.setSelectedColumn(this.pickColumn(model,  this.depth));

                return resolve();
            }, 10);
        });

        return promise;
    };

    /**
     * do nothing. computer cannot be interrupted (TO BE DONE)
     */
    interrupt(){
        //this.interrupted = true;
    }

    /**
     * computer specific method. (usefull for unit test)
     * Run the algorithym to find the best column to play on the given board model.
     * 
     * @param {*} model 
     * @param depth
     */
    pickColumn(model, depth){

        cachedScores = [];
        let selection = minMax( model.clone(), this.player, this.player.nextPlayer, depth);
        
        return selection.num;
    }
}


/**
 * https://fr.wikipedia.org/wiki/Algorithme_minimax
 * 
 * @param {*} model 
 * @param playerToBeEvaluated
 * @param {*} currentPlayer player who juste played
 * 
 * @returns {score: columnScore, num : column.num}
 */
function minMax(model, playerToBeEvaluated, currentPlayer, currentDepth){

    let initialScore = null;
    let currentPlayerCoeff = (currentPlayer === playerToBeEvaluated ? 1 : -1);

    //evaluation of the last move (of the current player)
    
    //is last move a win ?
    if (model.getLastPlayedCell() && model.checkIfLastPlayWin()){
        return {
                score: MAX_SCORE * currentPlayerCoeff, 
                num : model.getLastPlayedCell().column.num
            };

    }else if (model.isComplete()){
        //draw game
        return {
            score: DRAW_SCORE , 
            num : model.getLastPlayedCell().column.num
        };

    }else  if(currentDepth === 0 ){
        // evaluate the state of the game for the current Player
        return {
            score: evaluate(model, currentPlayer) * currentPlayerCoeff ,
            num : model.getLastPlayedCell().column.num
        };

    } else {

        let minOrMax = null; //min or max method to be called

        if (playerToBeEvaluated === currentPlayer.nextPlayer){
            //maximize the score
            initialScore = - CANT_PLAY_SCORE;
            minOrMax = (columnScore, currenScore)=>{
                return columnScore > currenScore
            };
    
        }else {
            //minimizing score 
            initialScore = CANT_PLAY_SCORE;
            minOrMax = (columnScore, currenScore)=>{
                return columnScore < currenScore
            };
        }

        let scoreKey = model.key()+currentPlayer.name;
        let cachedScore = cachedScores[scoreKey];
        if ( ! cachedScore){
            //go deeper
            cachedScore =  model.columns.reduce((currentSelection, column)=>{

                let columnScore=null;

                if(! column.isComplete()){
                
                    model.play(column, currentPlayer.nextPlayer);
                    columnScore = minMax(model, playerToBeEvaluated, currentPlayer.nextPlayer, currentDepth - 1).score;
                    column.removeLastPlay();
                
                }else{
                    //don't play on complete column
                    columnScore = initialScore;
                }
                
                //console.log('minMax:', currentPlayer.nextPlayer.name, column.num,"=" ,columnScore, "depth=",currentDepth);
                
                return  minOrMax(columnScore, currentSelection.score) ? 
                            {score: columnScore, num : column.num} : currentSelection;

            }, {score: initialScore, num : 0});//initial selection

            cachedScores[scoreKey] = cachedScore;
        }
        return cachedScore;
    }
};

/**
 * 
 * @param {*} model 
 * @param {*} playerToBeEvaluated 
 */
function evaluate(model, playerToBeEvaluated){
    
    let total = model.columns.reduce((score, column) => {
        
        let lastPlayedCell = column.getLastPlayedCell();
        //if there is no last played cell, we take the first (empty) cell to evaluate
        if (! lastPlayedCell ) lastPlayedCell = column.getFirstCell();

        let cellScore = evaluateCell(lastPlayedCell, model, playerToBeEvaluated) ;

        return  score += cellScore  ;

    }, 0);
    

    return total;
}

/**
 * 
 */
function evaluateCell(cell, model, playerToBeEvaluated){ 

    let score=0;

    if (cell.value === playerToBeEvaluated || cell.isEmpty() ){
        //vertical
        score += evaluateDirection(cell, model, playerToBeEvaluated, model.getPrevious, model.getNext);
        //horizontal
        score += evaluateDirection(cell, model, playerToBeEvaluated, model.getLeftSibling, model.getRightSibling);
        //diag bottom to up
        score += evaluateDirection(cell, model, playerToBeEvaluated, model.getLeftPreviousSibling, model.getRightNextSibling);
        //diag up to bottom
        score += evaluateDirection(cell, model, playerToBeEvaluated, model.getLeftNextSibling, model.getRightPreviousSibling);
        
        //add bonus if the current cell is owned by the player to be evaluated 
        // and there is a chance to have a winning position (score>0) 
        if (score > 0 && cell.value === playerToBeEvaluated){
            score += SAME_PLAYER_CELL_SCORE;
        }
    }

    //console.log(score);

    return score;
}

//
function evaluateDirection(cell, model, playerToBeEvaluated, left, right){
    let score=0;

    //check if there is at most 'nbCellsToWin' cells on the left side of the cell
    let nbLeft=0;
    let cellToTest = left.apply(model, [cell]);
    if (cellToTest){
        
        for(; nbLeft < model.getConfig().nbCellsToWin-1; nbLeft++){
            if (!cellToTest){
                //border of the board
                break;

            }else if (cellToTest.isEmpty() ){
                score += EMTPY_CELL_SCORE;

            } else if (cellToTest.value === playerToBeEvaluated){
                score += SAME_PLAYER_CELL_SCORE;

            }else{
                //cell of the other player, we stop here
                break;
            }
            cellToTest = left.apply(model, [cellToTest]);
        }
    }

    //same thing on the right side
    let nbRight=0;
    cellToTest = right.apply(model, [cell]);
    if (cellToTest){
        for(; nbRight < model.getConfig().nbCellsToWin-1; nbRight++){
            if (!cellToTest){
                break;

            }else if (cellToTest.isEmpty() ){
                score += EMTPY_CELL_SCORE;

            } else if (cellToTest.value === playerToBeEvaluated){
                score += SAME_PLAYER_CELL_SCORE;
                
            }else{
                //cell of the other player, we stop here
                break;
            }
            cellToTest = right.apply(model, [cellToTest]);
        }
    }
    if ( (nbRight + nbLeft + 1) < model.getConfig().nbCellsToWin ){
        //reset score if there no chance to get enough cells to win
        score = 0;
    }
    return score;
}


export {
    ComputerStrategy, 
    //for unit testing only
    evaluate,
    evaluateCell, 
    MAX_SCORE,
    DRAW_SCORE,
    EMTPY_CELL_SCORE,
    SAME_PLAYER_CELL_SCORE
};
