// Simple, rule-based "AI" for the Wellness Companion prototype.
// No external APIs. No network requests. Just templates + logic.

// --- Helper: add messages to the chat window ---

const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message", role);

  const meta = document.createElement("div");
  meta.classList.add("message-meta");
  meta.textContent = role === "user" ? "You" : "Companion";

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");
  bubble.innerHTML = text; // safe enough for this prototype (no user HTML injection)

  wrapper.appendChild(meta);
  wrapper.appendChild(bubble);

  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// --- Core "AI" logic ---

// Crisis keywords to watch for (very simple)
const crisisKeywords = [
  "suicide",
  "kill myself",
  "end my life",
  "can't go on",
  "hurt myself",
  "hurt myself",
  "self harm",
  "self-harm",
  "die",
  "ending it",
  "ending everything"
];

// Some mood and topic keywords
const anxietyKeywords = [
  "anxious",
  "anxiety",
  "panic",
  "overwhelmed",
  "stressed",
  "stress",
  "worried",
  "worry"
];

const lowMoodKeywords = [
  "sad",
  "down",
  "depressed",
  "empty",
  "hopeless",
  "tired of everything"
];

const schoolKeywords = [
  "school",
  "class",
  "assignment",
  "homework",
  "grades",
  "deadline",
  "project"
];

const relationshipKeywords = [
  "friend",
  "friends",
  "relationship",
  "partner",
  "family",
  "mom",
  "dad"
];

const bodyKeywords = [
  "body",
  "weight",
  "appearance",
  "look",
  "ugly"
];

// Reflection prompts and coping suggestions
const generalReflections = [
  "If you were talking to a close friend feeling the way you do, what would you say to them?",
  "What is one small thing that went okay today, even if the day felt rough overall?",
  "If you could gently name your emotion right now, what would you call it?",
  "What do you think your mind is trying to protect you from or prepare you for?",
  "Is there a small boundary or tiny act of kindness you could offer yourself today?"
];

const groundingExercises = [
  "Try the 5-4-3-2-1 grounding exercise: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste or imagine tasting.",
  "Take a slow breath in for a count of 4, hold for 4, and breathe out for 6. Repeat a few times and notice any tiny shift.",
  "Look around and pick one object you can see. Describe it to yourself in detail: color, shape, texture, shadows.",
  "Gently stretch your neck and shoulders, roll your shoulders a few times, and notice how your body feels.",
  "If you can, place your feet flat on the ground and notice the feeling of support under you. Let your muscles rest for a few breaths."
];

const copingIdeas = [
  "Sometimes it helps to break things into the tiniest steps possible. What might be a 'first 5-minute step' you could take?",
  "You might try a short walk, a shower, or even changing your environment for a couple of minutes.",
  "Writing out your thoughts in a quick brain dump can sometimes make them feel less crowded.",
  "It can help to text or message someone you trust, even just to say 'hey, today is kind of a lot.'",
  "Is there a comforting routine (music, tea, a favorite show, a game) you can lean on for a little while?"
];

// Crisis response text
function getCrisisResponse() {
  return `
    I’m really glad you shared that with me. ❤️<br /><br />
    I’m just a prototype and I’m <strong>not able to keep you safe</strong> or respond like a real person in an emergency,
    but your safety matters a lot.<br /><br />
    If you are thinking about harming yourself or feel like you might act on these thoughts, please:
    <ul>
      <li>Call or text <strong>988</strong> in the U.S. for the Suicide &amp; Crisis Lifeline.</li>
      <li>Call your local emergency number (such as <strong>911</strong>).</li>
      <li>Reach out to someone you trust and let them know how you’re feeling.</li>
    </ul>
    You don’t have to go through this alone. This assistant is here only for gentle reflection and cannot replace real-world help.
  `;
}

// Non-crisis supportive response builder
function buildSupportiveResponse(text) {
  const lower = text.toLowerCase();
  let responseParts = [];

  // Basic validation / acknowledgment
  responseParts.push(
    "Thank you for sharing that with me. It sounds like there’s a lot on your mind, and I’m here to sit with you for a moment."
  );

  // Topic-specific pieces
  if (anxietyKeywords.some((k) => lower.includes(k))) {
    responseParts.push(
      "Feeling anxious or overwhelmed can be really draining. Anxiety often tries to convince us that everything is urgent and dangerous, even when that isn’t fully true."
    );
    responseParts.push(randomFromArray(groundingExercises));
  }

  if (lowMoodKeywords.some((k) => lower.includes(k))) {
    responseParts.push(
      "Low moods can make everything feel heavier and more permanent than it really is. You’re allowed to feel what you feel without having to fix it instantly."
    );
  }

  if (schoolKeywords.some((k) => lower.includes(k))) {
    responseParts.push(
      "School and deadlines can stack up and feel relentless. It might help to pick one tiny next step and give yourself permission to just do that, not everything at once."
    );
  }

  if (relationshipKeywords.some((k) => lower.includes(k))) {
    responseParts.push(
      "Relationships can bring up really strong emotions. It can help to notice what you need right now: to be heard, to set a boundary, to ask for support, or to take space."
    );
  }

  if (bodyKeywords.some((k) => lower.includes(k))) {
    responseParts.push(
      "Thoughts about our bodies can get really loud and harsh. Your worth isn’t defined by how you look, and you deserve kindness from yourself as much as anyone else."
    );
  }

  // If nothing specific matched, go more general
  if (responseParts.length === 1) {
    responseParts.push(
      "Even if it’s hard to put into words, what you’re feeling makes sense in the context of everything you’re juggling."
    );
  }

  // Always add a reflection prompt + coping idea
  responseParts.push(randomFromArray(generalReflections));
  responseParts.push(randomFromArray(copingIdeas));

  // Encourage real-world support
  responseParts.push(
    "If this feels like more than you want to handle alone, it could be helpful to talk with a trusted person or a professional who can support you more directly."
  );

  return responseParts.join("<br /><br />");
}

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Detect whether text likely contains crisis language
function isCrisis(text) {
  const lower = text.toLowerCase();
  return crisisKeywords.some((k) => lower.includes(k));
}

// --- Form handler ---

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = userInput.value.trim();
  if (!value) return;

  // Show user message
  addMessage("user", escapeHtml(value));
  userInput.value = "";

  // Simulate a tiny delay (optional)
  setTimeout(() => {
    let replyHtml;
    if (isCrisis(value)) {
      replyHtml = getCrisisResponse();
    } else {
      replyHtml = buildSupportiveResponse(value);
    }
    addMessage("assistant", replyHtml);
  }, 350);
});

// Simple HTML escape to avoid weirdness
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
