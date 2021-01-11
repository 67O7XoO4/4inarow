
/**
 */
class Timer {

    constructor(isEnabled){
        this.timePassed = 0;
        this.enabled = isEnabled;
    }

    enable(isEnabled){
        this.reset();
        this.enabled = isEnabled;
    }

    reset(){
        clearInterval(this._intervalId); 
        this.timePassed = 0;
    }

    resume(){
        this._timePassedBeforelastResume = this.timePassed;
        this._lastResume = Date.now();
        this._intervalId = setInterval(() => (this.timePassed += 1000), 1000);
    }

    suspend(){
        
        clearInterval(this._intervalId); 

        // compute a more accurate timepassed
        let timePassedSinceLastResume = Date.now() - this._lastResume ;
        this.timePassed = this._timePassedBeforelastResume + timePassedSinceLastResume;
    }


}

export {Timer};
    