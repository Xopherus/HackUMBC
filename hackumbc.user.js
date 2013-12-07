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
// @run-at			document-end
// ==/UserScript==

var GAIN = 50
var LOSS = 100

if (localStorage.progress == undefined) {
 
    localStorage.progress = 75
    
}

var DOC_SAVE

var BEGINNER = .1
var PHRASE_LENGTH = 10
var NUM_SUBS = 25
var outLang = "es"
var inLang = "en"
var prog = Math.min(parseInt(localStorage.progress) + GAIN, 1000)
var rev = false
console.log(prog)
var link = document.createElement('link')
var script1 = document.createElement('script')
var script2 = document.createElement('script')

link.rel = 'stylesheet'
link.href = 'http://userpages.umbc.edu/~craborg1/hackUMBC/css/vader/jquery-ui-1.10.3.custom.css'
link.type = 'text/css'

script1.src = 'http://code.jquery.com/jquery-1.9.1.js'
script2.src = 'http://code.jquery.com/ui/1.10.3/jquery-ui.js'

document.head.insertBefore(link, null)
document.head.insertBefore(script1, null)
document.head.insertBefore(script2, null)

var regexSplit = new RegExp(/[,\\.\\!\\?]/)

var initPhraseArr = document.getElementsByTagName('body')[0].innerHTML.replace(/(<([^>]+)>)/ig, "").split(regexSplit)
var sortedArr = contentMine(initPhraseArr)
var topPhraseArr = new Array()
var finalPhraseArr = new Array()
var translationArr = new Array()

var transDialogHolder = document.createElement('div')
transDialogHolder.style.visibility = 'hidden'
transDialogHolder.style.height = 0
transDialogHolder.id = 'transDialogHolder'
document.body.insertBefore(transDialogHolder, null)

addSpans(document.body)
addToolBar()

DOC_SAVE = $('body').clone()[0]

function addSpans(node) {
 
   if (node.nodeType == 3) {
        
		if (!/^\s*$/.test(node.data)) {
            
            var newNode = document.createElement('span')
            newNode.className = "innerSpan"
            newNode.innerHTML = node.data
            
            node.parentNode.replaceChild(newNode, node)
            
        }
       
   }
    else if (node.hasChildNodes()) {
        		for (var i = 0, len = node.childNodes.length; i < len; ++i) {
			addSpans(node.childNodes[i]);
		}
    }             
        
}

