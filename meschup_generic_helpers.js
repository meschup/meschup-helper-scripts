/**
 * Generic meSchup Helpers
 * 
 * All rights reserved by
 * Unversity of Stuttgart 2013-2017
 * 
 * author: Thomas Kubitza
 * email: thomas.kubitza@vis.uni-stuttgart.de
 * 
 * last change: 06.09.2016, TK
 *              01.10.2016, TK: Added State, Stream objects and jQuery-like $-query-interface
 */


/** Overview of generic meschup helper functions
 * 
 * load (varname, defaultValue)      : Loads variable from persistent store
 * save (varname,value)              : Stores variable into persistent store
 * getDeviceId (device)              : Returns the unique ID of a device or null
 * isTriggeredByDevice (device)      : 
 * ...
 * 
 * 
 * /


/**
 * Loads variable from persistent store
 * @param  {String} variable_name 
 * @return {object} value
 */
function load(varname, defaultValue) {
    var ruleId = api.rule.ruleID;
    var res = null;
    if (api.state[ruleId] === undefined){
        api.state[ruleId] = {};
    }
    if (api.state[ruleId][varname] !== undefined){
        return api.state[ruleId][varname];
    }
    else {
        if (defaultValue !== undefined) {
            api.state[ruleId][varname] = defaultValue;
            res = defaultValue;
        }
    }
    return res;
}

/**
 * Stores variable into persistent store
 * @param  {String} variable_name 
 */
function save(varname,value) {
    var ruleId = api.rule.ruleID;
    if (api.state[ruleId] === undefined){
        api.state[ruleId] = {};
    }
    api.state[ruleId][varname] = value;
}



function changed (name, value, store) {
    if (store === undefined)
        store = true;
    
    var old_value = load(name);
    if (store) {
        save (name,value);
    }
    if (old_value != value)
        return true;
    return false;
}

/**
 * "Debounces" a sensor signal. 
 * @param {String} storage name
 * @param {number} signal value
 * @param {number} minimal signal change that triggers a state change
 * @param {String} debounce time. Time in which sensor changes are ignored
 * @return {bool}
 */
function debounced(name,value,delta,delay) {
    if (delay === undefined)
        delay = 500;
    if (value === true) value = 1;
    if (value === false) value = 0;
    
    var tkey="_debounce_"+name+"_timestamp";
    var vkey="_debounce_"+name+"_value";
    var last_time = load(tkey,Date.now());
    var last_value = load(vkey,value);
    var now = Date.now();
    if ((now-last_time) <= delay) {
        return false;
    }
    if (Math.abs(value-last_value) < delta) {

        return false;
    }
    else {
        save(vkey,value);
        save(tkey,now);
        return true;
    }
    
    return false;
}

/**
 * Returns the unique ID of a device or null
 * @param {Object} device | {String} devicename 
 * @return {String} uuid | null
 */
function getDeviceId(device) {
    if (device === null || device === '')
        return null;
    var res = null;
    if (typeof device === 'object') {
        if (device['uuid'] !== undefined)
            res = device.uuid;
    }
    else if (typeof device === 'string') {
        if (api.device[device] !== undefined)
            if (api.device[device]['uuid'] !== undefined)
                res = api.device[device].uuid;
    }
        
    return res;    
}

/**
 * Returns a device object by a unique device id
 * @param {String} device-id 
 * @return {object} device | null
 */
function getDeviceById (id) {
    for ( var devName in api.device) {
        //
        if (id == api.device[devName].uuid) {
            //log (id+" "+api.device[devName].uuid);
            return api.device[devName];
        }
    }
    return null;
}

function getDeviceNameById (id) {
    for ( var devName in api.device) {
        if (id == api.device[devName].uuid) {
            return devName;
        }
    }
    return null;
}

/**
 * InArray function
 */
function inA(item,arr) {
    if (arr === undefined || arr === null || arr["constructor"] === undefined)
        return false;
    if (arr.constructor !== Array)
        return false;
    if (arr.indexOf(item) != -1)
        return true;
    return false;
}


/**
 * Checks if an event is triggered by a certain device
 * @param {Object} device | {String} devicename 
 * @return {bool} value
 */
function isTriggeredByDevice(device) {
    if (device === null || device === '')
        return false;
    var res = false;
    var dev = null;
    if (typeof device === 'object') {
        if (device['uuid'] !== undefined)
            dev = device;
    }
    else if (typeof device === 'string') {
        if (api.device[device] !== undefined)
            if (api.device[device]['uuid'] !== undefined)
                dev = api.device[device];
    }
    if (dev !== null) {
        if (api.event.current.sourceID == dev.uuid)
            res = true;
    }
        
    return res;
}

