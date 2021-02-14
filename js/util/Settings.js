
import * as Observable from './Observable.js';

const storageName = '4inarow.settings';

/**
 * 
 */
class Settings {

    /**
     * 
     * @param {*} defaultSettings 
     */
    constructor(defaultSettings){
        
        let globalSettings = this;

        let initializeProperty = function(obj, prop, defaultValue, savedValue){

            if (defaultValue instanceof Object){
                obj[prop] = {};
                initializeSettings(obj[prop], defaultValue, savedValue);
            }else{
                // get value from localStorage or take the default one
                obj.$values[prop] =  savedValue != null ? savedValue : defaultValue;

                //console.log("value",prop, savedValue , defaultValue, obj.$values[prop]);
            
                let getter = () => obj.$values[prop] ;

                let setter = (newval) => {
                    let oldval = obj.$values[prop]; 
                    obj.$values[prop] = newval;
                    //console.log(prop, oldval, newval);

                    obj.$observable.emit(prop, newval, oldval);

                    //save the entire Settings (globalSettings) to localStorage if any
                    if (typeof localStorage !== 'undefined')
                        localStorage.setItem(storageName, JSON.stringify(globalSettings, (key, value)=>{
                            
                            if (['$values', '$observable'].includes(key)){
                                return undefined;
                            }
                            return value;
                        })); 
                };

                Object.defineProperty(obj, prop, {
                    get : getter
                    , set: setter
                    , enumerable: true
                    , configurable: true
                });
            }
        }

        //
        let initializeSettings = function(obj, defaultSettings, savedValues =  {}){
            
            obj.$observable = new Observable.Observable();
            obj.$values = {};
            obj.toArray = function(){
                return Object.assign({}, obj.$values);
            }
    
            obj.listen = function(prop, listener, defaultValue){
                obj.$observable.addListener(prop, listener);
                if (obj.$values[prop] == null){
                    initializeProperty(obj, prop, defaultValue );
                }
                return obj.$values[prop];
            };
        
            //console.log("savedValues", savedValues);

            for (const [prop, defaultValue] of Object.entries(defaultSettings)) {

                initializeProperty(obj,prop, defaultValue , savedValues[prop] );

            }
        }

        let savedValues = {};
        if (typeof localStorage !== 'undefined')
            savedValues = JSON.parse(localStorage.getItem(storageName) || "{}" ) ;

        initializeSettings(this, defaultSettings, savedValues);

    }
};

/**
 * 
 * @param {*} val 
 */
let init = function(val){

    val = val || {};
    if ( ! val.listen ) {
        val = new Settings(val);
    }
    return val;
};

export {Settings, init};