import type { Team, Group, QuestionBank } from "@/types";

export const HOST_ID       = import.meta.env.VITE_HOST_ID       || "host";
export const HOST_PASSWORD = import.meta.env.VITE_HOST_PASSWORD || "host@mtn2025";
export const AUDIENCE_ID   = import.meta.env.VITE_AUDIENCE_ID   || "audience";

const TEAM_PASSWORD = import.meta.env.VITE_TEAM_PASSWORD || "mtn2025";

// 15 teams, 3 groups of 5 — maps to MySQL `teams` and `groups` tables
export const TEAMS: Team[] = [
  { id: "sales",      name: "Sales & Distribution",        groupId: "g1", password: TEAM_PASSWORD },
  { id: "risk",       name: "Risk & Compliance",           groupId: "g1", password: TEAM_PASSWORD },
  { id: "network",    name: "Network Group",               groupId: "g1", password: TEAM_PASSWORD },
  { id: "marketing",  name: "Marketing",                   groupId: "g1", password: TEAM_PASSWORD },
  { id: "customer",   name: "Customer Relations",          groupId: "g1", password: TEAM_PASSWORD },
  { id: "transform",  name: "Transformation",              groupId: "g2", password: TEAM_PASSWORD },
  { id: "it",         name: "Information Technology",      groupId: "g2", password: TEAM_PASSWORD },
  { id: "digital",    name: "Digital",                     groupId: "g2", password: TEAM_PASSWORD },
  { id: "corporate",  name: "Corporate Services",          groupId: "g2", password: TEAM_PASSWORD },
  { id: "hr",         name: "Human Resource",              groupId: "g2", password: TEAM_PASSWORD },
  { id: "home",       name: "Home",                        groupId: "g3", password: TEAM_PASSWORD },
  { id: "enterprise", name: "Enterprise Business",         groupId: "g3", password: TEAM_PASSWORD },
  { id: "audit",      name: "Internal Audit & Forensics",  groupId: "g3", password: TEAM_PASSWORD },
  { id: "finance",    name: "Finance & Services",          groupId: "g3", password: TEAM_PASSWORD },
  { id: "management", name: "Management",                  groupId: "g3", password: TEAM_PASSWORD },
];

export const GROUPS: Group[] = [
  { id: "g1", name: "Group 1", teamIds: ["sales", "risk", "network", "marketing", "customer"] },
  { id: "g2", name: "Group 2", teamIds: ["transform", "it", "digital", "corporate", "hr"] },
  { id: "g3", name: "Group 3", teamIds: ["home", "enterprise", "audit", "finance", "management"] },
];

