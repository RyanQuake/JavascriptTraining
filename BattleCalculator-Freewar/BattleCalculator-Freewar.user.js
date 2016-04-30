// ==UserScript==
// @name        BattleCalculator-Freewar
// @namespace   Zabuza
// @description Removes fastattack links for NPCs where the outcome of a battle is loosing for the player.
// @include     *.freewar.de/freewar/internal/*
// @version     1
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

/******* Globals *******/
console.debug = function() {}
var playerExpectedLife = GM_getValue("playerExpectedLife",0);
var playerStrength = GM_getValue("playerStrength",0);
var playerDefense = GM_getValue("playerDefense",0);

// Create NPC data structure objects
var critSpecialNpc = GM_getValue("critSpecialNpc", null);
if (critSpecialNpc === null) critSpecialNpc = new Object();
//critSpecialNpc = new Object();
var nonCritSpecialNpc = GM_getValue("nonCritSpecialNpc", null);
if (nonCritSpecialNpc === null) nonCritSpecialNpc = new Object();
//nonCritSpecialNpc = new Object();

//var bufferIsSet = false;
var bufferIsSet = GM_getValue("bufferIsSet", false);
/*
 * Routine function of the script.
 */
function routine() {
	if (bufferIsSet === false) {
        initCriticalSpecialNpc();
        initNonCriticalSpecialNpc();
        GM_setValue("critSpecialNpc",critSpecialNpc);
        GM_setValue("nonCritSpecialNpc",nonCritSpecialNpc);
        GM_setValue("bufferIsSet", true);
    }
    
    getplayerExpectedLife();
    getplayerStrength();
    getplayerDefense();
    
//    console.debug("playerExpectedLife: "+playerExpectedLife);
//    console.debug("playerStrength: "+playerStrength);
//    console.debug("playerDefense: "+playerDefense);
    
	// First search for multiple NPC
	$('.listusersrow').each(function(index, cellElement) {
        // get Text
        var text = $(cellElement).find('b').parent().contents().filter(function() {
          return this.nodeType == 3;
        }).text();
        //console.debug(text);
        // get LP
        var npcLP = text.substring(text.indexOf("LP:")+4,text.indexOf("/")).replace(/\./g,'').trim();
        console.debug("LP: " + parseFloat(npcLP));
        // get AP
        var npcAP = text.substring(text.indexOf("Angriffsstärke:")+15,text.lastIndexOf(".")).replace(/\./g,'').trim();
        if (isNaN(npcAP)) {
            npcAP = text.substring(text.indexOf("Angriffsstärke:")+15,text.length).replace(/\./g,'').trim();  
        }
        console.debug("Angriffsstärke: " + parseFloat(npcAP));
        
        var foundNpcInElement = processElement(cellElement,npcLP,npcAP);
	});
}

function getplayerExpectedLife(){
    if(document.getElementById('listrow_lifep') != null) {
        var string = document.getElementById('listrow_lifep').innerHTML;
        var indexStart = string.lastIndexOf('/') + 1;
        var indexEnd = string.lastIndexOf(')');
        playerExpectedLife = parseFloat(string.substr(indexStart,indexEnd-indexStart));
        GM_setValue('playerExpectedLife',playerExpectedLife);
    }
}

function getplayerStrength(){
    if(document.getElementById('listrow_attackp') != null) {
        var string = document.getElementById('listrow_attackp').innerHTML;
        var indexStart = string.lastIndexOf('</b>') + 4;
        var indexEnd = string.indexOf('<span') - 1;
        
        if(indexEnd < 0)
            indexEnd = string.length;
        
        playerStrength = parseFloat(string.substr(indexStart,indexEnd-indexStart));
        
        indexStart = string.indexOf('+') + 1;
        indexEnd = string.lastIndexOf('</span>'); 
        if(indexEnd > indexStart) {
            playerStrength += parseFloat(string.substr(indexStart,indexEnd-indexStart));
        }
        
        GM_setValue('playerStrength', playerStrength);
    }
}

