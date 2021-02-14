
class ComputerStrategy  {

    /**
     * 
     */
    depth = 5 ; 
 
    constructor(player, depth){
        
        this.waiting = false;
        
        this.isHuman = false;
        this.player = player;
        this.depth = depth;
        
        this._currentPromiseResolve = null;
    }

    /**
     * 
     * @param {*} model 
     */
    selectColumn(model){
        
        this.waiting = true;
        
        return new Promise((resolve) => {

            this._currentPromiseResolve = resolve; 

            if (this.worker== null){
                //console.log('typeof Worker' , Worker);
                // if ( ! window && !! window.Worker){
                //     var Worker = require("tiny-worker");//webWorker for node.js useful for unit test with jasmine
                //     worker = new Worker("../../../js/ComputerStrategyWorker.js",[], {esm: true});
                // }else{
                    this.worker = new Worker("ComputerStrategyWorker.js");
                // }
            }
                    
            this.worker.onerror = function(oEvent) {
                console.log('Worker on error : ', oEvent);

                this.waiting = false;
                resolve(null); //TODO 
            };

            //run MinMax
            this.worker.postMessage(JSON.stringify({
                action : 'runMinMax',
                boardModel: model.toArray(),
                playerToBeEvaluatedKey: this.player.key,
                currentPlayerKey : this.player.nextPlayer.key,
                depth : this.depth,
            }));

            //receive MinMax result
            this.worker.onmessage = function(oEvent) {
                //console.log('Worker said : ', oEvent);
                let data = JSON.parse(oEvent.data);
                this.waiting = false;
                resolve(data.colnum);
            };
            
        });
    };

    /**
     */
    interrupt(){
        if (this.worker){
            this.worker.postMessage(JSON.stringify({
                action : 'interrupt'
            }));    
        }
    }
}

export {
    ComputerStrategy
};
