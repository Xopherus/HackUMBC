// ==UserScript==
// @name       hackUMBC Text Mining
// @namespace  http://www.umbc.edu
// @version    0.1
// @description  Langauge Plugin
// @include      *pastebin*
// @copyright  2013, Robert Jackson, Christopher Raborg, Zach Hisley
// ==/UserScript==

var regexSplit = new RegExp(/[,\\.\\!\\?]/)

var chosenWords = document.getElementsByTagName('html')[0].innerHTML.replace(/(<([^>]+)>)/ig,"").split(regexSplit)
var translatedWords = new Array(chosenWords.length)

contentMine(chosenWords);

function contentMine(content){
    wordList = []
    for(i in content){
        line = content[i].split(" ")
        
        for(w in line){ 
            console.log(line[w])
            
            var word = new Object()
            word.text = line[w].toLowerCase()
            word.count = 1
            
            if(objectIndexOf(wordList, word) == -1){
                wordList.push(word)
            }else{
                wordList[wordList.objectIndexOf(word)].count++
            }
          
            
        }  
    }
    printWords(wordList)
    return
}

// Returns the index of the object that matches the text
function objectIndexOf(words, word){
    for(var i = 0; i < words.len; i++){
     	if(words[i].text == word)
            return i
    }
    return -1
}

function printWords(words){
    for(i in words){
        console.log(words[i].text + " is found " + words.count + " times");    
    }
}