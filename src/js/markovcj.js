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
        const next = tokens[i + n - 1];
        if (!chain[key]) chain[key] = [];
        chain[key].push(next);
    }

    // Determine start key from user input
    let inputTokens = input.toLowerCase().match(/\b[\w']+\b/g) || [];
    let startKey = inputTokens.slice(- (n - 1)).join(" ");
    if (!chain[startKey]) {
        const keys = Object.keys(chain);
        startKey = keys[Math.floor(Math.random() * keys.length)];
    }

    // Generate sentence deterministically
    const result = startKey.split(" ");
    for (let i = 0; i < 50; i++) {
        const options = chain[startKey];
        if (!options || options.length === 0) break;

        // deterministic "random" choice based on current key
        let index = 0;
        for (let c = 0; c < startKey.length; c++) index += startKey.charCodeAt(c);
        index = index % options.length;

        const nextToken = options[index];
        result.push(nextToken);

        // slide window
        startKey = result.slice(- (n - 1)).join(" ");
    }

    // Join tokens intelligently
    let sentence = result.join(" ")
        .replace(/\s([,.!?])/g, "$1")    // remove space before punctuation
        .replace(/\s+/g, " ")             // normalize spaces
        .trim();

    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}
