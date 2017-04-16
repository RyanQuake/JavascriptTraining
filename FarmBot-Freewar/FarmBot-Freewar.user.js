// ==UserScript==
// @name        FarmBot-Freewar
// @namespace   Freewar
// @description A simple Farmbot for Freewar
// @include     *.freewar.de/freewar/internal/*
// @version     1
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

/******* Globals *******/
console.debug = function () {};
/**
 * ShroomFarm has 3 modes
 * 0 - Off (default)
 * 1 - List <- Only attack listed Npc's
 * 2 - Aggressive <- Attack all Npc within ShroomBorder
 */
var ShroomFarm = GM_getValue( "ShroomFarm" , 0);
var ShroomBorder = -1*Math.floor(getplayerExpectedLife()*0.1);
var AutoChase = GM_getValue( "AutoChase" , false);
var AutoHeal = GM_getValue( "AutoHeal" , false);
var currentLP = getcurrentLP();
var critLPvalue = Math.floor(getplayerExpectedLife()/3);
var chaseBorder = Math.floor(getplayerExpectedLife()/5)*-1;
var npcData = new Array();
if (localStorage.getItem("AutoWalk") != null) {
    var AutoWalk = localStorage.getItem("AutoWalk");
} else {
    var AutoWalk = 0;
}

console.debug("currentLP: " + currentLP);
console.debug("critLPvalue: " + critLPvalue);
console.debug("chaseBorder: " + chaseBorder);
console.debug("ShroomBorder: " + ShroomBorder);

function updateShroomFarm() {
    switch (GM_getValue("ShroomFarm")) {
        case 1:
            GM_setValue("ShroomFarm", 2 );
            ShroomFarm = 2;
            GM_setValue("AutoChase", false);
            AutoChase = false;
            document.getElementById("textField_Chase").value = AutoChase ? "On" : "Off";
            break;
        case 2:
            GM_setValue("ShroomFarm", 0 );
            ShroomFarm = 0;
            break;
        default:
            GM_setValue("ShroomFarm", 1 );
            ShroomFarm = 1;
    }
}

function getShroomFarmString(){
    var retString = "Off";

    switch (ShroomFarm) {
        case 1:
            retString = "List";
            break;
        case 2:
            retString = "Aggrr";
            break;
        default:
            retString = "Off";
    }
    return retString;
}

function updateAutoChase() {
	if(GM_getValue( "AutoChase" ) === true) {
		GM_setValue( "AutoChase", false );
        AutoChase = false;
	}else{
		GM_setValue( "AutoChase", true );
        AutoChase = true;
	}
}

function updateAutoHeal() {
	if(GM_getValue( "AutoHeal" ) === true) {
		GM_setValue( "AutoHeal", false );
        AutoHeal = false;
	}else{
		GM_setValue( "AutoHeal", true );
        AutoHeal = true;
	}
}

function updateAutoWalk() {
    if("1"=== AutoWalk) {
        AutoWalk = 0;
        localStorage.setItem("AutoWalk", AutoWalk);
    }else{
        AutoWalk = 1;
        localStorage.setItem("AutoWalk", AutoWalk);
    }
}

/******* Functions *******/
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function attack() {
    var TargetLink = $("a:contains('Schnellangriff')");
    $("a:contains('Schnellangriff')").each(function(index, element){
        var index = 0;
        index += element.innerHTML.indexOf("defeat");
        index += element.innerHTML.indexOf("unknown");
        index += element.innerHTML.indexOf("non-crit-special");
        index += element.innerHTML.indexOf("crit-special");
        var linkStr = element.getAttribute("href");
        var BaseStr = "http://welt11.freewar.de/freewar/internal/";
        if (index === -4) {
            setTimeout(function() {
                window.location.href = linkStr;
                console.debug("I DO AUTOATTACK!!");
            }, getRandomInt(348, 869));
        }
    });
}

