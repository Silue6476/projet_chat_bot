// Sélection des éléments DOM
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.getElementById("prompt-form");
const promptInput = document.getElementById("prompt-input");

// Clé API et URL
const API_KEY = "AIzaSyAqYdK6EHAw5XCxGSVYAVgwnwkyxJSVP_U";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
const chatHistory = [];

// Fonction pour créer un élément message
function createMsgElement(content, ...classes) {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);

    const msgText = document.createElement("p");
    msgText.classList.add("message-text");
    msgText.textContent = content;

    div.appendChild(msgText);
    return div;
}

// Fonction pour générer une réponse depuis l'API
async function generateResponse(botMsgDiv) {
    const textElement = botMsgDiv.querySelector(".message-text");

    // Vérifier si c'est une salutation
    if (isGreeting(userMessage)) {
        textElement.textContent = handleGreeting(userMessage);
        return;
    }

    // Vérifier si la question est liée aux Sénoufo
    if (!isSenoufoRelated(userMessage)) {
        textElement.textContent = "Désolé, je ne peux répondre qu'aux questions concernant la culture, l'histoire, les traditions ou la langue des Sénoufo en Côte d'Ivoire.";
        return;
    }

    // Ajouter une instruction spécifique pour restreindre les réponses aux Sénoufo
    chatHistory.push({
        role: "user",
        parts: [{ text: `Réponds uniquement en parlant de la culture, l'histoire, les traditions ou la langue des Sénoufo en Côte d'Ivoire : ${userMessage}` }]
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        if (!response.ok) throw new Error("Erreur lors de la communication avec l'API.");

        const data = await response.json();
        let responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();

        textElement.textContent = responseText;

        // Ajouter la réponse du bot à l'historique
        chatHistory.push({
            role: "model",
            parts: [{ text: responseText }]
        });
    } catch (error) {
        console.error(error);
        textElement.textContent = "Désolé, je ne peux pas répondre à cela.";
    }
}

// Fonction pour vérifier si une question est liée aux Sénoufo
function isSenoufoRelated(message) {
    const keywords = [
        "sénoufo", "côte d'ivoire", "culture", "tradition", "langue", "masques", 
        "histoire", "artisanat", "religion", "communauté", "village", "rituels", "senoufo","nordisse", "peuples", "savane", "gbon"
    ];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
}

// Fonction pour détecter les salutations
function isGreeting(message) {
    const greetings = ["salut", "bonjour", "coucou", "hello", "bonsoir", "hi" ,"Hi",];
    return greetings.some(greeting => message.toLowerCase().includes(greeting));
}

// Fonction pour gérer les salutations
function handleGreeting(message) {
    const responses = [
        "Bonjour ! Comment puis-je vous aider avec les Sénoufo aujourd'hui ?",
        "Salut ! Je suis ici pour discuter de la culture Sénoufo. Que souhaitez-vous savoir ?",
        "Hello ! Prêt à explorer les traditions fascinantes des Sénoufo ?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Gestion de la soumission du formulaire
promptForm.addEventListener("submit", (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();

    if (!userMessage) return;

    // Créer le message utilisateur
    const userMsgDiv = createMsgElement(userMessage, "user-message");
    chatsContainer.appendChild(userMsgDiv);

    // Réinitialiser l'input
    promptInput.value = "";

    // Afficher un message de chargement
    const botMsgDiv = createMsgElement("Juste un instant...", "bot-message", "loading-message");
    chatsContainer.appendChild(botMsgDiv);

    // Faire défiler vers le bas
    chatsContainer.scrollTop = chatsContainer.scrollHeight;

    // Générer la réponse
    generateResponse(botMsgDiv).then(() => {
        // Enlever la classe de chargement après la génération
        botMsgDiv.classList.remove("loading-message");
        // Faire défiler vers le bas
        chatsContainer.scrollTop = chatsContainer.scrollHeight;
    });
});