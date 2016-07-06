/*

Highlighting publications from particular databse directly in search output of Google Scholar.

External tools, credits, authors, licenses

	About: highlight v3 
	Authors: Johann Burkard
	URL: http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
	Licence: MIT Lience

	About: sSimilarity
	Authors: doorhammer
	URL: https://gist.github.com/doorhammer/9957864
	Licence: NO license indicated

	About: levenstein distance
	Authors: Andrei Mackenzie, bdelespierre, scottgelin 
	URL: https://gist.github.com/andrei-m/982927
	License: Partially "Copyright (c) 2011 Andrei Mackenzie"

*/

/* In case true will generate console logs */
var CONSOLE_VERBOSE = true;

/* Computing Levenstein distance */
String.prototype.levenstein = function(string) {
    var a = this, b = string + "", m = [], i, j, min = Math.min;

    if (!(a && b)) return (b || a).length;

    for (i = 0; i <= b.length; m[i] = [i++]);
    for (j = 0; j <= a.length; m[0][j] = j++);

    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            m[i][j] = b.charAt(i - 1) == a.charAt(j - 1)
                ? m[i - 1][j - 1]
                : m[i][j] = min(
                    m[i - 1][j - 1] + 1, 
                    min(m[i][j - 1] + 1, m[i - 1 ][j] + 1))
        }
    }

    return m[b.length][a.length];
}

/* Computing Sørensen–Dice coefficient */
var sSimilarity = function(sa1, sa2){
    // Compare two strings to see how similar they are.
    // Answer is returned as a value from 0 - 1
    // 1 indicates a perfect similarity (100%) while 0 indicates no similarity (0%)
    // Algorithm is set up to closely mimic the mathematical formula from
    // the article describing the algorithm, for clarity. 
    // Algorithm source site: http://www.catalysoft.com/articles/StrikeAMatch.html
    // (Most specifically the slightly cryptic variable names were written as such
    // to mirror the mathematical implementation on the source site)
    //
    // 2014-04-03
    // Found out that the algorithm is an implementation of the Sørensen–Dice coefficient [1]
    // [1] http://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient
    //
    // The algorithm is an n-gram comparison of bigrams of characters in a string


    // for my purposes, comparison should not check case or whitespace
    var s1 = sa1.replace(/[^A-Za-z0-9\s!?]/g, "").toLowerCase();
    var s2 = sa2.replace(/[^A-Za-z0-9\s!?]/g, "").toLowerCase();
    
    function intersect(arr1, arr2) {
        // I didn't write this.  I'd like to come back sometime
        // and write my own intersection algorithm.  This one seems
        // clean and fast, though.  Going to try to find out where
        // I got it for attribution.  Not sure right now.
        var r = [], o = {}, l = arr2.length, i, v;
        for (i = 0; i < l; i++) {
            o[arr2[i]] = true;
        }
        l = arr1.length;
        for (i = 0; i < l; i++) {
            v = arr1[i];
            if (v in o) {
                r.push(v);
            }
        }
        return r;
    }
    
    var pairs = function(s){
        // Get an array of all pairs of adjacent letters in a string
        var pairs = [];
        for(var i = 0; i < s.length - 1; i++){
            pairs[i] = s.slice(i, i+2);
        }
        return pairs;
    }    
	
    var similarity_num = 2 * intersect(pairs(s1), pairs(s2)).length;
    var similarity_den = pairs(s1).length + pairs(s2).length;
    var similarity = similarity_num / similarity_den;
	
    return similarity;
};