function checkShroomBorder() {
    var retVal = false;
    for (var i = -1; i >= ShroomBorder; i--) {
        if ( $("a:contains('"+i+"')").length != 0 ){
            retVal = true;
            break;
        }
    }
    return retVal;
}

function getNpcStrength() {
    var retVal = null;
    for (var i = -1; i >= ShroomBorder; i--) {
        var string = i + " LP";
        if ( $("a:contains('"+string+"')").length != 0 ){
            retVal = i;
            break;
        }
    }
    return retVal;
}

function chase() {
    var checkStrength = null;
    for (var i = -1; i >= chaseBorder; i--) {
        if ( $("a:contains('"+i+"')").length != 0 ){
            checkStrength = $("a:contains('"+i+"')");
            break;
        }
    }
    if (checkStrength.length) {
        var TargetLink = $("a:contains('Verjagen')")
        setTimeout(function() {
            window.location.href = TargetLink[0].href;
            console.debug("I DO AUTOCHASE!!");
        }, getRandomInt(400, 850));
    }
}

function heal() {

    if ($('a[href*="=tee"]').length) {
        var TargetLink = $('a[href*="tee"]');
    } else {
        var TargetLink = $('a[href*="=drinkwater"]');
    }

    if (TargetLink.length) {
        setTimeout(function() {
            window.location.href = TargetLink[0].href;
            console.debug("I DO AUTOHEAL!!");
        }, getRandomInt(400, 850));
    }
}

function npcIsListed( string ) {
    retVal = false;
    $("b:contains("+string+")").each(function(index,element){
        retVal = true;
    });
    return retVal;
}

function routine() {
    initData();
    for (var i = 0; i < npcData.length; i++) {
        if(npcIsListed(npcData[i]) === true) {
            console.debug("I CALL AUTOATTACK!!");
            attack();
            break;
        }
    }
}

function getcurrentLP() {
    if(document.getElementById('listrow_lifep') != null) {
        var string = document.getElementById('listrow_lifep').innerHTML;
        var indexStart = string.lastIndexOf('<b>') + 3;
        var indexEnd = string.lastIndexOf('</b>');
        currentLP = parseFloat(string.substr(indexStart,indexEnd-indexStart));
        GM_setValue('currentLP', currentLP);
    }
    return GM_getValue( "currentLP" , 0);
}

function getplayerExpectedLife(){
    if(document.getElementById('listrow_lifep') != null) {
        var string = document.getElementById('listrow_lifep').innerHTML;
        var indexStart = string.lastIndexOf('/') + 1;
        var indexEnd = string.lastIndexOf(')');
        playerExpectedLife = parseFloat(string.substr(indexStart,indexEnd-indexStart));

        GM_setValue('playerExpectedLife',playerExpectedLife);
    }
    return GM_getValue( "playerExpectedLife" , 0);
}

/******* Init/Create Button *******/
var xNode           = document.createElement ('div');
    xNode.innerHTML = '<button id="myButton_Shroom" type="button" style="width:90px">'
                    + 'ShroomFarm' + '</button>'
                    + '<input id="textField_Shroom" type="text" value="0" align="right"'
                    + 'size="7" + readonly="readonly"/>';
    xNode.setAttribute ('id', 'myContainer_Shroom');
    document.getElementById("MainFrameMain").appendChild( xNode );
    document.getElementById("textField_Shroom").value = getShroomFarmString();
//--- Activate the newly added button.
document.getElementById ("myButton_Shroom").addEventListener (
    "click", ButtonClickAction_Shroom, false
);

function ButtonClickAction_Shroom () {
    updateShroomFarm();
    document.getElementById("textField_Shroom").value = getShroomFarmString();
    setTimeout(function() { window.location.reload(); }, 100);
}

