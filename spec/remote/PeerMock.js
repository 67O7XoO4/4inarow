
class PeerMock {

    peerFactory;
    peer;
    conn;

    constructor(){
        this.conn = jasmine.createSpyObj("conn", ["on", "send"]);
        this.conn.send.and.callFake((data)=>{  this.conn.data = data    });
        this.conn.on.and.callFake((event, fn)=>{  this.conn.callBack[event] = fn    });
        this.conn.callBack = {};
        
        this.peer = jasmine.createSpyObj("peer", ["on", "connect", "destroy"]);
        this.peer.on.and.callFake((event, fn)=>{  this.peer.callBack[event] = fn    });
        this.peer.connect.and.returnValue(this.conn);
        this.peer.callBack = {};
        
        this.peerFactory = jasmine.createSpyObj("peerFactory", ["createPeer"]);
        this.peerFactory.createPeer.and.returnValue(this.peer);
    }


    simulateCallFromRemote = function(r, obj, event, stillWaiting, arg){
        //simulate network latency
        // setTimeout(() => {
          expect( obj.callBack[event]).not.toBeNull();
          obj.callBack[event](arg);
          expect(r.waiting).toBe(stillWaiting);
        // }, 150);
    }

    simulateOpenPeer(r, stillWaiting, id){
        this.simulateCallFromRemote(r, this.peer, 'open',stillWaiting, id);
    }

    simulateOpenConn(r, stillWaiting){
        this.simulateCallFromRemote(r, this.conn, 'open',stillWaiting);
    }

    simulateGetConn(r, stillWaiting){
        //provide connection
      this.simulateCallFromRemote(r, this.peer, 'connection', stillWaiting, this.conn);
    }

    simulateSendData(r, data){
        this.simulateCallFromRemote(r, this.conn, 'data', false, data);
    }
};




export {PeerMock};