function getplayerDefense(){
    if(document.getElementById('listrow_defensep') != null) {
        var string = document.getElementById('listrow_defensep').innerHTML;
        var indexStart = string.lastIndexOf('</b>') + 4;
        var indexEnd = string.indexOf('<span') - 1;

        if(indexEnd < 0)
            indexEnd = string.length;
        
        playerDefense = parseFloat(string.substr(indexStart,indexEnd-indexStart));
        
        indexStart = string.indexOf('+') + 1;
        indexEnd = string.lastIndexOf('</span>'); 
        if(indexEnd > indexStart) {
           playerDefense += parseFloat(string.substr(indexStart,indexEnd-indexStart)); 
        }
        
        GM_setValue('playerDefense', playerDefense);
    }
}

/*
 * Processes an element that might contain NPC data.
 *
 * @param cellElement The element that might contain NPC data
 *
 * @return True if a NPC was found, false if not
 */
function processElement(cellElement,npcLP,npcAP) {
	// Threshold at which lifepoint loss is critical
	var critLifeThreshold = Math.floor(playerExpectedLife/2);

	var npcNameElement = $(cellElement).find('b');
	var npcFastAttackElement = $(cellElement).find('.fastattack');

	if ($(npcNameElement).length > 0 && $(npcFastAttackElement).length > 0) {
		// Skip if NPC was already processed before
		if ($(npcNameElement).hasClass('processedNPC')) {
			return $(npcNameElement).hasClass('knownNPC');
		}

		var npcName = $(npcNameElement).text();
		var lifeLoss = computeOutcome(playerExpectedLife, playerStrength, playerDefense, npcLP,npcAP);
        
        if (isCriticalSpecialNpc(npcName)) {
			// NPC is a critical special NPC
			$(npcFastAttackElement).css('color', '#F00F0F');
			$(npcFastAttackElement).append(' (crit-special)');
			$(npcFastAttackElement).removeAttr('href');
			$(npcFastAttackElement).removeAttr('onclick');
			$(npcNameElement).addClass('processedNPC knownNPC');
		} else if (isNonCriticalSpecialNpc(npcName)) {
			// NPC is a non critical special NPC
			$(npcFastAttackElement).css('color', '#F00F0F');
			$(npcFastAttackElement).append(' (non-crit-special)');
			$(npcFastAttackElement).removeAttr('href');
			$(npcFastAttackElement).removeAttr('onclick');
			$(npcFastAttackElement).hide();
			$(npcNameElement).addClass('processedNPC knownNPC');
		} else  if (lifeLoss == -1) {
			// Player looses
			$(npcFastAttackElement).css('color', '#F00F0F');
			$(npcFastAttackElement).append(' (defeat)');
			$(npcFastAttackElement).removeAttr('href');
			$(npcFastAttackElement).removeAttr('onclick');
			$(npcNameElement).addClass('processedNPC knownNPC');
			return true;
		} else if (lifeLoss == -2){
			// NPC is unknown
			$(npcFastAttackElement).css('color', '#0D4BF2');
			$(npcFastAttackElement).append(' (unknown)');
			$(npcNameElement).addClass('processedNPC unknownNPC');
			return false;
		} else {
			// Player wins
			if (lifeLoss >= critLifeThreshold || npcName == 'Undaron') {
				$(npcFastAttackElement).css('color', '#E7971F');
			}
			$(npcFastAttackElement).append(' (-' + lifeLoss + ' LP)');
			$(npcNameElement).addClass('processedNPC knownNPC');
			return true;
		}
	}
}

/*
 * Computes the outcome of a battle between the player and a NPC.
 *
 * @param playerLife The amount of lifepoints the player has
 * @param playerStrength The strength of the player
 * @param playerDefense The defense of the player
 * @param npcName The name of the NPC
 *
 * @return The amount of lifepoints loosed in the battle. -1 if the player
 * gets defeated and -2 if the NPC is unknown.
 */
function computeOutcome(playerLife, playerStrength, playerDefense, npcLP, npcAP) {
	var npcStrength = npcAP;
	var npcLife = npcLP;

	if (npcStrength < 0 || npcLife < 0) {
		return -2;
	}

	// A hit deals at most one point of damage
	var howManyHits = Math.ceil(npcLife / playerStrength);
	var lifeLossPerHit = Math.max(1, npcStrength - playerDefense);
	var lifeLoss = Math.max(1, Math.ceil(howManyHits * lifeLossPerHit));

	if (lifeLoss >= playerLife) {
		return -1;
	} else {
		return lifeLoss;
	}
}

/*
 * Returns wether the given NPC is a critical special NPC.
 *
 * @param npcName The name of the NPC
 *
 * @return True if the given NPC is a critical special NPC, false if not.
 */