var yNode           = document.createElement ('div');
    yNode.innerHTML = '<button id="myButton_Chase" type="button" style="width:90px">'
                    + 'AutoChase' + '</button>'
                    + '<input id="textField_Chase" type="text" value="0" align="right"'
                    + 'size="7" + readonly="readonly"/>';
    yNode.setAttribute ('id', 'myContainer_Chase');
    document.getElementById("MainFrameMain").appendChild( yNode );
    document.getElementById("textField_Chase").value = AutoChase ? "On" : "Off";
//--- Activate the newly added button.
document.getElementById ("myButton_Chase").addEventListener (
    "click", ButtonClickAction_Chase, false
);

function ButtonClickAction_Chase () {
    updateAutoChase();
    document.getElementById("textField_Chase").value = AutoChase ? "On" : "Off";
    setTimeout(function() { window.location.reload(); }, 100);
}

var zNode           = document.createElement ('div');
    zNode.innerHTML = '<button id="myButton_Heal" type="button" style="width:90px">'
                    + 'AutoHeal' + '</button>'
                    + '<input id="textField_Heal" type="text" value="0" align="right"'
                    + 'size="7" + readonly="readonly"/>';
    zNode.setAttribute ('id', 'myContainer_Heal');
    document.getElementById("MainFrameMain").appendChild( zNode );
    document.getElementById("textField_Heal").value = AutoHeal ? "On" : "Off";
//--- Activate the newly added button.
document.getElementById ("myButton_Heal").addEventListener (
    "click", ButtonClickAction_Heal, false
);

function ButtonClickAction_Heal () {
    updateAutoHeal();
    document.getElementById("textField_Heal").value = AutoHeal ? "On" : "Off";
    setTimeout(function() { window.location.reload(); }, 100);
}

var kpNode           = document.createElement ('div');
    kpNode.innerHTML = '<button id="myButton_AutoWalk" type="button" style="width:90px">'
                    + 'AutoWalk' + '</button>'
                    + '<input id="textField_AutoWalk" type="text" value="0" align="right"'
                    + 'size="7" + readonly="readonly"/>';
    kpNode.setAttribute ('id', 'myContainer_AutoWalk');
    document.getElementById("MainFrameMain").appendChild( kpNode );
    document.getElementById("textField_AutoWalk").value = ("1" === AutoWalk) ? "On" : "Off";
//--- Activate the newly added button.
document.getElementById ("myButton_AutoWalk").addEventListener (
    "click", ButtonClickAction_AutoWalk, false
);

function ButtonClickAction_AutoWalk () {
    updateAutoWalk();
    document.getElementById("textField_AutoWalk").value = ("1" === AutoWalk) ? "On" : "Off";
    setTimeout(function() { window.location.reload(); }, 100);
}

/******* Data *******/
// Add NPC's to Autokill here
function initData() {
    npcData.push('Pilzwachtel');
    npcData.push('Wüstenmaus');
    npcData.push('Lebender Salzhügel');
    npcData.push('Milchkuh');
    npcData.push('Trockenwurm');
//    npcData.push('Stabfisch');
//    npcData.push('Stabkrebs');
//    npcData.push('Stabschrecke');
}

/******* Exec Area *******/
if (ShroomFarm === 2) {
    currentLP = getcurrentLP();
    console.debug("checkShroomBorder: " + checkShroomBorder())
    if (checkShroomBorder()) {
        //check if you die
        if ( (getNpcStrength() != null) && (currentLP + getNpcStrength() > 0) ) {
            attack();
            setTimeout(function() { window.location.reload(); }, 1000);
        }
    }
}

if (ShroomFarm === 1 && currentLP > 0) {
    console.debug("ShroomFarm === 1 && currentLP > 0");
    routine();
}

if (AutoChase === true && currentLP > critLPvalue) {
    console.debug("AutoChase === true && currentLP > critLPvalue");
    setTimeout(function() {
        chase();
    }, getRandomInt(980, 1565));
}

if (AutoHeal === true && currentLP <= critLPvalue) {
    console.debug("AutoHeal === true && currentLP <= critLPvalue");
    setTimeout(function() {
        heal();
    }, getRandomInt(690, 890));
}
