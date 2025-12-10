// Simple, rule-based "AI" for the Wellness Companion prototype.
// No external APIs. No network requests. Just templates + logic.

// --- DOM references and helpers ---

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
  bubble.innerHTML = text; // ok for this prototype (we escape user input)

  wrapper.appendChild(meta);
  wrapper.appendChild(bubble);

  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// --- Keyword groups ---

// Crisis keywords (very simple, not exhaustive)
const crisisKeywords = [
  "suicide",
  "kill myself",
  "end my life",
  "can't go on",
  "cant go on",
  "hurt myself",
  "self harm",
  "self-harm",
  "die",
  "dying",
  "ending it",
  "ending everything"
];

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
  "project",
  "exam",
  "test"
];

const relationshipKeywords = [
  "friend",
  "friends",
  "relationship",
  "partner",
  "boyfriend",
  "girlfriend",
  "family",
  "mom",
  "dad",
  "parents"
];

const bodyKeywords = [
  "body",
  "weight",
  "appearance",
  "look",
  "ugly",
  "fat",
  "skinny"
];

// Modes: goals, gratitude, creative planning
const goalsKeywords = [
  "goal",
  "goals",
  "habit",
  "habits",
  "plan",
  "plans",
  "routine",
  "project",
  "projects",
  "focus on"
];

const gratitudeKeywords = [
  "grateful",
  "gratitude",
  "thankful",
  "appreciate",
  "appreciation",
  "blessed",
  "thank you"
];

const creativeKeywords = [
  "creative",
  "creativity",
  "idea",
  "ideas",
  "brainstorm",
  "art",
  "draw",
  "write",
  "story",
  "design",
  "make something",
  "project idea"
];

// Positive / “doing okay” words/phrases (used inside isPositiveMood)
const positiveKeywords = [
  "good",
  "great",
  "awesome",
  "okay",
  "ok",
  "fine",
  "pretty good",
  "not bad",
  "happy",
  "excited",
  "better",
  "everything",
  "all good",
  "doing well"
];

// --- Response templates ---

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

const positiveResponses = [
  "I’m really glad to hear that. 😊",
  "That’s nice to hear. It sounds like you’re in a pretty solid place right now.",
  "Love that—sometimes “great” or “everything’s good” is exactly enough.",
  "It sounds like a lot of things are going well overall. That’s really good to notice."
];

// New: richer follow-ups when things are going well
const followUpPositiveResponses = [
  "That’s really good to hear. It sounds like things are lining up nicely for you right now.",
  "Love that. It’s nice when everything starts clicking into place.",
  "That kind of momentum feels good. Definitely worth noticing.",
  "That’s awesome. It sounds like you’re in a pretty steady place."
];

const forwardLookingPrompts = [
  "Is there anything coming up that you’re especially excited about?",
  "What’s one thing you’re looking forward to next?",
  "Do you want to use this good energy to move something small forward?",
  "Is there a goal you’re quietly excited about right now?",
  "Anything fun or meaningful planned in the near future?"
];

// Mode templates: goals, gratitude, creative planning

const goalsModePrompts = [
  "If you want, we can shrink a goal down into something tiny and doable. What is one small thing you would like to make progress on?",
  "Think of one area of your life you would like to nudge forward a little. What comes to mind first?",
  "If you picked a goal just for this week, what would it be?",
  "Sometimes it helps to pick a 'very small next step' instead of a big goal. What could that look like for you?"
];

const gratitudeModePrompts = [
  "Let’s do a quick gratitude check in. What is one thing you feel grateful for right now, no matter how small?",
  "You can try naming three tiny things you appreciate in this moment. They can be as simple as a warm drink or a song you like.",
  "Sometimes it helps to notice one person, one place, and one small comfort you appreciate today.",
  "If it feels okay, what is something about yourself that you are glad exists?"
];

const creativePlanningPrompts = [
  "Want to use this good energy for something creative? What kind of project or idea have you been thinking about lately?",
  "If you had an hour just to create something, what would you want to work on?",
  "Think about a simple creative experiment you could try this week. What is the first idea that pops up?",
  "Is there a small creative project you have been postponing that you would like to bring back to life?"
];

// --- Positive mood detector (improved) ---

