// =========================================================
// index.js — AI Chat UI Controller (Updated, CORS Safe)
// =========================================================

// ---------------------- DOM Elements ----------------------
const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const fileUpload = document.getElementById("fileUpload");
const modelSelect = document.getElementById("modelSelect");

// ---------------------- Global State ----------------------
let uploadedText = "";   // contents of uploaded .txt file
let isTyping = false;    // show typing animation

// ---------------------- Utility: Append Message ----------------------
function appendMessage(sender, text) {
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble", sender === "user" ? "user-bubble" : "ai-bubble");
    bubble.textContent = text;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ---------------------- Utility: Typing Indicator ----------------------
function showTypingIndicator() {
    if (isTyping) return;
    isTyping = true;
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble", "ai-bubble", "typing-bubble");
    bubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    const typingBubble = document.querySelector(".typing-bubble");
    if (typingBubble) typingBubble.remove();
    isTyping = false;
}

// ---------------------- File Upload Handler ----------------------
fileUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith(".txt")) {
        appendMessage("ai", "⚠️ Please upload a valid .txt file.");
        return;
    }

    try {
        uploadedText = await file.text();
        appendMessage("ai", `✅ Loaded file: ${file.name} (${uploadedText.length} chars)`);
    } catch (err) {
        appendMessage("ai", "❌ Error reading file.");
    }
});

// ---------------------- Dynamic Module Loader ----------------------
async function loadModelModule(modelName) {
    try {
        // cache-bust trick to avoid local file import issues
        return await import(`./${modelName}.js?cachebust=${Date.now()}`);
    } catch (err) {
        console.error("Module load error:", err);
        throw new Error("Failed to load model module");
    }
}

// ---------------------- Message Sending Logic ----------------------
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage("user", text);
    userInput.value = "";
    showTypingIndicator();

    const selectedModel = modelSelect.value;
    let response = "";

    try {
        let module;
        if (selectedModel === "markovcj") module = await loadModelModule("markovcj");
        else if (selectedModel === "nb") module = await loadModelModule("nb");
        else if (selectedModel === "kormogov") module = await loadModelModule("kormogov");
        else throw new Error("Unknown model selected");

        response = await module.generateResponse(text, uploadedText);
    } catch (err) {
        console.error(err);
        response = "❌ Error generating response.";
    }

    removeTypingIndicator();
    appendMessage("ai", response);
}

// ---------------------- Event Listeners ----------------------
sendBtn.addEventListener("click", handleSend);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
});

// ---------------------- Welcome Message ----------------------
appendMessage("ai", "👋 Welcome! Upload a .txt file, choose a model, and start chatting.");