function isCriticalSpecialNpc(npcName) {
	var foundNpc = false;

	if (npcName in critSpecialNpc) {
		foundNpc = true;
	} else {
		// Try it with the first character uppered
		var upperedNpcName = firstCharToUpperCase(npcName);
		if (upperedNpcName in critSpecialNpc) {
			foundNpc = true;
		}
	}
    
    if (npcName.indexOf('Portalstab-Anbeter') > -1) {
        foundNpc = true;
    }
    
	return foundNpc;
}

/*
 * Returns wether the given NPC is a non critical special NPC.
 *
 * @param npcName The name of the NPC
 *
 * @return True if the given NPC is a non critical special NPC, false if not.
 */
function isNonCriticalSpecialNpc(npcName) {
	var foundNpc = false;

	if (npcName in nonCritSpecialNpc) {
		foundNpc = true;
	} else {
		// Try it with the first character uppered
		var upperedNpcName = firstCharToUpperCase(npcName);
		if (upperedNpcName in nonCritSpecialNpc) {
			foundNpc = true;
		}
	}

	return foundNpc;
}

/*
 * Uppers the first character of a given String.
 *
 * @param str String to upper first character
 *
 * @return String where the first character was uppered
 */
function firstCharToUpperCase(str) {
	return str.substr(0, 1).toUpperCase() + str.substr(1);
}

/*
 * Initializes the critical special NPC data structure.
 */
function initCriticalSpecialNpc() {
	// Resistance NPC
	critSpecialNpc['Achtsamer Stachelschuss-Igel'] = true;
	critSpecialNpc['Bockiger Stier'] = true;
	critSpecialNpc['Dickhäutiger Graustein-Bär'] = true;
	critSpecialNpc['Gepanzertes Undaron'] = true;
	critSpecialNpc['Glitschige Dunkelsee-Qualle'] = true;
	critSpecialNpc['Robuster Morschgreifer'] = true;
	critSpecialNpc['Schnelle Bernstein-Raupe'] = true;
	critSpecialNpc['Schneller Stororaptor'] = true;
	critSpecialNpc['Schneller Tempelkrabbler'] = true;
	critSpecialNpc['Schnelles Tonar-Reptil'] = true;
	critSpecialNpc['Stepto-Waran'] = true;
	critSpecialNpc['Transparenter Schatten'] = true;
	critSpecialNpc['Wachsamer Frostwolf'] = true;
	critSpecialNpc['Wendige Glypra'] = true;
	critSpecialNpc['Zäher Spindelschreiter'] = true;

	// Super Resistance NPC
	critSpecialNpc['Absorbierende Dunkelsee-Qualle'] = true;
	critSpecialNpc['Alter Frostwolf'] = true;
	critSpecialNpc['Alter Stororaptor'] = true;
	critSpecialNpc['Bestialisches Tonar-Reptil'] = true;
	critSpecialNpc['Dickhäutiger Goldballenwurm'] = true;
	critSpecialNpc['Enormer Graustein-Bär'] = true;
	critSpecialNpc['Flinker Bernstein-Falke'] = true;
	critSpecialNpc['Glypra-Spion'] = true;
	critSpecialNpc['Metallischer Morschgreifer'] = true;
	critSpecialNpc['Resistenter Schatten'] = true;
	critSpecialNpc['Resistenter Stachelschuss-Igel'] = true;
	critSpecialNpc['Robuster Spindelschreiter'] = true;
	critSpecialNpc['Schnellflatter-Schmetterling'] = true;
	critSpecialNpc['Unverwüstliches Undaron'] = true;
	critSpecialNpc['Zäher Ontolon'] = true;
	critSpecialNpc['Undaron'] = true;
	critSpecialNpc['Portalstab-Anbeter'] = true;

	// Special exeptions
	critSpecialNpc['kräftiger Graustein-Bär'] = true;
}

/*
 * Initializes the non critical special NPC data structure.
 */
