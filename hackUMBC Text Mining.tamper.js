// ==UserScript==
// @name       		hackUMBC Langauge Plugin
// @namespace  		http://www.umbc.edu
// @version    		0.1
// @description  	Langauge Plugin
// @include      	*
// @copyright  		2013, Robert Jackson, Christopher Raborg, Zach Hisley
// @require       	http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// @grant			GM_xmlhttpRequest
// @grant			none
// ==/UserScript==

var BEGINNER = .1
var PHRASE_LENGTH = 10
var NUM_SUBS = 25
var outLang = "es"
var inLang = "en"

var link = document.createElement('link')
var script1 = document.createElement('script')
var script2 = document.createElement('script')

link.rel = 'stylesheet'
link.href = 'http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css'
link.type = 'text/css'

script1.src = 'http://code.jquery.com/jquery-1.9.1.js'
script2.src = 'http://code.jquery.com/ui/1.10.3/jquery-ui.js'

document.head.insertBefore(link, null)
document.head.insertBefore(script1, null)
document.head.insertBefore(script2, null)

var regexSplit = new RegExp(/[,\\.\\!\\?]/)

var initPhraseArr = document.getElementsByTagName('body')[0].innerHTML.replace(/(<([^>]+)>)/ig, "").split(regexSplit)
var sortedArr = contentMine(initPhraseArr)
var topPhraseArr = new Array(NUM_SUBS)
var finalPhraseArr = new Array(NUM_SUBS);
var translationArr = new Array(NUM_SUBS);

for (var i = 0; i < NUM_SUBS; i++) {
 
   topPhraseArr[i] = sortedArr[i][0]
   finalPhraseArr[i] = encodeURI(sortedArr[i][0])
    
}

lookupPhrases(finalPhraseArr, translationArr)


function lookupPhrases(arr, tArr) {
    for (var i = 0; i < arr.length; i++) {

        GM_xmlhttpRequest({
            method: "GET",
            url: "http://translate.google.com/translate_a/t?client=p&text=" + arr[i] + "&sl=" + inLang + "&tl=" + outLang,
            onload: (function (arr, tArr, i) {

                return function (response) {

                    var json = JSON.parse(response.responseText)

                    var transString = ""

                    json.sentences.forEach(function (i) {

                        transString = transString + i.trans

                    })

                    tArr[i] = transString

                    modifyPage(finalPhraseArr[i], tArr[i], i)

                }

            })(arr, tArr, i)

        })

    }

}


function modifyPage(phrase, tPhrase, i) {

    var diagElem = document.createElement('div')
    diagElem.id = 'transDialog' + i
    diagElem.title = 'Translation Toolkit'

    document.body.insertBefore(diagElem, null)

	replaceTextNodes(document.getElementsByTagName('body')[0], phrase, tPhrase, i)
    
}

function replaceTextNodes(node, phrase, tPhrase, idx) {
    
    var newSpan = '<span style="text-decoration: underline" onmouseover="this.style.backgroundColor=&quot;yellow&quot;\" onmouseout="this.style.backgroundColor=null" onclick="$(&quot;#transDialog' + idx + '&quot;).dialog()">' + tPhrase + '</span>'

    if (node.nodeType == 3) {
             
		if (!/^\s*$/.test(node.data)) {
                       
			var newNode = document.createElement('span')
			newNode.innerHTML = node.data.toString().replace(new RegExp("\\b" + phrase + "\\b", "ig"), newSpan)

			node.parentNode.replaceChild(newNode, node)
                       
    	}

	}      
	else if (node.hasChildNodes()) {
		for (var i = 0, len = node.childNodes.length; i < len; ++i) {
			replaceTextNodes(node.childNodes[i], phrase, tPhrase, idx);
		}
	}
}
        

            /*if (!node.childNodes[i].hasChildNodes()) {
                if (node.childNodes[i].nodeType == 3) {
                    
                    if (node.childNodes[i].data.toString().indexOf(phrase) != -1) {
                     
                        console.log(node)
                        

                        
                      /*  var newSpan = document.createElement('span')
                        newSpan.id = 'transInsert' + idx
                        newSpan.setAttribute('style','text-decoration: underline')
                        newSpan.setAttribute('onmouseover', 'this.style.backgroundColor = \'yellow\'')
                        newSpan.setAttribute('onmouseout', 'this.style.backgroundColor = null')
                        newSpan.setAttribute('onclick', '$("#transDialog' + idx + '").dialog()')
                        newSpan.innerHTML = tPhrase
                        
                        var newNode = document.createElement('span')
                        
                        node.replaceChild(newNode, node.childNodes[i])
                        
                    }
                                        
                }
                else {
                 
                    if (node.childNodes[i].innerHTML.toString().indexOf(phrase) != -1) {
                        
                        node.childNodes[i].innerHTML = node.childNodes[i].innerHTML.toString().replace(phrase, newSpan)
                        
                    }
                    
                }
            }*/