/**
 * Alias for is triggered by device
 */
 function fromDevice(device) {
    return isTriggeredByDevice(device);
 }

/**
 * Checks if an event is triggered by a certain device type
 * @param {String} deviceType
 * @return {bool} value
 */
function isTriggeredByDeviceType(deviceType) {
    if (deviceType == api.event.current.deviceType)
        return true;
    return false;
}

/**
 * Alias for isTriggeredByDeviceType
 */
 function fromDeviceType(deviceType) {
    return isTriggeredByDeviceType(deviceType);
 }

/**
 * Checks if an event is triggered by a certain module
 * @param {String} module name 
 * @return {bool} value
 */
function isTriggeredByModule(moduleName) {
    if (moduleName == api.event.current.moduleName)
        return true;
    return false;
}

/**
 * Alias for is triggered by module
 */
 function fromModule(moduleName) {
    return isTriggeredByModule(moduleName);
 }
 
 function fromDeviceModule(device,moduleName) {
    return (isTriggeredByModule(moduleName) && isTriggeredByDevice(device));
 }

/**
 * Checks if an event is triggered by a certain module type
 * @param {String} moduleType 
 * @return {bool} value
 */
function isTriggeredByModuleType(moduleType) {
    if (moduleType == api.event.current.moduleType)
        return true;
    return false;
}

/**
 * Alias for isTriggeredByModuleType
 */
 function fromModuleType(moduleType) {
    return isTriggeredByModuleType(moduleType);
 }

/**
 * Runs a sequence of value changes
 * @param {Object} module reference, e.g. api.device.Arduino1.DigitalOutOne
 * @param {String} name of property to alter
 * @param {Integer} time between two changes in ms
 * @param {Array} Array of values. This sequence of values is applied to the defined propery e.g. [0,1,0,1,0,1,0]
 * @param {func} callback
 */
function valueSequence (module, propName, delay, seq) {
    try {
    var i = 0;
    var run = function() {
        setTimeout(function(){
            try {
                if (module !== null && module !== undefined) {
                    if (module[propName] !== undefined)
                        module[propName] = seq[i];
                }
                
                //log("i: ",i);
                i++;
                
                if (i < seq.length)
                run();
            }
            catch (e) {
                console.log("valueSequence inside setTimeout error",e);
            }
            
        },delay);
    }
    
    run();
    }
    catch (e2) {
        console.log("valueSequence inside setTimeout error",e2);
    }
        
}

/**
 * Run callback once every minDelay ms at max
 * @param {int} minDelay
 * @param {func} callback
 */
function runOnceEvery(minDelay, callback) {
    if (api.state["interval"][callback.toString()] === undefined){
        api.state["interval"][callback.toString()] = setInterval(callback,minDelay);
    }
}

/**
 * Stops interval started with runOnceEvery
 *
 * @param {func} callback - used to identify the correct interval.
 */
function stopInterval(callback) {
    if (api.state["interval"][callback.toString()] !== undefined){
        clearInterval(api.state["interval"][callback.toString()]);
        api.state["interval"][callback.toString()] = undefined;
    }
}

/**
 * Return the device Reference for a specified AR marker ID when it is assigned 
 * to a device (via device configuration UI)
 *
 * @param {String} AR marker ID
 * @returns {Object} device reference | null id not found
 */
function getDeviceByArMarker (markerid) {
    for (var devname in api.device) {
        if (api.device[devname].config.info["arMarkerID"] != undefined && api.device[devname].config.info["arMarkerID"] == markerid) {
            return api.device[devname];
        }
    }
    return null;
}

/**
 * Return the device Reference for a specified NFC tag when it is assigned 
 * to a device (via device configuration UI)
 *
 * @param {String} NFC tag ID
 * @returns {Object} device reference | null id not found
 */
function getDeviceByNfcTag (tagid) {
    for (var devname in api.device) {
        if (api.device[devname].config.info["nfcTagID"] != undefined && api.device[devname].config.info["nfcTagID"] == tagid) {
            return api.device[devname];
        }
    }
    return null;
}

/**
 * Return the device Reference for a specified BLE tag when it is assigned 
 * to a device (via device configuration UI)
 *
 * @param {String} BLE tag ID
 * @returns {Object} device reference | null id not found
 */
function getDeviceByBleTag (tagid) {
    for (var devname in api.device) {
        if (api.device[devname].config.info["bleTagID"] != undefined && api.device[devname].config.info["bleTagID"] == tagid) {
            return api.device[devname];
        }
    }
    return null;
}


