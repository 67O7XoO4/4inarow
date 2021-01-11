


/**
 * Human Strategy when no GUI board are available
 * useful for CLI interface or unit test
 */
class HumanCliStrategy  {

    constructor(){
        this.isHuman = true;
        
        let resolveCurrentPromise = null;
     
        this.selectColumn = function(model){

            let currentPromise = new Promise((resolve, reject)=>{
                resolveCurrentPromise = resolve; 
            });
        
            //clear promise when fullfilled
            currentPromise.finally(()=>{
                resolveCurrentPromise = null;
            })

            return currentPromise;
        } 

        /**
         * just set the column to be played with setSelectedColumn() function
         * 
         * @param {*} columnNumber 
         */
        this.setSelectedColumn = function(columnNumber){
            resolveCurrentPromise(columnNumber);
        }

        /**
         * 
         */
        this.interrupt = function(){
            if (resolveCurrentPromise) {
                resolveCurrentPromise();
            }
        }
    }
};

export {HumanCliStrategy};