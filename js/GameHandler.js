import * as Game from './Game.js';

/**
 * The GameHandler is responsible for Game initialisation between the 2 remote players
 * and to update game settings 
 */
class GameHandler {
    
    /**
     * 
     * @param {*} game the game to update according to the remote game settings
     * @param {*} isServer if true send the settings to the remote 
     *  if false, update the game setting wth the received settings 
     */
    constructor(game, isServer){
        this.game = game;
        this.isServer = isServer;

        if(this.isServer){
            this.$resetGameListening = game.listen(Game.EVENTS.GAME_STARTED, ()=>{
                this.$sendGameStart();
            })
        }

    }

    onOpen(send, remoteManager){

        if(this.isServer){

            this.$sendGameStart = function(){
                //set update strategy on the remote player
                this.$remotePlayerId = 0;
                if (this.game.players[0].isHuman()){
                    this.$remotePlayerId = 1;
                }
                
                this.$initRemotePlayer(remoteManager);

                //send game settings that must be sync between the local and the remote game
                send( {
                    // - board size
                    nbColumns : this.game.model.getConfig().nbColumns,
                    nbRows : this.game.model.getConfig().nbRows,
                    // - timer
                    timer :  this.game.players[1].timer.enabled,
                    // - invert players for remote
                    remote : (this.game.players[0].isRemote() ) ? 1 : 0,
                }  );
            }
        }
    }

    onReceive(data, remoteManager){

        this.game.model.getConfig().nbColumns = data.nbColumns;
        this.game.model.getConfig().nbRows = data.nbRows;

        //local player
        this.game.players[data.remote].nextPlayer.settings.isHuman = true;
        //remote player
        this.$remotePlayerId = data.remote;
        this.$initRemotePlayer(remoteManager);

        this.game.start();
    }

    onClose(){
        console.debug("GameHandler.onClose()", this.$resetGameListening);
        if (this.$resetGameListening) this.$resetGameListening();
        //reset remote player
        this.$initRemotePlayer(null);
        this.$remotePlayerId = null;
        this.$resetGameListening = null;
        this.game.start();
    }

    /**
     * @private
     * 
     * @param {RemoteManager} remoteManager 
     */
    $initRemotePlayer(remoteManager){
        // set the player as remote : the strategy will wait for event from the remote player 
        this.game.players[this.$remotePlayerId].setRemote(remoteManager, this.game.model);
    }
    
    
}
export { GameHandler };