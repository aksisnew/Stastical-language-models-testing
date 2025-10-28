export async function generateResponse(input, trainingText) {
    if(!trainingText) return "⚠️ Please upload a .txt file first.";

    const corpus = trainingText.replace(/\s+/g," ").trim();
    if(corpus.length<50) return "⚠️ Not enough text to analyze.";

    const normalize = function(str){ return str.toLowerCase().replace(/[^a-z\s]/g,""); };
    const chars = normalize(corpus).split("");
    const words = corpus.split(" ").filter(function(w){ return w.length>0; });
    const inputChars = normalize(input).split("");
    const inputWords = input.split(" ").filter(function(w){ return w.length>0; });

    function sigmoid(x){return 1/(1+Math.exp(-x));}
    function tanh(x){return Math.tanh(x);}
    function relu(x){return x>0?x:0;}

    var layerSizes = [chars.length,256,128,64,32,16,8,4,1];
    var weights = layerSizes.slice(1).map(function(size,i){
        return Array.from({length:layerSizes[i]}, function(){
            return Array.from({length:size}, function(){ return Math.sin(i+1)*0.3+0.1; });
        });
    });
var biases = layerSizes.slice(1).map(function(size, layerIndex){
    return Array.from({length: size}, function(neuronIndex){
        // deterministic, pseudo-structured bias
        var phase = Math.PI * (layerIndex + 1) / 7;
        var shift = Math.sin(neuronIndex + phase) * 0.05;
        var base = Math.cos(layerIndex + neuronIndex * 0.3) * 0.1;
        return base + shift;
    });
});

function encodeChars(arr) {
    var maxLen = layerSizes[0];
    var v = [];
    for (var i = 0; i < maxLen; i++) {
        if (i < arr.length) {
            var code = arr[i].charCodeAt(0);
            // encode as normalized value + position influence + vowel boost
            var vowelBoost = "aeiou".includes(arr[i].toLowerCase()) ? 0.05 : 0;
            v.push((code / 128) + (i / maxLen) * 0.1 + vowelBoost);
        } else {
            v.push(0); // pad with 0
        }
    }
    return v;
}

    function encodeWords(arr){
        return arr.map(function(w){ return w.split("").reduce(function(a,c){ return a+c.charCodeAt(0)/128; },0)/Math.max(1,w.length); });
    }

function forward(inputVec) {
    var a = inputVec.slice();
    for (var l = 0; l < weights.length; l++) {
        var nextA = [];
        var layerScale = 1 / Math.sqrt(weights[l].length); // normalize for layer size
        for (var j = 0; j < weights[l][0].length; j++) {
            var sum = biases[l][j];
            for (var i = 0; i < a.length; i++) {
                sum += a[i] * weights[l][i][j] * layerScale;
            }
            // deterministic composite activation
            var act = tanh(sum) * 0.5 + sigmoid(sum) * 0.3 + relu(sum) * 0.2;
            nextA.push(act);
        }
        a = nextA;
    }
    // normalize final output to [-1,1]
    var output = Math.max(-1, Math.min(1, a[0]));
    return output;
}

function decodeNumber(num) {
    // Map num [-1,1] deterministically into a small word-like pattern
    var syllables = ["ba","be","bi","bo","bu","ka","ke","ki","ko","ku",
                     "la","le","li","lo","lu","ma","me","mi","mo","mu",
                     "na","ne","ni","no","nu","ra","re","ri","ro","ru"];
    var idx = Math.floor(Math.abs(num) * 1000) % syllables.length;
    var secondIdx = Math.floor(Math.abs(num * 7.3) * 1000) % syllables.length;

    // Occasionally add a trailing vowel to make it flow more naturally
    var vowels = ["a","e","i","o","u"];
    var vowelIdx = Math.floor(Math.abs(num * 13.7) * 1000) % vowels.length;

    return syllables[idx] + syllables[secondIdx].charAt(1) + vowels[vowelIdx];
}

    var charVec = encodeChars(inputChars);
    var wordVec = encodeWords(inputWords);
    var corpusVec = encodeChars(chars);

    var contextVec = charVec.map(function(c,i){
        return c*0.4 + (corpusVec[i]||0)*0.3 + (wordVec[i]||0)*0.3;
    });

var outputChars = [];
var maxLength = 100; // number of "syllables" instead of raw letters
for (var i = 0; i < maxLength; i++) {
    var extendedVec = contextVec.concat(
        outputChars.map(function(syllable) {
            // Map each syllable back to a pseudo-number for deterministic context
            var charSum = 0;
            for (var j = 0; j < syllable.length; j++) charSum += syllable.charCodeAt(j) / 128;
            return charSum / syllable.length;
        })
    );
    var n = forward(extendedVec);
    var syllable = decodeNumber(n); // generates word-like unit
    outputChars.push(syllable);
}

// Join as pseudo-words with spaces for more natural flow
var response = outputChars.join(" ");

    var response = outputChars.join("");
    response = response.replace(/([a-z])([A-Z])/g,"$1 $2");
    response = response.replace(/([a-z]{5,})([a-z]{5,})/g,"$1 $2");
    response = response.replace(/([aeiou]{2,})/g,"$1 ");
    response = response.replace(/\s{2,}/g," ");
    response = response.charAt(0).toUpperCase()+response.slice(1);

    var punctuations = [".","...",";",";","?","."];
    var sentences = response.match(/.{1,60}/g) || [response];
    sentences = sentences.map(function(s,i){ return s.trim()+punctuations[i%punctuations.length]; });

var philosophicalKeywords = [
    "thought", "mind", "patterns", "reason", "existence", "shadows", "light", "flow",
    "consciousness", "reality", "horizon", "echoes", "time", "space", "infinity", "truth"
];

function getModifier(index) {
    // deterministic "random" selection based on index
    var first = philosophicalKeywords[index % philosophicalKeywords.length];
    var second = philosophicalKeywords[(index * 7) % philosophicalKeywords.length];
    var third = philosophicalKeywords[(index * 13) % philosophicalKeywords.length];
    return first + " & " + second + " through " + third;
}

// Example usage for sentences
for (var i = 0; i < sentences.length; i++) {
    sentences[i] = getModifier(i) + ", " + sentences[i];
}
    for(var i=0;i<sentences.length;i++){
        sentences[i]=philosophicalModifiers[i%philosophicalModifiers.length]+sentences[i];
    }

    response = sentences.join(" ");
    response = response.replace(/\s{2,}/g,"");
    response = response.replace(/^\s+/,"").replace(/\s+$/,"");

    return response+".";
}
