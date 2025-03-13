// Sélectionne les éléments HTML nécessaires pour interagir avec l'interface
const chatsContainer = document.querySelector(".chats-container");
// Sélectionne le conteneur où les messages seront affichés dynamiquement
const promptForm = document.getElementById("prompt-form");
// Sélectionne le formulaire de saisie (formulaire pour envoyer des questions)
const promptInput = document.getElementById("prompt-input");
// Sélectionne le champ de texte où l'utilisateur tape sa question

// Définit la clé API Google Gemini (à remplacer par votre propre clé)
const API_KEY = "AIzaSyAqYdK6EHAw5XCxGSVYAVgwnwkyxJSVP_U";

// URL de l'API Google Gemini avec la clé intégrée
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Tableau pour stocker l'historique des conversations (utilisé pour suivre les échanges)
const chatHistory = [];

// Fonction pour créer un élément de message (utilisateur ou bot)
function createMsgElement(content, sender) {
    const div = document.createElement("div"); // Crée un nouvel élément <div>
    div.className = `message ${sender}-message`; // Ajoute une classe spécifique au type de message (user ou bot)
    div.innerHTML = `<p>${content}</p>`; // Insère le contenu du message dans une balise <p>
    return div; // Retourne l'élément créé pour être ajouté à l'interface
}

// Fonction asynchrone pour générer une réponse du bot
async function generateResponse() {
    const userMessage = promptInput.value.trim(); // Récupère et nettoie le message de l'utilisateur (supprime les espaces inutiles)
    if (!userMessage) return; // Si le message est vide, ne fait rien (évite les soumissions vides)

    // Ajoute le message utilisateur à l'interface
    const userMsg = createMsgElement(userMessage, "user"); // Crée un élément de message pour l'utilisateur
    chatsContainer.appendChild(userMsg); // Ajoute le message utilisateur dans le conteneur des messages

    // Ajoute un message de chargement pendant que le bot traite la réponse
    const loadingMsg = createMsgElement("Juste un instant...", "bot"); // Crée un message de chargement pour le bot
    loadingMsg.classList.add("loading-message"); // Ajoute une classe spécifique pour le style du message de chargement
    chatsContainer.appendChild(loadingMsg); // Ajoute le message de chargement dans le conteneur des messages

    // Réinitialise le champ de saisie et fait défiler automatiquement vers le bas
    promptInput.value = ""; // Vide le champ de saisie après soumission
    chatsContainer.scrollTop = chatsContainer.scrollHeight; // Fait défiler la zone des messages vers le bas pour afficher le dernier message

    try {
        // Vérifie si le message est une salutation (ex: "bonjour", "salut")
        if (isGreeting(userMessage)) {
            loadingMsg.remove(); // Supprime le message de chargement
            const response = handleGreeting(); // Génère une réponse aléatoire pour les salutations
            const botMsg = createMsgElement(response, "bot"); // Crée un élément de message pour la réponse du bot
            chatsContainer.appendChild(botMsg); // Ajoute la réponse du bot dans le conteneur des messages
            return; // Termine la fonction ici car la réponse a été générée
        }

        // Vérifie si le message contient des mots-clés liés au sport/fitness
        if (!isFitnessRelated(userMessage)) {
            loadingMsg.remove(); // Supprime le message de chargement
            const botMsg = createMsgElement("Je ne réponds qu'aux questions sport/fitness", "bot"); // Crée un message d'erreur
            chatsContainer.appendChild(botMsg); // Ajoute le message d'erreur dans le conteneur des messages
            return; // Termine la fonction ici car le message n'est pas valide
        }

        // Appelle l'API Google Gemini pour obtenir une réponse
        const response = await fetch(API_URL, {
            method: "POST", // Utilise la méthode POST pour envoyer des données à l'API
            headers: { "Content-Type": "application/json" }, // Spécifie que les données sont au format JSON
            body: JSON.stringify({
                contents: [{
                    role: "user", // Indique que le message provient de l'utilisateur
                    parts: [{ text: userMessage }] // Inclut le message de l'utilisateur dans la requête
                }]
            })
        });

        // Parse la réponse JSON reçue de l'API
        const data = await response.json(); // Convertit la réponse en objet JSON
        const botResponse = data.candidates[0].content.parts[0].text
            .replace(/\*\*/g, '') // Supprime les étoiles doubles (formatage Markdown) de la réponse
            .trim(); // Supprime les espaces inutiles au début ou à la fin de la réponse

        // Supprime le message de chargement et ajoute la réponse du bot
        loadingMsg.remove(); // Supprime le message de chargement
        const botMsg = createMsgElement(botResponse, "bot"); // Crée un élément de message pour la réponse du bot
        chatsContainer.appendChild(botMsg); // Ajoute la réponse du bot dans le conteneur des messages
        chatsContainer.scrollTop = chatsContainer.scrollHeight; // Fait défiler la zone des messages vers le bas
    } catch (error) {
        // Gère les erreurs potentielles (ex: problème de connexion, erreur API)
        loadingMsg.remove(); // Supprime le message de chargement
        const errorMsg = createMsgElement("Erreur lors de la réponse", "bot"); // Crée un message d'erreur
        chatsContainer.appendChild(errorMsg); // Ajoute le message d'erreur dans le conteneur des messages
    }
}

// Fonction pour vérifier si le message est une salutation
function isGreeting(message) {
    const greetings = ["bonjour", "salut", "hello", "coucou"]; // Liste des salutations acceptées
    return greetings.some(g => message.toLowerCase().includes(g)); // Vérifie si le message contient une salutation
}

// Fonction pour générer une réponse aléatoire aux salutations
function handleGreeting() {
    const responses = [
        "Bonjour ! Prêt à atteindre vos objectifs sportifs ?", // Réponse possible 1
        "Salut ! Besoin de conseils fitness ?", // Réponse possible 2
        "Hello ! Je suis là pour vos questions sport/nutrition" // Réponse possible 3
    ];
    return responses[Math.floor(Math.random() * responses.length)]; // Retourne une réponse aléatoire
}

// Fonction pour vérifier si le message contient des mots-clés liés au sport/fitness
function isFitnessRelated(message) {
    const keywords = ["sport", "fitness", "nutrition", "musculation", "cardio", "poids", "endurance"]; // Liste des mots-clés acceptés
    return keywords.some(kw => message.toLowerCase().includes(kw)); // Vérifie si le message contient un mot-clé
}

// Ajoute un écouteur d'événements pour gérer la soumission du formulaire
promptForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Empêche le rechargement de la page lors de la soumission
    generateResponse(); // Appelle la fonction pour générer une réponse
});

// Ajoute des écouteurs d'événements pour les boutons de suggestions
document.querySelectorAll(".suggestion-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        promptInput.value = btn.textContent; // Remplit le champ de saisie avec le texte du bouton
        generateResponse(); // Appelle la fonction pour générer une réponse
    });
});