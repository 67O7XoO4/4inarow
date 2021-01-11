
const RED = "RED";
const YELLOW = "YELLOW";

class GameHelper {

  RED = "RED";
  YELLOW = "YELLOW";

  lastEvent = null;
  assertOnEvent = null;
  
  constructor(){

    var vm = this;
    
    this.listener = function(event, lastEventPlayer){
      vm.lastEvent = event;
      if (vm.assertOnEvent) vm.assertOnEvent(event, lastEventPlayer);
    }

  }

  playAndAssert(play, assert){
    return new Promise((resolve)=>{
        
      this.assertOnEvent = (event, lastEventPlayer)=>{
          if (assert) assert(event, lastEventPlayer);
          resolve();
      }
      play();
    });
  };

  clear(){
    this.lastEvent = null;
    this.assertOnEvent = null;
  }

}

export {GameHelper};

  