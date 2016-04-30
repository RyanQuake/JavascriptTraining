// ==UserScript==
// @name        PressButton-Freewar
// @namespace   Freewar
// @description This automatically pressed a button     
// @include     *.freewar.de/freewar/internal/map*
// @version     1
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant       none
// ==/UserScript==

//if (localStorage.getItem("AutoWalk") != null) {
//    var AutoWalk = localStorage.getItem("AutoWalk");
//} else {
//    var AutoWalk = false;
//}

/******* Functions *******/
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


setTimeout(function() { 
    if ("1" === localStorage.getItem("AutoWalk")) {
        var keyboardEvent = document.createEvent("KeyboardEvent");
        var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";

        keyboardEvent[initMethod](
                           "keydown", // event type : keydown, keyup, keypress
                            true, // bubbles
                            true, // cancelable
                            window, // viewArg: should be window
                            false, // ctrlKeyArg
                            false, // altKeyArg
                            false, // shiftKeyArg
                            false, // metaKeyArg
                            101, // keyCodeArg : unsigned long the virtual key code, else 0
                            0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
        );
        document.dispatchEvent(keyboardEvent);
     }
}, getRandomInt(5500,8700));


console.debug("KP: " + localStorage.getItem("AutoWalk"));