function isPositiveMood(lower) {
  // Phrases that should not be treated as positive, even if they contain positive words
  const negativePatterns = [
    "not good",
    "not great",
    "not okay",
    "not ok",
    "not fine",
    "not happy",
    "not excited",
    "not better",
    "not doing well",
    "not feeling well",
    "tired of everything",
    "everything sucks",
    "everything is terrible",
    "everything is awful",
    "everything is falling apart"
  ];
  if (negativePatterns.some((p) => lower.includes(p))) {
    return false;
  }

  // Clear positive phrases
  const positivePhrases = [
    "doing well",
    "feeling well",
    "feeling good",
    "feeling great",
    "pretty good",
    "all good",
    "everything is good",
    "everything's good",
    "things are good",
    "things are going well",
    "i'm doing well",
    "im doing well"
  ];
  if (positivePhrases.some((p) => lower.includes(p))) {
    return true;
  }

  // Fallback: positive words, matched as whole words
  return positiveKeywords.some((word) => {
    const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const wordRegex = new RegExp("\\b" + escaped + "\\b");
    return wordRegex.test(lower);
  });
}

// --- Crisis response text ---

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

// --- Non-crisis supportive response builder ---

function buildSupportiveResponse(text) {
  const lower = text.toLowerCase();
  let responseParts = [];

  const mentionsGoals = goalsKeywords.some((k) => lower.includes(k));
  const mentionsGratitude = gratitudeKeywords.some((k) => lower.includes(k));
  const mentionsCreative = creativeKeywords.some((k) => lower.includes(k));

  // ✅ Positive path (e.g., "I'm feeling great", "I'm doing well", "everything is good")
  if (isPositiveMood(lower)) {
    responseParts.push(randomFromArray(positiveResponses));

    // If they are already talking about goals, gratitude, or creativity while feeling good
    if (mentionsGoals) {
      responseParts.push(randomFromArray(goalsModePrompts));
    } else if (mentionsGratitude) {
      responseParts.push(randomFromArray(gratitudeModePrompts));
    } else if (mentionsCreative) {
      responseParts.push(randomFromArray(creativePlanningPrompts));
    } else {
      // Second level positive replies like "everything is going well"
      if (
        lower.includes("everything") ||
        lower.includes("all") ||
        lower.includes("really good") ||
        lower.includes("great") ||
        lower.includes("amazing")
      ) {
        responseParts.push(randomFromArray(followUpPositiveResponses));
        responseParts.push(randomFromArray(forwardLookingPrompts));
      } else {
        responseParts.push(
          "If you feel like sharing, what’s something that’s been going well for you lately, or something you’re looking forward to?"
        );
        responseParts.push(
          "If you ever want to switch gears, you can also say something like 'goals', 'gratitude', or 'creative ideas' and we can lean into that."
        );
      }
    }

    return responseParts.join("<br /><br />");
  }

  // ✅ Default gentle acknowledgement
  responseParts.push("Thanks for sharing that with me. I’m here with you.");

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

  // Modes can still show up even if mood is mixed
  if (mentionsGoals) {
    responseParts.push(randomFromArray(goalsModePrompts));
  }

  if (mentionsGratitude) {
    responseParts.push(randomFromArray(gratitudeModePrompts));
  }

  if (mentionsCreative) {
    responseParts.push(randomFromArray(creativePlanningPrompts));
  }

  // If nothing specific matched, keep it light but validating
  if (responseParts.length === 1) {
    responseParts.push(
      "Even if it’s hard to put everything into words, it’s okay to be exactly where you are right now."
    );
  }

  // Reflection + coping idea
  responseParts.push(randomFromArray(generalReflections));
  responseParts.push(randomFromArray(copingIdeas));

  // Encourage real-world support (without assuming crisis)
  responseParts.push(
    "If you ever feel like this is more than you want to hold by yourself, it can really help to reach out to someone you trust or a professional who can support you more directly."
  );

  return responseParts.join("<br /><br />");
}

// --- Utility helpers ---

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isCrisis(text) {
  const lower = text.toLowerCase();
  return crisisKeywords.some((k) => lower.includes(k));
}

// Escape user text so they can’t inject HTML
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// --- Form handler ---

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = userInput.value.trim();
  if (!value) return;

  // Show user message
  addMessage("user", escapeHtml(value));
  userInput.value = "";

  // Simulate a tiny delay
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
