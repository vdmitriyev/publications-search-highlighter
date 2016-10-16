var globalDatabase = [];

function searchPublications(that) {
    console.log("searchPublications was called");

    // var currentLink = document.getElementById('currentLink').innerHTML;
    // console.log(currentLink);
    getDatabase();

    //console.log(globalDatabase);
    highlightDataBase(globalDatabase);
}


function getDatabase(){

    if (globalDatabase.length < 1 ){
        console.log("Loading database.");
        readCSVFile("db.csv");
    } else {
        console.log("Re-using already loaded database.");
    }
}

/* Reading local file with database if possible.*/
function readCSVFile(file){

    if (globalDatabase.length < 1 ){
        var rawFile = new XMLHttpRequest();
        console.log(chrome.extension);
        rawFile.open("GET", chrome.extension.getURL(file), true);
        rawFile.onreadystatechange = function (){

            if( rawFile.readyState == XMLHttpRequest.DONE && rawFile.status == 200){
                var rawText = rawFile.responseText;
                globalDatabase = convertDataBaseFromRawToJS(rawText);
            }

            if( rawFile.readyState == XMLHttpRequest.DONE && rawFile.status != 200){
                var msg = "Extension was not able to read database from CSV." + "\n"
                        + "Something wrong with database file: " + chrome.runtime.getURL(file);
                console.error(msg);
                alert(msg);
            }

        };

        rawFile.send();
    }
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

/* Convert read CSV file with raw data into JavaScript array for future usage*/
function convertDataBaseFromRawToJS(rawDatabaseData){

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
            //console.log("tmpArr[\"title\"]: " + tmpArr["title"]);
            database.push(tmpArr);
        }
    }

    return database;
}


function highlightDataBase(database){

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

        //console.log('color: ' + color);

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
            //console.log("title: " + title);
            chrome.tabs.executeScript(null, {code:"$(document.body).highlight('" + title + "','" + color + "')"});
        }

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

function editDatabaseNavigate(that) {
     var pathToHTML = chrome.extension.getURL("editdatabase.html");
     window.open(pathToHTML, '_blank');
}


function saveDatabase(that) {

}

function editDatabase(that) {

    $('#editableDatabase').html('');
    getDatabase();

    // setting time-out, because request for local file is asynchronous
    setTimeout(function(){

        addDataToTable();

        $('#editableDatabase').Tabledit({
            url: null,
            columns: {
                identifier: [0, 'id'],
                editable: [[1, 'title'], [2, 'status']]
            }
        });

        editDatabaseButton.innerHTML = "Load Database"

    }, 2000);

    var editDatabaseButton = document.getElementById('btnEditDatabase');
    if (editDatabaseButton != null){
        editDatabaseButton.innerHTML = "Loading database (waiting ... )"
    }

}

function addDataToTable(){

    var tableContent = "";
    tableContent = "<table><tr><td>Title</td><td>Status</td></tr>";

    try{
        for (var i=0; i < globalDatabase.length; i++) {
            var title = (globalDatabase[i]["title"] + "").slice(1, -1).trim();
            var status = (globalDatabase[i]["status"] + "").slice(1, -1).trim();

            tableContent += '<tr><td>' + title + '</td><td>' + status + '</td></tr>';
        }
    } catch(err) {
        console.error(err);
    }

    tableContent += "</table>"
    //console.log(tableContent);
    $('#editableDatabase').html(tableContent);
}

document.addEventListener('DOMContentLoaded', function () {

    var searchButton = document.getElementById('btnHighlightPublications');
    // console.log(searchButton);
    if (searchButton != null){
        searchButton.addEventListener('click', searchPublications);
    }

    var clearButton = document.getElementById('btnClearHighlights');
    if (clearButton != null){
        clearButton.addEventListener('click', clearHighlights);
    }

    var editDatabaseNavigateButton = document.getElementById('btnEditDatabaseNavigate');
    if (editDatabaseNavigateButton != null){
        editDatabaseNavigateButton.addEventListener('click', editDatabaseNavigate);
    }

    var editDatabaseButton = document.getElementById('btnEditDatabase');
    if (editDatabaseButton != null){
        editDatabaseButton.addEventListener('click', editDatabase);
    }

    var saveDatabaseButton = document.getElementById('btnSaveDatabase');
    if (saveDatabaseButton != null){
        saveDatabaseButton.addEventListener('click', saveDatabase);
    }



});

// chrome.tabs.getSelected(null, function(tab) {
//     document.getElementById('currentLink').innerHTML = tab.url;
// });
