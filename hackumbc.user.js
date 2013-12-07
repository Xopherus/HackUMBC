// ==UserScript==
// @name       		hackUMBC Langauge Plugin
// @namespace  		http://www.umbc.edu
// @version    		0.1
// @description  	Langauge Plugin
// @include      	*pastebin*
// @copyright  		2013, Robert Jackson, Christopher Raborg, Zach Hisley
// @require       	http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// @grant			GM_xmlhttpRequest
// @grant			none
// ==/UserScript==

var outLang = "es"
var inLang = "en"

var regexSplit = new RegExp(/[,\\.\\!\\?]/)
var initPhraseArr = document.getElementsByTagName('html')[0].innerHTML.replace(/(<([^>]+)>)/ig,"").split(regexSplit)

var finalPhraseArr = makePhraseArray(initPhraseArr)
var finalPhraseArrEncoded = new Array(finalPhraseArr.length);
var translationArr = new Array(finalPhraseArr.length);

for (var i = 0; i < finalPhraseArr.length; i++) {

    finalPhraseArrEncoded[i] = encodeURI(finalPhraseArr[i])
    
}

lookupPhrases(finalPhraseArrEncoded, translationArr)


function makePhraseArray(phraseArr) {
    
    var arr = new Array()
    
    if (Object.prototype.toString.call(phraseArr) === '[object Array]') {
     
        phraseArr.forEach(function (i) {
          
            phraseSplit(i, arr)
            
        })
        
    }
    else {
        
        phraseSplit(phraseArr, arr)
        
    }
    
    return arr
    
}

function phraseSplit (phrase, arr) {
    
    phrase.replace(/.{250}\S*\s+/g, "$&@").split(/\s+@/).forEach(function (i) {
        
        arr.push(i)
        
    })
        
}

function lookupPhrases(arr, tArr) {
    for (var i = 0; i < arr.length; i++) {
              
       GM_xmlhttpRequest({
       		method:	"GET",
       		url:	"http://translate.google.com/translate_a/t?client=p&text=" + arr[i] + "&sl=" + inLang + "&tl=" + outLang,
            onload:	(function (arr, tArr, i){ 
               
               return function(response) {
                                      
                   	var json = JSON.parse(response.responseText)
                    
                    var transString = ""
                    
                    json.sentences.forEach(function (i) {
                      
                        transString = transString + i.trans
                        
                    })

    				tArr[i] = transString
                                    
                    modifyPage(finalPhraseArr[i], tArr[i])
               
               }
               
           })(arr, tArr, i)

       })
        
    }

}


function modifyPage(phrase, tPhrase) {
    
    console.log(phrase + " " + tPhrase)
    
	document.getElementsByTagName('html')[0].innerHTML = document.getElementsByTagName('html')[0].innerHTML.replace(phrase, tPhrase)
    
}
