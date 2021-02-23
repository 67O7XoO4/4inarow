
/**
 */
class MsgHandler {
    
    msg = '';
    msgList = [ 
    {type : 'sent', msg : ''},
    {type : 'received', msg : ''} ];

        
    constructor(){
        // nothing special
    }

    onOpen(send){
        this.$send = send;
    }

    onReceive(data){
        this.msgList.push({type : 'received', msg : data});
        this.msgList.shift();
    }
    
    send(msg){
        if (this.$send) this.$send(msg);
        this.msgList.push({type : 'sent', msg : msg});

        this.msgList.shift();
        this.msg = '';
    }

    sendMsg(){
        this.send(this.msg);
    }

}
export { MsgHandler };