/* Experimental function for comparing two sentences */
function compareTwoSentences(searchPattern, dataToCheck){

	var newPhrase = "";
	var tokensSearchPattern = searchPattern.split(" ");
	var tokensDataToCheck = dataToCheck.split(" ");
	
	/* Array to facilitate one-to-one relation between two sentences*/
	var isMinDistanceFound = new Array(tokensDataToCheck.length);
	for (var i = 0; i < isMinDistanceFound.length; ++i) { isMinDistanceFound[i] = false; }
	
	for (var i = 0 ; i < tokensSearchPattern.length; i++){
	
		var minDistance = 0;
		var tokenIndex = 0;
		
		/* First min distance - any distance*/
		for (var k = 0; k < isMinDistanceFound.length; k++){
			if (! isMinDistanceFound[k]){
				minDistance = tokensSearchPattern[i].levenstein(tokensDataToCheck[k]);
				tokenIndex = k;
				break;
			}
		}
		
		/* Calculate actual min distance out of remained */
		var tmpDistance = 0;
		for (var j = 0 ; j < tokensDataToCheck.length; j++){			
			if (!isMinDistanceFound[j]){
				tmpDistance = tokensSearchPattern[i].levenstein(tokensDataToCheck[j]);
				if (tmpDistance <= minDistance){
					minDistance = tmpDistance;
					tokenIndex = j;
				}
			}
		}
		
		/* Saving found values */
		isMinDistanceFound[tokenIndex] = true;
		newPhrase += tokensDataToCheck[tokenIndex] + " ";
		
		console.log("similarity between " + tokensSearchPattern[i] + " and " + tokensDataToCheck[tokenIndex] + " " + sSimilarity(tokensSearchPattern[i], tokensDataToCheck[tokenIndex]))
	}
	
	/* Concatenating left after processing words*/
	for (var i = 0; i < isMinDistanceFound.length; i++){
		if (!isMinDistanceFound[i]){
			newPhrase += tokensDataToCheck[i] + " ";
		}
	}
	
	console.log("newPhrase : " + newPhrase);
	console.log("levenstein (tokensSearchPattern + newPhrase): " + searchPattern.levenstein(newPhrase));
	
	var paarSimilarityNew = sSimilarity(searchPattern, newPhrase);
	console.log("paarSimilarityNew: " + paarSimilarityNew);
	console.log("similarity difference (new - old): " + (paarSimilarityNew - paarSimilarity));
}

/* Getting full text and not only the first parts from Google Scholar*/
function getFullTextInTag(node){

	var fullTextToCheck = "";
	var siblings = node.parentNode.childNodes;
	
	for (var i=0; i < siblings.length; i++){
		if (siblings[i].firstChild == null){
			fullTextToCheck += siblings[i].data + " ";
		} else {
			fullTextToCheck += siblings[i].firstChild.data + " ";
		}
	}
	
	return fullTextToCheck;
}

jQuery.fn.highlight = function(pat, fbgcolor) {
 function innerHighlight(node, pat, fbgcolor) {
 
  var tagType = node.parentNode.nodeName.toLowerCase(); // check all <a> tags
  var skip = 0;
  

  if (node.nodeType == 3 && tagType === 'a') {
  
	var fullTextinTag = getFullTextInTag(node);
	var searchPattern = pat.replace(/[^\w!?]/g, "").toUpperCase();
	var dataToCheck = fullTextinTag.replace(/[^\w!?]/g, "").toUpperCase();
	
	paarSimilarity = sSimilarity(searchPattern, dataToCheck);
	//console.log(paarSimilarity);
	
	/* Checking Levenstein distance only when similarity is high enough*/
   if (paarSimilarity > 0.5){
  
		if (CONSOLE_VERBOSE) console.log("searchPattern " + searchPattern);
		if (CONSOLE_VERBOSE) console.log("dataToCheck " + dataToCheck);
		if (CONSOLE_VERBOSE) console.log("similarity: " + paarSimilarity);		
		
		var levensteinDistance = searchPattern.levenstein(dataToCheck);
		if (CONSOLE_VERBOSE) console.log("levenstein: " + levensteinDistance);
		
		/* Highlighting only when  Levenstein distance is small enough*/
		if (levensteinDistance < 10) {
			// Setting padding & margin to 0px to fix this -- https://github.com/curiosity/Find-Many-Strings/issues/1
			fbgcolor += ";padding: 0px; margin: 0px;";
			node.parentNode.setAttribute('style', fbgcolor);
			node.parentNode.className = "highlight";
			skip = 1;
		}
   }
  }
  else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
   for (var i = 0; i < node.childNodes.length; ++i) {
    i += innerHighlight(node.childNodes[i], pat, fbgcolor);
   }
  }
  return skip;
 }
 return this.each(function() {
  innerHighlight(this, pat.toUpperCase(), fbgcolor);
 });
};

jQuery.fn.removeHighlight = function() {
 return this.find("a.highlight").each(function() {
  this.parentNode.firstChild.nodeName;
  var txtNode = document.createTextNode(this.textContent);
  with (this.parentNode) {
   replaceChild(txtNode, this);
   normalize();
  }
 }).end();
};
