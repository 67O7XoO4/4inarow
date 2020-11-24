import * as Player from '../src/Player.js';

describe("Player", ()=> {

  
  it("should be able to be a computer", ()=>{

    let p = new Player.Player("thePlayer");
    
    expect(p).toBeInstanceOf(Player.Player);
    expect(p.name).toBe("thePlayer");
    expect(p.isHuman()).toBeFalse();
    expect(p.key).toBeUndefined();
    expect(p.color).toBeUndefined();
    expect(p.nextPlayer).toBeNull();
    expect(p.strategy.depth).not.toBeUndefined();
    
    
  });

  
  it("should be able to be a human", ()=>{

    let p = new Player.Player("thePlayer", {isHuman : true});
    
    expect(p).toBeInstanceOf(Player.Player);
    expect(p.name).toBe("thePlayer");
    expect(p.isHuman()).toBeTrue();
    expect(p.key).toBeUndefined();
    expect(p.color).toBeUndefined();
    expect(p.nextPlayer).toBeNull();
    expect(p.strategy.depth).toBeUndefined();

  });

    
  it("should be able to be a human with config", ()=>{

    let config = {
            key :'aKey',
            name : 'AnotherPlayer' , 
            color : '#ffffff' ,
    };

    let p = new Player.Player(config, {isHuman : true});
    
    expect(p).toBeInstanceOf(Player.Player);
    expect(p.name).toBe("AnotherPlayer");
    expect(p.isHuman()).toBeTrue();
    expect(p.key).toBe("aKey");
    expect(p.color).toBe("#ffffff"); 

  });


  it("should be able to change Strategy ", ()=>{
    let p = new Player.Player("thePlayer");

    expect(p.isHuman()).toBeFalse();

    p.settings.isHuman = true;

    expect(p.isHuman()).toBeTrue();

    p.settings.isHuman = false;

    expect(p.isHuman()).toBeFalse();

  });

    it("should be able to set and switch to next Player ", ()=>{
      let p1 = new Player.Player("p1");
      let p2 = new Player.Player("p2");

      expect(p1.nextPlayer).toBeNull();
      expect(p2.nextPlayer).toBeNull();
    
      expect(p1.isCurrentPlayer).toBeFalse();
      expect(p2.isCurrentPlayer).toBeFalse();

      p1.initPlayer(p2);

      expect(p1.nextPlayer).toBe(p2);
      expect(p2.nextPlayer).toBe(p1);

      expect(p1.isCurrentPlayer).toBeTrue();
      expect(p2.isCurrentPlayer).toBeFalse();

      p1.switchToNextPlayer();
      
      expect(p1.isCurrentPlayer).toBeFalse();
      expect(p2.isCurrentPlayer).toBeTrue();
  });
  

});
