// ==UserScript==
// @name       hackUMBC Langauge Plugin
// @namespace  http://www.umbc.edu
// @version    0.1
// @description  Langauge Plugin
// @include      *pastebin*
// @copyright  2013, Robert Jackson, Christopher Raborg, Zach Hisley
// ==/UserScript==

var chosenWords = document.getElementsByTagName('html')[0].innerHTML.replace(/(<([^>]+)>)/ig,"").split(" ")

console.log(chosenWords.length);
console.log(chosenWords[0]);
