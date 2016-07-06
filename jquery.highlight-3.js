/*

highlight v3

Highlights arbitrary terms.

<http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>

MIT license.

Johann Burkard
<http://johannburkard.de>
<mailto:jb@eaio.com>


sSimilarity by doorhammer, https://gist.github.com/doorhammer/9957864

NO license indicated

*/

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
    var s1 = sa1.replace(/\s/g, "").toLowerCase();
    var s2 = sa2.replace(/\s/g, "").toLowerCase();
	
	//console.log("sSimilarity param 1: " + s1);
	//console.log("sSimilarity param 2: " + s2);
    
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

jQuery.fn.highlight = function(pat, fbgcolor) {
 function innerHighlight(node, pat, fbgcolor) {
  var tagType = node.parentNode.nodeName.toLowerCase(); // check all <a> tags
  var skip = 0;
  if (node.nodeType == 3 && tagType === 'a') {
	//console.log(pat);
	//console.log(node.data);
	similarity = sSimilarity(node.data.toUpperCase(), pat);
	//console.log(similarity);
	
	//var pos = node.data.toUpperCase().indexOf(pat);
   //if (pos >= 0) {
   if (similarity > 0.7){
   
	console.log("pattern: " + pat);
	console.log("text matched: " + node.data);
	console.log("similarity: " + similarity);
	
	// Setting padding & margin to 0px to fix this -- https://github.com/curiosity/Find-Many-Strings/issues/1
    fbgcolor += ";padding: 0px; margin: 0px;";
	node.parentNode.setAttribute('style', fbgcolor);
	node.parentNode.className = "highlight"
	/*
    var pos = 1;
    var spannode = document.createElement('span');
    spannode.className = 'highlight';
    // Setting padding & margin to 0px to fix this -- https://github.com/curiosity/Find-Many-Strings/issues/1
    fbgcolor += ";padding: 0px; margin: 0px;";
    spannode.setAttribute('style', fbgcolor);
    var middlebit = node.splitText(pos);
    var endbit = middlebit.splitText(pat.length);
    var middleclone = middlebit.cloneNode(true);
    spannode.appendChild(middleclone);
    middlebit.parentNode.replaceChild(spannode, middlebit);
	*/
    skip = 1;
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