// Exact mock data from brief — maps to MySQL question tables
export const INITIAL_QUESTIONS: QuestionBank = {
  round1: [
    { id: 101, text: "What does AI stand for?", answer: "Artificial Intelligence", explanation: "AI refers to technology that enables computers and machines to perform tasks that normally require human intelligence.", isUsed: false , difficulty: "easy" },
    { id: 102, text: "What does NLP stand for?", answer: "Natural Language Processing", explanation: "NLP enables computers to understand, interpret and generate human language.", isUsed: false , difficulty: "medium" },
    { id: 103, text: "What does AGI stand for?", answer: "Artificial General Intelligence", explanation: "AGI refers to AI that would be capable of performing a wide range of intellectual tasks at a human-like level.", isUsed: false , difficulty: "hard" },
    { id: 104, text: "What does API stand for?", answer: "Application Programming Interface", explanation: "An API allows different software applications or systems to communicate with each other.", isUsed: false , difficulty: "easy" },
    { id: 105, text: "What does LLM stand for?", answer: "Large Language Model", explanation: "LLMs are AI models trained on large amounts of text to understand and generate human-like language.", isUsed: false , difficulty: "medium" },
    { id: 106, text: "Which company developed the LLaMA family of AI models?", answer: "Meta", explanation: "LLaMA stands for Large Language Model Meta AI.", isUsed: false , difficulty: "hard" },
    { id: 107, text: "Which company originally developed Siri?", answer: "Apple", explanation: "Siri is Apple's virtual assistant. Apple acquired Siri in 2010.", isUsed: false , difficulty: "easy" },
    { id: 108, text: "Which company developed the Gemini family of AI models?", answer: "Google", explanation: "Gemini is Google's family of generative AI models.", isUsed: false , difficulty: "medium" },
    { id: 109, text: "Which company developed the self-driving car project Waymo?", answer: "Google", explanation: "Waymo began as Google's self-driving car project and is now an independent company under Alphabet.", isUsed: false , difficulty: "hard" },
    { id: 110, text: "Which company created the DALL-E image-generation model?", answer: "OpenAI", explanation: "DALL-E is an AI model developed by OpenAI that can generate images from text descriptions.", isUsed: false , difficulty: "easy" },
    { id: 111, text: "What is the general term for a step-by-step set of instructions that a computer follows?", answer: "Algorithm", explanation: "An algorithm is a set of instructions or steps used to solve a problem or perform a task.", isUsed: false , difficulty: "medium" },
    { id: 112, text: "What do we call the trained output of a machine learning process that makes predictions?", answer: "Machine Learning Model", explanation: "A trained model learns patterns from data and uses those patterns to make predictions or decisions.", isUsed: false , difficulty: "hard" },
    { id: 113, text: "What do we call AI development practices designed to be fair, safe and accountable?", answer: "Responsible AI", explanation: "Responsible AI focuses on developing and using AI in ways that are fair, safe, transparent and accountable.", isUsed: false , difficulty: "easy" },
    { id: 114, text: "What is the general term for a car that can drive itself using AI?", answer: "Autonomous Vehicle", explanation: "Autonomous vehicles use technologies such as AI, sensors and cameras to navigate and drive with limited or no human control.", isUsed: false , difficulty: "medium" },
    { id: 115, text: "What is the term for a system that suggests products, movies or songs you might like?", answer: "Recommendation System", explanation: "Recommendation systems analyse information about users and items to suggest content or products that may interest them.", isUsed: false , difficulty: "hard" },
    { id: 116, text: "What does \"GenAI\" stand for?", answer: "Generative Artificial Intelligence", explanation: "Generative AI refers to AI systems that can create new content such as text, images, audio, video or code.", isUsed: false , difficulty: "easy" },
    { id: 117, text: "Which company developed ChatGPT?", answer: "OpenAI", explanation: "ChatGPT is an AI chatbot developed by OpenAI.", isUsed: false , difficulty: "medium" },
    { id: 118, text: "What is the main purpose of training data in machine learning?", answer: "To teach the AI model to recognise patterns and make predictions.", explanation: "A machine learning model learns from examples in training data.", isUsed: false , difficulty: "hard" },
    { id: 119, text: "What is a chatbot primarily designed to do?", answer: "Communicate with users through conversation.", explanation: "Chatbots can answer questions, provide information and assist users through text or voice.", isUsed: false , difficulty: "easy" },
    { id: 120, text: "What is bias in AI?", answer: "A tendency of an AI system to produce unfair or unbalanced results.", explanation: "AI can become biased when the data or methods used to develop it contain unfair or unbalanced patterns.", isUsed: false , difficulty: "medium" },
  ],
  round2: [
    {
      id: 201,
      scenario: "An MTN team is preparing a customer campaign. They have a large amount of customer data, including usage patterns, product preferences and customer interactions. The team wants to use AI to identify customers who are most likely to respond positively to the campaign. However, some of the data is incomplete, some customer information may be sensitive, and the team is concerned about making unfair or inaccurate decisions.",
      question: "As a team, identify three important things that should be considered before using AI for this campaign.",
      answer: "Any three of the following: 1. Data quality 2. Data privacy 3. Fairness/Bias 4. Transparency 5. Security 6. Human oversight",
      explanation: "Marking Guide: 1 mark for each valid consideration identified. Maximum: 3 marks.",
    },
  ],
  round3: [
    { id: 301, text: "OpenAI was founded in 2015.", answer: "TRUE", isUsed: false , difficulty: "easy" },
    { id: 302, text: "GPT-4 was released by OpenAI in 2023.", answer: "TRUE", isUsed: false , difficulty: "medium" },
    { id: 303, text: "Microsoft's chatbot \"Tay\" had to be taken offline shortly after launch because of offensive posts generated through interactions with users.", answer: "TRUE", explanation: "Tay was launched in 2016 and was quickly withdrawn after users caused it to generate inappropriate content.", isUsed: false , difficulty: "hard" },
    { id: 304, text: "Kaggle is a platform for hosting data science and machine learning competitions.", answer: "TRUE", isUsed: false , difficulty: "easy" },
    { id: 305, text: "AI can be used in healthcare to help analyse medical images such as X-rays and scans.", answer: "TRUE", isUsed: false , difficulty: "medium" },
    { id: 306, text: "Data governance refers to how an organisation manages the availability, usability, integrity and security of its data.", answer: "TRUE", isUsed: false , difficulty: "hard" },
    { id: 307, text: "\"Dark data\" refers to data an organisation collects but does not actively use or analyse.", answer: "TRUE", isUsed: false , difficulty: "easy" },
    { id: 308, text: "Differential privacy is a technique used to protect individual privacy while still allowing useful analysis of data.", answer: "TRUE", isUsed: false , difficulty: "medium" },
    { id: 309, text: "AI safety research focuses on making AI systems more reliable and reducing unintended harm.", answer: "TRUE", isUsed: false , difficulty: "hard" },
    { id: 310, text: "AI alignment refers to making sure an AI system's goals and behaviour are consistent with human values and intentions.", answer: "TRUE", isUsed: false , difficulty: "easy" },
    { id: 311, text: "\"Jailbreaking\" an AI model means officially unlocking extra features provided by the manufacturer.", answer: "FALSE", explanation: "AI jailbreaking refers to techniques used to bypass an AI system's safety restrictions or safeguards.", isUsed: false , difficulty: "medium" },
    { id: 312, text: "Voice biometrics can be used to verify a caller's identity based on characteristics of their voice.", answer: "TRUE", isUsed: false , difficulty: "hard" },
    { id: 313, text: "An AI system called Pluribus defeated professional poker players in six-player no-limit Texas hold'em.", answer: "TRUE", explanation: "Pluribus demonstrated superhuman performance in six-player poker.", isUsed: false , difficulty: "easy" },
    { id: 314, text: "AI can be used in content moderation to help detect harmful or policy-violating content online.", answer: "TRUE", isUsed: false , difficulty: "medium" },
    { id: 315, text: "A data lake typically stores raw data, while a data warehouse generally stores more structured and processed data.", answer: "TRUE", isUsed: false , difficulty: "hard" },
    { id: 316, text: "Generative AI can create new content such as text, images and audio.", answer: "TRUE", isUsed: false , difficulty: "easy" },
    { id: 317, text: "An AI model will always provide a correct answer if it sounds confident.", answer: "FALSE", explanation: "AI models can produce incorrect or fabricated information even when the response sounds confident.", isUsed: false , difficulty: "medium" },
    { id: 318, text: "A prompt is an instruction or input given to an AI system.", answer: "TRUE", isUsed: false , difficulty: "hard" },
    { id: 319, text: "Machine learning can only be used with numbers and cannot work with text or images.", answer: "FALSE", explanation: "Machine learning can be applied to many types of data, including text, images, audio and numerical data.", isUsed: false , difficulty: "easy" },
    { id: 320, text: "Human oversight can be important when AI is used to support significant business decisions.", answer: "TRUE", explanation: "Human review can help identify errors, unexpected outcomes and potential bias.", isUsed: false , difficulty: "medium" },
  ],
  round4: [
    { id: 401, text: "What type of AI is designed to create new text, images, audio or video?", answer: "Generative AI", isUsed: false , difficulty: "easy" },
    { id: 402, text: "What does ML stand for?", answer: "Machine Learning", isUsed: false , difficulty: "medium" },
    { id: 403, text: "What is the name given to instructions written for an AI model to produce a desired response?", answer: "Prompt", isUsed: false , difficulty: "hard" },
    { id: 404, text: "What does IoT stand for?", answer: "Internet of Things", isUsed: false , difficulty: "easy" },
    { id: 405, text: "What is an AI system that can understand and respond to spoken language commonly called?", answer: "Voice Assistant", isUsed: false , difficulty: "medium" },
    { id: 406, text: "What technology allows a computer to identify and understand objects or people in images?", answer: "Computer Vision", isUsed: false , difficulty: "hard" },
    { id: 407, text: "What is the term for incorrect or fabricated information generated by an AI model?", answer: "Hallucination", isUsed: false , difficulty: "easy" },
    { id: 408, text: "What does OCR stand for?", answer: "Optical Character Recognition", isUsed: false , difficulty: "medium" },
    { id: 409, text: "What is the process of teaching an AI model using data called?", answer: "Training", isUsed: false , difficulty: "hard" },
    { id: 410, text: "What type of data consists of values such as numbers and measurements?", answer: "Numerical Data", isUsed: false , difficulty: "easy" },
    { id: 411, text: "What is a chatbot?", answer: "An AI or software system that communicates with users through conversation.", isUsed: false , difficulty: "medium" },
    { id: 412, text: "What does an API allow different software systems to do?", answer: "Communicate or exchange information", isUsed: false , difficulty: "hard" },
    { id: 413, text: "What is the term for an AI model that can work with more than one type of input, such as text and images?", answer: "Multimodal AI", isUsed: false , difficulty: "easy" },
    { id: 414, text: "What is the name of the process of checking an AI model's performance using data it has not trained on?", answer: "Evaluation", isUsed: false , difficulty: "medium" },
    { id: 415, text: "What does \"data privacy\" refer to?", answer: "Protecting people's personal information and controlling how it is collected, used and shared.", isUsed: false , difficulty: "hard" },
    { id: 416, text: "What does AI stand for?", answer: "Artificial Intelligence", isUsed: false , difficulty: "easy" },
    { id: 417, text: "What does NLP stand for?", answer: "Natural Language Processing", isUsed: false , difficulty: "medium" },
    { id: 418, text: "What is the name of Google's AI model family?", answer: "Gemini", isUsed: false , difficulty: "hard" },
    { id: 419, text: "What does IoT stand for?", answer: "Internet of Things", isUsed: false , difficulty: "easy" },
    { id: 420, text: "What is the term for an AI system generating false information that appears believable?", answer: "Hallucination", isUsed: false , difficulty: "medium" },
  ],
  round5: [
    { id: 501, clue1: "I read a piece of text and try to understand how the writer feels.", clue2: "Happy, angry or neutral — I try to label the mood.", clue3: "Companies use me to analyse customer reviews and social media.", answer: "Sentiment Analysis", explanation: "Sentiment analysis uses AI and NLP to determine whether text expresses a positive, negative or neutral sentiment.", isUsed: false },
    { id: 502, clue1: "I try to guess which customers are about to walk away.", clue2: "Telecom companies can use me to act before it is too late.", clue3: "I use patterns in a customer's usage, behaviour and complaints.", answer: "Churn Prediction", explanation: "Churn prediction uses data and machine learning to identify customers who may stop using a service.", isUsed: false },
    { id: 503, clue1: "I sound confident, but I can be completely wrong.", clue2: "I am not a medical symptom here — I am a flaw in an AI's output.", clue3: "Large language models can sometimes produce me.", answer: "AI Hallucination", explanation: "An AI hallucination occurs when an AI generates information that is incorrect, fabricated or unsupported but presents it as if it were true.", isUsed: false },
    { id: 504, clue1: "I connect everyday objects such as fridges, cars and thermostats to the internet.", clue2: "Sensors are my eyes and ears.", clue3: "My name is three letters and refers to a network of connected things.", answer: "IoT – Internet of Things", explanation: "IoT refers to physical devices that connect to the internet to collect, send or receive data.", isUsed: false },
    { id: 505, clue1: "I live inside Word, Excel, PowerPoint and Teams.", clue2: "I can help draft emails, analyse information and summarise meetings.", clue3: "Microsoft gave me a name associated with a helpful assistant.", answer: "Microsoft Copilot", explanation: "Microsoft Copilot is Microsoft's AI assistant integrated into products such as Microsoft 365.", isUsed: false },
    { id: 506, clue1: "I scan a face and try to match it to an identity.", clue2: "Your phone might use me to help unlock itself.", clue3: "I am a well-known application of computer vision.", answer: "Facial Recognition", explanation: "Facial recognition uses computer vision and AI to identify or verify a person based on facial features.", isUsed: false },
    { id: 507, clue1: "You give me instructions before I do my work.", clue2: "The clearer you are, the better my response can be.", clue3: "You use me when talking to an AI system.", answer: "Prompt", explanation: "A prompt is the instruction or input given to an AI model to guide its response.", isUsed: false },
    { id: 508, clue1: "I learn from examples rather than being explicitly programmed for every situation.", clue2: "I look for patterns in data.", clue3: "I am one of the most common approaches used to build AI systems.", answer: "Machine Learning", explanation: "Machine learning allows computers to learn patterns from data and use those patterns to make predictions or decisions.", isUsed: false },
    { id: 509, clue1: "I can write, summarise, translate and answer questions.", clue2: "I learn patterns from huge amounts of text.", clue3: "My name contains three letters and starts with \"Large\".", answer: "LLM – Large Language Model", explanation: "LLMs are AI models trained on large amounts of text to understand and generate language.", isUsed: false },
    { id: 510, clue1: "I can create something that did not exist before.", clue2: "I can generate text, images, music or video.", clue3: "My name is often shortened to three letters: GenAI.", answer: "Generative AI", explanation: "Generative AI creates new content based on patterns learned from existing data.", isUsed: false },
    { id: 511, clue1: "I help you find what you might want to watch, buy or listen to next.", clue2: "Netflix, YouTube and online shopping platforms can use me.", clue3: "I personalise suggestions based on your behaviour and preferences.", answer: "Recommendation System", explanation: "Recommendation systems analyse user behaviour and other information to suggest relevant content, products or services.", isUsed: false },
  ]
};

