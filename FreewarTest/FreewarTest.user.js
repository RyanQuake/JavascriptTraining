// ==UserScript==
// @name        PickUpBot-Freewar
// @namespace   Freewar
// @description This Bot automatically picks up an Item, as long there is no other Player on the field
// @include     *.freewar.de/freewar/internal/*
// @version     1
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

/******* Globals *******/
console.debug = function() {}
/**
 * AutoLoot has three modes
 * 0 - Off (default) 
 * 1 - auto (only loot when no one is watching)
 * 2 - force (loot everytime)
 */
var AutoLoot = GM_getValue("AutoLoot", 0);

function updateAutoLoot() {
    switch (GM_getValue("AutoLoot")) {
        case 1:
            GM_setValue("AutoLoot", 2 );
            AutoLoot = 2;
            break;
        case 2: 
            GM_setValue("AutoLoot", 0 );
            AutoLoot = 0;
            break;
        default:
            GM_setValue("AutoLoot", 1 );
            AutoLoot = 1;
    }
}

function getAutoLootString(){
    var retString = "Off";
    
    switch (AutoLoot) {
        case 1:
            retString = "Auto";
            break;
        case 2:
            retString = "Force";
            break;
        default:
            retString = "Off";
    }
    return retString;
}

/******* Functions *******/
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if another Player is on the field
 *
 * @param none
 *
 * @return boolean
 * @retval true when another Player is on the field
 * @retval false when there is no other Player on the field
 */
function playerOnField() {
    var retVal = false;        
    //console.debug(document.links.length);
    for ( var i = 0 ; i < document.links.length; i++) {
        //console.debug(document.links[i].getAttribute("href").indexOf("act_user_id"));
        //console.debug(document.links[i].getAttribute("href"));
        if (document.links[i].getAttribute("href").indexOf("act_user_id") > -1) 
            retVal = true;
        }
    return retVal;
}

/**
 * Routine function of the script.
 *
 * @param none
 *
 * @return none
 */
function doAutoLoot() {
    var TargetLink = $("a:contains('Nehmen')");
    console.debug("I DO AUTOLOOT!!");
    if (TargetLink.length) {
        setTimeout(function() { 
            window.location.href = TargetLink[0].href;
        }, getRandomInt(400, 850));     
    }
}

/**
 * Routine function of the script.
 *
 * @param none
 *
 * @return none
 */
function checkAutoLoot() {
    switch(AutoLoot) {
        case 1: // Automatic mode
            if (playerOnField() === false) 
               doAutoLoot();
            break;
        case 2: // Force mode
            doAutoLoot();
            break;
        default: // Off
            null; 
    }
}

/******* Init/Create Button *******/
var xNode           = document.createElement ('div');
    xNode.innerHTML = '<button id="myButton" type="button" style="width:90px">'
                    + 'AutoLoot' + '</button>' 
                    + '<input id="textField1" type="text" value="0" align="right"'
                    + 'size="7" + readonly="readonly" />';
    xNode.setAttribute ('id', 'myContainer2');
    document.getElementById("MainFrameMain").appendChild( xNode );
    document.getElementById("textField1").value = getAutoLootString();

//--- Activate the newly added button.
document.getElementById ("myButton").addEventListener (
    "click", ButtonClickAction, false
);

/**
 * EventHandle on ButtonClick. 
 * Has to update the Status of AutoLoot.
 *
 * @param none
 *
 * @return none
 */
function ButtonClickAction () {
    updateAutoLoot();
    document.getElementById("textField1").value = getAutoLootString();
    setTimeout(function() { window.location.reload(); }, 100);
}

/******* Exec Area *******/
if (AutoLoot > 0)
console.debug("I run.")
    checkAutoLoot();