// =========================================================
// index.js — AI Chat UI Controller
// =========================================================

// ---------------------- DOM Elements ----------------------
const chatBox = document.getElementById("chatBox");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const fileUpload = document.getElementById("fileUpload");
const modelSelect = document.getElementById("modelSelect");

// ---------------------- Global State ----------------------
let uploadedText = "";   // stores contents of uploaded .txt file
let isTyping = false;    // to show typing animation

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
        const text = await file.text();
        uploadedText = text;
        appendMessage("ai", `✅ Loaded file: ${file.name} (${text.length} chars)`);
    } catch (err) {
        appendMessage("ai", "❌ Error reading file.");
    }
});

// ---------------------- Message Sending Logic ----------------------
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    // append user message
    appendMessage("user", text);
    userInput.value = "";

    // show typing indicator
    showTypingIndicator();

    // determine selected model
    const selectedModel = modelSelect.value;
    let response = "";

    try {
        // Dynamically import model module
        if (selectedModel === "markovcj") {
            const { generateResponse } = await import("./markovcj.js");
            response = await generateResponse(text, uploadedText);
        } 
        else if (selectedModel === "nb") {
            const { generateResponse } = await import("./nb.js");
            response = await generateResponse(text, uploadedText);
        } 
        else if (selectedModel === "kormogov") {
            const { generateResponse } = await import("./kormogov.js");
            response = await generateResponse(text, uploadedText);
        } 
        else {
            response = "⚠️ Unknown model selected.";
        }
    } catch (err) {
        response = "❌ Error loading model.";
        console.error(err);
    }

    // remove typing indicator & append AI response
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
