// /js/kormogov.js

export async function generateResponse(input, trainingText) {
    if (!trainingText) return "⚠️ Please upload a .txt file first.";

    const words = trainingText.split(/\s+/);
    if (words.length < 10) return "⚠️ Not enough text to analyze.";

    // Random shuffle (simulating information entropy)
    const shuffled = [...words].sort(() => Math.random() - 0.5);

    // Find a word close to user input
    const inputWord = input.split(/\s+/).pop().toLowerCase();
    const matches = shuffled.filter(w => w.toLowerCase().startsWith(inputWord[0]));
    const start = matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : shuffled[0];

    // Build short pseudo-random response
    const idx = shuffled.indexOf(start);
    const result = shuffled.slice(idx, idx + 20).join(" ");

    return result.charAt(0).toUpperCase() + result.slice(1) + ".";
}
