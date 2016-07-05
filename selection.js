/*
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {

	if (info.status === 'complete' ) {
		alert('fdsfds');
	}
});
*/

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	
    if (request.method == "getSelection")
        sendResponse({data: window.getSelection().toString()});
    else
        sendResponse({}); // snub them.
});

//document.body.innerHTML = document.body.innerHTML.replace("manifest.json", "nobody");