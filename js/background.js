// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    /*
     chrome.tabs.executeScript({
      code: 'document.body.style.backgroundColor="red"'
    });
    */

    chrome.tabs.executeScript(null, {file: 'app.js'}, function() {
        console.log('Success');
        //searchPublications();
        console.log('Success2');
    });

});


// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     //code in here will run every time a user goes onto a new tab, so you can insert your scripts into every new tab
//     chrome.tabs.executeScript(null, {file: 'app.js'}, function() {
//         console.log('Success');
//         //searchPublications();
//         console.log('Success2');
//     });
// });
