


/**
 * Human Strategy when no GUI board are available
 * useful for CLI interface or unit test
 */
class HumanCliStrategy  {

    constructor(){
        this.isHuman = true;
        
        let _currentPromise = null;
    
        let resolvePromise = ()=>{};

        this.selectColumn = function(model){
        
            _currentPromise = new Promise((resolve, reject)=>{

                resolvePromise = resolve;

            });
            return _currentPromise;
        } 

        this.setSelectedColumn = function(columnNumber){
            resolvePromise(columnNumber);
        }

        /**
         * 
         */
        this.interrupt = function(){
            return _currentPromise || Promise.resolve();
        }
    }
};

export {HumanCliStrategy};