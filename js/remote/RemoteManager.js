import Peer from 'peerjs';
import queryString from 'query-string';
import * as MsgHandler from './MsgHandler.js';

const REMOTE_ID_PARAM_NAME = "remoteid";

const REMOTE_MANAGER = 'remoteManager';
const CLOSING = 'CLOSING';


//useful to mock peer.js dependency
class PeerFactory {

    constructor(){
        // nothing to do
    }

    createPeer(){

        //to test webrtc connectivity https://test.webrtc.org/

        return new Peer(null, {
            debug: 2,
            config: {
                'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' },
                                {urls: 'stun:stun2.l.google.com:19302'}]
            }
        
        });
    }
}


/**
 */
class RemoteManager {
    
    handlers = { };

    waiting  = false;
    isConnected = false;
    isServer = false;
                

    $conn = null;

    invitationUrl = null;


    /**
     * 
     * @param {*} peerFactory optional to be provided only to mock peer.js dependency
     */
    constructor(peerFactory = new PeerFactory()){
        this.peerFactory = peerFactory;
        this.addHandler(new MsgHandler.MsgHandler());
    }


    getMsgHandler(){
        return this.handlers['MsgHandler'];
    }

    /**
     * 
     * A Handler manage data exchange with the remote. The remote must a Handler with the same id.
     * Data are routed to the correct handler according to this id. 
     * the given 'handler' will be notified when the connection is openned. 
     * Once handler.onOpen(send, remoteManager)  is called, data can be sent et onReceived by the handler. 
     * data can be sent by the 'send' function in params
     * Handler is notified when it onReceives data with the 'onReceive(data)' callback
     * 
     * @param {*} handler {
     *      onOpen(send, remoteManager)
     *      onReceive(data, remoteManager)
     * }
     * @param id (optional) must identify the given handler default = handler.constructor.name
     */
    addHandler(handler, id){
        handler.id = id || handler.constructor.name; 
        this.handlers[handler.id] = handler;

        let vm = this;

        if (this.isConnected) {
            //connection already openned, we notify the handler
            handler.onOpen(function(content){
                vm.$conn.send({
                    handler : handler.id,
                    content : content
                });
            }, this);
        }
    }

    /**
     * generate a url to be provided to the remote guest.
     * @returns Promise with a url 
     */
    invite(){
        this.waiting = true;

        return new Promise((resolve, reject)=>{
            let vm = this;
            
            vm.$peer = this.peerFactory.createPeer(); 

            //get an id from the peer server
            vm.$peer.on('open', function(id) {

                //href without params
                vm.invitationUrl = window.location.origin;
                vm.invitationUrl+= window.location.pathname;

                vm.invitationUrl+= "?"+REMOTE_ID_PARAM_NAME+"=" + id;

                vm.waiting = false;
                resolve(vm.invitationUrl);
               
            });
        });
    }

    /**
     * wait from a remote guest to connect
     * 
     * @param handler optional a new data handler 
     * @returns Promise that resolves when the connection is ready
     */
    waitForConnection(handler){
        
        this.waiting = true;
        let vm = this;

        return new Promise((resolve, reject)=>{

            vm.$peer.on('close', function() { 
                console.log('peer on close');
                vm.cancel();                
            });

            vm.$peer.on('error', function(err) { 
                console.log('peer connect error : ', err);
                reject(err.type);
                vm.cancel();
            });
            if (handler) vm.addHandler(handler);

            // wait for a connection with a remote peer
            vm.$peer.on('connection', (conn) => {
                vm.$conn = conn;
                vm.isConnected = true;
                vm.isServer = true;

                vm.$open(resolve);
            });
        });
    }

    /**
     * @private 
     * @param {*} resolve 
     */
    $open(resolve){
        let vm = this;
        vm.$conn.on('open', function() {
            console.log('connect : open ');

            //initiate exchange with peer
            //iterate through every handlers 
            Object.values(vm.handlers).forEach(handler => handler.onOpen(function(content){
                vm.$conn.send({
                    handler : handler.id,
                    content : content
                });
            }, vm));
    
            vm.$conn.on('close', function() { 
                console.log('conn on close ');
                vm.cancel();                
            });

            // onReceive messages
            vm.$conn.on('data', function(data) {
                if (REMOTE_MANAGER == data.handler){
                    if(data.content == CLOSING){
                        console.info("remoteManager closing received");
                        vm.cancel();
                    }
                }else if ( ! vm.handlers[data.handler]){
                    console.warn("No handler :", data.handler);
                }else{
                    vm.handlers[data.handler].onReceive(data.content, vm);
                }
            });
            vm.waiting = false;
            resolve();
        });
    }

    /**
     * 
     */
    cancel(){
        console.debug("remoteManager.cancel()");
        this.waiting = false;
        if (this.isConnected) {
            this.isConnected = false;

            this.$conn.send({
                handler : REMOTE_MANAGER,
                content : CLOSING
            });

            //notify handlers  
            Object.values(this.handlers).forEach(handler => {
                if (handler.onClose) handler.onClose();
            });
            //and then reset handlers
            this.handlers = {};
            this.addHandler(new MsgHandler.MsgHandler());

            this.isServer = false;
                
        }else{
            if (this.$conn){
                this.$conn.close();
            }
            if (this.$peer) this.$peer.destroy();
            this.$peer = null;
            this.$conn = null;
        }
        this.invitationUrl = null;
    }


    /**
     * check if the current url contains a remote invitation
     */
    checkRemoteInvitation(){
        const queryParams = queryString.parse(window.location.search);
 
        return queryParams[REMOTE_ID_PARAM_NAME] != null;
    }

    /**
     * To be called when the current URL has got a remote invitation
     * 
     * @returns a Promise trying to connect
     *  - it resolve if the url is an invitation and if the connection is ready
     *  - it reject otherwise
     */
    connectToRemoteInvitation(){
        const queryParams = queryString.parse(window.location.search);
 
        if (queryParams[REMOTE_ID_PARAM_NAME]){
            //clean URL
            window.history.pushState({}, document.title,  window.location.pathname );
                        
            let remoteId = queryParams[REMOTE_ID_PARAM_NAME];
            this.waiting = true;
            let vm = this;
            //try to connect
            return new Promise((resolve, reject)=>{
    
                this.$peer = this.peerFactory.createPeer(); 

                this.$peer.on('error', function(err) { 
                    console.log('peer connect error : ', err);
                    reject(err.type);
                    vm.cancel();
                });
    
                this.$peer.on('open', function(id) {
                    console.log('connect id/remote : ', id, remoteId);
                    //initiate connection with remote peer
                    vm.$conn = vm.$peer.connect(remoteId);
                    vm.isConnected = true;
                    vm.isServer = false;
                
                    vm.$open(resolve);
                });   
            });
    
     
        }
        return Promise.reject();
    }

}

export { RemoteManager };
