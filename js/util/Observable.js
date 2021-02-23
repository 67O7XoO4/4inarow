
const ALL_EVENTS = '*';

/**
 * to be added to a class that want to emit events to listeners
 */
class Observable {

    $listeners = {};

    constructor(){
        // nothing to do
    }

    /**
     * 
     * @param {*} event to be emitted
     */
    emit(event){
        let args = Array.prototype.slice.call(arguments, 1);
        if (this.$listeners[event]) {
            this.$listeners[event].forEach( listener => listener.apply(null, args) );
        }
        if (this.$listeners[ALL_EVENTS]) {
            args.unshift(event);      
            this.$listeners[ALL_EVENTS].forEach( listener => listener.apply(null, args) );
        }
    }

    /**
     * add a listener that listen to *all* events emited by the instance
     * 
     * @param {*} listener to be added
     */
    addAllEventsListener(listener){
        if (listener) this.addListener(ALL_EVENTS, listener);
    }

    /**
     * add a listener that listen to the specific given event
     * 
     * @param {*} event 
     * @param {*} listener 
     * @returns a function to remove this listener
     */
    addListener(event, listener){
        if (listener) {

            if ( ! this.$listeners[event]) {
                this.$listeners[event] = [];
            }
            this.$listeners[event].push(listener);
        }
        return ()=>{
            this.$listeners[event] = this.$listeners[event].filter(item => item !== listener)
        };
    }

}
export { Observable };