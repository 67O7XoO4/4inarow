import { BoardModel } from "./BoardModel";
import { Player } from "./Player";
import * as MinMax from "./MinMax";

let isInterrupted  = false;
let actions={};

//message received from ComputerStrategy
onmessage = function(oEvent) {
    let data = JSON.parse(oEvent.data)
    //console.log('from main thread : ', data);
    //run the required action
    actions[data.action].apply(null, [data]);
};

actions['interrupt'] = function(data){
    isInterrupted  = true;
};

// run mimax action
actions['runMinMax'] = function(data){
    isInterrupted  = false;
    // recreate the Two users
    let playerToBeEvaluated = new Player(data.playerToBeEvaluatedKey);
    let currentPlayer = new Player(data.currentPlayerKey);

    currentPlayer.initPlayer(playerToBeEvaluated);

    //recreate the boardmodel 
    let board = new BoardModel(data.boardModel.settings);
    board.init(data.boardModel.data, [currentPlayer, playerToBeEvaluated]);

    //run minmax
    let colnum = MinMax.pickColumn(board, playerToBeEvaluated,  data.depth, {isInterrupted : function(){return isInterrupted;} });
    
    //post result
    postMessage(JSON.stringify({
        colnum : colnum
    }));
};
