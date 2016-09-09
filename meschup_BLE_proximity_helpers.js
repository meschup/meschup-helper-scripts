/**
 * Generic meSchup Helpers Lib
 * 
 * All rights reserved by
 * Unversity of Stuttgart 2013-2017
 * 
 * author: Thomas Kubitza
 * email: thomas.kubitza@vis.uni-stuttgart.de
 * 
 * LastChange: 2016.09.09 TK - fixed oor in BLE map
 * 
 */



/**
 * Updates a map of BLE beacons assigned to scanners in range
 */

if (api.state["BLEMAP"] === undefined){
 api.state["BLEMAP"] = {};    
}


var BLE_PROXIMITY_LEVEL = {NEAR:55,ROOM:75,FAR:88};

function BLE_updateProximityMap() {
    var BLE_PROXIMITY_OUTOFRANGE_THRESHOLD_TIME = 15; // sec
    var BLE_PROXIMITY_SAMPLES = 3; // Samples used for running average

    // ToDo: Use moduleType instead of moduleName
    if (api.event.current.moduleName === undefined) {
        return 0;
    }
    
    if (api.event.current.moduleName.indexOf("BleScanner") == -1) {
        return 0;
    }

    var map = api.state["BLEMAP"];
    var data = api.event.current.data;
    var id = api.event.current.data.mac_id;
    var rssi = Math.abs(data.rssi);
    var sid = api.event.current.sourceID;

    // skip BLE devices which are not registered at the meschup platform
    if (getDeviceById(id) === undefined){
        return;
    }

    //log(data);
    if (map[sid] === undefined) {
        map[sid] = {};
    }


    if (map[sid][id] === undefined) {
        map[sid][id] = {};
    }

    var now = Date.now();
   

    map[sid][id]["rssi"] = rssi;
   

    //*** Calculate moving average of rssi ***
    if (map[sid][id]["hist"] === undefined)
        map[sid][id]["hist"] = [];

    if (map[sid][id]["hist"].length >= BLE_PROXIMITY_SAMPLES) {
        map[sid][id]["hist"].pop();
    }
    map[sid][id]["hist"].unshift(rssi);
    var sum = 0;
    for (var i = 0; i < map[sid][id]["hist"].length; i++) {
        sum += parseInt(map[sid][id]["hist"][i], 10);
    }
    var avgrssi = sum / map[sid][id]["hist"].length;
    map[sid][id]["avgrssi"] = avgrssi;
    

    //*** Derive state ***
    var state = "active";
    
    // Check which beacons have have to be marked oor (out of range)
    for (var scannerid in map) {
        for (var beaconid in map[scannerid]) {
             
            if (map[scannerid][beaconid]["t"] !== undefined) 
                map[scannerid][beaconid]["silence"] = (now - map[scannerid][beaconid].t);   
            if (map[scannerid][beaconid].silence !== undefined) {
                var silence = map[scannerid][beaconid].silence;
                if (silence > (BLE_PROXIMITY_OUTOFRANGE_THRESHOLD_TIME * 1000)) {
                    map[scannerid][beaconid].state = "oor";
                }    
            }
            else
                map[scannerid][beaconid].silence = 0;
        }
    }
    
    map[sid][id]["t"] = now;
    
    
    if (rssi <= BLE_PROXIMITY_LEVEL.NEAR) {
        state = "near";
    } else if (avgrssi > BLE_PROXIMITY_LEVEL.NEAR && avgrssi <= BLE_PROXIMITY_LEVEL.ROOM) {
        state = "room";
        if (rssi < BLE_PROXIMITY_LEVEL.ROOM)
            map[sid][id]["hist"] = [rssi];
        map[sid][id]["avgrssi"] = rssi;
    } else {
        state = "far";
    }

    map[sid][id]["state"] = state;
    
    if(Object.keys(map).length > 0) {
        ("scanned but nothing found!");
    }

}

//log(load("test"));
BLE_updateProximityMap();
log("BLEMAP",api.state["BLEMAP"]);

/**
 * Checks if a beacon is near to a scanner. Returns true, if so.
 * Near is defined as threshold of rssi.
 *
 * @param beaconId - the item to look for
 * @param deviceId - the scanner
 * @returns {boolean} true, if beacon is near to device.
 */
function beaconNearToDevice(beaconId, deviceId) {

    var map = api.state["BLEMAP"];
    //log("map is",map);

    if (beaconId === undefined || deviceId === undefined ||map === undefined ||
        map[deviceId] === undefined || map[deviceId][beaconId] === undefined ) {
        return false;
    }

    return map[deviceId][beaconId]["state"] === "near";
}

/**
 * Gets an array of all beacons which are currently near to a device
 *
 * @param deviceId - this device's near beacons are returned
 * @returns {Array} - id's of beacons
 */
function getNearBeaconsByDevice(deviceId) {
    var beacons = []
    var map = api.state["BLEMAP"];


    if (deviceId === undefined || map === undefined || map[deviceId] === undefined) {
        return beacons;
    }

    for (var beaconId in map[deviceId]){
        if (map[deviceId][beaconId]["state"] === "near"){
            beacons.push(beaconId);
        }
    }

    return beacons;
}

/**
 * Gets all scanned beaconIds for a scanner ordered by nearest beacon. Uses average value for comparison.
 *
 * @param deviceId
 * @param BLE_PROXIMITY_LEVEL - optional argument, if given, returns only beacons which are closer as given threshold level. Integer value of rssi.
 * @returns {Array} - returns array of object with id:beaconId and avgrssi: rssi-value or empty array, if scanner has not found any beacons.
 */
function getBeaconsByDevice(deviceId,BLE_PROXIMITY_LEVEL) {
    var beacons = []
    var resultList = []
    var map = api.state["BLEMAP"];


    if (deviceId === undefined || map === undefined || map[deviceId] === undefined) {
        log("device not found in BLE Map ", deviceId,map,map[deviceId]);
        return beacons;
    }

    for (var beaconId in map[deviceId]){
        // check if valid number

        var avgRssi = map[deviceId][beaconId]["avgrssi"];

        if (isFinite(parseInt(avgRssi)) &&
            (BLE_PROXIMITY_LEVEL === undefined || (avgRssi <= BLE_PROXIMITY_LEVEL))){
            beacons.push({id: beaconId, avgrssi: avgRssi});
        }

    }

    beacons.sort(function(a,b) {
       return a. avgrssi - b.avgrssi;
    });

    return beacons;
}

/**
 *
 * Gets a list of all scanners currently having a signal for given beacon
 *
 * @param beaconId
 * @returns {*} object with scanner as Id and rssi as value.
 */
function getRSSIbyBeacon(beaconId) {

    var rssiList = {};

    var map = api.state["BLEMAP"];

    if (beaconId !== undefined) {
        for (var scanner in map) {
            if (map[scanner][beaconId] !== undefined) {
                rssiList[scanner] = map[scanner][beaconId]["avgrssi"];
            }
        }
    }

    return rssiList;
}

/**
 * Gets the scanner which is nearest for beacon.
 *
 * @param beaconId
 * @returm - id of scanner device or undefined, if beacon was not found in any scanner.
 */
function getNearestDeviceByBeacon(beaconId) {
    var rssiList = getRSSIbyBeacon(beaconId);

    var min;
    var minScanner;

    for (var scanner in rssiList){
        if (min === undefined || rssiList[scanner] < min){
            min = rssiList[scanner];
            minScanner = scanner;
        }
    }

    return minScanner;
}