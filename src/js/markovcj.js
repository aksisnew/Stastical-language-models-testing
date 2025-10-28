// /js/markovcj.js

export async function generateResponse(input, trainingText) {
    if (!trainingText) return "⚠️ Please upload a .txt file first.";

    const words = trainingText.split(/\s+/);
    if (words.length < 3) return "⚠️ Not enough text to train a model.";

    // Build Markov chain
    const chain = {};
    for (let i = 0; i < words.length - 1; i++) {
        const word = words[i];
        const next = words[i + 1];
        if (!chain[word]) chain[word] = [];
        chain[word].push(next);
    }

    // Pick a start word — based on user input or random
    let currentWord = input.split(/\s+/).pop();
    if (!chain[currentWord]) {
        const keys = Object.keys(chain);
        currentWord = keys[Math.floor(Math.random() * keys.length)];
    }

    // Generate a short sentence
    let result = [currentWord];
    for (let i = 0; i < 30; i++) {
        const options = chain[currentWord];
        if (!options || options.length === 0) break;
        currentWord = options[Math.floor(Math.random() * options.length)];
        result.push(currentWord);
    }

    return result.join(" ") + ".";
}
