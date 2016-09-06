/**
 * meSchup Speech Helpers
 * 
 * All rights reserved by
 * Unversity of Stuttgart 2013-2017
 * 
 * author: Thomas Kubitza
 * email: thomas.kubitza@vis.uni-stuttgart.de
 * 
 * Allows to easily trigger callbacks when certain text-patterns are found in spoken input from devices with a SpeechModule
 * Example:
 *
 * whenIhear(/search for (.*)/g,
 *   function(part){
 *       api.device.PicoPix03.WebViewOne.showURL = "http://bing.com?q="+encodeURIComponent(part[1]);
 *   }
 * );
 * 
 * // Saying "search for current time" will display the bing-results for "current time" on the display of the specified device
 */

function whenIhear(pattern, callback) {
    if (!fromModule("SpeechOne"))
        return;

    function getRandomAnswer(key) {
        var answers = {
            positive : ["ok!","Alright!","Sure!","No problem buddy!", "Good idea!", "Yeah, let me do it for you!"],
            negative : ["No","no, sorry", "Can't do it" ],
            didnotunderstand : ["Sorry, what?","I didn't get it!","Soryy I didn't listen","Excuse me?"]
        };
        return answers[key][Math.floor((Math.random() * answers[key].length))];
    }
    
    
    //console.log(api.event.current);
    var srcDev = api.device[api.event.current.deviceName];
    var spoken = srcDev.SpeechOne.speech2text
    var spoken = spoken.toLowerCase();
    console.log('I heard you say: '+spoken);

    var matches = pattern.exec(spoken);
    if (matches != null) {
        srcDev.SpeechOne.text2speech = getRandomAnswer("positive");
        callback(matches);
    }
    else {
        
    }
}