import * as Game from '../js/Game.js';
import * as BoardModel from '../js/BoardModel.js';

import {GameHelper} from './GameHelper.js';


describe("Game", ()=> {

  let g ;

  let gh = new GameHelper();
  
  beforeEach(() => {
    
    gh.clear();
    
    g = new Game.Game(
      gh.listener 
      , {
      red             : { isHuman       : true},
      yellow          : { isHuman       : true},
    });
  });


  it("should be able to be initialized", (done)=>{

    expect(g).toBeInstanceOf(Game.Game);
    
    expect(g.currentPlayer.key).toBe(gh.RED);
    expect(g.currentPlayer.isHuman()).toBeTrue();

    expect(g.currentPlayer.nextPlayer.key).toBe(gh.YELLOW);
    expect(g.currentPlayer.nextPlayer.isHuman()).toBeTrue();

    expect(g.isStarted()).toBeFalse();
    expect(g.isOver()).toBeFalse();
    expect(g.isDraw()).toBeFalse();
    expect(g.isWon()).toBeFalse();
    expect(g.isBeingPlayed()).toBeFalse();
    
    g.start(new BoardModel.BoardModel());

    expect(gh.lastEvent).toBe(Game.EVENTS.GAME_STARTED);
    expect(g.isStarted()).toBeFalse(); //!! false till the first player played

    expect(g.currentPlayer.key).toBe(gh.RED);

    //player RED play on col #1
    gh.playAndAssert(()=>{
      g.currentPlayer.strategy.setSelectedColumn(1);
    },

    (event, lastEventPlayer)=>{
      expect(event).toBe(Game.EVENTS.JUST_PLAYED);
      expect(lastEventPlayer.key).toBe(g.currentPlayer.key);
      expect(lastEventPlayer.key).toBe(gh.RED);

      expect(g.model.getLastPlayedCell().num).toBe(0);
      expect(g.model.getLastPlayedCell().column.num).toBe(1);
      
      done();
    });

  });

  it("should be able to be send event on win", (done)=>{

    let m = new BoardModel.BoardModel();
    let p1 = g.currentPlayer;
    let p2 = g.currentPlayer.nextPlayer;
    

    g.start(m);
    m.init([
      [0 , p1, p2],
      [0 , p1, p2],
      [0 , p1, p2],
    ])

    gh.playAndAssert(()=>{
        //player p1 play on col #1
        p1.strategy.setSelectedColumn(1);
      },

      (event, lastEventPlayer)=>{
        //player p1 win
        expect(event).toBe(Game.EVENTS.PLAYER_WIN);
        expect(lastEventPlayer.key).toBe(p1.key);

        expect(g.isStarted()).toBeTrue();
        expect(g.isOver()).toBeTrue();
        expect(g.isDraw()).toBeFalse();
        expect(g.isWon()).toBeTrue();
        expect(g.isBeingPlayed()).toBeFalse();

        done();
      }
    )

  });

  
  it("should be able to be send event on draw", (done)=>{

    let m = new BoardModel.BoardModel({
      nbCellsToWin: 3,
      nbRows      : 3,
      nbColumns   : 3,
    });

    let p1 = g.currentPlayer;
    let p2 = g.currentPlayer.nextPlayer;
    
    g.start(m);
    
    m.init([
      [0  , p1, p2],
      [p2 , p2, p1],
      [p1 , p1, p2],
    ])

    gh.playAndAssert(()=>{
        //player p1 play on col #1
        p1.strategy.setSelectedColumn(0);
      },

      (event, lastEventPlayer)=>{
        //Draw event 
        expect(event).toBe(Game.EVENTS.DRAW_GAME);
        
        expect(g.isStarted()).toBeTrue();
        expect(g.isOver()).toBeTrue();
        expect(g.isDraw()).toBeTrue();
        expect(g.isWon()).toBeFalse();
        expect(g.isBeingPlayed()).toBeFalse();

        done();
    })

  });


  it("should be able to undo moves", (done)=>{

    let m = new BoardModel.BoardModel();
    let p1 = g.players[0];
    let p2 = g.players[1];

    g.start(m);
    
    m.init([
      [0 ,  0,  0],
      [0 , p1, p2],
      [0 , p1, p2],
    ]);
  
    gh.playAndAssert(()=>{
        //Player P1 play on column #1
        p1.strategy.setSelectedColumn(1);
      },

      (event, lastEventPlayer)=>{
        expect(event).toBe(Game.EVENTS.JUST_PLAYED);
        expect(lastEventPlayer.key).toBe(p1.key);

        expect(g.model.getLastPlayedCell().num).toBe(2);
        expect(g.model.getLastPlayedCell().column.num).toBe(1);
    })      
    .then(()=>{

      return gh.playAndAssert(()=>{
          //player P2 play on col #2
          p2.strategy.setSelectedColumn(2);
        },

        (event, lastEventPlayer)=>{
          expect(event).toBe(Game.EVENTS.JUST_PLAYED);
          expect(lastEventPlayer.key).toBe(p2.key);
  
          expect(g.model.getLastPlayedCell().num).toBe(2);
          expect(g.model.getLastPlayedCell().column.num).toBe(2);
  
      })
    })
    .then(()=>{

      return gh.playAndAssert(()=>{
          //player P1 play on col #2
          p1.strategy.setSelectedColumn(2);
        },
        (event, lastEventPlayer)=>{
          expect(event).toBe(Game.EVENTS.JUST_PLAYED);
          expect(lastEventPlayer.key).toBe(p1.key);
  
          expect(g.model.getLastPlayedCell().num).toBe(3);
          expect(g.model.getLastPlayedCell().column.num).toBe(2);
      })
    })      
    .then(()=>{
      return gh.playAndAssert(()=>{
          //Undo player P1
          g.undoLastMove()
        },
        (event, lastEventPlayer)=>{

          expect(event).toBe(Game.EVENTS.UNDO);

          expect(g.currentPlayer.key).toBe(p1.key);

          expect(g.model.getLastPlayedCell().num).toBe(2);
          expect(g.model.getLastPlayedCell().column.num).toBe(2);
        }
      )
    })
    .then(()=>{
      return gh.playAndAssert(()=>{
          //Undo player P2
          g.undoLastMove()
        },
        (event, lastEventPlayer)=>{

          expect(event).toBe(Game.EVENTS.UNDO);

          expect(g.currentPlayer.key).toBe(p2.key);

          expect(g.model.getLastPlayedCell().num).toBe(2);
          expect(g.model.getLastPlayedCell().column.num).toBe(1);
        }
      )
    })
    .then(()=>{
      return gh.playAndAssert(()=>{
          
          //resume game
          g.nextMove();

          //player p2 play on col #2
          p2.strategy.setSelectedColumn(0);
        },
        (event, lastEventPlayer)=>{

          expect(event).toBe(Game.EVENTS.JUST_PLAYED);

          expect(g.currentPlayer.key).toBe(p2.key);

          expect(g.model.getLastPlayedCell().num).toBe(0);
          expect(g.model.getLastPlayedCell().column.num).toBe(0);

          done();
      } )

    }) 
  })


// PLAYER_SUSPENDED    : 'PLAYER_SUSPENDED'
});

  