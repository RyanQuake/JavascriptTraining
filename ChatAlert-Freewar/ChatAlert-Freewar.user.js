// ==UserScript==
// @name        ChatAlert-Freewar
// @namespace   Freewar
// @include     *.freewar.de/freewar/internal/chattext*
// @version     1
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

/******* Globals *******/
console.debug = function(){};
var g_msgCnt = GM_getValue("g_msgCnt",0);
var m_msgCnt = 0;
var player = document.createElement('audio');
player.src = 'https://dl.dropboxusercontent.com/u/69238990/buzz.mp3';
//player.src = 'file:///Users/forkent/Library/Application%20Support/Firefox/Profiles/0bumm5m4.default/gm_scripts/ChatAlert-Freewar/buzz.mp3';
player.preload = 'auto';


/******* Functions *******/
$('.chattextwhisper').each(function(index,element){ 
    console.debug("InnerHtml: " + element.innerHTML);
    if(element.innerHTML.indexOf('Nachricht') > -1) m_msgCnt++; 
});

/******* Debugging Functions *******/
//$('.chattext').each(function(index,element){ 
//    console.debug("InnerHtml: " + element.innerHTML);
//    if(element.innerHTML.indexOf('Gold') > -1) m_msgCnt++; 
//});

/******* Main *******/
console.debug("g_msgCnt: " + g_msgCnt);
console.debug("m_msgCnt: " + m_msgCnt);
if (g_msgCnt < m_msgCnt) {
    player.play();
    console.debug("DÖÖÖÖÖÖÖT");
    GM_setValue("g_msgCnt",m_msgCnt);
} else {
    GM_setValue("g_msgCnt",m_msgCnt);
}
