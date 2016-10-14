
function addDataToTable(){
    /* Note that the whole content variable is just a string */
    readCSVFile("db.csv");

    var tableContent = "";
    //tableContent = "<table>";

    for (var i=0; i < globalDatabase.length; i++) {
        var title = (globalDatabase[i]["title"] + "").slice(1, -1).trim();
        var status = (globalDatabase[i]["status"] + "").slice(1, -1).trim();

        tableContent += '<tr><td>' + title + '</td><td>' + status + '</td></tr>';
    }

    //tableContent += "</table>"

    $('#editableDatabase').append(tableContent);
}

function editDatabase(that) {
    // chrome.tabs.executeScript(null,
    //     {code:"$(document.body).removeHighlight()"});

    // window.close();
    // var codeToExecute  = "$('#editableDatabase').Tabledit({ url: 'example.php', columns: { identifier: [0, 'id'], editable: [[1, 'nickname'], [2, 'firstname'], [3, 'lastname']] }})";
    // chrome.tabs.executeScript(null, {code: codeToExecute });
    addDataToTable();

    $('#editableDatabase').Tabledit({
        url: null,
        columns: {
            identifier: [0, 'id'],
            editable: [[1, 'nickname'], [2, 'firstname'], [3, 'lastname']]
        }
    });

}

document.addEventListener('DOMContentLoaded', function () {

    var editDatabaseButton = document.getElementById('btnEditDatabase');
    editDatabaseButton.addEventListener('click', editDatabase);

});