function addToolBar() {
 
    var toolbar = document.createElement('div')
    toolbar.id = "globalToolbar"
    toolbar.style.position = 'fixed'
    toolbar.style.top = 0
    toolbar.style.left = 0
    toolbar.style.height = 30
    toolbar.style.width = '100%'
    toolbar.style.backgroundColor = 'black'
    toolbar.style.color = 'white'
    toolbar.style.textAlign = "center"
	toolbar.style.verticalAlign="middle"
    toolbar.innerHTML = 'Input Langauge: <select id="selInLang" tabindex=0><option SELECTED value=EN>English</option><option value=es>Spanish</option><option value=ru>Russian</option><option value=separator disabled>&#8212;</option><option value=af>Afrikaans</option><option value=sq>Albanian</option><option value=ar>Arabic</option><option value=hy>Armenian</option><option value=az>Azerbaijani</option><option value=eu>Basque</option><option value=be>Belarusian</option><option value=bn>Bengali</option><option value=bs>Bosnian</option><option value=bg>Bulgarian</option><option value=ca>Catalan</option><option value=ceb>Cebuano</option><option value=zh-CN>Chinese (Simplified)</option><option value=zh-TW>Chinese (Traditional)</option><option value=hr>Croatian</option><option value=cs>Czech</option><option value=da>Danish</option><option value=nl>Dutch</option><option value=en>English</option><option value=eo>Esperanto</option><option value=et>Estonian</option><option value=tl>Filipino</option><option value=fi>Finnish</option><option value=fr>French</option><option value=gl>Galician</option><option value=ka>Georgian</option><option value=de>German</option><option value=el>Greek</option><option value=gu>Gujarati</option><option value=ht>Haitian Creole</option><option value=iw>Hebrew</option><option value=hi>Hindi</option><option value=hmn>Hmong</option><option value=hu>Hungarian</option><option value=is>Icelandic</option><option value=id>Indonesian</option><option value=ga>Irish</option><option value=it>Italian</option><option value=ja>Japanese</option><option value=jw>Javanese</option><option value=kn>Kannada</option><option value=km>Khmer</option><option value=ko>Korean</option><option value=lo>Lao</option><option value=la>Latin</option><option value=lv>Latvian</option><option value=lt>Lithuanian</option><option value=mk>Macedonian</option><option value=ms>Malay</option><option value=mt>Maltese</option><option value=mr>Marathi</option><option value=no>Norwegian</option><option value=fa>Persian</option><option value=pl>Polish</option><option value=pt>Portuguese</option><option value=ro>Romanian</option><option value=ru>Russian</option><option value=sr>Serbian</option><option value=sk>Slovak</option><option value=sl>Slovenian</option><option value=es>Spanish</option><option value=sw>Swahili</option><option value=sv>Swedish</option><option value=ta>Tamil</option><option value=te>Telugu</option><option value=th>Thai</option><option value=tr>Turkish</option><option value=uk>Ukrainian</option><option value=ur>Urdu</option><option value=vi>Vietnamese</option><option value=cy>Welsh</option><option value=yi>Yiddish</option></select>'
    toolbar.innerHTML = toolbar.innerHTML + ' Output Langauge: <select id="selOutLang" tabindex=0><option SELECTED value=ES>Spanish</option><option value=en>English</option><option value=ru>Russian</option><option value=separator disabled>&#8212;</option><option value=af>Afrikaans</option><option value=sq>Albanian</option><option value=ar>Arabic</option><option value=hy>Armenian</option><option value=az>Azerbaijani</option><option value=eu>Basque</option><option value=be>Belarusian</option><option value=bn>Bengali</option><option value=bs>Bosnian</option><option value=bg>Bulgarian</option><option value=ca>Catalan</option><option value=ceb>Cebuano</option><option value=zh-CN>Chinese (Simplified)</option><option value=zh-TW>Chinese (Traditional)</option><option value=hr>Croatian</option><option value=cs>Czech</option><option value=da>Danish</option><option value=nl>Dutch</option><option value=en>English</option><option value=eo>Esperanto</option><option value=et>Estonian</option><option value=tl>Filipino</option><option value=fi>Finnish</option><option value=fr>French</option><option value=gl>Galician</option><option value=ka>Georgian</option><option value=de>German</option><option value=el>Greek</option><option value=gu>Gujarati</option><option value=ht>Haitian Creole</option><option value=iw>Hebrew</option><option value=hi>Hindi</option><option value=hmn>Hmong</option><option value=hu>Hungarian</option><option value=is>Icelandic</option><option value=id>Indonesian</option><option value=ga>Irish</option><option value=it>Italian</option><option value=ja>Japanese</option><option value=jw>Javanese</option><option value=kn>Kannada</option><option value=km>Khmer</option><option value=ko>Korean</option><option value=lo>Lao</option><option value=la>Latin</option><option value=lv>Latvian</option><option value=lt>Lithuanian</option><option value=mk>Macedonian</option><option value=ms>Malay</option><option value=mt>Maltese</option><option value=mr>Marathi</option><option value=no>Norwegian</option><option value=fa>Persian</option><option value=pl>Polish</option><option value=pt>Portuguese</option><option value=ro>Romanian</option><option value=ru>Russian</option><option value=sr>Serbian</option><option value=sk>Slovak</option><option value=sl>Slovenian</option><option value=es>Spanish</option><option value=sw>Swahili</option><option value=sv>Swedish</option><option value=ta>Tamil</option><option value=te>Telugu</option><option value=th>Thai</option><option value=tr>Turkish</option><option value=uk>Ukrainian</option><option value=ur>Urdu</option><option value=vi>Vietnamese</option><option value=cy>Welsh</option><option value=yi>Yiddish</option></select>'
    toolbar.innerHTML = toolbar.innerHTML + ' Progression: <input id="prog" type="range" min="1" value="' + prog + '" max="1000">'
    toolbar.innerHTML = toolbar.innerHTML + ' <input id="revButton" type="checkbox">Reverse</input>'
    toolbar.innerHTML = toolbar.innerHTML + '<button id="goButton" type="button">Go!</button>'
    
    document.body.style.marginTop = 30
    document.body.insertBefore(toolbar, null)    
    
    document.getElementById("goButton").addEventListener("click", startLookup, false);
    
}

