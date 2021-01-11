import * as Observable from '../../js/util/Observable.js';

describe("Observable", () => {

  
  it("should be able to be send params", () => {

    let param = new Object();
    let param2 = new Object();
    let countEvent1 = 0;

    let otherCount = 0;

    let lastArg = null;
    let lastEvent = null;

    let o = new Observable.Observable();

    let removeListenerOnEvent1 = o.addListener("event1", function(arg1){

      expect(arg1).toBe(param);
      countEvent1++;
    });

    o.addAllEventsListener((event, arg)=>{
      lastEvent = event;
      lastArg = arg;
    });

    o.emit("event2", param);

    expect(countEvent1).toBe(0);    
    expect(otherCount).toBe(0); 

    expect(lastEvent).toBe("event2");    
    expect(lastArg).toBe(param);    

    o.emit("event1", param);

    expect(countEvent1).toBe(1);    
    expect(otherCount).toBe(0);    

    expect(lastEvent).toBe("event1");    
    expect(lastArg).toBe(param);    


    o.addListener("event1", function(arg1){
      expect(arg1).toBe(param);
      otherCount++;
    });

    o.emit("event1", param);
    
    expect(countEvent1).toBe(2);    
    expect(otherCount).toBe(1);  
    
    expect(lastEvent).toBe("event1");    
    expect(lastArg).toBe(param); 

    o.emit("event2", param2);
    
    expect(countEvent1).toBe(2);    
    expect(otherCount).toBe(1);  

    expect(lastEvent).toBe("event2");    
    expect(lastArg).toBe(param2); 

    o.emit("event3");

    expect(countEvent1).toBe(2);    
    expect(otherCount).toBe(1);  

    expect(lastEvent).toBe("event3");    
    expect(lastArg).not.toBeDefined(); 

    removeListenerOnEvent1();

    o.emit("event1", param);
    expect(countEvent1).toBe(2);


  });

  
});
