// /js/markovcj.js

export async function generateResponse(input, trainingText) {
    if (!trainingText) return "⚠️ Please upload a .txt file first.";

    // Tokenize text: words and punctuation as separate tokens
    const tokens = trainingText.match(/\b[\w']+\b|[.!?]/g);
    if (!tokens || tokens.length < 10) return "⚠️ Not enough text to train a model.";

    const n = 5; // 5-gram
    const chain = {};

    // Build n-gram chain
for (let i = 0; i <= tokens.length - n; i++) {
    const key = tokens.slice(i, i + n - 1).join(" ").toLowerCase();
    const next = tokens[i + n - 1].toLowerCase();

    if (!chain[key]) chain[key] = {};

    // count frequency of next token
    if (!chain[key][next]) chain[key][next] = 0;
    chain[key][next] += 1;

    // optionally boost punctuation deterministically
    if (/[.!?]/.test(next)) chain[key][next] += 0.5;
}

    // Determine start key from user input
let inputTokens = input.toLowerCase().match(/\b[\w']+\b/g) || [];
let startKey = inputTokens.slice(- (n - 1)).join(" ");

// if exact match not found, find closest key deterministically
if (!chain[startKey]) {
    const keys = Object.keys(chain);
    let bestMatch = keys[0];
    let bestScore = -1;

    for (const key of keys) {
        let score = 0;
        const keyWords = key.split(" ");
        for (let i = 0; i < Math.min(inputTokens.length, keyWords.length); i++) {
            if (inputTokens[inputTokens.length - keyWords.length + i] === keyWords[i]) score += 1;
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = key;
        }
    }

    startKey = bestMatch;
}

    // Generate sentence deterministically
const result = startKey.split(" ");

for (let i = 0; i < 50; i++) {
    const optionsObj = chain[startKey];
    if (!optionsObj) break;

    // choose next token deterministically by weighted frequency
    let total = 0;
    for (const count of Object.values(optionsObj)) total += count;

    let threshold = 0;
    let index = 0;
    let keys = Object.keys(optionsObj).sort(); // sort for determinism
    let sum = 0;

    // deterministic "random" seed from current key
    let seed = 0;
    for (let c = 0; c < startKey.length; c++) seed += startKey.charCodeAt(c);

    for (let j = 0; j < keys.length; j++) {
        sum += optionsObj[keys[j]];
        if (sum / total >= (seed % 100) / 100) {
            index = j;
            break;
        }
    }

    const nextToken = keys[index];
    result.push(nextToken);

    // slide window for next iteration
    startKey = result.slice(- (n - 1)).join(" ");
}
    // Join tokens intelligently
    let sentence = result.join(" ")
        .replace(/\s([,.!?])/g, "$1")    // remove space before punctuation
        .replace(/\s+/g, " ")             // normalize spaces
        .trim();

    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}