function initNonCriticalSpecialNpc() {
	// Unique-NPC
    nonCritSpecialNpc['Abtrünnige Wolke'] = true;
	nonCritSpecialNpc['Anatubischer Windhund'] = true;
	nonCritSpecialNpc['Ausgesaugter Energiewurm'] = true;
	nonCritSpecialNpc['Blutapfelbaum'] = true;
	nonCritSpecialNpc['Diebstahlfallen-Verwalter'] = true;
	nonCritSpecialNpc['Dreiköpfige Wasserschlange'] = true;
	nonCritSpecialNpc['Dunkler Matschreißer'] = true;
	nonCritSpecialNpc['Dämonenhund'] = true;
	nonCritSpecialNpc['Entflohener Mörder'] = true;
	nonCritSpecialNpc['Erd-Skelkos'] = true;
	nonCritSpecialNpc['Experimental-Phasenwesen'] = true;
	nonCritSpecialNpc['Fliegender Todesfarn'] = true;
	nonCritSpecialNpc['Gefallenes Lichtwesen'] = true;
	nonCritSpecialNpc['Giftgeist von Narubia'] = true;
	nonCritSpecialNpc['Goldhornziege'] = true;
	nonCritSpecialNpc['Goldkraken'] = true;
	nonCritSpecialNpc['Grabräuber'] = true;
	nonCritSpecialNpc['Grabschlecker'] = true;
	nonCritSpecialNpc['Großer Blattalisk'] = true;
	nonCritSpecialNpc['Großer Nebelkreischer'] = true;
	nonCritSpecialNpc['Großes Eistentakel'] = true;
	nonCritSpecialNpc['Grüne Rotorlibelle'] = true;
	nonCritSpecialNpc['Heilender Baum'] = true;
	nonCritSpecialNpc['Jerodar-Anführer'] = true;
	nonCritSpecialNpc['Knorpel-Monster aus Draht'] = true;
	nonCritSpecialNpc['Kopolaspinne'] = true;
	nonCritSpecialNpc['Kurnotan - der dunkle Magier'] = true;
	nonCritSpecialNpc['Lola - Die Hauskawutze'] = true;
	nonCritSpecialNpc['Magier der dunklen Macht'] = true;
	nonCritSpecialNpc['Mutierter Koloa-Käfer'] = true;
	nonCritSpecialNpc['Mutter der Geysir-Schlucker'] = true;
	nonCritSpecialNpc['Nebelgeist Argarie'] = true;
	nonCritSpecialNpc['Nebelgeist Bargu'] = true;
	nonCritSpecialNpc['Nebelgeist Frorie'] = true;
	nonCritSpecialNpc['Nebelgeist Girie'] = true;
	nonCritSpecialNpc['Nebelgeist Murahn'] = true;
	nonCritSpecialNpc['Nebelgeist Napirie'] = true;
	nonCritSpecialNpc['Nebelgeist Nukarie'] = true;
	nonCritSpecialNpc['Nebelgeist Sorlie'] = true;
	nonCritSpecialNpc['Nebelgeist Viginur'] = true;
	nonCritSpecialNpc['Nebelgeist Wrozie'] = true;
	nonCritSpecialNpc['Onuk Kulo'] = true;
	nonCritSpecialNpc['Phasenverbrenner'] = true;
	nonCritSpecialNpc['Pironer'] = true;
	nonCritSpecialNpc['Portal in die Unterwelt'] = true;
	nonCritSpecialNpc['Randalierer'] = true;
	nonCritSpecialNpc['Rote Landkoralle'] = true;
	nonCritSpecialNpc['Roteiskoralle'] = true;
	nonCritSpecialNpc['Schatten-Ei'] = true;
	nonCritSpecialNpc['Schattenkreatur Gortari'] = true;
	nonCritSpecialNpc['Schattenkreatur Jalakori'] = true;
	nonCritSpecialNpc['Schattenkreatur Mantori'] = true;
	nonCritSpecialNpc['Schattenkreatur Turwakori'] = true;
	nonCritSpecialNpc['Schatzsucher'] = true;
	nonCritSpecialNpc['Schmieriger Geschäftemacher'] = true;
	nonCritSpecialNpc['Schneeworan'] = true;
	nonCritSpecialNpc['Schwebende Goldkutsche'] = true;
	nonCritSpecialNpc['Spezialist für Erze'] = true;
	nonCritSpecialNpc['Staubkrieger'] = true;
	nonCritSpecialNpc['Stein-Koloss'] = true;
	nonCritSpecialNpc['Stein-Skelkos'] = true;
	nonCritSpecialNpc['Sula-Echse'] = true;
	nonCritSpecialNpc['Tilua-Pflanze'] = true;
	nonCritSpecialNpc['Todesflossen-Fisch'] = true;
	nonCritSpecialNpc['Turmgeist'] = true;
	nonCritSpecialNpc['Untoter Bürgermeister'] = true;
	nonCritSpecialNpc['Vater aller Stachelschuss-Igel'] = true;
	nonCritSpecialNpc['Wahnsinniger Waldschlurch'] = true;
	nonCritSpecialNpc['Wasser-Schemen'] = true;
	nonCritSpecialNpc['Wetterkontroll-Magier'] = true;
	nonCritSpecialNpc['Wucherwurzelbaum'] = true;

	// Group-NPC
	nonCritSpecialNpc['26-köpfiger Salamander'] = true;
	nonCritSpecialNpc['Angepasster Ontolon'] = true;
	nonCritSpecialNpc['Baru-Schrecke'] = true;
	nonCritSpecialNpc['Behüter der Kathedrale'] = true;
	nonCritSpecialNpc['Bernstein-Dokun'] = true;
	nonCritSpecialNpc['Beuteltiger'] = true;
	nonCritSpecialNpc['Bierbraumeister'] = true;
	nonCritSpecialNpc['Blauer Landfisch'] = true;
	nonCritSpecialNpc['Blaues Stachel-Kowu'] = true;
	nonCritSpecialNpc['Blutprobenwesen'] = true;
	nonCritSpecialNpc['Bulliges Erd-Skelkos'] = true;
	nonCritSpecialNpc['Diener des Feuers'] = true;
	nonCritSpecialNpc['Dunkelmorin'] = true;
	nonCritSpecialNpc['Dunkelschlamm-Wurm'] = true;
	nonCritSpecialNpc['Dunkelstern-Seher'] = true;
	nonCritSpecialNpc['Dunkelwald-Skelett'] = true;
	nonCritSpecialNpc['Eiswelt-Echse'] = true;
	nonCritSpecialNpc['Feuerwachtel'] = true;
	nonCritSpecialNpc['Flimmernde Farbanomalie'] = true;
	nonCritSpecialNpc['Großer Prärieskorpion'] = true;
	nonCritSpecialNpc['Grünbaum-Affe'] = true;
	nonCritSpecialNpc['Grünes Stachel-Kowu'] = true;
	nonCritSpecialNpc['Herrscher der eisigen Dämonen'] = true;
	nonCritSpecialNpc['Herz des Blutwaldes'] = true;
	nonCritSpecialNpc['Kollektiver Salzhügel'] = true;
	nonCritSpecialNpc['Larpan'] = true;
	nonCritSpecialNpc['Lebende Waldwurzel'] = true;
	nonCritSpecialNpc['Lebender Tropfstein'] = true;
	nonCritSpecialNpc['Loroktom, der große Steingolem'] = true;
	nonCritSpecialNpc['Massive Landqualle'] = true;
	nonCritSpecialNpc['Nebelwolf'] = true;
	nonCritSpecialNpc['Phasenskelkos'] = true;
	nonCritSpecialNpc['Schattenkrokodil'] = true;
	nonCritSpecialNpc['Siedestein-Morschgreifer'] = true;
	nonCritSpecialNpc['Silberfluss-Bär'] = true;
	nonCritSpecialNpc['Siramücken-Schwarm'] = true;
	nonCritSpecialNpc['Sohn des Wiesengeistes'] = true;
	nonCritSpecialNpc['Spindelschreiter-Überwacher'] = true;
	nonCritSpecialNpc['Spinne der Staubnetze'] = true;
	nonCritSpecialNpc['Staubschleifer-Königin'] = true;
	nonCritSpecialNpc['Störrischer Stororaptor'] = true;
	nonCritSpecialNpc['Tempelhüter'] = true;
	nonCritSpecialNpc['Tempelwächter'] = true;
	nonCritSpecialNpc['Tollwütiger Graustein-Bär'] = true;
	nonCritSpecialNpc['Vertin'] = true;
	nonCritSpecialNpc['Waldmonster'] = true;
	nonCritSpecialNpc['Wandelnder Laubbaum'] = true;
	nonCritSpecialNpc['Weltenwandler'] = true;
	nonCritSpecialNpc['Wüstenkrake'] = true;
}

// Start the routine function
routine();
