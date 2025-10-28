// /js/nb.js

export async function generateResponse(input, trainingText) {
    if (!trainingText) return "⚠️ Please upload a .txt file first.";

    const sentences = trainingText.split(/(?<=[.?!])\s+/);
    const keywords = input.toLowerCase().split(/\s+/);

    let scored = sentences.map((s) => {
        let score = 0;
        for (const k of keywords) {
            if (s.toLowerCase().includes(k)) score++;
        }
        return { sentence: s.trim(), score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored.find((s) => s.score > 0);

    return best ? best.sentence : "🤖 I couldn't find anything relevant.";
}
