import * as RemoteManager from '../../js/remote/RemoteManager.js';

import {PeerMock} from './PeerMock.js';


let jsDomGlobal = require('jsdom-global');

describe("RemoteManager", () => {


  let jsdom;

  let peerMock;


  beforeEach(() => {

    jsDomGlobal('', {
      url: 'http://awesomeurl/',
    });

    peerMock = new PeerMock();

  });
  
  it("should be able to create a url", (done) => {

    let r = new RemoteManager.RemoteManager(peerMock.peerFactory);

    expect(r.waiting).toBeFalse();
    
    //invite
    r.invite()
    .then((url) => {

      expect(url).toBe('http://awesomeurl/?remoteid=anId');

      expect(r.waiting).toBeFalse();

      done();
    });

    expect(r.waiting).toBeTrue();

    //open peer with 'anId' id
    peerMock.simulateOpenPeer(r, false, 'anId')
    
  });

  
  it("should be able to not create a connection from a url with no remote id", (done) => {

    let r = new RemoteManager.RemoteManager(peerMock.peerFactory);

    expect(r.waiting).toBeFalse();
    
    //connectToRemoteInvitation
    r.connectToRemoteInvitation()
    .then(() => {
        fail('should not return a successfull promise');
      },
      () => {
        done();
      },
    );
    expect(r.waiting).toBeFalse();
  });


  it("should be able to create a connection from a url with a remote id", (done) => {

    jsDomGlobal('', {
      url: 'http://awesomeurl/?remoteid=123',
    });

    let r = new RemoteManager.RemoteManager(peerMock.peerFactory);
   
    expect(r.waiting).toBeFalse();
    
    //connectToRemoteInvitation
    r.connectToRemoteInvitation()
    .then(() => {
      expect(r.waiting).toBeFalse();
      done();
      }
    );

    expect(r.waiting).toBeTrue();

    peerMock.simulateOpenPeer(r, true, 'anId');

    peerMock.simulateOpenConn(r, false);
  });

  
  it("should be able to wait For Connection", (done) => {

    let r = new RemoteManager.RemoteManager(peerMock.peerFactory);
 
    expect(r.waiting).toBeFalse();
    
    r.invite()
    .then(()=>{
 
      //waitForConnection
      r.waitForConnection()
      .then(() => {
        expect(r.waiting).toBeFalse();

        done();
      });
      expect(r.waiting).toBeTrue();

      //provide connection
      peerMock.simulateGetConn(r, true)

      //open connection
      peerMock.simulateOpenConn(r, false);
    })
    
    peerMock.simulateOpenPeer(r, false, 'anId');
  });
  
  
  it("should be able to init handlers and let them communicate", (done) => {

    let r = new RemoteManager.RemoteManager(peerMock.peerFactory);
 
    let h = jasmine.createSpyObj("h", ["onOpen", "onReceive"]);
    h.onOpen.and.callFake((fn)=>{  h.send = fn    });

    expect(r.waiting).toBeFalse();
    
    r.invite()
    .then(()=>{
 
      //waitForConnection
      r.waitForConnection(h)
      .then(() => {
        //onOpen
        expect(h.onOpen).toHaveBeenCalledTimes(1);

        expect(r.waiting).toBeFalse();

        //send data
        h.send("this is a test");

        // console.log(peerMock.conn.data);
        expect(peerMock.conn.data.content).toBe("this is a test");

        //receive data
        peerMock.simulateSendData(r,   {content : "test", handler: 'Object'});

        expect(h.onReceive).toHaveBeenCalledWith("test", r);

        peerMock.simulateSendData(r,   {content : "test 2", handler: 'Object'});

        expect(h.onReceive).toHaveBeenCalledWith("test 2", r);

        //do not receive data fom other handlers
        expect(h.onReceive).toHaveBeenCalledTimes(2);
        peerMock.simulateSendData(r, {content : "test 3", handler: 'AnotherHandler'});

        expect(h.onReceive).toHaveBeenCalledTimes(2);

        done();
      });

      expect(r.waiting).toBeTrue();
      
      //provide connection
      peerMock.simulateGetConn(r, true);
      
      expect(h.onOpen).not.toHaveBeenCalled();
      
      //open connection
      peerMock.simulateOpenConn(r, false);
    })
    //open peer
    peerMock.simulateOpenPeer(r, false, 'anId');

  });

  
});
