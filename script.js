const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.getElementById("prompt-form");
const promptInput = document.getElementById("prompt-input");

const API_KEY = "AIzaSyAqYdK6EHAw5XCxGSVYAVgwnwkyxJSVP_U";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
const chatHistory = [];

function createMsgElement(content, sender) {
    const div = document.createElement("div");
    div.className = `message ${sender}-message`;
    div.innerHTML = `<p>${content}</p>`;
    return div;
}

async function generateResponse() {
    const userMessage = promptInput.value.trim();// la fonction trim permet de netooyer le input saisi  
    if (!userMessage) return; // si le input est vide alors rien ne se passe

    // Ajout message utilisateur
    const userMsg = createMsgElement(userMessage, "user");
    chatsContainer.appendChild(userMsg);// utiliser pour ajouter dynamiquement les messages
    
    // Message de chargement
    const loadingMsg = createMsgElement("Juste un instant...", "bot");
    loadingMsg.classList.add("loading-message");
    chatsContainer.appendChild(loadingMsg);
    
    // Réinitialisation input
    promptInput.value = "";
    chatsContainer.scrollTop = chatsContainer.scrollHeight;// elle permet de scroller automatiquement

    try {
        // Vérification type de message
        if (isGreeting(userMessage)) {
            loadingMsg.remove();
            const response = handleGreeting();
            const botMsg = createMsgElement(response, "bot");
            chatsContainer.appendChild(botMsg);
            return;
        }
        // fonction qui permet de renvoyer un message d'erreur si la input ne contient pas de mot cle 
        if (!isFitnessRelated(userMessage)) {
            loadingMsg.remove();
            const botMsg = createMsgElement("Je ne réponds qu'aux questions sport/fitness", "bot");// permet de renvoyer un message d'erreur si la question ne com^porte pas de mot cle
            chatsContainer.appendChild(botMsg);
            return;
        }

        // Appel API
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });
        // permet de netoyer la reponse obtenir
        const data = await response.json();
        const botResponse = data.candidates[0].content.parts[0].text
            .replace(/\*\*/g, '')
            .trim();
        // permet de supprimer le message (juste quelques instant...)
        loadingMsg.remove();
        const botMsg = createMsgElement(botResponse, "bot");
        chatsContainer.appendChild(botMsg);
        chatsContainer.scrollTop = chatsContainer.scrollHeight;
        // cette section permet de renvoyer un message d'erreur en cas de probleme avec l'api
    } catch (error) {
        loadingMsg.remove();
        const errorMsg = createMsgElement("Erreur lors de la réponse", "bot");
        chatsContainer.appendChild(errorMsg);
    }
}
// fonction qui permet de repondre aux salutations
function isGreeting(message) {
    const greetings = ["bonjour", "salut", "hello", "coucou"];
    return greetings.some(g => message.toLowerCase().includes(g));
}
// fonction qui contient les reponsre
function handleGreeting() {
    const responses = [
        "Bonjour ! Prêt à atteindre vos objectifs sportifs ?",
        "Salut ! Besoin de conseils fitness ?",
        "Hello ! Je suis là pour vos questions sport/nutrition"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}
// fonction qui stock les mots cle
function isFitnessRelated(message) {
    const keywords = ["sport", "fitness", "nutrition", "musculation", "cardio", "poids", "endurance"];
    return keywords.some(kw => message.toLowerCase().includes(kw));
}

// Gestion des événements
promptForm.addEventListener("submit", (e) => {
    e.preventDefault();
    generateResponse();
});
// permet de repondre aux question suggerer 
document.querySelectorAll(".suggestion-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        promptInput.value = btn.textContent;
        generateResponse();
    });
});