function contentMine(chosenWords){
    var stopWords = ["and", "or", "the", "a", "is", "as"]
    var chosenWordsSplit = []
    var wordList = []
    var freqList = []
    var mostFrequent = []
 
    // Preprocessing
    for(i in chosenWords){
        // Remove dashes
        var words = chosenWords[i].toLowerCase().replace(/[-;:]/ig, " ").trim().split(" ")
      
        for(j in words){
            // Remove apostrophes, line breaks
            words[j] = words[j].replace(/['\s]/, "").replace(/[*'\s]/, "").replace(/(\r\n|\n|\r)/gm,"")
            
            if(words[j] != "")
            	chosenWordsSplit.push(words[j])
            
            // If not a stop word, add to word list
            if(words[j] != "" && stopWords.indexOf(words[j]) == -1){
                if(wordList.indexOf(words[j]) == -1){
                    wordList.push(words[j])
                    freqList.push(1)
                }
                else
                    freqList[wordList.indexOf(words[j])]++
            }
        }
    }
    
    var sortable = sortText(wordList, freqList)
 
    // Choose the most frequent words to translate first
    for(var i=0; i < sortable.length * BEGINNER; i++)
    	mostFrequent.push(sortable[i])
     
    var phrases = generatePhrases(chosenWordsSplit, PHRASE_LENGTH)
    
    var sortablePhrases = scorePhrases(phrases, sortable)
    
  //  for(i in sortablePhrases)
        //console.log(sortablePhrases[i][0] + " : " + sortablePhrases[i][1])
    return sortable
}

// Generates a list of the best phrases to begin translating, based on how many frequent words are in the phrase
function scorePhrases(phrases, freqWords){
    var phraseScores = []
    
    for(var i=0; i < phrases.length; i++){
        var score = 0
        for(w in freqWords){
            if(phrases[i].indexOf(freqWords[w][0]) != -1){
                // count up how many times it appears
                var count = countWordInPhrase(phrases[i], freqWords[w][0])
                //console.log(count)
                score = score + (freqWords[w][1] * countWordInPhrase(phrases[i], freqWords[w][0]))
            }
        }
        phraseScores[i] = score
    }
    
    return sortText(phrases, phraseScores)
    
}

// Counts the number of times a word appears in a phrase
function countWordInPhrase(phrase, word){
    brokenPhrase = phrase.split(" ")
    count = 0
    for(b in brokenPhrase)
        if(brokenPhrase[b] == word)
        	count++
   
    return count
}

// Generates phrases by concatenating words together
function generatePhrases(words, phraseSize){
    var phrases = []
    var count = 0
    
    for(var i=0; i < words.length; i = i + phraseSize){
        phrases[count] = ""
        for(var j = 0; j < phraseSize; j++){
            if(i + j < words.length)
            	phrases[count] = phrases[count] + words[i+j] + " "
        }
        count++
    }
    
    return phrases
}

// Sorts word frequency lists by tying words and freq together in one object
function sortText(wordList, freqList){
    var sortable = []
    for(i in wordList)
    	sortable.push([wordList[i], freqList[i]])    
    
    sortable.sort(function(a, b){ return b[1] - a[1] })
   
	return sortable
}