/**
 * State provides a convenient object-oriented way to work with persistent states
 * 
 * @param {String} storage key 
 * @param optional {any} initial value, null id not set 
 * 
 * Examples:
 *   var btn = new State("mybutton",0); 
 *   log(btn.value++); // Increments and returns
 *   btn.value = true;
 *   log(btn.toggle().value); // toggles the value if it boolean or 0/1, otherwise no effect
 *   log(btn.toggle(500).value); // toggles the value with a debounce of 500ms
 */
function State (name,defaultvalue) {
    
    var self = this;
    if (defaultvalue === undefined)
        defaultvalue = null;
    this._GLOBALSTOREKEY = "__stateobjectstore";
    
    if (api.state[this._GLOBALSTOREKEY] === undefined) {
        api.state[this._GLOBALSTOREKEY] = {};
    }

    if (api.state[this._GLOBALSTOREKEY][name] === undefined) {
        api.state[this._GLOBALSTOREKEY][name] = { value : defaultvalue , last_toggle_call : 0 };
    }
    
    this.name = name;
    
    Object.defineProperty(this, 'value', {
        get: function() {
            return api.state[this._GLOBALSTOREKEY][this.name].value;
        },
        set: function(val) {
           api.state[this._GLOBALSTOREKEY][this.name].value = val;
        }
    });
}

State.prototype.toggle = function(minwaittime) {
    if (minwaittime === undefined)
        minwaittime = 0;
    var rightnow = new Date().getTime();
    var lastcall = api.state[this._GLOBALSTOREKEY][this.name].last_toggle_call;

    if ((rightnow - lastcall) < minwaittime) {
        return this;
    }
    api.state[this._GLOBALSTOREKEY][this.name].last_toggle_call = rightnow;
        
    var val = api.state[this._GLOBALSTOREKEY][this.name].value;
    if (val === true || val === false) {
        this.value = !val;
        return this;
    }
    if (val === 0) {
        this.value = 1;
        return this;
    }
    if (val === 1) {
        this.value = 0;
        return this;
    }
    return this;
}

State.prototype.crossed = function(value,threshold,debouncetime) {
    if (debouncetime === undefined)
        debouncetime = 0;
    // ToDo: Implement debounce time    
    if (threshold === undefined)
        return false;
    var result = false;
    if ((value >= threshold && this.value < threshold) || (value < threshold && this.value >= threshold)) {
        result = true;
    }
    this.value = value;
    return result;
    
}


/**
 * Generic stream reader object
 * 
 * @param {String} storage key 
 * 
 * Examples:
 *   var gps = new Stream("gpsreadings"); 
 *   gps.setLinebreak("\r\n"); // default is "\r"
 *   gps.feed(api.device.BlueSmartCoin.gps.received);
 *   while(gps.hasLine()) {
 *     log("New Reading: "+gps.readLine());
 *   }
 */

function Stream (name) {
    var self = this;
    this.MAXSTACKSIZE = 1000;
    this.LINEBREAKCHAR = "\r";
    
    this.name = name;
    
    this._GLOBALSTOREKEY = "__streamobjectstore";
    
    if (api.state[this._GLOBALSTOREKEY] === undefined) {
        api.state[this._GLOBALSTOREKEY] = {};
    }
    if (api.state[this._GLOBALSTOREKEY][name] === undefined) {
        api.state[this._GLOBALSTOREKEY][name] = { buffer : "", linestack : [] , lastchange : 0 };
    }
    
    Object.defineProperty(this, 'buffer', {
        get: function() {
            return api.state[this._GLOBALSTOREKEY][this.name].buffer;
        },
        set: function(val) {
           api.state[this._GLOBALSTOREKEY][this.name].buffer = val;
           api.state[this._GLOBALSTOREKEY][this.name].lastchange = new Date().getTime();
        }
    });
    
     Object.defineProperty(this, 'linestack', {
        get: function() {
            return api.state[this._GLOBALSTOREKEY][this.name].linestack;
        },
        set: function(val) {
           api.state[this._GLOBALSTOREKEY][this.name].linestack = val;
        }
    });
}

Stream.prototype.clear = function() {
    api.state[this._GLOBALSTOREKEY][this.name].buffer = "";
    api.state[this._GLOBALSTOREKEY][this.name].linestack.length = 0;
}

Stream.prototype.feed = function(text) {
    this.buffer += text;
    this.parse();
}

