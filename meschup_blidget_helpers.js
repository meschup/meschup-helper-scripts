/**
 * meSchup Blidget Helpers
 * 
 * All rights reserved by
 * Unversity of Stuttgart 2013-2017
 * 
 * author: Thomas Kubitza
 * email: thomas.kubitza@vis.uni-stuttgart.de
 * 
 */

function setColor (module, color) {
    switch (color) {
        default : module.ledRed = 0; module.ledGreen = 0; module.ledBlue = 0; break;
        case "white" : module.ledRed = 255; module.ledGreen = 255; module.ledBlue = 255; break;
        case "red" : module.ledRed = 255; module.ledGreen = 0; module.ledBlue = 0; break;
        case "green" : module.ledRed = 0; module.ledGreen = 255; module.ledBlue = 0; break;
        case "blue" : module.ledRed = 0; module.ledGreen = 0; module.ledBlue = 255; break;
        case "orange" : module.ledRed = 200; module.ledGreen = 200; module.ledBlue = 0; break;
        case "yellow" : module.ledRed = 150; module.ledGreen = 250; module.ledBlue = 0; break;
        case "pink" : module.ledRed = 200; module.ledGreen = 0; module.ledBlue = 250; break;
        
    }
}

function setColorRGB(module,rgbhex) {
    if (rgbhex.length != 6) {
        log("Error: Unknown RGB format.");
        return false;
    }
    var r = parseInt(rgbhex.substr(0,2), 16);
    var g = parseInt(rgbhex.substr(2,2), 16);
    var b = parseInt(rgbhex.substr(4,2), 16);
    log(r,g,b);
    module.ledRed = r;
    module.ledGreen = g;
    module.ledBlue = b;
    return true;
}