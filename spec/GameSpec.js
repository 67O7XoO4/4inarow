import * as Game from '../js/Game.js';
import * as BoardModel from '../js/BoardModel.js';


describe("Game", ()=> {

  
  it("should be able to be initialized", (done)=>{

    let lastEvent = null;

    let assertOnEvent = null;

    let gameListener =  (event, player) =>{
      lastEvent = event;
      if (assertOnEvent) assertOnEvent(event, player);
    } ;

    let g = new Game.Game(gameListener, {
      red             : { isHuman       : true},
      yellow          : { isHuman       : true},
    });
    
    expect(g).toBeInstanceOf(Game.Game);
    
    expect(g.currentPlayer.key).toBe("RED");
    expect(g.currentPlayer.isHuman()).toBeTrue();

    expect(g.currentPlayer.nextPlayer.key).toBe("YELLOW");
    expect(g.currentPlayer.nextPlayer.isHuman()).toBeTrue();

    expect(g.isStarted()).toBeFalse();
    expect(g.isOver()).toBeFalse();
    expect(g.isDraw()).toBeFalse();
    expect(g.isWon()).toBeFalse();
    expect(g.isBeingPlayed()).toBeFalse();
    
    g.start(new BoardModel.BoardModel())
    .finally(()=>{

      expect(lastEvent).toBe(Game.EVENTS.GAME_STARTED);
      expect(g.isStarted()).toBeFalse(); //!! false till the first player played
     

      assertOnEvent = function(event, player){
        expect(lastEvent).toBe(Game.EVENTS.JUST_PLAYED);
        expect(g.isStarted()).toBeTrue();
        expect(g.isBeingPlayed()).toBeTrue();
        expect(g.currentPlayer.key).toBe("YELLOW");
        expect(player.key).toBe("RED");

        done();
      };

      g.currentPlayer.strategy.setSelectedColumn(1);

     

    })


    //nextMove

    //undoLastMove


    //  PLAYER_WIN          : 'PLAYER_WIN',
    // DRAW_GAME           : 'DRAW_GAME',
    // PLAYER_SUSPENDED    : 'PLAYER_SUSPENDED'
  });

  
});
