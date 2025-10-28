// /js/nb.js

// helper activations
function tanh(x){ return Math.tanh(x); }
function sigmoid(x){ return 1/(1+Math.exp(-x)); }
function relu(x){ return Math.max(0,x); }

var layerSizes = [20, 16, 8, 1]; // input, hidden1, hidden2, output

// deterministic biases and weights
var biases = layerSizes.slice(1).map((size, layerIndex) =>
    Array.from({length: size}, (v, j) => Math.cos(layerIndex+j)*0.1 + Math.sin(j*0.7)*0.05)
);

var weights = layerSizes.slice(1).map((size, layerIndex) =>
    Array.from({length: layerSizes[layerIndex]}, () =>
        Array.from({length: size}, (v,j) => Math.sin(layerIndex*j+0.3)*0.1)
    )
);

function encodeSentence(sentence, maxLen=layerSizes[0]) {
    let words = sentence.toLowerCase().split(/\s+/).join("").slice(0,maxLen);
    let vec = [];
    for(let i=0;i<maxLen;i++){
        if(i<words.length){
            let c = words[i];
            let vowelBoost = "aeiou".includes(c)?0.05:0;
            vec.push(c.charCodeAt(0)/128 + vowelBoost + i/maxLen*0.1);
        } else vec.push(0);
    }
    return vec;
}

function forward(inputVec){
    var a = inputVec.slice();
    for(var l=0; l<weights.length; l++){
        var nextA=[];
        var layerScale=1/Math.sqrt(weights[l].length);
        for(var j=0;j<weights[l][0].length;j++){
            var sum=biases[l][j];
            for(var i=0;i<a.length;i++) sum+=a[i]*weights[l][i][j]*layerScale;
            nextA.push(tanh(sum)*0.5+sigmoid(sum)*0.3+relu(sum)*0.2);
        }
        a=nextA;
    }
    return Math.max(0,Math.min(1,a[0]));
}

export async function generateResponse(input, trainingText){
    if(!trainingText) return "⚠️ Please upload a .txt file first.";

    const sentences = trainingText.split(/(?<=[.?!])\s+/);
    const inputVec = encodeSentence(input);

    let scored = sentences.map(s=>{
        let sentVec = encodeSentence(s);
        let combined = inputVec.concat(sentVec);
        return { sentence: s.trim(), score: forward(combined) };
    });

    scored.sort((a,b)=>b.score-a.score);

    return scored[0].score>0 ? scored[0].sentence : "🤖 I couldn't find anything relevant.";
}