export const ROUND_CONFIG = {
  1: { label: "General Knowledge",      short: "R1", color: "#FFCC00", pts: 2 },
  2: { label: "Speed Race",             short: "R2", color: "#FFCC00", pts: 2 },
  3: { label: "Problem of the Day",     short: "R3", color: "#FFCC00", pts: 5 },
  4: { label: "True / False — Directed",short: "R4", color: "#FFCC00", pts: 1 },
  5: { label: "Riddle Round",           short: "R5", color: "#FFCC00", pts: 5 },
} as const;

export const STEAL_TIMER_SECS = Number(import.meta.env.VITE_STEAL_TIMER_SECS) || 12;
export const CLUE_TIMER_SECS  = Number(import.meta.env.VITE_CLUE_TIMER_SECS)  || 30;
export const R2_TIMER_SECS    = Number(import.meta.env.VITE_R2_TIMER_SECS)    || 180;

// ── Sound engine (Web Audio API — no external files needed) ──────────────────
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!_audioCtx) _audioCtx = new AudioContext();
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.15, delay = 0) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch { /* ignore browsers without audio */ }
}

export function playSound(type: "shuffle" | "reveal" | "draw" | "answer" | "timer" | "buzz" | "correct" | "wrong" | "lockout") {
  switch (type) {
    case "draw":
      playTone(440, 0.15, "triangle", 0.12);
      playTone(587, 0.15, "triangle", 0.12, 0.08);
      break;
    case "shuffle":
      playTone(330, 0.08, "square", 0.06);
      break;
    case "reveal":
      playTone(523, 0.12, "sine", 0.15);
      playTone(659, 0.12, "sine", 0.15, 0.1);
      playTone(784, 0.2, "sine", 0.15, 0.2);
      break;
    case "answer":
      playTone(880, 0.1, "sine", 0.12);
      playTone(1047, 0.15, "sine", 0.12, 0.08);
      break;
    case "correct":
      // Cheerful ascending ping when points are awarded
      playTone(659, 0.12, "sine", 0.18);
      playTone(784, 0.12, "sine", 0.18, 0.1);
      playTone(1047, 0.25, "sine", 0.2, 0.2);
      break;
    case "wrong":
      playTone(200, 0.3, "sawtooth", 0.1);
      playTone(180, 0.3, "sawtooth", 0.1, 0.15);
      break;
    case "buzz":
      playTone(880, 0.08, "square", 0.15);
      playTone(1100, 0.12, "square", 0.18, 0.06);
      break;
    case "lockout":
      playTone(300, 0.2, "sawtooth", 0.1);
      playTone(220, 0.3, "sawtooth", 0.12, 0.15);
      break;
    case "timer":
      playTone(440, 0.1, "triangle", 0.1);
      break;
  }
}

export function buildInitialScores() {
  const zero = { total: 0, byRound: { r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 } };
  return Object.fromEntries(TEAMS.map((t) => [t.id, { ...zero, byRound: { ...zero.byRound } }]));
}

export const INITIAL_BROADCAST = {
  questionText: null,
  questionId: null,
  round: null,
  isShuffling: false,
  buzzEnabled: false,
  buzzedTeamId: null,
  lockedOutTeamIds: [] as string[],
  isStealMode: false,

  timerSecs: 0,
  timerTotal: 0,
  timerActive: false,
  timerLabel: "",
} as const;
