// ==UserScript==
// @name       hackUMBC Text Mining
// @namespace  http://www.umbc.edu
// @version    0.1
// @description  Langauge Plugin
// @include     *pastebin*
// @copyright  2013, Robert Jackson, Christopher Raborg, Zach Hisley
// ==/UserScript==

var BEGINNER = .1
var PHRASE_LENGTH = 3

var regexSplit = new RegExp(/[,\\.\\!\\?]/)
var initPhraseArr = document.getElementsByTagName('html')[0].innerHTML.replace(/(<([^>]+)>)/ig,"").split(regexSplit)

contentMine(initPhraseArr)

function contentMine(chosenWords){
    // These words fill not have an associated frequency
    var stopWords = [] //["a", "the", "to"]
    
    var chosenWordsSplit = []
    var wordList = []
    var freqList = []
    var mostFrequent = []
 
    // Preprocessing
    for(i in chosenWords){
        // Remove dashes, colons, semicolons, numbers
        var words = chosenWords[i].toLowerCase().replace(/[-;:\d+]/ig, " ").trim().split(" ")
      
        for(j in words){
            // Remove apostrophes, line breaks
            words[j] = words[j].replace(/['\s]/, "").replace(/[*'\s]/, "").replace(/(\r\n|\n|\r)/gm,"")
            
           	// Only add non-empty strings to the new list
            if(words[j] != "")
            	chosenWordsSplit.push(words[j])
            
            // If not a stop word, add to word list. Increase frequency each time a word is seen
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
    
    // Generate a list of sorted words by frequency
    var sortable = tfidf(sortText(wordList, freqList))
    
    // Choose the most frequent words to translate first
    for(var i=0; i < sortable.length * BEGINNER; i++)
    	mostFrequent.push(sortable[i])
     
    // Generate a list of sorted phrases by score (more frequently used words = higher score)    
    var sortablePhrases = scorePhrases(generatePhrases(chosenWordsSplit, PHRASE_LENGTH), sortable)
   
    // need to evaluate the "goodness" of fragments, parsing of nouns/verbs/adjectives?    
    var sortedBigrams = generateBigrams(chosenWordsSplit, sortable, 2)
	
    var ngrams = JSON.parse(localStorage["ngrams"])
    
    for(i in sortedBigrams)
        console.log(sortedBigrams[i][0] + ":" + sortedBigrams[i][1])
    
    return sortablePhrases
}



// Generates a list of the best phrases to begin translating, based on how many frequent words are in the phrase
function scorePhrases(phrases, freqWords){
    var phraseScores = []
    
    for(var i=0; i < phrases.length; i++){
        var score = 0
        for(w in freqWords){
            // count up how many times it appears
            if(phrases[i].indexOf(freqWords[w][0]) != -1)
                score = score + (freqWords[w][1] * countWordInPhrase(phrases[i], freqWords[w][0]))
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
        for(var j = 0; j < phraseSize; j++)
            if(i + j < words.length) 
                phrases[count] = phrases[count] + words[i+j] + " "
        count++
    }
    
    return phrases
}

// Generates ngrams
function generateBigrams(words, wordFreq, n){
    // this needs to be in local storage to improve ngrams algorithm
    if(localStorage["ngrams"] != undefined)
        var ngrams = JSON.parse(localStorage["ngrams"])
    else
        var ngrams = []
        
    var probabilities = []
    
    for(var i = 0; i < words.length; i++){
        var ngram = []
            
        for(var j = 0; j < n; j++)
            if(i + j < words.length)
                ngram.push(words[i + j])
                        
        if(ngrams.indexOf(ngram) == -1){        
            // calculate maximum likelihood of ngram (C-ngram / C-ngram\lastword)
            count = groupedWordFreq(words, ngram)
            probability = count / groupedWordFreq(words, ngram[0])
            probabilities.push([ngram, probability])
            
            ngrams.push([ngram, count])
        }
    }
    
    // store ngrams to local storage after updating
    localStorage["ngrams"] = JSON.stringify(ngrams)
    
    probabilities.sort(function(a, b){ return b[1] - a[1]})
    return probabilities
}

/*
function groupedWordPhrases(words, freqWords, n){
    var phrases = []
    
    for(i in freqWords){
        for(j in words){
            var phrase = []
            //console.log(wordFrequencies[j][0])
            if(words[j] == freqWords[i][0]){
               // look behind to get a word
               if(j - 1 >= 0)
                   phrase.push(words[j-1])
               //look ahead to the next word 
               if(j + 1 < words.length)
               	   phrase.push(words[j+1])
                   
               phrases.push(phrase)
            }
        }
    }   
    return phrases;
}*/

function groupedWordFreq(words, tuple){
    count = 1
    
    for(var i=0; i < words.length - (tuple.length-1); i++){
        var flag = true
        for(var j=0; j < tuple.length; j++)
            if(i+j < words.length)
     			if(words[i+j] != tuple[i+j])
            		flag = false

        if(flag)
            count++
    }
    return count
}

// Sorts word frequency lists by tying words and freq together in one object
function sortText(wordList, freqList){
    var sortable = []
    for(i in wordList)
    	sortable.push([wordList[i], freqList[i]])    
    
    sortable.sort(function(a, b){ return b[1] - a[1] })
  
	return sortable
}

// Calculates tf-idf measure for each phrase to see how common/rare it is
function tfidf(wordFreq){
    for(i in wordFreq){
     	var td = 0.5 + ((0.5 * wordFreq[i][1]) / wordFreq[0][1])   
        var idf = 1 // since we only analyze one document at a time 
        
        wordFreq[i][1] = td * idf
    }
    
    return wordFreq
    
}