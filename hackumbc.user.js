// ==UserScript==
// @name       hackUMBC Langauge Plugin
// @namespace  http://www.umbc.edu
// @version    0.1
// @description  Langauge Plugin
// @include      *pastebin*
// @copyright  2013, Robert Jackson, Christopher Raborg, Zach Hisley
// ==/UserScript==

var regexSplit = new RegExp(/[,\\.\\!\\?]/)

var chosenWords = document.getElementsByTagName('html')[0].innerHTML.replace(/(<([^>]+)>)/ig,"").split(regexSplit)
var translatedWords = new Array(chosenWords.length)

setupTranslations()

function setupTranslations() {
    
    var tempString = ""

    chosenWords.forEach(function(i) {
        tempString = tempString + i + "\n"
    })    
    
    console.log(encodeURIComponent(tempString))
    
}