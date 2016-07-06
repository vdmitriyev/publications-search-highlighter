function readCSVFile(file){

	//alert(chrome.extension.getURL(file));
	
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", chrome.extension.getURL(file), true);
    rawFile.onreadystatechange = function (){
	
		if( rawFile.readyState == XMLHttpRequest.DONE && rawFile.status == 200){
			var rawText = rawFile.responseText;
			highlightDataBase(rawText);
        }
    };

    rawFile.send();
}

function getRandomColor() {

    var style = 'background: ';

    var r, g, b;

    r = Math.round(Math.random() * 0xFF);
    g = Math.round(Math.random() * 0xFF);
    b = Math.round(Math.random() * 0xFF);

    style += 'rgba(' + r + ',' + g + ',' + b + ',1);';
	//console.write(style);

    /* The formula for calculating luminance is taken from
     * http://www.paciellogroup.com/resources/contrast-analyser.html
     *
     * If there are better methods to change, please let me know.
     */
     var luminance = (r * 299 + g * 587 + b * 114 ) / 1000;

     if (luminance < 125) {
        style += 'color: #FFFFFF';
    } else {
        style += 'color: #000000';
    }

    return style;
}

function searchPublications(that) {	
	//alert("searchPublications was called");
	console.log("searchPublications was called");
	//console.log("reading from file");
	readCSVFile("db.csv");	
}

function highlightDataBase(rawDatabaseData){
	
	var output = "";
    var delimToken = ";";
	var database = [];
    var lines = rawDatabaseData.split("\n");
	
	for (var i=0; i < lines.length; i++) {
		if (lines[i] != 'undefined'){
			//alert(lines[i]);
			var parts = lines[i].split(delimToken);
			output += parts[0] + parts[1] + "\n";
			var tmpArr = {};
			tmpArr["title"] = (parts[0] + "").trim().toUpperCase().replace("'", "");
			tmpArr["status"] = (parts[1] + "").trim().toUpperCase();
			console.log("tmpArr[\"title\"]: " + tmpArr["title"]);
			database.push(tmpArr);
		}
	}
	
    for (var i=0; i < database.length; i++) {
		var title = (database[i]["title"] + "").slice(1, -1).trim();
		var status = (database[i]["status"] + "").slice(1, -1).trim();
		var color = getRandomColor();
		
		//alert(title + "\n" + status);
		
		if (status == "READ"){
			color = "background: rgba(100, 200, 131,1); color: #000;";
		} 
		
		if (status == "UNREAD"){
			color = "background: rgba(180, 13, 33,1); color: #000;";
		} 

		console.log('color: ' + color);
		
		if ( title.indexOf("_") > -1) {
			console.log("found '_' symbols in name of the file");
			/*
			var subTitles = title.split("_");
			console.log(subTitles.length);
			for ( var j = 0 ; j < subTitles.length; j++){
				console.log(subTitles[j]);
				chrome.tabs.executeScript(null,{code:"$(document.body).highlight('" + subTitles[j] + "','" + color + "')"});
			}
			*/
		} else {
			console.log("title: " + title);
			chrome.tabs.executeScript(null, {code:"$(document.body).highlight('" + title + "','" + color + "')"});
		}

		/*
		
		*/
        
    }

    // Scroll such that the last occurrences of the first search token is visible
    //chrome.tabs.executeScript(null,
    //{code:"$(document.body).scrollTop($(\"*:contains('"+ title  +"'):last\").offset().top)"});

    //window.close();
}

function clearHighlights(that) {
    chrome.tabs.executeScript(null,
        {code:"$(document.body).removeHighlight()"});

    window.close();
}

document.addEventListener('DOMContentLoaded', function () {

  var searchButton = document.getElementById('btnHighlightPublications');
  searchButton.addEventListener('click', searchPublications);

  var clearButton = document.getElementById('btnClearHighlights');
  clearButton.addEventListener('click', clearHighlights);
});
