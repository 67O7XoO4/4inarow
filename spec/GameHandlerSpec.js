import {RemoteManager} from '../js/remote/RemoteManager.js';
import {GameHandler} from '../js/GameHandler.js';
import {Game, EVENTS} from '../js/Game.js';
import {BoardModel} from '../js/BoardModel.js';
import { HumanRemoteStrategy } from '../js/HumanRemoteStrategy.js';
import { HumanCliStrategy } from '../js/HumanCliStrategy.js';

import {PeerMock} from './remote/PeerMock.js';
import {GameHelper} from './GameHelper.js';

let jsDomGlobal = require('jsdom-global');

  
describe("GameHandler", () => {

  let peerFactory;
  let peer;
  let conn ;

  let jsdom;
  let peerMock;
  let gh = new GameHelper();

  beforeEach(() => {
    
    gh.clear();

    jsDomGlobal('', {
      url: 'http://awesomeurl/',
    });

    peerMock = new PeerMock();
  });
  
  
  it("should be able to send game init as a server", (done) => {

    let r = new RemoteManager(peerMock.peerFactory);
 
    let g = new Game(
      gh.listener
      , {
      red             : { isHuman       : false},
      yellow          : { isHuman       : true},
    });

    let model = new BoardModel({
      nbColumns : 8,
      nbRows : 3
    });
    
    g.init(model);

    let h = new GameHandler(g, true);

    r.invite()
    .then(()=>{
 
      //waitForConnection
      r.waitForConnection(h)
      .then(() => {

        g.start();
        
        // console.log(peerMock.conn.data);
        expect(peerMock.conn.data.content).toEqual({
          nbColumns : 8,
          nbRows : 3,
          timer: true, 
          remote: 1 
        });

        expect(g.players[0].isHuman()).toBeTrue();
        expect(g.players[0].isRemote()).toBeTrue();
        expect(g.players[0].strategy).toBeInstanceOf(HumanRemoteStrategy);

        
        gh.playAndAssert(()=>{

            //simulate receive data
          peerMock.simulateSendData(r,  {
            content : 4, 
            handler: 'HumanRemoteStrategy'
          });

        },
    
        (event, lastEventPlayer)=>{
          expect(event).toBe(EVENTS.JUST_PLAYED);
          expect(lastEventPlayer.key).toBe(g.currentPlayer.key);
          expect(lastEventPlayer.key).toBe(gh.RED);
    
          expect(g.model.getLastPlayedCell().num).toBe(0);
          expect(g.model.getLastPlayedCell().column.num).toBe(4);
          
          done();
        });
          
        
      });
      //provide connection
      peerMock.simulateGetConn(r, true);
      //open connection
      peerMock.simulateOpenConn(r, false);
    })
    //open peer
    peerMock.simulateOpenPeer(r, false, 'anId');
  });

  
  
  it("should be able to receive init game as client", (done) => {

    let r = new RemoteManager(peerMock.peerFactory);
 
    let g = new Game(
      gh.listener
      , {
      red             : { isHuman       : true},
      yellow          : { isHuman       : true},
    });

    g.init(new BoardModel());

    let h = new GameHandler(g, false);

    r.invite()
    .then(()=>{
 
      //waitForConnection
      r.waitForConnection(h)
      .then(() => {

        //simulate receive data
        peerMock.simulateSendData(r,  {
          content : {
            nbColumns : 4,
            nbRows : 3,
            remote :  1
          }, 
          handler: 'GameHandler'});

        expect(g.model.getConfig().nbColumns).toBe(4);
        expect(g.model.getConfig().nbRows).toBe(3);

        expect(g.players[0].isHuman()).toBeTrue();
        expect(g.players[0].isRemote()).not.toBeTrue();
        expect(g.players[0].strategy).toBeInstanceOf(HumanCliStrategy);
        
        expect(g.players[1].isHuman()).toBeTrue();
        expect(g.players[1].isRemote()).toBeTrue();
        expect(g.players[1].strategy).toBeInstanceOf(HumanRemoteStrategy);
        
        expect(g.isStarted()).toBeFalse();
        expect(g.isOver()).toBeFalse();
        expect(g.isDraw()).toBeFalse();
        expect(g.isWon()).toBeFalse();
        expect(g.isBeingPlayed()).toBeFalse();

        gh.playAndAssert(()=>{
          g.currentPlayer.strategy.setSelectedColumn(2);
        },
    
        (event, lastEventPlayer)=>{
          expect(event).toBe(EVENTS.JUST_PLAYED);
          expect(lastEventPlayer.key).toBe(g.currentPlayer.key);
          expect(lastEventPlayer.key).toBe(gh.RED);
    
          expect(g.model.getLastPlayedCell().column.num).toBe(2);
          
          expect(peerMock.conn.data.content).toEqual(2);

          
          done();
        });

      });

      //provide connection
      peerMock.simulateGetConn(r, true);
      //open connection
      peerMock.simulateOpenConn(r, false);
    })
    //open peer
    peerMock.simulateOpenPeer(r, false, 'anId');
  });

  
});