function startLookup() {
        
    inLang = document.getElementById('selInLang').value
    outLang = document.getElementById('selOutLang').value
    prog = document.getElementById('prog').value
    rev = document.getElementById('revButton').checked
    
    document.body = DOC_SAVE

    document.getElementById('selInLang').value = inLang
    document.getElementById('selOutLang').value = outLang
    document.getElementById('prog').value = prog
    document.getElementById('revButton').checked = rev
    
    DOC_SAVE = $('body').clone()[0]
    localStorage.progress = prog
        
    var numSwaps = Math.ceil(((prog / 1000) * (prog / 1000)) * sortedArr.length)
    
    if (rev) {
     
        numSwaps = Math.ceil((1-((prog / 1000) * (prog / 1000))) * sortedArr.length)
        
    }
        
    topPhraseArr = new Array(numSwaps)
	finalPhraseArr = new Array(numSwaps)
	translationArr = new Array(numSwaps)
    
    for (var i = 0; i < numSwaps; i++) {
 
   		topPhraseArr[i] = sortedArr[i][0]
  	 	finalPhraseArr[i] = encodeURI(sortedArr[i][0])
    
	}
    
    if (rev) {
        
     for (var i = 0; i < numSwaps; i++) {
 
   		topPhraseArr[i] = sortedArr[sortedArr.length - 1 - i][0]
  	 	finalPhraseArr[i] = encodeURI(sortedArr[sortedArr.length - 1 - i][0])
    
	}
        
    }
            
    lookupPhrases(finalPhraseArr, translationArr)
    
    document.getElementById("goButton").addEventListener("click", startLookup, false);
        
}


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
                    
                    modifyPage(finalPhraseArr[i], tArr[i], i, json)

                }

            })(arr, tArr, i)

        })

    }

}


function modifyPage(phrase, tPhrase, i, json) {

    var diagElem = document.createElement('div')
    diagElem.id = 'transDialog' + i
    diagElem.title = 'Translation Information'
    diagElem.style.height = 0       
    diagElem.innerHTML = "Phrase: " + phrase + "<hr>Translation: " + tPhrase + "<hr>Alternative Translations:"
    
    for (var j = 0; j < json.dict.length; j++) {
     
        diagElem.innerHTML = diagElem.innerHTML + "<br>Interpretation: " + json.dict[j].base_form + " (" + json.dict[j].pos + ")<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + json.dict[j].terms
        
    }
        
    document.getElementById('transDialogHolder').insertBefore(diagElem, null)

	replaceTextNodes(document.getElementsByTagName('body')[0], phrase, tPhrase, i)
    
}

function replaceTextNodes(node, phrase, tPhrase, idx) {
    
    var newSpan = '<span class="transInsert' + idx + '" style="text-decoration: underline" onmouseover="this.style.backgroundColor=&quot;yellow&quot;\" onmouseout="this.style.backgroundColor=null" onclick="$(&quot;#transDialog' + idx + '&quot;).dialog({'
    newSpan = newSpan + 'modal: true, buttons: {' 
    newSpan = newSpan + '&quot;I did not know this word&quot;: function() {'
   newSpan = newSpan + 'document.getElementById(\'prog\').value=&quot;' + (prog - LOSS) + '&quot;; localStorage.progress=' + (prog - LOSS) + '; Array.prototype.slice.call(document.getElementsByClassName(&quot;transInsert' + idx + '&quot;), 0).forEach(function (i) { i.style.color = \'red\'; i.innerHTML=\'' + phrase + '\'; });'
   newSpan = newSpan + '$(this).dialog(&quot;close&quot;) },'
    newSpan = newSpan + 'Cancel: function() { $(this).dialog(&quot;close&quot;) }'
    newSpan = newSpan + '}'
    newSpan = newSpan + '})">' + tPhrase + '</span>'

    Array.prototype.slice.call(document.getElementsByClassName("innerSpan"),0).forEach(function (i) {
      
        i.innerHTML = i.innerHTML.replace(new RegExp("(\\b" + phrase + "\\b)(?![^<]*>|[^<>]*</)", "ig"), newSpan)
        
    })

}

function contentMine(chosenWords){
    var stopWords = []//["and", "or", "the", "a", "is", "as"]
    var chosenWordsSplit = []
    var wordList = []
    var freqList = []
    var mostFrequent = []
 
    // Preprocessing
    for(i in chosenWords){
        // Remove dashes
        var words = chosenWords[i].toLowerCase().replace(/[-;:\d+]/ig, " ").trim().split(" ")
      
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
    
    
    for (var ii = 0; ii + 5 < sortable.length; ii += 5) {
     
        for (var jj = ii; jj < ii + 5; jj++) {
         
            var rand = Math.floor(Math.random() * 5 + ii);
            var temp = sortable[rand];
            sortable[rand]=sortable[jj];
            sortable[jj]=temp;
            
        }
        
    }
    

    
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