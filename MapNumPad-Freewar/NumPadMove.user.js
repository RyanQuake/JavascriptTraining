// ==UserScript==
// @name        MapNumPad-Freewar
// @namespace   Freewar
// @description This Tool allows the User to move with Numpad Keys along the world of Freewar       
// @include     *.freewar.de/freewar/internal/*
// @version     1
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant       none
// ==/UserScript==

/******* Globals *******/
console.debug = function() {}
var moveData = new Array();
if (localStorage.getItem("AreaStr") != null) {
    var AreaStr = localStorage.getItem("AreaStr");
} else {
    var AreaStr = undefined;
}


/* !!! if true include main.php !!! */
var activateStupid = true;

if (activateStupid === true) {
    localStorage.setItem("activeRegionStr", AreaStr);
    var lastStep = localStorage.getItem("lastStep");
    var activeRegionStr = localStorage.getItem("activeRegionStr");
    var activeRegion = localStorage.getItem("activeRegion");

    if (isRegion(activeRegionStr) != undefined) {
        console.debug("This: "+isRegion(activeRegionStr));
        localStorage.setItem("activeRegion", isRegion(activeRegionStr));
    }
}

/******* Functions *******/
/*
 * KeyMapper
 */
function KeyCheck( e ){
    var pressed = false;
    switch( e.keyCode ) {
        case 96: //96 -> NumPad0
        case 192: //192 -> ´` Key
            AreaStr = prompt("Please enter your name", AreaStr);
            if (AreaStr != null) localStorage.setItem("AreaStr", AreaStr);
            console.debug("AreaStr: " + AreaStr);
            break;
//        case 89: //89 -> Y
       case 97: //97 -> NumPad1
            console.debug("NumPad1");
            eval(Move('downleft'));
            pressed = true;
            break;
//        case 88: //88 -> X
        case 98: //98 -> NumPad2
            console.debug("NumPad2");
            eval(Move('down'));
            pressed = true;
            break;
//        case 67: //67 -> C
        case 99: //99 -> NumPad 3
            console.debug("NumPad3");
            eval(Move('downright'));
            pressed = true;
            break;
//        case 65: //65 -> A
        case 100: //100 -> NumPad4
            console.debug("NumPad4");
            eval(Move('left'));
            pressed = true;
            break;
//        case 68: //68 -> D
        case 102: //102 -> NumPad6
            console.debug("NumPad6");
            eval(Move('right'));
            pressed = true;
            break;
//        case 81: //81 -> Q
        case 103: //103 -> NumPad7
            console.debug("NumPad7");
            eval(Move('upleft'));
            pressed = true;
            break;
//        case 87: //87 -> W
        case 104: //104 -> NumPad8
            console.debug("NumPad8");
            eval(Move('up'));
            pressed = true;
            break;
//        case 69: //69 -> E
        case 105: //105 -> NumPad9
            console.debug("NumPad9");
            eval(Move('upright'));
            pressed = true;
            break;
//        case 83: //83 -> S
        case 101: //101 -> NumPad5
            console.debug("NumPad5");
            moveRandom();
            pressed = true;
            break;
        default: 
            console.debug("KeyCode: " + e.keyCode);
    } 
    
    if(pressed)
        setTimeout(function() { window.location.reload(); }, 500);
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getAvailableActions() {
    $('a[onclick*="Move"]').each(function(index,element){
        if (element.getAttribute('class') != "nocango") {
            moveData.push(element.getAttribute("onclick"));
        }
    });
}

function moveRandom() {
if (activateStupid === true) {
    var string = null;
    console.debug("That: " + localStorage.getItem("activeRegion"));
    //console.debug(isRegion(activeRegion) != false);
    if (localStorage.getItem("activeRegion") === "true") {
        var upperBoarder = moveData.length-1;
            string = moveData[getRandomInt(0,upperBoarder)];
        var indexLow = string.indexOf(":")+1;
        var indexHigh = string.lastIndexOf(")")+1
        string = string.substring(indexLow,indexHigh);
    } else {
        string = getOpposite(lastStep);
    } 
    } else {
        var upperBoarder = moveData.length-1;
        var string = moveData[getRandomInt(0,upperBoarder)];
        var indexLow = string.indexOf(":")+1;
        var indexHigh = string.lastIndexOf(")")+1
        string = string.substring(indexLow,indexHigh);
    }
    console.debug("Step: "+string);
    eval(string);
    localStorage.setItem("lastStep", string);
}

function isRegion( string ) {
    var retVal;
    $('td[class*="mainheader"]').each(function(index, element) {
        if ( element.innerHTML.search(string) > -1) {
            retVal = true;
        } else {
            retVal = false;
        }   
    });
    return retVal;
}

function getOpposite( string ) {
    var retStr = null;
    console.debug("Passed: "+string);
    switch( string ) {
        case "Move('downleft')":
            retStr = "Move('upright')";
            break;
        case "Move('downright')":
            retStr = "Move('upleft')";
            break;
        case "Move('down')":
            retStr = "Move('up')";
            break;
        case "Move('left')":
            retStr = "Move('right')";
            break;
        case "Move('right')":
            retStr = "Move('left')";
            break;
        case "Move('up')":
            retStr = "Move('down')";
            break;
        case "Move('upright')":
            retStr = "Move('downleft')";
            break;
        case "Move('upleft')":
            retStr = "Move('downright')";
            break;
        default:
           null;
    }
    return retStr;
}

/******* EventListener *******/
window.addEventListener('keydown', KeyCheck, true);

/******* Exec Area *******/
getAvailableActions();