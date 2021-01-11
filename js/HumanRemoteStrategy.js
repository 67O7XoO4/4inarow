/**
 * Human Remote Strategy 
 * set when the Player is declared as remote
 * Responsible for exchanging between local and remote where each player is playing (which column) 
 */
class HumanRemoteStrategy  {

    constructor(){
        
        this.waiting = false;
        this.isHuman = true;
        this.isRemote = true;
        let resolveSelectColumn = null;
        let colNum = null;

        this.init = function(remoteManager, model){

            let vm = this;

            let sendOnPlay ;
            let resetOnClose;

            let handler = {
                onOpen : function(send){
                    sendOnPlay = send;
                },

                onReceive: function(data){
                    if (resolveSelectColumn) {
                        resolveSelectColumn(data);
                        resolveSelectColumn = null;
                    }else{
                        colNum = data;
                    }
                },

                onClose : function(){
                    console.debug("HumanRemoteStrategy.onClose()", resetOnClose);
                    if (resetOnClose) resetOnClose();
                    vm.waiting = false;
                }
            };
            //we add a handler to send/receive played column number
            remoteManager.addHandler(handler, 'HumanRemoteStrategy');

            //listen local play and send the played column number to the remote player
            resetOnClose = model.onPlay(function(column, player){
                if ( ! player.isRemote()){
                    sendOnPlay(column.num);
                }
            })

        }

        this.selectColumn = function(model){
            this.waiting = true;
            return new Promise((resolve, reject)=>{
                if (colNum != null) {
                    resolve(colNum);
                    this.waiting = false;
                    colNum = null;
                }else{
                    resolveSelectColumn = resolve;   
                } 
            });
        } 

        this.interrupt = function(){
            if (resolveSelectColumn) {
                resolveSelectColumn();
            }
        }
    }


};

export {HumanRemoteStrategy};