Stream.prototype.parse = function() {
    var pos = -1;
    do {
        pos = this.buffer.indexOf(this.LINEBREAKCHAR);
        if (pos > -1) {
            var line = this.buffer.substr(0,pos);
            this.linestack.push(line);
            if (this.linestack.length >= this.MAXSTACKSIZE-1) {
                log("Stream: Max stack size reached");
                this.linestack.shift()
            }
            this.buffer =  this.buffer.substr(pos+1);
            //log ("Found line break at: "+pos,this.buffer,this.linestack);
        }
    }
    while (pos != -1)
}

Stream.prototype.hasLine = function() {
    return this.linestack.length > 0;
}

Stream.prototype.readLine = function() {
    
    return this.linestack.shift();
}

Stream.prototype.setLinebreak = function(text) {
    this.LINEBREAKCHAR = text;
}


/**
 * jQuery-like interface for querying devices and modules from the smart things pool
 * 
 * 
 * Examples:
 *   $.dev("Nex").mod("Aug").each(function(dev,name) { //Filters all devices that have "Nex" in their name and own modules with "Aug" in their name
 *     log("Name: "+name);
 *   })
 * 
 * ToDO:
 * - Add .alive(time) filter : Shows only devices that sent a sign of live with the "time" seconds
 * - Add .modtype(type) filter: Filter by module types
 * - Add .group(name) filter: Filter by the device-groups
 * - Add .qrtag() / nfctag() / bleId() filter
 * - Add .near(rssi) filter: Filter by signal strength
 */

function thingsQuery() {
    
    this.results = [];
    this.modules = [];
    this.devices = [];
    
}

thingsQuery.prototype.dev = function (selector) {
    var sel_name = null;
    sel_name = selector;
    
    for (var devname in api.device) {
        if (devname.indexOf(sel_name) != -1) {
            this.devices.push(devname);
        }
    }
    return this;
}

thingsQuery.prototype.devtype = function (selector) {
    var sel_name = null;
    sel_name = selector;
    
    for (var devname in api.device) {
        if (api.device[devname]["config"] !== undefined) {
            if (api.device[devname].config["info"] !== undefined) {
                if (api.device[devname].config.info["type"] !== undefined) {
                    if (api.device[devname].config.info["type"].indexOf(sel_name) != -1) {
                        this.devices.push(devname);
                    }
                }
                
            }
        }
        
    }
    return this;
}

thingsQuery.prototype.mod = function (selector) {
    var sel_name = null;
    sel_name = selector;
    var newobj = new thingsQuery();
    
    for (var i=0; i < this.devices.length; i++) {
        var devname = this.devices[i];
        for (var modname in api.device[devname]) {
            //log("Mod: "+modname);
            if (modname.indexOf(sel_name) != -1) {
                newobj.devices.push(devname);
                newobj.modules.push(modname);
            } 
        }
    }
    return newobj;
}

thingsQuery.prototype.location = function (selector) {
    var sel_name = null;
    sel_name = selector;
    var newobj = new thingsQuery();
    
    for (var i=0; i < this.devices.length; i++) {
        var devname = this.devices[i];
        
        if (api.device[devname]["config"] !== undefined)
            if (api.device[devname].config["info"] !== undefined) {
                if (api.device[devname].config.info["location"] !== undefined) {
                    if (api.device[devname].config.info.location == selector) {
                        newobj.devices.push(devname);
                    }
                }
            }
    }
    return newobj;
}

thingsQuery.prototype.owner = function (selector) {
    var sel_name = null;
    sel_name = selector;
    var newobj = new thingsQuery();
    
    for (var i=0; i < this.devices.length; i++) {
        var devname = this.devices[i];
        
        if (api.device[devname]["config"] !== undefined)
            if (api.device[devname].config["info"] !== undefined) {
                if (api.device[devname].config.info["owner"] !== undefined) {
                    if (api.device[devname].config.info.owner == selector) {
                        newobj.devices.push(devname);
                    }
                }
            }
    }
    return newobj;
}

thingsQuery.prototype.online = function () {
    var newobj = new thingsQuery();
    
    for (var i=0; i < this.devices.length; i++) {
        var devname = this.devices[i];
        if (api.device[devname]["state"] !== undefined)
            if (api.device[devname].state["deviceStatus"] !== undefined) {
                if (api.device[devname].state.deviceStatus == "RUNNING") {
                    newobj.devices.push(devname);
                }
            }
    }
    return newobj;
}


thingsQuery.prototype.each = function (callback) {
    for (var i=0; i < this.devices.length; i++) {
        var key = this.devices[i];
        callback(api.device[key],key);
    }
}

var $ = new thingsQuery ();
