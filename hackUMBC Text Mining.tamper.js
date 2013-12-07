// ==UserScript==
// @name       hackUMBC Text Mining
// @namespace  http://www.umbc.edu
// @version    0.1
// @description  Langauge Plugin
// @include      *pastebin*
// @copyright  2013, Robert Jackson, Christopher Raborg, Zach Hisley
// ==/UserScript==
var BEGINNER = .1
var PHRASE_LENGTH = 10

var regexSplit = new RegExp(/[,\\.\\!\\?]/)
var initPhraseArr = document.getElementsByTagName('html')[0].innerHTML.replace(/(<([^>]+)>)/ig,"").split(regexSplit)

contentMine(initPhraseArr)

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
    
    for(i in sortablePhrases)
        console.log(sortablePhrases[i][0] + " : " + sortablePhrases[i][1])
    return
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
                console.log(count)
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