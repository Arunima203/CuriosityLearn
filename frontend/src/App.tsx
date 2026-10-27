import { useEffect, useState, type FormEvent } from "react";
import {
  generateQuizQuestions,
  type QuizQuestion,
} from "./data/quizGenerator";

import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import ClimateChangeLab from "./components/ClimateChangeLab";
import WeatherStation from "./components/WeatherStation";
import DigitalGeographyClassroom from "./components/DigitalGeographyClassroom";
import LivingGeography from "./components/LivingGeography";
import GeographyAIChat from "./components/GeographyAIChat";



const API_URL = (() => {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  const isCapacitor =
    typeof window !== "undefined" &&
    Boolean((window as any).Capacitor?.isNativePlatform?.());
  if (isCapacitor) {
    return envUrl || "https://curiositylearn.onrender.com";
  }
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  if (isLocal) {
    return envUrl && !envUrl.includes("onrender.com")
      ? envUrl
      : "http://127.0.0.1:8000";
  }
  return envUrl || "https://curiositylearn.onrender.com";
})();

// Convert any YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    if (url.includes("youtube.com/embed/")) return url;
    const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (short) return `https://www.youtube.com/embed/${short[1]}`;
    const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
    const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
  } catch {}
  return null;
}

// Fetch with 30s timeout — Render free tier can be slow on cold start
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
const translations = {
  en: {
    exploreWorld: "Explore the World",
    startExploring: "Start Exploring →",
    interactiveMap: "Interactive Map",
    clickCountry: "Click a country to discover information.",
    capital: "Capital",
    population: "Population",
    area: "Area",
    continent: "Continent",
    currency: "Currency",
    languages: "Languages",
    countryCode: "Country Code",
    loading: "Loading country details... 🌍",
    officialName: "Official Name",
    timezone: "Timezone",
    region: "Region",
    subregion: "Subregion",
    countryInfoNotFound: "Country information পাওয়া যায়নি।",
    geographyExplorer: "Geography Explorer",
    indiaMap: "India Map",
    exploreIndia: "Explore India",
    clickState: "Click on a state or Union Territory to explore it.",
    famousPlaces: "Famous Places",
    geographyExamples: "Geographical Examples",
    quickFact: "Quick Fact",
    startChallenge: "🎯 Start Pointing Challenge",
    backDashboard: "← Back to Dashboard",
    backWorldMap: "← Back to World Map",
    backIndiaMap: "← Back to India Map",
    pointingChallenge: "Geography Challenge 🎯",
    pointTheState: "Point the State!",
    findCorrectLocation: "Find the correct location on the map.",
    find: "Find",
    correct: "🎉 Correct! +10 Points",
    tryAgain: "❌ Not quite! Try again.",
    nextChallenge: "🎯 Next Challenge",
    returnIndiaMap: "← Return to India Map",
    welcomeBack: "Welcome to SRK classes 👋",
    readyExplore: "Ready to explore the world?",
    discoverPlaces: "Discover places, maps and amazing facts.",
    geography: "Geography",
    learningZone: "Learning Zone",
    learnCountries:
      "Learn countries, states, rivers, mountains and much more through interactive maps.",
    points: "Points",
    dayStreak: "Day Streak",
    interactiveMapCard: "Interactive Map",
    pointExplore: "Point, explore and discover places.",
    learnVideos: "Learn with Videos",
    understandConcepts: "Understand concepts through animation.",
    quickQuiz: "Quick Quiz",
    testLearning: "Test what you have learned.",
    logout: "Logout",
    setupProfile: "Let's set up your profile 🌍",
    profileDescription: "Tell us a little about your studies.",
    classPlaceholder: "Class (e.g. 10)",
    boardPlaceholder: "Board (e.g. CBSE)",
    mediumPlaceholder: "Medium (e.g. English)",
    continueGeography: "Continue to Geography 🌍",
    welcomeExplorer: "Welcome back, Explorer!",
    createAccount: "Create your explorer account",
    yourName: "Your name",
    email: "Email",
    password: "Password",
    role: "Role",
    studentRole: "Student",
    teacherRole: "Teacher",
    login: "Login",
    register: "Register",
    noAccount: "Don't have an account? Register",
    haveAccount: "Already have an account? Login",
    backendError: "Backend-er sathe connection hocche na.",
    studentProfile: "Student Profile",
    profileDetails: "Your learning profile",
    classLabel: "Class",
    boardLabel: "Board",
    mediumLabel: "Medium",
    teacherProgress: "Student Progress",
    studentsLearning: "Students Learning Overview",
    recentActivity: "Recent Activity",
    viewProgress: "View Progress",
    curiosityAnswered: "Curiosity Answered",
    curiosityAccuracy: "Curiosity Accuracy",
    mockAttempts: "Mock Attempts",
    mockAverage: "Mock Average",
    activityCount: "Activities",
    noStudents: "No student accounts found yet.",
    progressDetails: "Progress Details",
    close: "Close",
    noActivity: "No activity recorded yet.",
    curiosityAlert: "Curiosity Alert",
    curiosityTitle: "Today's Geography Mystery",
    curiositySubtitle: "One small question can unlock a big idea.",
    curiosityAnswer: "Answer",
    curiositySubmitting: "Checking...",
    curiosityCorrect: "🎉 Correct!",
    curiosityTryAgain: "❌ Not quite!",
    curiosityExplanation: "Why?",
    curiosityXp: "XP earned",
    curiosityCategory: "Category",
    curiosityHistory: "Curiosity Journey",
    curiosityHistoryEmpty: "Answer your first curiosity question to start your journey.",
    curiosityLoadFailed: "Today's curiosity is not available yet.",
    curiosityRetry: "Try Again",
    aiChatTitle: "Geography AI Tutor",
    aiChatSubtitle: "Ask me anything about Geography!",
    aiChatTag: "AI TUTOR",
    aiChatDesc: "Chat with your personal AI Geography tutor — get explanations, quizzes and tips.",
    aiChatBack: "← Back to Dashboard",
  },

  bn: {
    exploreWorld: "বিশ্ব অন্বেষণ করুন",
    startExploring: "অন্বেষণ শুরু করুন →",
    interactiveMap: "ইন্টার‍্যাক্টিভ মানচিত্র",
    clickCountry: "তথ্য জানতে একটি দেশে ক্লিক করুন।",
    capital: "রাজধানী",
    population: "জনসংখ্যা",
    area: "আয়তন",
    continent: "মহাদেশ",
    currency: "মুদ্রা",
    languages: "ভাষা",
    countryCode: "দেশের কোড",
    loading: "দেশের তথ্য লোড হচ্ছে... 🌍",
    officialName: "সরকারি নাম",
    timezone: "সময় অঞ্চল",
    region: "অঞ্চল",
    subregion: "উপ-অঞ্চল",
    countryInfoNotFound: "দেশের তথ্য পাওয়া যায়নি।",
    geographyExplorer: "ভূগোল অন্বেষণ",
    indiaMap: "ভারতের মানচিত্র",
    exploreIndia: "ভারত অন্বেষণ করুন",
    clickState: "একটি রাজ্য বা কেন্দ্রশাসিত অঞ্চলে ক্লিক করুন।",
    famousPlaces: "বিখ্যাত স্থান",
    geographyExamples: "ভৌগোলিক বৈশিষ্ট্য",
    quickFact: "দ্রুত তথ্য",
    startChallenge: "🎯 পয়েন্টিং চ্যালেঞ্জ শুরু করুন",
    backDashboard: "← ড্যাশবোর্ডে ফিরে যান",
    backWorldMap: "← বিশ্ব মানচিত্রে ফিরে যান",
    backIndiaMap: "← ভারত মানচিত্রে ফিরে যান",
    pointingChallenge: "ভূগোল চ্যালেঞ্জ 🎯",
    pointTheState: "রাজ্যটি খুঁজে বের করুন!",
    findCorrectLocation: "মানচিত্রে সঠিক অবস্থান খুঁজে বের করুন।",
    find: "খুঁজুন",
    correct: "🎉 সঠিক! +১০ পয়েন্ট",
    tryAgain: "❌ ঠিক হয়নি! আবার চেষ্টা করুন।",
    nextChallenge: "🎯 পরের চ্যালেঞ্জ",
    returnIndiaMap: "← ভারত মানচিত্রে ফিরে যান",
    welcomeBack: "আবার স্বাগতম 👋",
    readyExplore: "বিশ্ব অন্বেষণের জন্য প্রস্তুত?",
    discoverPlaces: "স্থান, মানচিত্র এবং দারুণ তথ্য আবিষ্কার করুন।",
    geography: "ভূগোল",
    learningZone: "লার্নিং জোন",
    learnCountries:
      "ইন্টার‍্যাক্টিভ মানচিত্রের মাধ্যমে দেশ, রাজ্য, নদী, পাহাড় এবং আরও অনেক কিছু শিখুন।",
    points: "পয়েন্ট",
    dayStreak: "দিনের স্ট্রিক",
    interactiveMapCard: "ইন্টার‍্যাক্টিভ মানচিত্র",
    pointExplore: "পয়েন্ট করুন, অন্বেষণ করুন এবং স্থান আবিষ্কার করুন।",
    learnVideos: "ভিডিওর মাধ্যমে শিখুন",
    understandConcepts: "অ্যানিমেশনের মাধ্যমে ধারণা বুঝুন।",
    quickQuiz: "কুইক কুইজ",
    testLearning: "আপনি যা শিখেছেন তা পরীক্ষা করুন।",
    logout: "লগআউট",
    setupProfile: "চলুন আপনার প্রোফাইল তৈরি করি 🌍",
    profileDescription: "আপনার পড়াশোনা সম্পর্কে কিছু তথ্য দিন।",
    classPlaceholder: "ক্লাস (যেমন ১০)",
    boardPlaceholder: "বোর্ড (যেমন CBSE)",
    mediumPlaceholder: "মাধ্যম (যেমন বাংলা)",
    continueGeography: "ভূগোলে এগিয়ে যান 🌍",
    welcomeExplorer: "আবার স্বাগতম, Explorer!",
    createAccount: "আপনার Explorer account তৈরি করুন",
    yourName: "আপনার নাম",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    role: "রোল",
    studentRole: "স্টুডেন্ট",
    teacherRole: "টিচার",
    login: "লগইন",
    register: "রেজিস্টার",
    noAccount: "অ্যাকাউন্ট নেই? রেজিস্টার করুন",
    haveAccount: "অ্যাকাউন্ট আছে? লগইন করুন",
    backendError: "Backend-এর সাথে connection হচ্ছে না।",
    studentProfile: "স্টুডেন্ট প্রোফাইল",
    profileDetails: "আপনার লার্নিং প্রোফাইল",
    classLabel: "ক্লাস",
    boardLabel: "বোর্ড",
    mediumLabel: "মাধ্যম",
    teacherProgress: "স্টুডেন্ট প্রগ্রেস",
    studentsLearning: "স্টুডেন্টদের লার্নিং ওভারভিউ",
    recentActivity: "সাম্প্রতিক অ্যাক্টিভিটি",
    viewProgress: "প্রগ্রেস দেখুন",
    curiosityAnswered: "Curiosity উত্তর",
    curiosityAccuracy: "Curiosity Accuracy",
    mockAttempts: "Mock Test",
    mockAverage: "Mock Average",
    activityCount: "অ্যাক্টিভিটি",
    noStudents: "এখনও কোনো student account পাওয়া যায়নি।",
    progressDetails: "প্রগ্রেস ডিটেইলস",
    close: "বন্ধ করুন",
    noActivity: "এখনও কোনো activity record নেই।",
    curiosityAlert: "কিউরিওসিটি অ্যালার্ট",
    curiosityTitle: "আজকের Geography Mystery",
    curiositySubtitle: "একটি ছোট প্রশ্ন থেকেই বড় একটি ধারণা খুলে যেতে পারে।",
    curiosityAnswer: "উত্তর দিন",
    curiositySubmitting: "উত্তর যাচাই হচ্ছে...",
    curiosityCorrect: "🎉 সঠিক!",
    curiosityTryAgain: "❌ ঠিক হয়নি!",
    curiosityExplanation: "কেন?",
    curiosityXp: "XP অর্জিত",
    curiosityCategory: "ক্যাটাগরি",
    curiosityHistory: "Curiosity Journey",
    curiosityHistoryEmpty: "প্রথম Curiosity প্রশ্নের উত্তর দিয়ে আপনার journey শুরু করুন।",
    curiosityLoadFailed: "আজকের Curiosity এখনো পাওয়া যায়নি।",
    curiosityRetry: "আবার চেষ্টা করুন",
    aiChatTitle: "Geography AI টিউটর",
    aiChatSubtitle: "Geography সম্পর্কে যেকোনো প্রশ্ন করুন!",
    aiChatTag: "AI টিউটর",
    aiChatDesc: "আপনার personal AI Geography টিউটরের সাথে chat করুন — ব্যাখ্যা, quiz এবং tips পান।",
    aiChatBack: "← ড্যাশবোর্ডে ফিরে যান",
  },
};

type Language = "en" | "bn";

type LearningContent = {
  id: string;
  subject: string;
  chapter: string;
  title: string;
  description: string;
  videoUrl: string;
  imageUrl: string;
  notes: string;
  explanation: string;
  pdf_data?: string;
  pdf_name?: string;
};

type GeographyTopic = {
  id: number;
  title: string;
  image_url: string | null;
};

const DEFAULT_LEARNING_CONTENT: LearningContent[] = [
  {
    id: "geo-monsoon",
    subject: "Geography",
    chapter: "Climate",
    title: "Why does the monsoon suddenly change direction?",
    description: "Explore the Indian monsoon through explanation, animation and challenges.",
    videoUrl: "",
    imageUrl: "",
    notes: "• Indian monsoon is caused by differential heating of land and sea.\n• Southwest monsoon brings rain to most of India (June–September).\n• The monsoon reverses direction in winter (Northeast monsoon).\n• Key factors: Coriolis effect, ITCZ movement, Western Ghats orographic rainfall.",
    explanation: "The monsoon changes direction due to the seasonal shift of the Inter-Tropical Convergence Zone (ITCZ). In summer, land heats up faster than the sea, creating a low-pressure area over India. Moist winds rush in from the Indian Ocean. In winter, the land cools faster, reversing the pressure gradient and sending dry winds outward.",
  },
  {
    id: "geo-cyclone",
    subject: "Geography",
    chapter: "Atmosphere",
    title: "How does a cyclone form?",
    description: "See how warm ocean water, rising air and pressure create a cyclone.",
    videoUrl: "",
    imageUrl: "",
    notes: "• Cyclones form over warm ocean water (above 26°C).\n• Warm moist air rises rapidly, creating a low-pressure centre.\n• Surrounding air spirals inward due to the Coriolis effect.\n• The 'eye' of the cyclone is calm and clear.\n• Bay of Bengal cyclones affect eastern India (Odisha, Andhra Pradesh, West Bengal).",
    explanation: "A cyclone begins when warm ocean water heats the air above it. The warm air rises quickly, leaving a low-pressure zone at the surface. Cooler surrounding air rushes in and spirals because of Earth's rotation (Coriolis effect). This creates the rotating storm system. The centre — called the eye — is surprisingly calm.",
  },
  {
    id: "geo-river",
    subject: "Geography",
    chapter: "Rivers",
    title: "How does a river shape the land?",
    description: "Understand erosion, transportation and deposition with visuals.",
    videoUrl: "",
    imageUrl: "",
    notes: "• Erosion: river cuts into rock and soil (upper course — V-shaped valleys).\n• Transportation: river carries sediment as load.\n• Deposition: sediment dropped at the mouth (delta formation).\n• Famous Indian deltas: Ganga-Brahmaputra delta (Sundarbans), Krishna, Godavari.\n• Meanders form in the middle course where gradients are gentle.",
    explanation: "Rivers shape the landscape through three processes — erosion, transportation and deposition. In the mountains (upper course), fast-moving water cuts deep V-shaped valleys. In the plains (middle course), the river slows, forms meanders and starts depositing. At the coast (lower course), sediment is dropped, forming fertile deltas.",
  },
];

function loadLearningContent(): LearningContent[] {
  try {
    const saved = localStorage.getItem("curiosity_learning_content");
    return saved ? JSON.parse(saved) : DEFAULT_LEARNING_CONTENT;
  } catch {
    return DEFAULT_LEARNING_CONTENT;
  }
}

const INDIA_CHALLENGE_STATES = [
  "Andaman and Nicobar",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

function getRandomIndiaChallengeState(excludeState = "") {
  const candidates = INDIA_CHALLENGE_STATES.filter(
    (state) => state !== excludeState
  );

  return candidates[Math.floor(Math.random() * candidates.length)] ?? INDIA_CHALLENGE_STATES[0];
}

const locationData: Record<
  string,
  {
    famousPlaces: string[];
    geography: string[];
    fact: string;
  }
> = {
  India: {
    famousPlaces: ["Taj Mahal", "Red Fort", "Gateway of India"],
    geography: ["Himalayas", "Thar Desert", "Ganges River"],
    fact: "India has the world's largest democracy and an extraordinary variety of landscapes.",
  },
  "Andhra Pradesh": {
    famousPlaces: ["Tirumala Temple", "Charminar (Hyderabad)", "Araku Valley"],
    geography: ["Eastern Ghats", "Bay of Bengal Coast", "Krishna & Godavari Rivers"],
    fact: "Andhra Pradesh has one of the longest coastlines in India at about 974 km.",
  },
  "Arunachal Pradesh": {
    famousPlaces: ["Tawang Monastery", "Ziro Valley", "Namdapha National Park"],
    geography: ["Eastern Himalayas", "Brahmaputra Tributaries", "Dense Forests"],
    fact: "Arunachal Pradesh is India's largest northeastern state and shares borders with China, Bhutan and Myanmar.",
  },
  Assam: {
    famousPlaces: ["Kaziranga National Park", "Kamakhya Temple", "Majuli Island"],
    geography: ["Brahmaputra Valley", "Barak Valley", "Shillong Plateau"],
    fact: "Assam's Kaziranga is home to two-thirds of the world's one-horned rhinoceroses.",
  },
  Bihar: {
    famousPlaces: ["Bodh Gaya", "Nalanda", "Vaishali"],
    geography: ["Gangetic Plains", "Ganges River", "Son River"],
    fact: "Bihar is one of the oldest continuously inhabited places in the world and the birthplace of Buddhism.",
  },
  Chhattisgarh: {
    famousPlaces: ["Chitrakote Falls", "Bastar", "Sirpur"],
    geography: ["Dandakaranya Forest", "Mahanadi River", "Satpura Ranges"],
    fact: "Chhattisgarh has the highest proportion of tribal population among large Indian states.",
  },
  Goa: {
    famousPlaces: ["Baga Beach", "Basilica of Bom Jesus", "Dudhsagar Falls"],
    geography: ["Konkan Coast", "Western Ghats", "Mandovi River"],
    fact: "Goa is India's smallest state by area and has a strong Portuguese colonial heritage.",
  },
  Gujarat: {
    famousPlaces: ["Gir National Park", "Rann of Kutch", "Somnath Temple"],
    geography: ["Thar Desert", "Gulf of Kutch", "Sabarmati River"],
    fact: "Gujarat's Rann of Kutch is the world's largest salt desert.",
  },
  Haryana: {
    famousPlaces: ["Kurukshetra", "Sultanpur Bird Sanctuary", "Morni Hills"],
    geography: ["Indo-Gangetic Plain", "Aravalli Range", "Yamuna River"],
    fact: "Haryana is one of the wealthiest states in India and surrounds the national capital Delhi on three sides.",
  },
  "Himachal Pradesh": {
    famousPlaces: ["Shimla", "Manali", "Dharamshala"],
    geography: ["Western Himalayas", "Beas River", "Pir Panjal Range"],
    fact: "Himachal Pradesh is known as 'Dev Bhoomi' (Land of Gods) because of its numerous temples and monasteries.",
  },
  Jharkhand: {
    famousPlaces: ["Hundru Falls", "Betla National Park", "Deoghar"],
    geography: ["Chota Nagpur Plateau", "Damodar River", "Mineral-rich Plateau"],
    fact: "Jharkhand holds about 40% of India's mineral resources including coal, iron ore and copper.",
  },
  Karnataka: {
    famousPlaces: ["Mysore Palace", "Hampi", "Coorg"],
    geography: ["Deccan Plateau", "Western Ghats", "Cauvery River"],
    fact: "Karnataka's Western Ghats are a UNESCO World Heritage Site and a global biodiversity hotspot.",
  },
  Kerala: {
    famousPlaces: ["Alleppey Backwaters", "Munnar", "Periyar National Park"],
    geography: ["Western Ghats", "Arabian Sea Coast", "Backwaters"],
    fact: "Kerala has the highest literacy rate in India and its backwaters are a unique network of lagoons and lakes.",
  },
  "Madhya Pradesh": {
    famousPlaces: ["Khajuraho", "Sanchi Stupa", "Kanha National Park"],
    geography: ["Vindhya Range", "Narmada River", "Satpura Range"],
    fact: "Madhya Pradesh is called the 'Heart of India' and has the highest number of tiger reserves in the country.",
  },
  Maharashtra: {
    famousPlaces: ["Gateway of India", "Ajanta & Ellora Caves", "Lonavala"],
    geography: ["Deccan Plateau", "Konkan Coast", "Western Ghats"],
    fact: "Maharashtra's Mumbai is India's financial capital and has the Dharavi — one of Asia's largest urban settlements.",
  },
  Manipur: {
    famousPlaces: ["Loktak Lake", "Kangla Fort", "Keibul Lamjao National Park"],
    geography: ["Imphal Valley", "Barail Range", "Barak River"],
    fact: "Manipur's Loktak Lake is the largest freshwater lake in northeastern India and has floating islands called Phumdis.",
  },
  Meghalaya: {
    famousPlaces: ["Cherrapunji", "Living Root Bridges", "Dawki River"],
    geography: ["Shillong Plateau", "Khasi Hills", "Garo Hills"],
    fact: "Cherrapunji in Meghalaya holds the record for the highest annual rainfall on Earth.",
  },
  Mizoram: {
    famousPlaces: ["Aizawl", "Phawngpui Peak", "Palak Lake"],
    geography: ["Lushai Hills", "Chhimtuipui River", "Dense Bamboo Forests"],
    fact: "Mizoram has one of the highest literacy rates in India and over 90% of the land is forested.",
  },
  Nagaland: {
    famousPlaces: ["Hornbill Festival", "Kohima War Cemetery", "Dzukou Valley"],
    geography: ["Naga Hills", "Doyang River", "Dense Forest"],
    fact: "Nagaland is called the 'Land of Festivals' and the Hornbill Festival showcases all Naga tribes together.",
  },
  Odisha: {
    famousPlaces: ["Jagannath Temple", "Konark Sun Temple", "Chilika Lake"],
    geography: ["Eastern Coastal Plains", "Chilika Lagoon", "Bay of Bengal Coast"],
    fact: "Odisha has a long coastline and is home to the famous Chilika Lagoon — Asia's largest brackish water lagoon.",
  },
  Punjab: {
    famousPlaces: ["Golden Temple", "Jallianwala Bagh", "Wagah Border"],
    geography: ["Indo-Gangetic Plain", "Sutlej River", "Five Rivers (Punjab)"],
    fact: "Punjab is India's bread basket — it produces about 50% of India's wheat.",
  },
  Rajasthan: {
    famousPlaces: ["Amber Fort", "Hawa Mahal", "Jaisalmer Fort"],
    geography: ["Thar Desert", "Aravalli Range", "Luni River"],
    fact: "Rajasthan is India's largest state by area and the Thar Desert covers most of its western region.",
  },
  Sikkim: {
    famousPlaces: ["Kangchenjunga", "Gurudongmar Lake", "Rumtek Monastery"],
    geography: ["Eastern Himalayas", "Teesta River", "High-altitude Lakes"],
    fact: "Kangchenjunga in Sikkim is the world's third-highest mountain at 8,586 m.",
  },
  "Tamil Nadu": {
    famousPlaces: ["Meenakshi Temple", "Marina Beach", "Ooty"],
    geography: ["Eastern Ghats", "Western Ghats", "Cauvery River"],
    fact: "Marina Beach in Chennai is the second longest urban beach in the world at 13 km.",
  },
  Telangana: {
    famousPlaces: ["Charminar", "Golconda Fort", "Nagarjuna Sagar"],
    geography: ["Deccan Plateau", "Krishna River", "Godavari River"],
    fact: "Hyderabad, the capital of Telangana, is known as 'Cyberabad' for being India's top IT hub.",
  },
  Tripura: {
    famousPlaces: ["Ujjayanta Palace", "Neermahal", "Unakoti"],
    geography: ["Barail Range", "Haora River", "Tropical Forest"],
    fact: "Tripura is surrounded by Bangladesh on three sides, making it one of India's most unique border states.",
  },
  "Uttar Pradesh": {
    famousPlaces: ["Taj Mahal", "Varanasi Ghats", "Mathura"],
    geography: ["Gangetic Plains", "Ganges & Yamuna Rivers", "Vindhya Hills"],
    fact: "Uttar Pradesh is India's most populous state and home to the Taj Mahal, one of the Seven Wonders of the World.",
  },
  Uttarakhand: {
    famousPlaces: ["Kedarnath", "Badrinath", "Valley of Flowers"],
    geography: ["Central Himalayas", "Garhwal & Kumaon Hills", "Glaciers"],
    fact: "Uttarakhand is called 'Dev Bhoomi' and is the source of the sacred Ganges and Yamuna rivers.",
  },
  "West Bengal": {
    famousPlaces: ["Victoria Memorial", "Sundarbans", "Darjeeling"],
    geography: ["Ganges Delta", "Mangrove Forest", "Himalayan Foothills"],
    fact: "The Sundarbans in West Bengal is the world's largest mangrove forest and a UNESCO World Heritage Site.",
  },
  Delhi: {
    famousPlaces: ["Red Fort", "India Gate", "Qutub Minar"],
    geography: ["Yamuna River", "Indo-Gangetic Plain", "Aravalli Ridge"],
    fact: "Delhi is one of the world's oldest continually inhabited cities with a history spanning over 5,000 years.",
  },
  "Jammu and Kashmir": {
    famousPlaces: ["Dal Lake", "Vaishno Devi", "Gulmarg"],
    geography: ["Himalayas", "Jhelum River", "Kashmir Valley"],
    fact: "The Kashmir Valley, framed by the Himalayas and Pir Panjal range, is often called 'Paradise on Earth'.",
  },
  "Jammu & Kashmir": {
    famousPlaces: ["Dal Lake", "Vaishno Devi", "Gulmarg"],
    geography: ["Himalayas", "Jhelum River", "Kashmir Valley"],
    fact: "The Kashmir Valley, framed by the Himalayas and Pir Panjal range, is often called 'Paradise on Earth'.",
  },
  Ladakh: {
    famousPlaces: ["Pangong Lake", "Hemis Monastery", "Nubra Valley"],
    geography: ["Trans-Himalayan Region", "Indus River", "Cold Desert"],
    fact: "Ladakh is one of the world's highest inhabited regions with many areas above 5,000 m altitude.",
  },
  "Andaman and Nicobar": {
    famousPlaces: ["Radhanagar Beach", "Cellular Jail", "Barren Island Volcano"],
    geography: ["Bay of Bengal Islands", "Coral Reefs", "Tropical Forest"],
    fact: "Barren Island in the Andaman archipelago is South Asia's only confirmed active volcano.",
  },
  Chandigarh: {
    famousPlaces: ["Rock Garden", "Sukhna Lake", "Capitol Complex"],
    geography: ["Shivalik Foothills", "Ghaggar River"],
    fact: "Chandigarh was designed by Swiss-French architect Le Corbusier and is a UNESCO World Heritage Site.",
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    famousPlaces: ["Diu Fort", "Naida Caves", "Vanganga Lake"],
    geography: ["Arabian Sea Coast", "Daman Ganga River"],
    fact: "This union territory was a Portuguese colony until 1961 and retains distinct Lusophone heritage.",
  },
  Lakshadweep: {
    famousPlaces: ["Agatti Island", "Bangaram Atoll", "Minicoy Island"],
    geography: ["Arabian Sea Coral Islands", "Lagoons", "Coral Reefs"],
    fact: "Lakshadweep is India's smallest union territory and consists entirely of coral atolls and reefs.",
  },
  Puducherry: {
    famousPlaces: ["Auroville", "French Quarter", "Arikamedu"],
    geography: ["Coromandel Coast", "Bay of Bengal", "Gingee River"],
    fact: "Puducherry retains strong French colonial character and Auroville is an experimental international township.",
  },
};

// --------------------------------------------------
// India Map - soft physical geography colours
// --------------------------------------------------
const INDIA_TERRAIN_DESERT = new Set([
  "Rajasthan",
  "Gujarat",
]);

const INDIA_TERRAIN_MOUNTAIN = new Set([
  "Jammu and Kashmir",
  "Jammu & Kashmir",
  "Ladakh",
  "Himachal Pradesh",
  "Uttarakhand",
  "Sikkim",
  "Arunachal Pradesh",
  "Meghalaya",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
]);

const INDIA_TERRAIN_COASTAL = new Set([
  "Goa",
  "Maharashtra",
  "Karnataka",
  "Kerala",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Odisha",
  "West Bengal",
]);

function getIndiaTerrainFill(stateName: string) {
  const normalized = String(stateName || "").trim();

  if (INDIA_TERRAIN_DESERT.has(normalized)) {
    return "#f1dfb7"; // soft sand
  }

  if (INDIA_TERRAIN_MOUNTAIN.has(normalized)) {
    return "#cbd7c9"; // soft green-grey
  }

  if (INDIA_TERRAIN_COASTAL.has(normalized)) {
    return "#bfe6df"; // soft aqua
  }

  return "#dceecb"; // soft plains / land
}


// --------------------------------------------------
// Digital Citizenship Feature
// --------------------------------------------------

type DigitalCitizenshipTopic = {
  id: string;
  icon: string;
  title: string;
  titleBn: string;
  intro: string;
  introBn: string;
  points: string[];
  pointsBn: string[];
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const DIGITAL_CITIZENSHIP_TOPICS: DigitalCitizenshipTopic[] = [
  {
    id: "fake-news",
    icon: "📰",
    title: "Fake News",
    titleBn: "ফেক নিউজ",
    intro: "Learn how to pause, check and verify information before sharing it.",
    introBn: "কোনো তথ্য শেয়ার করার আগে কীভাবে থামবেন, যাচাই করবেন এবং সত্যতা দেখবেন তা শিখুন।",
    points: [
      "Check the source and date.",
      "Compare the claim with more than one reliable source.",
      "Be careful with shocking headlines, edited images and viral posts.",
    ],
    pointsBn: [
      "Source এবং date যাচাই করুন।",
      "একাধিক নির্ভরযোগ্য source-এর সঙ্গে তথ্য মিলিয়ে দেখুন।",
      "চমকপ্রদ headline, edited image এবং viral post সম্পর্কে সতর্ক থাকুন।",
    ],
    question: "Before sharing a surprising news post, what should you do first?",
    options: [
      "Share it quickly",
      "Check the source and verify the claim",
      "Trust the comments",
      "Forward it to friends",
    ],
    answer: 1,
    explanation: "Checking the source and verifying the claim helps you avoid spreading misinformation.",
  },
  {
    id: "reliable-sources",
    icon: "🔎",
    title: "Reliable Sources",
    titleBn: "নির্ভরযোগ্য Source",
    intro: "Build the habit of checking who created the information, why and where it came from.",
    introBn: "কে তথ্যটি তৈরি করেছে, কেন করেছে এবং তথ্যটি কোথা থেকে এসেছে—এসব যাচাই করার অভ্যাস গড়ে তুলুন।",
    points: [
      "Look for the author or organisation.",
      "Check evidence, references and publication date.",
      "Prefer official, educational or well-established sources when possible.",
    ],
    pointsBn: [
      "Author বা organisation-এর নাম দেখুন।",
      "Evidence, references এবং publication date যাচাই করুন।",
      "সম্ভব হলে official, educational বা established source ব্যবহার করুন।",
    ],
    question: "Which is the strongest sign that an online claim needs more checking?",
    options: [
      "It provides evidence and sources",
      "It names the author",
      "It makes a strong claim but gives no evidence",
      "It has a publication date",
    ],
    answer: 2,
    explanation: "A strong claim without evidence or sources deserves extra verification before you trust it.",
  },
  {
    id: "cyber-safety",
    icon: "🛡️",
    title: "Cyber Safety",
    titleBn: "সাইবার সেফটি",
    intro: "Protect your accounts, devices and personal information online.",
    introBn: "অনলাইনে নিজের account, device এবং personal information নিরাপদ রাখুন।",
    points: [
      "Use strong, unique passwords.",
      "Never share passwords or one-time codes with others.",
      "Be careful with unknown links, files and login pages.",
    ],
    pointsBn: [
      "Strong ও unique password ব্যবহার করুন।",
      "Password বা one-time code কারও সঙ্গে share করবেন না।",
      "Unknown link, file এবং login page সম্পর্কে সতর্ক থাকুন।",
    ],
    question: "What is the safest response to an unexpected message asking for your OTP?",
    options: [
      "Send the OTP",
      "Post the OTP publicly",
      "Do not share it and verify the sender through a trusted channel",
      "Reply with your password instead",
    ],
    answer: 2,
    explanation: "OTP codes are private security credentials. Do not share them; verify suspicious requests independently.",
  },
  {
    id: "social-media",
    icon: "📱",
    title: "Responsible Social Media",
    titleBn: "Responsible Social Media",
    intro: "Use social platforms thoughtfully, respectfully and with awareness of your digital footprint.",
    introBn: "Social media চিন্তাশীলভাবে, সম্মানের সঙ্গে এবং নিজের digital footprint মাথায় রেখে ব্যবহার করুন।",
    points: [
      "Think before posting or commenting.",
      "Respect other people's privacy and dignity.",
      "Remember that online posts can be copied and reshared.",
    ],
    pointsBn: [
      "Post বা comment করার আগে ভাবুন।",
      "অন্যের privacy এবং dignity সম্মান করুন।",
      "Online post copy বা reshare হয়ে যেতে পারে—এটা মনে রাখুন।",
    ],
    question: "Why should you think before posting something online?",
    options: [
      "Because posts can leave a lasting digital footprint",
      "Because every post gets many likes",
      "Because the internet never stores anything",
      "Because comments cannot be shared",
    ],
    answer: 0,
    explanation: "Online content can remain accessible, be copied or reshared, so thoughtful posting matters.",
  },
  {
    id: "responsible-ai",
    icon: "🤖",
    title: "Responsible AI Use",
    titleBn: "AI-এর Responsible Use",
    intro: "Use AI as a learning aid while checking accuracy, protecting privacy and keeping your own judgement.",
    introBn: "AI-কে শেখার সহায়ক হিসেবে ব্যবহার করুন, তবে accuracy যাচাই করুন, privacy রক্ষা করুন এবং নিজের judgement বজায় রাখুন।",
    points: [
      "Verify important AI-generated information.",
      "Do not upload sensitive personal information unnecessarily.",
      "Use AI to support learning, not to replace your own thinking.",
    ],
    pointsBn: [
      "গুরুত্বপূর্ণ AI-generated তথ্য যাচাই করুন।",
      "অপ্রয়োজনীয়ভাবে sensitive personal information upload করবেন না।",
      "AI-কে learning support হিসেবে ব্যবহার করুন, নিজের চিন্তাকে replace করতে নয়।",
    ],
    question: "What is a responsible way to use AI for schoolwork?",
    options: [
      "Copy the answer without checking it",
      "Use AI output as a starting point and verify it",
      "Share private data with the AI",
      "Let AI make every decision for you",
    ],
    answer: 1,
    explanation: "Responsible AI use includes verification, privacy awareness and keeping your own reasoning involved.",
  },
  {
    id: "copyright",
    icon: "©️",
    title: "Copyright & Plagiarism",
    titleBn: "Copyright ও Plagiarism",
    intro: "Learn to respect creators and give credit when using ideas, words, images or media.",
    introBn: "অন্যের idea, লেখা, image বা media ব্যবহার করার সময় creator-কে সম্মান করুন এবং credit দিন।",
    points: [
      "Give credit to the original creator.",
      "Use quotation marks for direct quotations and cite sources.",
      "Create your own work instead of presenting copied work as your own.",
    ],
    pointsBn: [
      "Original creator-কে credit দিন।",
      "Direct quotation হলে quotation marks ও source দিন।",
      "Copied work নিজের নামে না দিয়ে নিজের কাজ তৈরি করুন।",
    ],
    question: "What is plagiarism?",
    options: [
      "Creating your own original work",
      "Giving credit to a source",
      "Presenting someone else's work or ideas as your own",
      "Using a bibliography",
    ],
    answer: 2,
    explanation: "Plagiarism means using another person's work or ideas and presenting them as your own without proper credit.",
  },
];


// --------------------------------------------------
// Geography Innovation Zone
// --------------------------------------------------
type GeographyInnovationSection =
  | "classroom"
  | "living";

const GEOGRAPHY_INNOVATION_SECTIONS: Record<
  GeographyInnovationSection,
  {
    icon: string;
    tag: string;
    title: string;
    description: string;
    points: string[];
  }
> = {
  classroom: {
    icon: "🌍",
    tag: "DIGITAL CLASSROOM",
    title: "Digital Geography Classroom",
    description:
      "Learn Geography through interactive lessons, animation, simulation, climate and map-based exploration.",
    points: [
      "Interactive Geography lessons",
      "Animation ও simulation",
      "3D Earth learning",
      "Climate ও weather concepts",
      "Maps ও satellite imagery",
    ],
  },
  living: {
    icon: "🌊",
    tag: "জ্যান্ত ভূগোল",
    title: "জ্যান্ত ভূগোল",
    description:
      "Real-life events থেকে Geography শেখো—নদীভাঙন, বন্যা, ঘূর্ণিঝড়, ভূমিকম্প ও জলবায়ু পরিবর্তন।",
    points: [
      "নদীভাঙন ও নদীর পরিবর্তন",
      "বন্যা ও ঘূর্ণিঝড়",
      "ভূমিকম্প",
      "জলবায়ু পরিবর্তন",
      "স্থানীয় পরিবেশ",
    ],
  },
};

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"email"|"reset">("email");

  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem("language") as Language) || "en"
  );

  const t = translations[language];
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [profileSaved, setProfileSaved] = useState(
    localStorage.getItem("student_profile_saved") === "true"
  );

  const [explorerOpen, setExplorerOpen] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState("");

  const [indiaMapOpen, setIndiaMapOpen] = useState(false);

  const [selectedState, setSelectedState] = useState("");

  const [challengeOpen, setChallengeOpen] = useState(false);

  const [challengeTarget, setChallengeTarget] = useState("");
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizShowResult, setQuizShowResult] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [_quizLoading, setQuizLoading] = useState(false);

  // --------------------------------------------------
  // Chapter-wise Take Quiz System
  // --------------------------------------------------
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterList, setChapterList] = useState<Array<{ chapter: string; question_count: number }>>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [selectedChapterName, setSelectedChapterName] = useState<string>("All");

  // Teacher Chapter Quiz Manager
  const [teacherQuizManagerOpen, setTeacherQuizManagerOpen] = useState(false);
  const [teacherQuizSaving, setTeacherQuizSaving] = useState(false);
  const [teacherQuizQuestions, setTeacherQuizQuestions] = useState<any[]>([]);
  const [teacherQuizFilterChapter, setTeacherQuizFilterChapter] = useState<string>("All");
  const [teacherQuizForm, setTeacherQuizForm] = useState({
    chapter: "__new__",
    customChapter: "",
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "0",
    explanation: "",
  });

  // --------------------------------------------------
  // Daily Geography Curiosity
  // --------------------------------------------------
  const [curiosity, setCuriosity] = useState<any>(null);
  const [curiosityLoading, setCuriosityLoading] = useState(false);
  const [curiositySelected, setCuriositySelected] = useState<number | null>(null);
  const [curiosityResult, setCuriosityResult] = useState<any>(null);
  const [curiosityHistory, setCuriosityHistory] = useState<any[]>([]);
  const [curiosityHistoryOpen, setCuriosityHistoryOpen] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem("notifications_enabled") === "true"
  );
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // --------------------------------------------------
  // Weekly Mock Test
  // --------------------------------------------------
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [mockTestOpen, setMockTestOpen] = useState(false);
  const [selectedMockTest, setSelectedMockTest] = useState<any>(null);
  const [mockAnswers, setMockAnswers] = useState<Record<number, number>>({});
  const [mockResult, setMockResult] = useState<any>(null);
  const [mockLoading, setMockLoading] = useState(false);
  const [mockSubmitting, setMockSubmitting] = useState(false);

  // --------------------------------------------------
  // Teacher Mock Test Manager
  // --------------------------------------------------
  const [userRole, setUserRole] = useState(
    localStorage.getItem("user_role") || "student"
  );
  const [teacherMockOpen, setTeacherMockOpen] = useState(false);
  const [teacherTest, setTeacherTest] = useState<any>(null);
  const [teacherQuestions, setTeacherQuestions] = useState<any[]>([]);
  const [teacherSaving, setTeacherSaving] = useState(false);
  const [teacherPublishing, setTeacherPublishing] = useState(false);

  // Student profile + teacher progress
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentDashboardProfile, setStudentDashboardProfile] = useState<any>(null);
  const [studentActivity, setStudentActivity] = useState<any[]>([]);
  const [teacherStudents, setTeacherStudents] = useState<any[]>([]);

  // Student Points & Streak Stats
  const [studentStats, setStudentStats] = useState<{
    points: number;
    day_streak: number;
    curiosity_xp: number;
    activity_points: number;
    mock_points: number;
    curiosity_answered: number;
    mock_attempts: number;
    activity_count: number;
  }>({
    points: 0,
    day_streak: 0,
    curiosity_xp: 0,
    activity_points: 0,
    mock_points: 0,
    curiosity_answered: 0,
    mock_attempts: 0,
    activity_count: 0,
  });

  // Admin Teacher Verification & Approval
  const [teacherApprovalsOpen, setTeacherApprovalsOpen] = useState(false);
  const [adminTeachers, setAdminTeachers] = useState<{
    pending: any[];
    approved: any[];
    pending_count: number;
    approved_count: number;
  }>({
    pending: [],
    approved: [],
    pending_count: 0,
    approved_count: 0,
  });
  const [adminTeachersLoading, setAdminTeachersLoading] = useState(false);
  const [adminActionMessage, setAdminActionMessage] = useState("");
  const [selectedTeacherStudent, setSelectedTeacherStudent] = useState<any>(null);
  const [teacherProgressLoading, setTeacherProgressLoading] = useState(false);
  const [teacherStudentLoading, setTeacherStudentLoading] = useState(false);
  const [teacherProgressOpen, setTeacherProgressOpen] = useState(false);
  const [teacherTestForm, setTeacherTestForm] = useState({
    title: "",
    description: "",
    week: "",
  });
  const [teacherQuestionForm, setTeacherQuestionForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "0",
    explanation: "",
  });

  const [learningOpen, setLearningOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LearningContent | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [learningContent, setLearningContent] = useState<LearningContent[]>(
    loadLearningContent
  );
  const [contentForm, setContentForm] = useState({
    subject: "Geography",
    chapter: "",
    title: "",
    description: "",
    videoUrl: "",
    imageUrl: "",
    notes: "",
    explanation: "",
  });
  const [lessonPdfFile, setLessonPdfFile] = useState<File | null>(null);
  const [lessonPdfLoading, setLessonPdfLoading] = useState(false);

  // Teacher Geography Topic + Picture
  const [geographyTopics, setGeographyTopics] = useState<GeographyTopic[]>([]);
  const [geographyTopicName, setGeographyTopicName] = useState("");
  const [geographyTopicImage, setGeographyTopicImage] = useState<File | null>(null);
  const [geographyTopicLoading, setGeographyTopicLoading] = useState(false);

  const [challengePoints, setChallengePoints] = useState(0);

  const [challengeMessage, setChallengeMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");

  const [className, setClassName] = useState("");
  const [board, setBoard] = useState("");
  const [medium, setMedium] = useState("");

  const [message, setMessage] = useState("");
  const [countryDetails, setCountryDetails] = useState<any>(null);

  const [loadingCountry, setLoadingCountry] = useState(false);
  // Student Impact
const [impactStats, setImpactStats] = useState({
  learning: 0,
  activities: 0,
  assessments: 0,
  projects: 0,
  impactScore: 0,
});

const [innovationOpen, setInnovationOpen] = useState(false);

const [innovationForm, setInnovationForm] = useState({
  type: "Geography Model",
  title: "",
  description: "",
});

  // Weather Station + Climate Change Lab
  const [weatherStationOpen, setWeatherStationOpen] = useState(false);
  const [climateChangeLabOpen, setClimateChangeLabOpen] = useState(false);
  // AI Chat
  const [aiChatOpen, setAiChatOpen] = useState(false);
  // Geography Innovation Zone
  const [geographyInnovationOpen, setGeographyInnovationOpen] = useState(false);
  const [geographyInnovationSection, setGeographyInnovationSection] =
    useState<GeographyInnovationSection>("classroom");

  function openGeographyInnovation(
    section: GeographyInnovationSection = "classroom"
  ) {
    setGeographyInnovationSection(section);
    setGeographyInnovationOpen(true);
  }


  // Digital Citizenship
  const [digitalCitizenshipOpen, setDigitalCitizenshipOpen] = useState(false);
  const [selectedDigitalTopic, setSelectedDigitalTopic] = useState("fake-news");
  const [digitalAnswer, setDigitalAnswer] = useState<number | null>(null);
  const [digitalSubmitted, setDigitalSubmitted] = useState(false);
  const [digitalCompletedTopics, setDigitalCompletedTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("digital_citizenship_completed");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
    // --------------------------------------------------
  // Location + Weather
  // --------------------------------------------------

  const [_locationName, setLocationName] = useState("");
  const [_weather, setWeather] = useState<{
    temperature: number | null;
    weatherCode: number | null;
    rain: number;
    rainChance: number;
  } | null>(null);

  const [_weatherLoading, setWeatherLoading] = useState(false);

  async function loadCurrentUser() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUserRole("student");
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return null;
      }

      const role = data.role || data.user?.role || "student";
      setCurrentUser(data);
      setUserRole(role);
      localStorage.setItem("user_role", role);

      if (role === "teacher") {
        setProfileSaved(true);
      }

      return role;
    } catch (error) {
      console.error("Current user error:", error);
      return null;
    }
  }

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      loadCurrentUser();
    }
  }, []);

  async function loadLocationWeather() {
    if (!navigator.geolocation) {
      setLocationName("Location unavailable");
      return;
    }

    setWeatherLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          // Reverse geocoding: coordinates -> city/country
          const locationResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10`
          );

          if (locationResponse.ok) {
            const locationData = await locationResponse.json();
            const address = locationData.address || {};

            const city =
              address.city ||
              address.town ||
              address.village ||
              address.municipality ||
              address.state ||
              "Current Location";

            const country = address.country || "";

            setLocationName(
              country ? `${city}, ${country}` : city
            );
          } else {
            setLocationName("Current Location");
          }

          // Weather
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,rain,precipitation&hourly=precipitation_probability&timezone=auto`
          );

          if (!weatherResponse.ok) {
            throw new Error("Weather request failed");
          }

          const weatherData = await weatherResponse.json();

          setWeather({
            temperature:
              typeof weatherData.current?.temperature_2m === "number"
                ? weatherData.current.temperature_2m
                : null,

            weatherCode:
              typeof weatherData.current?.weather_code === "number"
                ? weatherData.current.weather_code
                : null,

            rain:
              typeof weatherData.current?.rain === "number"
                ? weatherData.current.rain
                : 0,

            rainChance:
              Array.isArray(
                weatherData.hourly?.precipitation_probability
              )
                ? Number(
                    weatherData.hourly.precipitation_probability[0] || 0
                  )
                : 0,
          });
        } catch (error) {
          console.error("Location/weather error:", error);
          setLocationName("Weather unavailable");
          setWeather(null);
        } finally {
          setWeatherLoading(false);
        }
      },
      (error) => {
        console.error("Location permission error:", error);
        setLocationName("Location permission needed");
        setWeather(null);
        setWeatherLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }
  async function loadImpactStats() {
  const token = localStorage.getItem("access_token");

  if (!token) return;

  try {
    const response = await fetch(
      `${API_URL}/student/activity`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) return;

    const activities = await response.json();

    const learning = activities.filter(
      (item: any) => item.activity_type === "learning"
    ).length;

    const assessments = activities.filter(
      (item: any) => item.activity_type === "assessment"
    ).length;

    const projects = activities.filter(
      (item: any) => item.activity_type === "innovation"
    ).length;

    const activityCount = activities.length;

    const totalScore = activities.reduce(
      (sum: number, item: any) => sum + (item.score || 0),
      0
    );

    setImpactStats({
      learning,
      activities: activityCount,
      assessments,
      projects,
      impactScore: totalScore,
    });
  } catch (error) {
    console.error("Impact stats error:", error);
  }
}

async function submitInnovationProject(
  e: FormEvent
) {
  e.preventDefault();

  const token = localStorage.getItem("access_token");

  if (!token) return;

  try {
    const response = await fetch(
      `${API_URL}/student/activity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity_type: "innovation",
          title: innovationForm.title,
          score: null,
          details:
            `${innovationForm.type}: ${innovationForm.description}`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Project submission failed");
    }

    alert("Project submitted successfully! 🚀");

    setInnovationForm({
      type: "Geography Model",
      title: "",
      description: "",
    });

    setInnovationOpen(false);

    loadImpactStats();
  } catch (error) {
    console.error(error);
    alert("Project submit করা যাচ্ছে না।");
  }
}


  function openDigitalCitizenship() {
    setDigitalCitizenshipOpen(true);
    setSelectedDigitalTopic("fake-news");
    setDigitalAnswer(null);
    setDigitalSubmitted(false);
  }

  function selectDigitalTopic(topicId: string) {
    setSelectedDigitalTopic(topicId);
    setDigitalAnswer(null);
    setDigitalSubmitted(false);
  }

  async function submitDigitalCitizenshipQuiz() {
    const topic = DIGITAL_CITIZENSHIP_TOPICS.find(
      (item) => item.id === selectedDigitalTopic
    );

    if (!topic || digitalAnswer === null || digitalSubmitted) return;

    const correct = digitalAnswer === topic.answer;
    const score = correct ? 10 : 0;

    setDigitalSubmitted(true);

    if (!digitalCompletedTopics.includes(topic.id)) {
      const updated = [...digitalCompletedTopics, topic.id];
      setDigitalCompletedTopics(updated);
      localStorage.setItem(
        "digital_citizenship_completed",
        JSON.stringify(updated)
      );
    }

    await logStudentActivity(
      "assessment",
      `Digital Citizenship: ${topic.title}`,
      score
    );

    await loadImpactStats();
    await loadStudentDashboardData();
  }

  function changeLanguage(lang: Language) {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }
    useEffect(() => {
    if (loggedIn && profileSaved) {
      loadLocationWeather();
    }
  }, [loggedIn, profileSaved]);

  useEffect(() => {
    if (loggedIn && profileSaved) {
      loadImpactStats();
    }
  }, [loggedIn, profileSaved]);

  async function getCountryDetails(countryName: string) {
    setLoadingCountry(true);
    setCountryDetails(null);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/geonames/country?name=${encodeURIComponent(
          countryName
        )}`
      );

      if (!response.ok) {
        throw new Error("Country request failed");
      }

      const data = await response.json();

      console.log("GeoNames country:", data);

      if (data.error) {
        setMessage(data.error);
        return;
      }

      setCountryDetails(data);
    } catch (error) {
      console.error("GeoNames error:", error);
      setMessage("GeoNames API connection failed");
      setCountryDetails(null);
    } finally {
      setLoadingCountry(false);
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetchWithTimeout(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      }, 30000);
      const data = await res.json();
      if (!res.ok) { setMessage(data.detail || "Something went wrong."); return; }
      if (data.found) {
        setResetToken(data.reset_token);
        setResetStep("reset");
        setMessage("");
      } else {
        setMessage("❌ এই email দিয়ে কোনো account নেই।");
      }
    } catch {
      setMessage("Connection failed. Try again.");
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (newPassword.length < 6) { setMessage("Password কমপক্ষে ৬ character হতে হবে।"); return; }
    try {
      const res = await fetchWithTimeout(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
      }, 30000);
      const data = await res.json();
      if (!res.ok) { setMessage(data.detail || "Reset failed."); return; }
      setMessage("✅ Password reset হয়েছে! এখন login করুন।");
      setForgotMode(false);
      setResetStep("email");
      setForgotEmail("");
      setResetToken("");
      setNewPassword("");
      setIsLogin(true);
    } catch {
      setMessage("Connection failed. Try again.");
    }
  }

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    const body = isLogin
      ? {
          email,
          password,
        }
      : {
          name,
          email,
          password,
          role: selectedRole,
        };

    try {
      const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }, 45000);

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Something went wrong");
        return;
      }

      if (isLogin) {
        localStorage.setItem("access_token", data.access_token);
        // Store role from login response directly — don't wait for /auth/me
        const role = data.user?.role || "student";
        setUserRole(role);
        setCurrentUser(data.user || null);
        localStorage.setItem("user_role", role);
        if (role === "teacher") {
          setProfileSaved(true);
        }
        setLoggedIn(true);
        // Load full user profile in background (non-blocking)
        void loadCurrentUser();
      } else {
        setMessage("Registration successful! 🎉");
        setIsLogin(true);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setMessage("Server response timeout। Render free tier-এ প্রথমবার 30-60 সেকেন্ড লাগে। আবার try করুন।");
      } else {
        setMessage(t.backendError);
      }
    }
  }

  async function handleProfile(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    const profileData = {
      class_name: className.trim(),
      board: board.trim(),
      medium: medium.trim(),
    };

    if (
      !profileData.class_name ||
      !profileData.board ||
      !profileData.medium
    ) {
      setMessage("Please fill Class, Board and Medium.");
      return;
    }

    // Keep the dashboard transition independent from a temporary
    // backend/profile response problem.
    setStudentDashboardProfile(profileData);
    setProfileSaved(true);
    localStorage.setItem(
      "student_profile_saved",
      "true"
    );
    localStorage.setItem(
      "student_profile_local",
      JSON.stringify(profileData)
    );

    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/student-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(
          "Student profile backend save failed:",
          response.status,
          data
        );
        return;
      }

      setStudentDashboardProfile(
        data && typeof data === "object" && data.class_name
          ? data
          : profileData
      );
    } catch (error) {
      console.error(
        "Student profile backend connection error:",
        error
      );
    }
  }

  async function loadStudentDashboardData() {
    const token = localStorage.getItem("access_token");
    if (!token || userRole !== "student") return;

    try {
      const [profileResponse, activityResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/student-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/student/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/student/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (profileResponse.ok) {
        setStudentDashboardProfile(await profileResponse.json());
      }
      if (activityResponse.ok) {
        const data = await activityResponse.json();
        setStudentActivity(Array.isArray(data) ? data : []);
      }
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStudentStats(statsData);
      }
    } catch (error) {
      console.error("Student dashboard data error:", error);
    }
  }

  // --------------------------------------------------
  // Admin Teacher Verification & Approval Functions
  // --------------------------------------------------

  async function loadAdminTeachers() {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setAdminTeachersLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setAdminTeachers(data);
      }
    } catch (error) {
      console.error("Error loading teachers for admin:", error);
    } finally {
      setAdminTeachersLoading(false);
    }
  }

  async function approveTeacher(teacherId: number, teacherName: string) {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/admin/teachers/${teacherId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setAdminActionMessage(data.message || `Teacher ${teacherName} approved! ✅`);
        await loadAdminTeachers();
      } else {
        alert(data.detail || "Approval failed");
      }
    } catch (error) {
      console.error("Approve teacher error:", error);
      alert("Failed to approve teacher");
    }
  }

  async function rejectTeacher(teacherId: number, teacherName: string) {
    if (!window.confirm(`Are you sure you want to reject and remove registration for '${teacherName}'?`)) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/admin/teachers/${teacherId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setAdminActionMessage(data.message || `Teacher registration for ${teacherName} rejected.`);
        await loadAdminTeachers();
      } else {
        alert(data.detail || "Rejection failed");
      }
    } catch (error) {
      console.error("Reject teacher error:", error);
      alert("Failed to reject teacher");
    }
  }

  async function revokeTeacher(teacherId: number, teacherName: string) {
    if (!window.confirm(`Are you sure you want to revoke approval for '${teacherName}'? They will no longer be able to access teacher features.`)) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/admin/teachers/${teacherId}/revoke`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setAdminActionMessage(data.message || `Approval revoked for ${teacherName}.`);
        await loadAdminTeachers();
      } else {
        alert(data.detail || "Revoke failed");
      }
    } catch (error) {
      console.error("Revoke teacher error:", error);
      alert("Failed to revoke teacher approval");
    }
  }

  async function loadTeacherStudents() {
    const token = localStorage.getItem("access_token");
    if (!token || userRole !== "teacher") return;

    setTeacherProgressLoading(true);
    try {
      const response = await fetch(`${API_URL}/teacher/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.detail || "Could not load student progress");
        return;
      }
      setTeacherStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Teacher student progress error:", error);
    } finally {
      setTeacherProgressLoading(false);
    }
  }

  async function openTeacherStudent(studentId: number) {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setTeacherStudentLoading(true);
    try {
      const response = await fetch(`${API_URL}/teacher/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.detail || "Could not load student details");
        return;
      }
      setSelectedTeacherStudent(data);
    } catch (error) {
      console.error("Teacher student detail error:", error);
    } finally {
      setTeacherStudentLoading(false);
    }
  }

  async function logStudentActivity(
    activityType: string,
    title: string,
    score?: number,
    details?: Record<string, unknown>
  ) {
    const token = localStorage.getItem("access_token");
    if (!token || userRole !== "student") return;

    try {
      await fetch(`${API_URL}/student/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity_type: activityType,
          title,
          score: score ?? null,
          details: details ?? null,
        }),
      });
    } catch (error) {
      console.error("Student activity logging error:", error);
    }
  }

  // --------------------------------------------------
  // Daily Geography Curiosity Functions
  // --------------------------------------------------

  async function loadTodayCuriosity() {
    const token = localStorage.getItem("access_token");
    setCuriosityLoading(true);

    try {
      const response = await fetch(`${API_URL}/curiosity/today`, {
        method: "GET",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        setCuriosity(null);
        return;
      }

      setCuriosity(data);
      setCuriositySelected(null);
      setCuriosityResult(null);
    } catch (error) {
      console.error("Curiosity loading error:", error);
      setCuriosity(null);
    } finally {
      setCuriosityLoading(false);
    }
  }

  async function checkUserLocationStatus() {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/curiosity/location`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.location_enabled) {
          setLocationEnabled(true);
        }
      }
    } catch (e) {
      console.warn("Location check error", e);
    }
  }

  async function enableCuriosityLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const token = localStorage.getItem("access_token");

        try {
          const response = await fetch(`${API_URL}/curiosity/location`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ latitude, longitude }),
          });

          const data = await response.json();

          if (!response.ok) {
            setLocationMessage(data.detail || "Could not save location.");
            return;
          }

          setLocationEnabled(true);
          const placeName = [data.city, data.region].filter(Boolean).join(", ");
          setLocationMessage(
            placeName
              ? `Location enabled (${placeName})! Your curiosity is personalized 🌍`
              : "Location enabled! Your Curiosity will now be personalized 🌍"
          );
          // Immediately reload today's curiosity question for this location
          loadTodayCuriosity();
        } catch (error) {
          console.error("Location save error:", error);
          setLocationMessage("Could not connect to the backend.");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage(
            "Location permission was not allowed. General India/World Geography Curiosity will continue."
          );
        } else {
          setLocationMessage("Could not access your location right now.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60 * 60 * 1000 }
    );
  }

  async function enableCuriosityNotifications() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setNotificationMessage("Please login again to enable notifications.");
      return;
    }

    if (!("Notification" in window)) {
      setNotificationMessage(
        "This browser does not support notifications."
      );
      return;
    }

    setNotificationsLoading(true);
    setNotificationMessage("");

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setNotificationMessage(
          "Notification permission was denied. Please allow notifications in site settings (ব্রাউজার সেটিংসে নোটিফিকেশন এলাউ করুন)."
        );
        return;
      }

      let pushSubscribed = false;

      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          await navigator.serviceWorker.ready;

          const keyResponse = await fetch(`${API_URL}/notifications/vapid-public-key`);
          if (keyResponse.ok) {
            const keyData = await keyResponse.json();
            const cleanKey = (keyData.public_key || "").trim().replace(/^["']|["']$/g, "");

            if (cleanKey) {
              function urlBase64ToUint8Array(base64String: string) {
                const clean = base64String.trim().replace(/^["']|["']$/g, "");
                const padding = "=".repeat((4 - (clean.length % 4)) % 4);
                const base64 = (clean + padding).replace(/-/g, "+").replace(/_/g, "/");
                const rawData = window.atob(base64);
                return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
              }

              let subscription = await registration.pushManager.getSubscription();
              if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(cleanKey),
                });
              }

              const subscriptionJson = subscription.toJSON();
              if (subscriptionJson.endpoint && subscriptionJson.keys?.p256dh && subscriptionJson.keys?.auth) {
                await fetch(`${API_URL}/notifications/subscribe`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    endpoint: subscriptionJson.endpoint,
                    keys: {
                      p256dh: subscriptionJson.keys.p256dh,
                      auth: subscriptionJson.keys.auth,
                    },
                  }),
                });
                pushSubscribed = true;
              }
            }
          }
        } catch (swErr) {
          console.warn("Service worker / push subscription note:", swErr);
        }
      }

      setNotificationsEnabled(true);
      localStorage.setItem("notifications_enabled", "true");
      setNotificationMessage(
        pushSubscribed
          ? "Curiosity Alerts enabled! 🔔 Daily mystery questions will notify you."
          : "Curiosity Alerts enabled! 🔔 Daily geography notifications active."
      );

      // Trigger immediate confirmation notification
      try {
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && reg.showNotification) {
            reg.showNotification("🌍 Curiosity Alerts Enabled!", {
              body: "You'll now receive daily Geography Mystery alerts! Stay curious.",
              icon: "/favicon.svg",
            });
          } else {
            new Notification("🌍 Curiosity Alerts Enabled!", {
              body: "You'll now receive daily Geography Mystery alerts! Stay curious.",
              icon: "/favicon.svg",
            });
          }
        } else {
          new Notification("🌍 Curiosity Alerts Enabled!", {
            body: "You'll now receive daily Geography Mystery alerts! Stay curious.",
            icon: "/favicon.svg",
          });
        }
      } catch (notifErr) {
        console.warn("Notification display note:", notifErr);
      }
    } catch (error) {
      console.error("Notification setup error:", error);
      setNotificationMessage(
        error instanceof Error ? error.message : "Could not enable notifications."
      );
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function loadCuriosityHistory() {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/curiosity/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) return;
      setCuriosityHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Curiosity history loading error:", error);
    }
  }

  async function submitCuriosityAnswer() {
    if (!curiosity || curiositySelected === null || curiosityResult) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    setCuriosityLoading(true);

    try {
      const response = await fetch(`${API_URL}/curiosity/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question_id: curiosity.id,
          answer: curiositySelected,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Curiosity answer submit failed");
        return;
      }

      setCuriosityResult(data);
      await loadCuriosityHistory();
      void loadStudentDashboardData();
    } catch (error) {
      console.error("Curiosity answer error:", error);
      setMessage(t.backendError);
    } finally {
      setCuriosityLoading(false);
    }
  }

  useEffect(() => {
    if (loggedIn && profileSaved) {
      loadGeographyTopics();
      checkUserLocationStatus();
      loadTodayCuriosity();
      loadCuriosityHistory();
      if (userRole === "student") {
        loadStudentDashboardData();
      } else if (userRole === "teacher" || userRole === "admin") {
        loadTeacherStudents();
        loadAdminTeachers();
      }
      // Load lessons from backend for everyone
      loadLearningContentFromBackend();
    }
  }, [loggedIn, profileSaved, userRole]);

  // --------------------------------------------------
  // Chapter-wise Quiz Functions
  // --------------------------------------------------

  async function loadLearningContentFromBackend() {
    try {
      const res = await fetch(`${API_URL}/learning-content/`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Map backend fields to frontend LearningContent type
          const mapped: LearningContent[] = data.map((item: any) => ({
            id: String(item.id),
            subject: item.subject || "Geography",
            chapter: item.chapter || "",
            title: item.title || "",
            description: item.description || "",
            videoUrl: item.video_url || "",
            imageUrl: item.image_url || "",
            notes: item.notes || "",
            explanation: item.explanation || "",
            pdf_data: item.pdf_data || "",
            pdf_name: item.pdf_name || "",
          }));
          setLearningContent(mapped);
        }
        // If backend is empty, keep localStorage defaults
      }
    } catch {
      // If backend fails, keep localStorage content
    }
  }
  async function loadQuizChapters() {
    setChaptersLoading(true);
    try {
      const response = await fetch(`${API_URL}/chapter-quiz/chapters`);
      if (response.ok) {
        const data = await response.json();
        const chapters = data.chapters || [];
        setChapterList(chapters);
        // Sync form to first existing chapter if available
        if (chapters.length > 0) {
          setTeacherQuizForm(f => f.chapter === "__new__" ? { ...f, chapter: chapters[0].chapter } : f);
        }
      }
    } catch (err) {
      console.error("Failed to load chapters:", err);
    } finally {
      setChaptersLoading(false);
    }
  }

  function openTakeQuizModal() {
    setChapterModalOpen(true);
    loadQuizChapters();
  }

  async function startChapterQuiz(chapterName: string = "All") {
    setQuizLoading(true);
    setSelectedChapterName(chapterName);
    setQuizQuestion(0);
    setQuizScore(0);
    setQuizAnswer(null);

    try {
      const url =
        chapterName && chapterName !== "All"
          ? `${API_URL}/chapter-quiz/questions?chapter=${encodeURIComponent(chapterName)}&limit=10`
          : `${API_URL}/chapter-quiz/questions?limit=10`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const formatted: QuizQuestion[] = data.map((q: any) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
          }));
          setQuizQuestions(formatted);
          setChapterModalOpen(false);
          setQuizOpen(true);
          return;
        }
      }
      const fallback = generateQuizQuestions([], 10);
      setQuizQuestions(fallback);
      setChapterModalOpen(false);
      setQuizOpen(true);
    } catch (err) {
      console.error("Chapter quiz error:", err);
      const fallback = generateQuizQuestions([], 10);
      setQuizQuestions(fallback);
      setChapterModalOpen(false);
      setQuizOpen(true);
    } finally {
      setQuizLoading(false);
    }
  }

  // Quiz launched via openTakeQuizModal

  async function loadTeacherQuizQuestions(ch: string = "All") {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const url =
        ch && ch !== "All"
          ? `${API_URL}/chapter-quiz/teacher/questions?chapter=${encodeURIComponent(ch)}`
          : `${API_URL}/chapter-quiz/teacher/questions`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTeacherQuizQuestions(data);
      }
    } catch (err) {
      console.error("Failed to load teacher quiz questions:", err);
    }
  }

  async function addTeacherQuizQuestion(e: FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      setMessage("Please login as teacher.");
      return;
    }

    const finalChapter =
      teacherQuizForm.chapter === "__new__"
        ? teacherQuizForm.customChapter.trim()
        : teacherQuizForm.chapter.trim();

    if (!finalChapter) {
      setMessage("Please enter or select a chapter name.");
      return;
    }

    if (!teacherQuizForm.question.trim()) {
      setMessage("Please enter the question text.");
      return;
    }

    if (
      !teacherQuizForm.option_a.trim() ||
      !teacherQuizForm.option_b.trim() ||
      !teacherQuizForm.option_c.trim() ||
      !teacherQuizForm.option_d.trim()
    ) {
      setMessage("Please provide all 4 options.");
      return;
    }

    setTeacherQuizSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/chapter-quiz/teacher/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapter: finalChapter,
          question: teacherQuizForm.question.trim(),
          option_a: teacherQuizForm.option_a.trim(),
          option_b: teacherQuizForm.option_b.trim(),
          option_c: teacherQuizForm.option_c.trim(),
          option_d: teacherQuizForm.option_d.trim(),
          correct_answer: Number(teacherQuizForm.correct_answer),
          explanation: teacherQuizForm.explanation.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.detail || "Failed to add question.");
        return;
      }

      setMessage(`Question added to chapter "${finalChapter}"! ✅`);
      setTeacherQuizForm((prev) => ({
        ...prev,
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "0",
        explanation: "",
      }));
      loadTeacherQuizQuestions(teacherQuizFilterChapter);
      loadQuizChapters();
    } catch (err) {
      console.error("Save question error:", err);
      setMessage("Backend connection error.");
    } finally {
      setTeacherQuizSaving(false);
    }
  }

  async function deleteTeacherQuizQuestion(id: number) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/chapter-quiz/teacher/question/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTeacherQuizQuestions((prev) => prev.filter((q) => q.id !== id));
        loadQuizChapters();
      }
    } catch (err) {
      console.error("Delete question error:", err);
    }
  }

  // --------------------------------------------------
  // Weekly Mock Test Functions
  // --------------------------------------------------

  async function loadMockTests() {
    setMockLoading(true);
    setMessage("");

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API_URL}/mock-tests/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Mock tests load failed");
        return;
      }

      setMockTests(data);
      setMockTestOpen(true);
      setSelectedMockTest(null);
      setMockResult(null);
      setMockAnswers({});
    } catch (error) {
      console.error("Mock test loading error:", error);
      setMessage(t.backendError);
    } finally {
      setMockLoading(false);
    }
  }

  async function openMockTest(testId: number) {
    setMockLoading(true);
    setMessage("");

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API_URL}/mock-tests/${testId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Mock test load failed");
        return;
      }

      setSelectedMockTest(data);
      setMockAnswers({});
      setMockResult(null);
    } catch (error) {
      console.error("Mock test error:", error);
      setMessage(t.backendError);
    } finally {
      setMockLoading(false);
    }
  }

  async function submitMockTest() {
    if (!selectedMockTest) return;

    // Warn if any question unanswered
    const totalQ = selectedMockTest.questions.length;
    const answeredQ = Object.keys(mockAnswers).length;
    if (answeredQ < totalQ) {
      const unanswered = totalQ - answeredQ;
      const ok = window.confirm(
        `${unanswered}টি প্রশ্নের উত্তর দেননি। এগুলো ভুল হিসেবে গণনা হবে। তবুও submit করবেন?`
      );
      if (!ok) return;
    }

    setMockSubmitting(true);
    setMessage("");

    const token = localStorage.getItem("access_token");

    const answers = selectedMockTest.questions.map((question: any) => ({
      question_id: question.id,
      selected_answer:
        mockAnswers[question.id] !== undefined
          ? mockAnswers[question.id]
          : -1,
    }));

    try {
      const response = await fetch(`${API_URL}/mock-tests/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          test_id: selectedMockTest.id,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Mock test submit failed");
        return;
      }

      setMockResult(data);
      void logStudentActivity(
        "mock_test",
        selectedMockTest.title,
        data.percentage ?? 0,
        { score: data.score, total: data.total }
      );
      void loadStudentDashboardData();
    } catch (error) {
      console.error("Mock test submit error:", error);
      setMessage(t.backendError);
    } finally {
      setMockSubmitting(false);
    }
  }

  // --------------------------------------------------
  // Teacher Mock Test Manager Functions
  // --------------------------------------------------

  async function createTeacherTest(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    const week = Number(teacherTestForm.week);

    if (!teacherTestForm.title.trim()) {
      setMessage("Please enter a test title.");
      return;
    }

    if (!Number.isInteger(week) || week < 1) {
      setMessage("Week must be a positive number.");
      return;
    }

    const token = localStorage.getItem("access_token");
    setTeacherSaving(true);

    try {
      const response = await fetch(`${API_URL}/mock-tests/teacher/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: teacherTestForm.title.trim(),
          description: teacherTestForm.description.trim() || null,
          week,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Test creation failed");
        return;
      }

      setTeacherTest(data.test);
      setTeacherQuestions([]);
      setTeacherTestForm({ title: "", description: "", week: "" });
      setMessage("Mock test created. Now add questions. 🎉");
    } catch (error) {
      console.error("Teacher test creation error:", error);
      setMessage(t.backendError);
    } finally {
      setTeacherSaving(false);
    }
  }

  async function addTeacherQuestion(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!teacherTest) {
      setMessage("Create a mock test first.");
      return;
    }

    const options = [
      teacherQuestionForm.option_a,
      teacherQuestionForm.option_b,
      teacherQuestionForm.option_c,
      teacherQuestionForm.option_d,
    ];

    if (!teacherQuestionForm.question.trim()) {
      setMessage("Please enter the question.");
      return;
    }

    if (options.some((option) => !option.trim())) {
      setMessage("Please fill all four options.");
      return;
    }

    const token = localStorage.getItem("access_token");
    setTeacherSaving(true);

    try {
      const response = await fetch(`${API_URL}/mock-tests/teacher/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          test_id: teacherTest.id,
          question: teacherQuestionForm.question.trim(),
          option_a: teacherQuestionForm.option_a.trim(),
          option_b: teacherQuestionForm.option_b.trim(),
          option_c: teacherQuestionForm.option_c.trim(),
          option_d: teacherQuestionForm.option_d.trim(),
          correct_answer: Number(teacherQuestionForm.correct_answer),
          explanation: teacherQuestionForm.explanation.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Question add failed");
        return;
      }

      setTeacherQuestions((questions) => [
        ...questions,
        {
          id: data.question_id,
          question: teacherQuestionForm.question.trim(),
          options,
          correct_answer: Number(teacherQuestionForm.correct_answer),
          explanation: teacherQuestionForm.explanation.trim(),
        },
      ]);

      setTeacherQuestionForm({
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "0",
        explanation: "",
      });

      setMessage("Question added successfully. ✅");
    } catch (error) {
      console.error("Teacher question error:", error);
      setMessage(t.backendError);
    } finally {
      setTeacherSaving(false);
    }
  }

  async function publishTeacherTest() {
    if (!teacherTest) return;

    if (teacherQuestions.length === 0) {
      setMessage("Add at least one question before publishing.");
      return;
    }

    const token = localStorage.getItem("access_token");
    setTeacherPublishing(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/mock-tests/teacher/${teacherTest.id}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Publish failed");
        return;
      }

      setMessage("Mock test published successfully! 🚀 Students can take it now.");
      setTeacherTest((test: any) => ({ ...test, published: true }));
    } catch (error) {
      console.error("Teacher publish error:", error);
      setMessage(t.backendError);
    } finally {
      setTeacherPublishing(false);
    }
  }

  function resetTeacherMockManager() {
    setTeacherMockOpen(false);
    setTeacherTest(null);
    setTeacherQuestions([]);
    setTeacherTestForm({ title: "", description: "", week: "" });
    setTeacherQuestionForm({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "0",
      explanation: "",
    });
    setMessage("");
  }

  async function loadGeographyTopics() {
    try {
      const response = await fetch(`${API_URL}/geography-content/`);
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) {
        setGeographyTopics(data);
      }
    } catch (error) {
      console.error("Geography topics loading error:", error);
    }
  }

  async function addGeographyTopic(e: FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("access_token");
    if (!token) { alert("Teacher login required."); return; }
    if (!geographyTopicName.trim()) { alert("Please enter a topic name."); return; }
    if (!geographyTopicImage) { alert("Please choose a topic picture."); return; }

    setGeographyTopicLoading(true);

    try {
      const formData = new FormData();
      formData.append("chapter", "Geography Topics");
      formData.append("title", geographyTopicName.trim());
      formData.append("subject", "Geography");
      formData.append("image", geographyTopicImage);

      const response = await fetchWithTimeout(`${API_URL}/geography-content/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }, 60000);

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Geography topic add failed.");
        return;
      }

      setGeographyTopics((items) => [data, ...items]);
      setGeographyTopicName("");
      setGeographyTopicImage(null);

      const fileInput = document.getElementById("geography-topic-image-input") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";

      alert("Geography topic added! 🎉");
    } catch (error) {
      console.error("Geography topic add error:", error);
      alert("Geography topic add failed. Please try again.");
    } finally {
      setGeographyTopicLoading(false);
    }
  }

  async function deleteGeographyTopic(id: number) {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    if (!window.confirm("Delete this Geography topic?")) return;

    try {
      const response = await fetch(`${API_URL}/geography-content/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Delete failed.");
        return;
      }

      setGeographyTopics((items) => items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Geography topic delete error:", error);
      alert("Delete failed.");
    }
  }

  function getGeographyImageUrl(imageUrl: string | null) {
    if (!imageUrl) return "";
    // data: URI — use directly
    if (imageUrl.startsWith("data:")) return imageUrl;
    // absolute URL
    if (imageUrl.startsWith("http")) return imageUrl;
    // relative path — prepend API base
    return `${API_URL}${imageUrl}`;
  }

  function openLearning() {
    setSelectedLesson(null);
    setLearningOpen(true);
    setAdminOpen(false);
  }

  function openAdmin() {
    if (userRole !== "teacher") return;
    setAdminOpen(true);
    setLearningOpen(false);
    setSelectedLesson(null);
  }

  async function uploadLessonPdf(lessonId: string) {
    if (!lessonPdfFile) return;
    const token = localStorage.getItem("access_token");
    if (!token || isNaN(Number(lessonId))) return;
    setLessonPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", lessonPdfFile);
      const res = await fetchWithTimeout(
        `${API_URL}/learning-content/${lessonId}/upload-pdf`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData },
        60000
      );
      const data = await res.json();
      if (!res.ok) { alert(data.detail || "PDF upload failed."); return; }
      alert(`✅ PDF uploaded: ${data.pdf_name}`);
      setLessonPdfFile(null);
      // Refresh lessons
      void loadLearningContentFromBackend();
    } catch {
      alert("PDF upload failed. Please try again.");
    } finally {
      setLessonPdfLoading(false);
    }
  }

  async function deleteLessonPdf(lessonId: string) {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    if (!window.confirm("PDF সরিয়ে দেবেন?")) return;
    try {
      await fetch(`${API_URL}/learning-content/${lessonId}/pdf`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      void loadLearningContentFromBackend();
    } catch {}
  }

  async function saveLearningContent(e: FormEvent) {
    e.preventDefault();

    if (!contentForm.title.trim() || !contentForm.chapter.trim()) {
      alert("Please add a lesson title and chapter.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) { alert("Teacher login required."); return; }

    try {
      const res = await fetchWithTimeout(`${API_URL}/learning-content/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject: contentForm.subject.trim() || "Geography",
          chapter: contentForm.chapter.trim(),
          title: contentForm.title.trim(),
          description: contentForm.description.trim() || null,
          video_url: contentForm.videoUrl.trim() || null,
          image_url: contentForm.imageUrl.trim() || null,
          notes: contentForm.notes.trim() || null,
          explanation: contentForm.explanation.trim() || null,
        }),
      }, 30000);

      const data = await res.json();
      if (!res.ok) { alert(data.detail || "Lesson save failed."); return; }

      // Map backend response to frontend type
      const newItem: LearningContent = {
        id: String(data.id),
        subject: data.subject,
        chapter: data.chapter,
        title: data.title,
        description: data.description || "",
        videoUrl: data.video_url || "",
        imageUrl: data.image_url || "",
        notes: data.notes || "",
        explanation: data.explanation || "",
      };

      setLearningContent(prev => [newItem, ...prev]);
      setContentForm({ subject: "Geography", chapter: "", title: "", description: "", videoUrl: "", imageUrl: "", notes: "", explanation: "" });
      alert("Lesson added! 🎉 Students এখন এটা দেখতে পাবে।");
    } catch {
      alert("Lesson save failed. Please try again.");
    }
  }

  async function deleteLearningContent(id: string) {
    const token = localStorage.getItem("access_token");

    // Try backend delete first
    if (token && !isNaN(Number(id))) {
      try {
        await fetch(`${API_URL}/learning-content/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    // Also remove from local state
    setLearningContent(prev => prev.filter(item => item.id !== id));
    localStorage.setItem("curiosity_learning_content",
      JSON.stringify(learningContent.filter(item => item.id !== id)));
  }

  function logout() {
    localStorage.removeItem("access_token");

    setLoggedIn(false);
    setProfileSaved(false);
    localStorage.removeItem("student_profile_saved");
    localStorage.removeItem("student_profile_local");
    setExplorerOpen(false);
    setIndiaMapOpen(false);
    setChallengeOpen(false);
    setMockTestOpen(false);
    setSelectedMockTest(null);
    setTeacherMockOpen(false);
    setTeacherTest(null);
    setTeacherQuestions([]);
    setCurrentUser(null);
    setStudentDashboardProfile(null);
    setStudentActivity([]);
    setTeacherStudents([]);
    setSelectedTeacherStudent(null);
    localStorage.removeItem("user_role");
    setUserRole("student");
    setMockAnswers({});
    setMockResult(null);
    setStudentStats({
      points: 0,
      day_streak: 0,
      curiosity_xp: 0,
      activity_points: 0,
      mock_points: 0,
      curiosity_answered: 0,
      mock_attempts: 0,
      activity_count: 0,
    });
    setAdminTeachers({
      pending: [],
      approved: [],
      pending_count: 0,
      approved_count: 0,
    });
    setTeacherApprovalsOpen(false);
  }

  // --------------------------------------------------
  // Geography Challenge
  // --------------------------------------------------

  if (
    loggedIn &&
    profileSaved &&
    explorerOpen &&
    indiaMapOpen &&
    challengeOpen
  ) {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button
            onClick={() => setChallengeOpen(false)}
            style={logoutStyle}
          >
            {t.backIndiaMap}
          </button>

          <div style={{ marginTop: "20px" }}>
            <div style={welcomeCard}>
              <div>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  {t.pointingChallenge}
                </p>
                <h2 style={{ margin: "8px 0" }}>
                  {t.pointTheState}
                </h2>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  {t.findCorrectLocation}
                </p>
              </div>
              <div style={globeStyle}>🎯</div>
            </div>

            <div style={geoCard}>
              <h2>
                {t.find}: {challengeTarget}
              </h2>

              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 1000, center: [82, 22] }}
                style={{ width: "100%", height: "auto" }}
              >
                <Geographies geography="/india-states.topojson">
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => {
                          const clickedState =
                            geo.properties?.st_nm ||
                            geo.properties?.name ||
                            "Unknown State";

                          if (clickedState === challengeTarget) {
                            setChallengePoints(10);
                            setChallengeMessage(t.correct);
                            void logStudentActivity(
                              "pointing_challenge",
                              `Completed India Pointing Challenge: ${challengeTarget}`,
                              10
                            ).then(() => loadStudentDashboardData());
                          } else {
                            setChallengeMessage(t.tryAgain);
                          }
                        }}
                        style={{
                          default: { fill: "#D6E4F0", outline: "none" },
                          hover: { fill: "#7CB9E8", outline: "none" },
                          pressed: { fill: "#4A90E2", outline: "none" },
                        } as any}
                      />
                    ))
                  }
                </Geographies>
              </ComposableMap>

              {challengeMessage && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "15px",
                    borderRadius: "12px",
                    background: "#0f172a",
                  }}
                >
                  <h3>{challengeMessage}</h3>
                  <p>⭐ {t.points}: {challengePoints}</p>

                  {challengePoints === 10 && (
                    <button
                      onClick={() => {
                        setChallengePoints(0);
                        setChallengeMessage("");

                        setChallengeTarget(
                          getRandomIndiaChallengeState(challengeTarget)
                        );
                      }}
                      style={nextChallengeButton}
                    >
                      {t.nextChallenge}
                    </button>
                  )}
                </div>
              )}

              <div
                style={{
                  marginTop: "20px",
                  padding: "20px",
                  borderRadius: "15px",
                  background: "#1e293b",
                }}
              >
                <h2>📍 {selectedState}</h2>
                <button
                  onClick={() => setChallengeOpen(false)}
                  style={exploreButton}
                >
                  {t.returnIndiaMap}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // India Map
  // --------------------------------------------------

  if (loggedIn && profileSaved && explorerOpen && indiaMapOpen) {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button
            onClick={() => {
              setIndiaMapOpen(false);
              setSelectedState("");
            }}
            style={logoutStyle}
          >
            {t.backWorldMap}
          </button>

          <div style={{ marginTop: "20px" }}>
            <div style={welcomeCard}>
              <div>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  {t.geographyExplorer} 🇮🇳
                </p>

                <h2 style={{ margin: "8px 0" }}>
                  {t.exploreIndia}
                </h2>

                <p style={{ margin: 0, opacity: 0.8 }}>
                  {t.clickState}
                </p>
              </div>

              <div style={globeStyle}>🇮🇳</div>
            </div>

            <div style={geoCard}>
              <h2>🇮🇳 {t.indiaMap}</h2>

              <div
                style={{
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: "18px",
                  background: "#cfe9f4",
                  padding: "10px",
                  boxSizing: "border-box",
                }}
              >
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{
                    scale: 1000,
                    center: [82, 22],
                  }}
                  style={{
                    width: "100%",
                    height: "auto",
                    background: "#cfe9f4",
                    borderRadius: "14px",
                    cursor: "pointer",
                  }}
                >
                  <Geographies geography="/india-states.topojson">
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const stateName =
                          geo.properties?.st_nm ||
                          geo.properties?.name ||
                          "Unknown State";
                        const baseFill = getIndiaTerrainFill(stateName);

                        const colorByState: Record<string, string> = {
                          "Jammu & Kashmir": "#b8c9b6",
                          "Jammu and Kashmir": "#b8c9b6",
                          Ladakh: "#c5d1bb",
                          Himachal: "#c1ceb9",
                          "Himachal Pradesh": "#c1ceb9",
                          Uttarakhand: "#bfd0bd",
                          Rajasthan: "#f3dfb7",
                          Gujarat: "#ead7ad",
                          Punjab: "#cfe7b8",
                          Haryana: "#d5eaba",
                          Delhi: "#d8edc2",
                          Uttar: "#c9e6b1",
                          "Madhya Pradesh": "#c5e2a9",
                          Chhattisgarh: "#c3dfac",
                          Bihar: "#cce8b7",
                          Jharkhand: "#c0dda7",
                          West: "#bde1be",
                          Odisha: "#afe0d6",
                          Maharashtra: "#b3dfd2",
                          Goa: "#9ed8c7",
                          Karnataka: "#a9dccf",
                          Kerala: "#9fd7c8",
                          "Tamil Nadu": "#a7ddd1",
                          Andhra: "#addfd2",
                          Telangana: "#b2dfbd",
                          "West Bengal": "#a9ddd0",
                          Sikkim: "#aec9b5",
                          Assam: "#b8dfb6",
                          Meghalaya: "#b4d8bb",
                          Tripura: "#abd8c3",
                          Mizoram: "#a6d8c7",
                          Manipur: "#acd9c0",
                          Nagaland: "#b2dcbc",
                          Arunachal: "#a9c5b1",
                        };

                        const stateKey = Object.keys(colorByState).find((key) =>
                          stateName.toLowerCase().includes(key.toLowerCase())
                        );
                        const stateFill = stateKey ? colorByState[stateKey] : baseFill;

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onClick={() => {
                              setSelectedState(stateName);
                            }}
                            fill={stateFill}
                            style={{
                              default: {
                                fill: stateFill,
                                fillOpacity: 1,
                                outline: "none",
                                stroke: "#ffffff",
                                strokeWidth: 0.8,
                              },
                              hover: {
                                fill: "#8fd4c0",
                                fillOpacity: 1,
                                outline: "none",
                                stroke: "#ffffff",
                                strokeWidth: 1.4,
                              },
                              pressed: {
                                fill: "#74c3ad",
                                fillOpacity: 1,
                                outline: "none",
                                stroke: "#ffffff",
                                strokeWidth: 1.5,
                              },
                            } as any}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ComposableMap>
              </div>

              {selectedState && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "20px",
                    borderRadius: "15px",
                    background: "#1e293b",
                  }}
                >
                  <h2>📍 {selectedState}</h2>

                  <p>
                    {language === "bn"
                      ? "আপনি এই রাজ্যটি নির্বাচন করেছেন।"
                      : "Great! You selected this state."}
                  </p>

                  {locationData[selectedState] && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "20px",
                        borderRadius: "15px",
                        background: "#0f172a",
                        textAlign: "left",
                      }}
                    >
                      <h3>📍 {selectedState}</h3>

                      <h4>🏛️ {t.famousPlaces}</h4>

                      <ul>
                        {locationData[selectedState].famousPlaces.map(
                          (place) => (
                            <li key={place}>{place}</li>
                          )
                        )}
                      </ul>

                      <h4>🌍 {t.geographyExamples}</h4>

                      <ul>
                        {locationData[selectedState].geography.map(
                          (item) => (
                            <li key={item}>{item}</li>
                          )
                        )}
                      </ul>

                      <h4>💡 {t.quickFact}</h4>

                      <p>
                        {locationData[selectedState].fact}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setChallengeTarget(getRandomIndiaChallengeState());
                      setChallengePoints(0);
                      setChallengeMessage("");
                      setChallengeOpen(true);
                    }}
                    style={startChallengeButton}
                  >
                    {t.startChallenge}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // World Explorer
  // --------------------------------------------------

  if (loggedIn && profileSaved && explorerOpen) {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          {/* Language selector */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginBottom: "15px",
            }}
          >
            <button
              onClick={() => changeLanguage("en")}
              style={{
                ...languageButton,
                background:
                  language === "en" ? "#2563eb" : "#e2e8f0",
                color:
                  language === "en" ? "white" : "#0f172a",
              }}
            >
              English
            </button>

            <button
              onClick={() => changeLanguage("bn")}
              style={{
                ...languageButton,
                background:
                  language === "bn" ? "#2563eb" : "#e2e8f0",
                color:
                  language === "bn" ? "white" : "#0f172a",
              }}
            >
              বাংলা
            </button>
          </div>

          <button
            onClick={() => setExplorerOpen(false)}
            style={logoutStyle}
          >
            {t.backDashboard}
          </button>

          <div style={{ marginTop: "20px" }}>
            <div style={welcomeCard}>
              <div>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  {t.geographyExplorer} 🌍
                </p>

                <h2 style={{ margin: "8px 0" }}>
                  {t.exploreWorld}
                </h2>

                <p style={{ margin: 0, opacity: 0.8 }}>
                  {t.clickCountry}
                </p>
              </div>

              <div style={globeStyle}>🗺️</div>
            </div>

            <div style={geoCard}>
              <div style={{ width: "100%" }}>
                <h2>{t.interactiveMap}</h2>

                <p>
                  {language === "bn"
                    ? "দেশের উপর ক্লিক করে তথ্য দেখুন।"
                    : "Click on a country to discover its information."}
                </p>

                <ComposableMap
                  projection="geoMercator"
                  style={{
                    width: "100%",
                    height: "auto",
                  }}
                >
                  <Geographies
                    geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
                  >
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => {
                            const countryName =
                              geo.properties?.name;

                            setSelectedCountry(countryName);
                            getCountryDetails(countryName);
                            // India map navigation is now done via a button
                            // in the country details panel, not immediately
                          }}
                          style={{
                            default: {
                              fill: "#D6E4F0",
                              outline: "none",
                            },
                            hover: {
                              fill: "#7CB9E8",
                              outline: "none",
                            },
                            pressed: {
                              fill: "#4A90E2",
                              outline: "none",
                            },
                          } as any}
                        />
                      ))
                    }
                  </Geographies>
                </ComposableMap>

                {selectedCountry && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "25px",
                      borderRadius: "15px",
                      background: "#1e293b",
                    }}
                  >
                    {loadingCountry ? (
                      <h2>{t.loading}</h2>
                    ) : countryDetails ? (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "20px",
                          }}
                        >
                          <div>
                            <h2>
                              {countryDetails.countryName}
                            </h2>

                            <p>
                              <strong>
                                {t.countryCode}:
                              </strong>{" "}
                              {countryDetails.countryCode ||
                                "N/A"}
                            </p>
                          </div>
                        </div>

                        <hr />

                        <p>
                          🏛️{" "}
                          <strong>
                            {t.capital}:
                          </strong>{" "}
                          {countryDetails.capital || "N/A"}
                        </p>

                        <p>
                          👥{" "}
                          <strong>
                            {t.population}:
                          </strong>{" "}
                          {countryDetails.population
                            ? Number(
                                countryDetails.population
                              ).toLocaleString()
                            : "N/A"}
                        </p>

                        <p>
                          📐{" "}
                          <strong>
                            {t.area}:
                          </strong>{" "}
                          {countryDetails.areaInSqKm
                            ? `${Number(
                                countryDetails.areaInSqKm
                              ).toLocaleString()} km²`
                            : "N/A"}
                        </p>

                        <p>
                          🌍{" "}
                          <strong>
                            {t.continent}:
                          </strong>{" "}
                          {countryDetails.continentName ||
                            "N/A"}
                        </p>

                        <p>
                          💰{" "}
                          <strong>
                            {t.currency}:
                          </strong>{" "}
                          {countryDetails.currencyCode ||
                            "N/A"}
                        </p>

                        <p>
                          🗣️{" "}
                          <strong>
                            {t.languages}:
                          </strong>{" "}
                          {countryDetails.languages ||
                            "N/A"}
                        </p>

                        <p>
                          🌐{" "}
                          <strong>ISO Alpha-3:</strong>{" "}
                          {countryDetails.isoAlpha3 || "N/A"}
                        </p>

                        <p>
                          🧭{" "}
                          <strong>{t.region}:</strong>{" "}
                          {countryDetails.continentName || "N/A"}
                        </p>

                        <p>
                          🕐{" "}
                          <strong>{t.timezone}:</strong>{" "}
                          {countryDetails.timeZones?.[0]?.timeZoneId
                            || countryDetails.timezone
                            || countryDetails.gmtOffset !== undefined
                              ? `GMT${countryDetails.gmtOffset >= 0 ? "+" : ""}${countryDetails.gmtOffset}`
                              : "N/A"}
                        </p>

                        <p
                          style={{
                            fontSize: "13px",
                            opacity: 0.65,
                            marginTop: "20px",
                          }}
                        >
                          GeoNames ID:{" "}
                          {countryDetails.geonameId ||
                            "N/A"}
                        </p>

                        {selectedCountry === "India" && (
                          <button
                            type="button"
                            onClick={() => setIndiaMapOpen(true)}
                            style={{
                              marginTop: "16px",
                              padding: "10px 20px",
                              background: "linear-gradient(135deg,#6366f1,#0e7490)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "10px",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: "14px",
                            }}
                          >
                            🗺️ Explore India Map →
                          </button>
                        )}
                      </>
                    ) : (
                      <p>{t.countryInfoNotFound}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // --------------------------------------------------
  // Geography Innovation Zone
  // --------------------------------------------------

  // Living Geography
  // Dedicated interactive simulations for real-world Geography events.
  if (
    loggedIn &&
    profileSaved &&
    geographyInnovationOpen &&
    geographyInnovationSection === "living"
  ) {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button
            type="button"
            onClick={() => setGeographyInnovationOpen(false)}
            style={logoutStyle}
          >
            {t.backDashboard}
          </button>

          <div style={{ marginTop: "18px" }}>
            <LivingGeography onActivityLog={(title, score) => void logStudentActivity("living_geography", title, score, {})} />
          </div>
        </div>
      </div>
    );
  }

  // Digital Geography Classroom
  // Keep the existing Geography Innovation Zone unchanged,
  // but open the dedicated classroom component for the classroom card.
  if (
    loggedIn &&
    profileSaved &&
    geographyInnovationOpen &&
    geographyInnovationSection === "classroom"
  ) {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button
            type="button"
            onClick={() => setGeographyInnovationOpen(false)}
            style={logoutStyle}
          >
            {t.backDashboard}
          </button>

          <div style={{ marginTop: "18px" }}>
            <DigitalGeographyClassroom onActivityLog={(title, score) => void logStudentActivity("digital_classroom", title, score, {})} />
          </div>
        </div>
      </div>
    );
  }

  if (loggedIn && profileSaved && geographyInnovationOpen) {
    const activeSection =
      GEOGRAPHY_INNOVATION_SECTIONS[geographyInnovationSection];

    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button
            type="button"
            onClick={() => setGeographyInnovationOpen(false)}
            style={logoutStyle}
          >
            {t.backDashboard}
          </button>

          <section style={{ ...dashboardHero, marginTop: "18px" }}>
            <div style={{ flex: 1 }}>
              <span style={eyebrow}>🌍 GEOGRAPHY INNOVATION</span>
              <h1
                style={{
                  ...heroTitle,
                  fontSize: "clamp(30px, 4vw, 44px)",
                }}
              >
                Geography Innovation Zone
              </h1>
              <p style={heroSubtitle}>
                Explore Geography through digital lessons, real-world events,
                AI and maps.
              </p>
            </div>
            <div style={heroOrb}>🗺️</div>
          </section>

          <div style={learningGrid}>
            {(
              Object.entries(GEOGRAPHY_INNOVATION_SECTIONS) as [
                GeographyInnovationSection,
                (typeof GEOGRAPHY_INNOVATION_SECTIONS)[GeographyInnovationSection]
              ][]
            ).map(([sectionId, section]) => {
              const active = sectionId === geographyInnovationSection;

              return (
                <button
                  key={sectionId}
                  type="button"
                  onClick={() => openGeographyInnovation(sectionId)}
                  style={{
                    ...learningCard,
                    textAlign: "left",
                    cursor: "pointer",
                    border: active
                      ? "1px solid rgba(125,211,252,0.7)"
                      : "1px solid rgba(148,163,184,0.16)",
                    background: active
                      ? "linear-gradient(145deg, rgba(14,116,144,0.42), rgba(7,27,61,0.92))"
                      : learningCard.background,
                  }}
                >
                  <div style={learningEmoji}>{section.icon}</div>
                  <span style={featureTag}>{section.tag}</span>
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                  <span style={featureArrow}>Explore →</span>
                </button>
              );
            })}
          </div>

          <section
            style={{
              marginTop: "24px",
              padding: "28px",
              borderRadius: "24px",
              background:
                "linear-gradient(145deg, rgba(15,23,42,0.94), rgba(7,27,61,0.94))",
              border: "1px solid rgba(148,163,184,0.16)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "240px" }}>
                <span style={featureTag}>{activeSection.tag}</span>
                <h2 style={{ margin: "8px 0 8px" }}>
                  {activeSection.icon} {activeSection.title}
                </h2>
                <p style={{ opacity: 0.78, lineHeight: 1.7 }}>
                  {activeSection.description}
                </p>
              </div>
              <div
                style={{
                  fontSize: "48px",
                  lineHeight: 1,
                  padding: "8px 12px",
                  borderRadius: "18px",
                  background: "rgba(30,41,59,0.7)",
                }}
              >
                {activeSection.icon}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              {activeSection.points.map((point) => (
                <div
                  key={point}
                  style={{
                    padding: "16px",
                    borderRadius: "16px",
                    background: "rgba(15,23,42,0.72)",
                    border: "1px solid rgba(148,163,184,0.12)",
                  }}
                >
                  <strong>✓ {point}</strong>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "22px",
                padding: "18px",
                borderRadius: "16px",
                background: "rgba(14,116,144,0.14)",
                border: "1px solid rgba(125,211,252,0.16)",
              }}
            >
              <strong>🎓 এখন explore করো</strong>
              <p style={{ marginBottom: 0, opacity: 0.8 }}>
                উপরের Digital Classroom, Living Geography এবং AI Tutor কার্ডগুলোতে click করে শেখা শুরু করো।
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Geography AI Chat
  // --------------------------------------------------

  if (loggedIn && profileSaved && aiChatOpen) {
    const token = localStorage.getItem("access_token") ?? "";
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button
            type="button"
            onClick={() => setAiChatOpen(false)}
            style={logoutStyle}
          >
            {t.aiChatBack}
          </button>

          <section style={{ ...dashboardHero, marginTop: "18px" }}>
            <div style={{ flex: 1 }}>
              <span style={eyebrow}>🤖 AI TUTOR</span>
              <h1 style={{ ...heroTitle, fontSize: "clamp(28px, 4vw, 42px)" }}>
                {t.aiChatTitle}
              </h1>
              <p style={heroSubtitle}>{t.aiChatSubtitle}</p>
            </div>
            <div style={heroOrb}>🌍</div>
          </section>

          <div style={{ marginTop: "22px" }}>
            <GeographyAIChat token={token} language={language} />
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // My Weather Station
  // --------------------------------------------------

  if (loggedIn && profileSaved && weatherStationOpen) {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button
            type="button"
            onClick={() => setWeatherStationOpen(false)}
            style={logoutStyle}
          >
            {t.backDashboard}
          </button>

          <div style={{ marginTop: "18px" }}>
            <WeatherStation onActivityLog={(title, score) => void logStudentActivity("weather_station", title, score, {})} />
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Climate Change Lab
  // --------------------------------------------------

  if (loggedIn && profileSaved && climateChangeLabOpen) {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button
            type="button"
            onClick={() => setClimateChangeLabOpen(false)}
            style={logoutStyle}
          >
            {t.backDashboard}
          </button>

          <div style={{ marginTop: "18px" }}>
            <ClimateChangeLab onActivityLog={(title, score) => void logStudentActivity("climate_lab", title, score, {})} />
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Digital Citizenship
  // --------------------------------------------------

  if (loggedIn && profileSaved && digitalCitizenshipOpen) {
    const topic =
      DIGITAL_CITIZENSHIP_TOPICS.find(
        (item) => item.id === selectedDigitalTopic
      ) || DIGITAL_CITIZENSHIP_TOPICS[0];

    const topicTitle = language === "bn" ? topic.titleBn : topic.title;
    const topicIntro = language === "bn" ? topic.introBn : topic.intro;
    const topicPoints = language === "bn" ? topic.pointsBn : topic.points;
    const isCorrect = digitalSubmitted && digitalAnswer === topic.answer;

    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button
            type="button"
            onClick={() => setDigitalCitizenshipOpen(false)}
            style={logoutStyle}
          >
            {t.backDashboard}
          </button>

          <section style={{ ...dashboardHero, marginTop: "18px" }}>
            <div style={{ flex: 1 }}>
              <span style={eyebrow}>🌐 LIFE SKILLS</span>
              <h1 style={{ ...heroTitle, fontSize: "clamp(30px, 4vw, 44px)" }}>
                Digital Citizenship
              </h1>
              <p style={heroSubtitle}>
                Learn how to stay safe, think critically and act responsibly in the digital world.
              </p>
            </div>
            <div style={heroOrb}>🌐</div>
          </section>

          <section style={digitalTopicGrid}>
            {DIGITAL_CITIZENSHIP_TOPICS.map((item) => {
              const active = item.id === topic.id;
              const completed = digitalCompletedTopics.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectDigitalTopic(item.id)}
                  style={{
                    ...digitalTopicCard,
                    border: active
                      ? "1px solid rgba(125,211,252,0.65)"
                      : digitalTopicCard.border,
                    background: active
                      ? "linear-gradient(145deg, rgba(14,116,144,0.42), rgba(7,27,61,0.92))"
                      : digitalTopicCard.background,
                  }}
                >
                  <div style={digitalTopicTopRow}>
                    <span style={digitalTopicIcon}>{item.icon}</span>
                    {completed && <span style={digitalCompletedBadge}>✓ Done</span>}
                  </div>
                  <strong style={digitalTopicTitle}>
                    {language === "bn" ? item.titleBn : item.title}
                  </strong>
                  <span style={digitalTopicOpenLabel}>
                    {active ? "Learning now" : "Explore topic →"}
                  </span>
                </button>
              );
            })}
          </section>

          <section style={digitalLessonCard}>
            <div style={digitalLessonHeader}>
              <div>
                <span style={featureTag}>TOPIC</span>
                <h2 style={{ margin: "6px 0 0" }}>{topic.icon} {topicTitle}</h2>
              </div>
              <div style={digitalLessonCounter}>
                {digitalCompletedTopics.length}/{DIGITAL_CITIZENSHIP_TOPICS.length}
              </div>
            </div>

            <p style={digitalLessonIntro}>{topicIntro}</p>

            <div style={digitalPointsBox}>
              <h3 style={{ marginTop: 0 }}>💡 Key Points</h3>
              <ul style={{ marginBottom: 0, lineHeight: 1.75 }}>
                {topicPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>

            <div style={digitalQuizBox}>
              <span style={featureTag}>MINI CHECK</span>
              <h3 style={{ margin: "6px 0 14px" }}>🧠 {topic.question}</h3>

              <div style={digitalAnswerGrid}>
                {topic.options.map((option, index) => {
                  const selected = digitalAnswer === index;
                  const correctOption = digitalSubmitted && index === topic.answer;
                  const wrongOption =
                    digitalSubmitted && selected && index !== topic.answer;

                  return (
                    <button
                      key={`${topic.id}-${index}`}
                      type="button"
                      disabled={digitalSubmitted}
                      onClick={() => setDigitalAnswer(index)}
                      style={{
                        ...digitalAnswerButton,
                        border: correctOption
                          ? "1px solid rgba(74,222,128,0.65)"
                          : wrongOption
                            ? "1px solid rgba(248,113,113,0.60)"
                            : selected
                              ? "2px solid #60a5fa"
                              : digitalAnswerButton.border,
                        background: correctOption
                          ? "rgba(22,101,52,0.58)"
                          : wrongOption
                            ? "rgba(127,29,29,0.58)"
                            : selected
                              ? "rgba(37,99,235,0.48)"
                              : digitalAnswerButton.background,
                      }}
                    >
                      <span style={curiosityOptionLetter}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {!digitalSubmitted ? (
                <button
                  type="button"
                  onClick={submitDigitalCitizenshipQuiz}
                  disabled={digitalAnswer === null}
                  style={{
                    ...curiositySubmitButton,
                    marginTop: "16px",
                    opacity: digitalAnswer === null ? 0.55 : 1,
                  }}
                >
                  Check Answer →
                </button>
              ) : (
                <div
                  style={{
                    ...digitalResultBox,
                    background: isCorrect
                      ? "rgba(22,101,52,0.28)"
                      : "rgba(127,29,29,0.28)",
                    border: isCorrect
                      ? "1px solid rgba(74,222,128,0.28)"
                      : "1px solid rgba(248,113,113,0.25)",
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    {isCorrect ? "🎉 Correct! +10 Impact Points" : "❌ Not quite — keep learning!"}
                  </h3>
                  <p style={{ margin: "8px 0 0", lineHeight: 1.6 }}>
                    💡 {topic.explanation}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Learning Library
  // --------------------------------------------------

  if (loggedIn && profileSaved && learningOpen && !selectedLesson) {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button onClick={() => setLearningOpen(false)} style={logoutStyle}>
            {t.backDashboard}
          </button>

          <div style={{ ...welcomeCard, marginTop: "20px" }}>
            <div>
              <p style={{ margin: 0, opacity: 0.75 }}>🎬 Learning Zone</p>
              <h1 style={{ margin: "8px 0" }}>What are you curious about today?</h1>
              <p style={{ margin: 0, opacity: 0.75 }}>
                Choose a chapter and learn through video, explanation, board work and challenges.
              </p>
            </div>
            <div style={globeStyle}>🚀</div>
          </div>

          <div style={learningGrid}>
            {learningContent.map((lesson) => (
              <div key={lesson.id} style={learningCard}>
                <div style={mediaPlaceholder}>
                  {lesson.imageUrl ? (
                    <img
                      src={lesson.imageUrl}
                      alt={lesson.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "14px" }}
                    />
                  ) : (
                    <span>🖼️<br />Image will be added</span>
                  )}
                </div>
                <span style={lessonTag}>{lesson.subject} • {lesson.chapter}</span>
                <h3>{lesson.title}</h3>
                <p style={{ opacity: 0.75 }}>{lesson.description}</p>
                <button
                  type="button"
                  style={exploreButton}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  Explore Lesson →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Lesson Detail
  // --------------------------------------------------

  if (loggedIn && profileSaved && learningOpen && selectedLesson) {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button onClick={() => setSelectedLesson(null)} style={logoutStyle}>
            ← Back to Lessons
          </button>

          <div style={{ ...welcomeCard, marginTop: "20px" }}>
            <div>
              <span style={lessonTag}>{selectedLesson.subject} • {selectedLesson.chapter}</span>
              <h1 style={{ margin: "10px 0" }}>{selectedLesson.title}</h1>
              <p style={{ margin: 0, opacity: 0.75 }}>{selectedLesson.description}</p>
            </div>
            <div style={globeStyle}>💡</div>
          </div>

          <div style={lessonSection}>
            <h2>🎥 Concept Video</h2>
            {(() => {
              const embedUrl = getYouTubeEmbedUrl(selectedLesson.videoUrl);
              if (embedUrl) {
                return (
                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: "16px", overflow: "hidden" }}>
                    <iframe
                      src={embedUrl}
                      title={selectedLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: "absolute", top: 0, left: 0,
                        width: "100%", height: "100%",
                        border: "none", borderRadius: "16px",
                      }}
                    />
                  </div>
                );
              }
              if (selectedLesson.videoUrl) {
                return (
                  <video
                    controls
                    src={selectedLesson.videoUrl}
                    style={{ width: "100%", maxHeight: "400px", borderRadius: "16px", background: "#020617" }}
                  />
                );
              }
              return (
                <div style={largeMediaPlaceholder}>
                  <div style={{ fontSize: "56px" }}>🎬</div>
                  <h3>Video not added yet</h3>
                  <p style={{ opacity: 0.65 }}>Teacher এখনো video add করেননি।</p>
                </div>
              );
            })()}
          </div>

          {selectedLesson.explanation ? (
            <div style={lessonSection}>
              <h2>🧑‍🏫 Teacher's Explanation</h2>
              <div style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "14px",
                padding: "18px",
                lineHeight: "1.8",
                fontSize: "15px",
                whiteSpace: "pre-wrap",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                {selectedLesson.explanation}
              </div>
            </div>
          ) : null}

          {selectedLesson.notes ? (
            <div style={lessonSection}>
              <h2>📝 Quick Notes</h2>
              <div style={{
                background: "rgba(37,99,235,0.10)",
                borderRadius: "14px",
                padding: "18px",
                lineHeight: "1.9",
                fontSize: "14px",
                whiteSpace: "pre-wrap",
                border: "1px solid rgba(96,165,250,0.18)",
              }}>
                {selectedLesson.notes}
              </div>
            </div>
          ) : null}

          {selectedLesson.imageUrl ? (
            <div style={lessonSection}>
              <h2>🖼️ Board Work</h2>
              <img
                src={selectedLesson.imageUrl}
                alt="Board work"
                style={{ width: "100%", borderRadius: "14px", maxHeight: "400px", objectFit: "contain" }}
              />
            </div>
          ) : null}

          {selectedLesson.pdf_data ? (
            <div style={lessonSection}>
              <h2>📄 Notes PDF</h2>
              <p style={{ opacity: 0.7, fontSize: "13px", marginBottom: "12px" }}>
                📎 {selectedLesson.pdf_name || "notes.pdf"}
              </p>
              {/* Embedded PDF viewer */}
              <div style={{ width: "100%", height: "500px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                <iframe
                  src={selectedLesson.pdf_data}
                  title={selectedLesson.pdf_name || "PDF Notes"}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </div>
              {/* Download button */}
              <a
                href={selectedLesson.pdf_data}
                download={selectedLesson.pdf_name || "notes.pdf"}
                style={{
                  display: "inline-block",
                  marginTop: "12px",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg,#2563eb,#0e7490)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                ⬇️ Download PDF
              </a>
            </div>
          ) : null}

          <div style={lessonSection}>
            <h2>🎯 Test Yourself</h2>
            <p style={{ opacity: 0.75, marginBottom: "14px" }}>এই lesson শেষ করার পর একটা quick quiz নাও।</p>
            <button style={exploreButton} type="button" onClick={openTakeQuizModal}>
              Take a Quick Challenge →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Admin Content Manager
  // --------------------------------------------------

  if (loggedIn && profileSaved && adminOpen && userRole === "teacher") {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <button onClick={() => setAdminOpen(false)} style={logoutStyle}>
            {t.backDashboard}
          </button>

          <div style={{ ...welcomeCard, marginTop: "20px" }}>
            <div>
              <p style={{ margin: 0, opacity: 0.75 }}>⚙️ Admin Content Manager</p>
              <h1 style={{ margin: "8px 0" }}>Build your Learning Library</h1>
              <p style={{ margin: 0, opacity: 0.75 }}>
                Add lesson details now. Video and image fields can be filled when your content is ready.
              </p>
            </div>
            <div style={globeStyle}>🛠️</div>
          </div>

          <div style={adminFormCard}>
            <h2>➕ Add New Lesson</h2>
            <form onSubmit={saveLearningContent}>
              <input
                style={inputStyle}
                placeholder="Subject (e.g. Geography)"
                value={contentForm.subject}
                onChange={(e) => setContentForm({ ...contentForm, subject: e.target.value })}
                required
              />
              <input
                style={inputStyle}
                placeholder="Chapter (e.g. Climate)"
                value={contentForm.chapter}
                onChange={(e) => setContentForm({ ...contentForm, chapter: e.target.value })}
                required
              />
              <input
                style={inputStyle}
                placeholder="Lesson title (e.g. Why does monsoon change direction?)"
                value={contentForm.title}
                onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                required
              />
              <textarea
                style={{ ...inputStyle, minHeight: "70px", resize: "vertical" as const }}
                placeholder="Short description"
                value={contentForm.description}
                onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
              />
              <input
                style={inputStyle}
                placeholder="🎥 YouTube video URL (e.g. https://youtube.com/watch?v=...)"
                value={contentForm.videoUrl}
                onChange={(e) => setContentForm({ ...contentForm, videoUrl: e.target.value })}
              />
              <textarea
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" as const }}
                placeholder="📝 Quick Notes (bullet points, key facts — students will see this)"
                value={contentForm.notes}
                onChange={(e) => setContentForm({ ...contentForm, notes: e.target.value })}
              />
              <textarea
                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" as const }}
                placeholder="🧑‍🏫 Teacher's Explanation (write the full concept explanation here)"
                value={contentForm.explanation}
                onChange={(e) => setContentForm({ ...contentForm, explanation: e.target.value })}
              />
              <p style={{ opacity: 0.6, fontSize: "12px", margin: "-6px 0 8px" }}>
                💡 YouTube URL paste করলে video automatically embed হবে।
              </p>
              <button type="submit" style={buttonStyle}>Save Lesson ✓</button>
            </form>
          </div>

          <div style={{ ...adminFormCard, marginTop: "24px", border: "1px solid rgba(56, 189, 248, 0.35)", background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ margin: "0 0 4px" }}>🛡️ Teacher Registration & Verification</h2>
                <p style={{ opacity: 0.8, margin: 0, fontSize: "14px" }}>
                  Pending registrations: <strong style={{ color: adminTeachers.pending_count > 0 ? "#f87171" : "#4ade80" }}>{adminTeachers.pending_count}</strong> | Approved teachers: <strong>{adminTeachers.approved_count}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminActionMessage("");
                  setTeacherApprovalsOpen(true);
                  loadAdminTeachers();
                }}
                style={{
                  ...buttonStyle,
                  background: adminTeachers.pending_count > 0 ? "linear-gradient(135deg, #ef4444, #dc2626)" : "#0284c7",
                  padding: "10px 20px",
                  fontSize: "14px",
                  width: "auto",
                }}
              >
                Manage Teacher Approvals {adminTeachers.pending_count > 0 ? `(${adminTeachers.pending_count})` : ""} →
              </button>
            </div>
          </div>

          <div style={{ ...adminFormCard, marginTop: "24px" }}>
            <h2>🌍 Add Geography Topic Picture</h2>
            <p style={{ opacity: 0.72, marginTop: "-4px" }}>
              Teacher শুধু topic-এর নাম ও picture যোগ করতে পারবেন।
            </p>

            <form onSubmit={addGeographyTopic}>
              <input
                style={inputStyle}
                placeholder="Topic name (e.g. River Erosion)"
                value={geographyTopicName}
                onChange={(e) => setGeographyTopicName(e.target.value)}
                required
              />

              <input
                id="geography-topic-image-input"
                style={inputStyle}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) =>
                  setGeographyTopicImage(e.target.files?.[0] || null)
                }
                required
              />

              <button
                type="submit"
                style={buttonStyle}
                disabled={geographyTopicLoading}
              >
                {geographyTopicLoading ? "Adding..." : "Add Topic + Picture"}
              </button>
            </form>
          </div>

          <h2 style={{ marginTop: "30px" }}>🌍 Geography Topics</h2>
          <div style={learningGrid}>
            {geographyTopics.map((topic) => (
              <div key={topic.id} style={learningCard}>
                {topic.image_url && (
                  <img
                    src={getGeographyImageUrl(topic.image_url)}
                    alt={topic.title}
                    style={{
                      width: "100%",
                      height: "190px",
                      objectFit: "cover",
                      borderRadius: "16px",
                      marginBottom: "14px",
                    }}
                  />
                )}
                <h3>{topic.title}</h3>
                <button
                  type="button"
                  style={{ ...logoutStyle, background: "#7f1d1d", color: "white" }}
                  onClick={() => deleteGeographyTopic(topic.id)}
                >
                  Delete Topic
                </button>
              </div>
            ))}

            {geographyTopics.length === 0 && (
              <div style={emptyLatest}>
                এখনও কোনো Geography topic যোগ করা হয়নি।
              </div>
            )}
          </div>

          <h2 style={{ marginTop: "30px" }}>📚 Existing Lessons</h2>
          <div style={learningGrid}>
            {learningContent.map((lesson) => (
              <div key={lesson.id} style={learningCard}>
                <span style={lessonTag}>{lesson.subject} • {lesson.chapter}</span>
                <h3 style={{ marginBottom: "8px" }}>{lesson.title}</h3>
                <p style={{ opacity: 0.7, fontSize: "13px" }}>{lesson.videoUrl ? "🎥 Video ✓" : "🎥 No video"}</p>
                <p style={{ opacity: 0.7, fontSize: "13px" }}>
                  {lesson.pdf_name ? `📄 PDF: ${lesson.pdf_name}` : "📄 No PDF"}
                </p>

                {/* PDF Upload for this lesson */}
                <div style={{ marginTop: "12px", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}>📤 Upload PDF Notes:</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    style={{ ...inputStyle, fontSize: "12px", padding: "8px" }}
                    onChange={(e) => setLessonPdfFile(e.target.files?.[0] || null)}
                  />
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button
                      type="button"
                      style={{ ...buttonStyle, flex: 1, padding: "8px", fontSize: "13px" }}
                      disabled={!lessonPdfFile || lessonPdfLoading}
                      onClick={() => uploadLessonPdf(lesson.id)}
                    >
                      {lessonPdfLoading ? "Uploading..." : "Upload PDF ↑"}
                    </button>
                    {lesson.pdf_name && (
                      <button
                        type="button"
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "none", background: "#7f1d1d", color: "white", cursor: "pointer", fontSize: "12px" }}
                        onClick={() => deleteLessonPdf(lesson.id)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  style={{ ...logoutStyle, background: "#7f1d1d", color: "white", marginTop: "10px", width: "100%" }}
                  onClick={() => deleteLearningContent(lesson.id)}
                >
                  Delete Lesson
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Dashboard
  // --------------------------------------------------

  if (loggedIn && profileSaved && teacherProgressOpen && userRole === "teacher") {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "18px",
            flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontSize: "13px", opacity: 0.7 }}>👩‍🏫 Teacher Panel</div>
              <h1 style={{ margin: "5px 0 0" }}>📊 Student Progress</h1>
              <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
                Check the learning progress of all students from one place.
              </p>
            </div>

            <button
              type="button"
              style={{ ...logoutStyle, background: "#2563eb", color: "white" }}
              onClick={() => {
                setSelectedTeacherStudent(null);
                setTeacherProgressOpen(false);
              }}
            >
              ← Back to Dashboard
            </button>
          </div>

          {userRole === "teacher" && (
            <section style={{
              marginTop: "18px",
              padding: "20px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(30,64,175,0.30), rgba(88,28,135,0.18))",
              border: "1px solid rgba(147,197,253,0.18)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "13px", opacity: 0.7 }}>👩‍🏫 {t.teacherProgress}</div>
                  <h2 style={{ margin: "4px 0 0" }}>{t.studentsLearning}</h2>
                </div>
                <button type="button" style={{ ...logoutStyle, background: "#2563eb", color: "white" }} onClick={loadTeacherStudents}>↻ Refresh</button>
              </div>
              {teacherProgressLoading ? (
                <div style={{ padding: "18px", opacity: 0.8 }}>Loading student progress…</div>
              ) : teacherStudents.length === 0 ? (
                <div style={{ padding: "18px", opacity: 0.8 }}>{t.noStudents}</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                  {teacherStudents.map((student: any) => (
                    <div key={student.id} style={{ padding: "16px", borderRadius: "16px", background: "rgba(2,6,23,0.34)", border: "1px solid rgba(148,163,184,0.13)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                        <div>
                          <h3 style={{ margin: 0 }}>{student.name}</h3>
                          <p style={{ margin: "4px 0 0", opacity: 0.65, fontSize: "13px" }}>{student.email}</p>
                        </div>
                        <div style={{ fontSize: "28px" }}>🎓</div>
                      </div>
                      <p style={{ margin: "12px 0 0", opacity: 0.75, fontSize: "13px" }}>
                        {student.profile ? `${student.profile.class_name} • ${student.profile.board} • ${student.profile.medium}` : "Profile not completed"}
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "12px" }}>
                        <div style={teacherMetricStyle}><strong>⭐ {student.progress.points ?? 0}</strong><span>Points</span></div>
                        <div style={teacherMetricStyle}><strong>🔥 {student.progress.day_streak ?? 0}d</strong><span>Streak</span></div>
                        <div style={teacherMetricStyle}><strong>{student.progress.curiosity_answered}</strong><span>Curiosity</span></div>
                        <div style={teacherMetricStyle}><strong>{student.progress.mock_attempts}</strong><span>Mocks</span></div>
                      </div>
                      <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "12px", opacity: 0.7 }}>Mock avg: {student.progress.mock_average_percentage}%</span>
                        <button type="button" style={{ ...logoutStyle, background: "rgba(37,99,235,0.25)", color: "#bfdbfe" }} onClick={() => openTeacherStudent(student.id)}>{t.viewProgress} →</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {selectedTeacherStudent && userRole === "teacher" && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.78)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 12000 }}>
              <div style={{ ...cardStyle, width: "min(920px, 100%)", maxHeight: "88vh", overflowY: "auto", background: "#0f172a", color: "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "13px", opacity: 0.7 }}>{t.progressDetails}</div>
                    <h2 style={{ margin: "4px 0" }}>{selectedTeacherStudent.name}</h2>
                    <div style={{ opacity: 0.7 }}>{selectedTeacherStudent.email}</div>
                  </div>
                  <button type="button" style={logoutStyle} onClick={() => setSelectedTeacherStudent(null)}>✕</button>
                </div>
                {teacherStudentLoading ? (
                  <div style={{ padding: "30px 0" }}>Loading…</div>
                ) : (
                  <>
                    <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                      <div style={progressStatCard}>⭐ <strong>{selectedTeacherStudent.progress.points ?? 0}</strong><span>Total Points</span></div>
                      <div style={progressStatCard}>🔥 <strong>{selectedTeacherStudent.progress.day_streak ?? 0} days</strong><span>Day Streak</span></div>
                      <div style={progressStatCard}>🌍 <strong>{selectedTeacherStudent.progress.curiosity_answered}</strong><span>{t.curiosityAnswered}</span></div>
                      <div style={progressStatCard}>🎯 <strong>{selectedTeacherStudent.progress.curiosity_accuracy}%</strong><span>{t.curiosityAccuracy}</span></div>
                      <div style={progressStatCard}>📝 <strong>{selectedTeacherStudent.progress.mock_attempts}</strong><span>{t.mockAttempts}</span></div>
                      <div style={progressStatCard}>📈 <strong>{selectedTeacherStudent.progress.mock_average_percentage}%</strong><span>{t.mockAverage}</span></div>
                    </div>
                    <h3 style={{ margin: "24px 0 10px" }}>{t.recentActivity}</h3>
                    {selectedTeacherStudent.recent_activities?.length ? (
                      <div style={{ display: "grid", gap: "8px" }}>
                        {selectedTeacherStudent.recent_activities.map((item: any) => (
                          <div key={item.id} style={{ padding: "12px 14px", borderRadius: "12px", background: "rgba(30,41,59,0.78)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}><strong>{item.title}</strong>{item.score !== null && item.score !== undefined ? <span>⭐ {item.score}</span> : null}</div>
                            <div style={{ marginTop: "4px", fontSize: "12px", opacity: 0.6 }}>{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: "14px", opacity: 0.7 }}>{t.noActivity}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  if (loggedIn && profileSaved) {
    return (
      <div style={pageStyle}>
        <div style={dashboardStyle}>
          <div style={topBar}>
            <div>
              <h1 style={{ margin: 0 }}>
                CuriosityLearn 🚀
              </h1>

              <p
                style={{
                  margin: "6px 0 0",
                  opacity: 0.7,
                }}
              >
                Explore Geography. Learn by curiosity.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {userRole === "teacher" && (
                <button
                  type="button"
                  onClick={openAdmin}
                  style={{ ...logoutStyle, background: "#334155", color: "white" }}
                >
                  ⚙️ Content Admin
                </button>
              )}

              {userRole === "teacher" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeacherStudent(null);
                    setTeacherProgressOpen(true);
                    loadTeacherStudents();
                  }}
                  style={{ ...logoutStyle, background: "#0f766e", color: "white" }}
                >
                  📊 Student Progress
                </button>
              )}

              {userRole === "teacher" && (
                <button
                  type="button"
                  onClick={() => {
                    setMessage("");
                    setTeacherMockOpen(true);
                  }}
                  style={{ ...logoutStyle, background: "#2563eb", color: "white" }}
                >
                  📝 Mock Test Manager
                </button>
              )}

              {userRole === "teacher" && (
                <button
                  type="button"
                  onClick={() => {
                    setMessage("");
                    setTeacherQuizManagerOpen(true);
                    loadQuizChapters();
                    loadTeacherQuizQuestions("All");
                  }}
                  style={{ ...logoutStyle, background: "#8b5cf6", color: "white" }}
                >
                  🧠 Chapter Quiz Manager
                </button>
              )}

              {(userRole === "teacher" || userRole === "admin") && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminActionMessage("");
                    setTeacherApprovalsOpen(true);
                    loadAdminTeachers();
                  }}
                  style={{
                    ...logoutStyle,
                    background: adminTeachers.pending_count > 0 ? "linear-gradient(135deg, #ef4444, #dc2626)" : "#0284c7",
                    color: "white",
                    fontWeight: adminTeachers.pending_count > 0 ? "bold" : "normal",
                    boxShadow: adminTeachers.pending_count > 0 ? "0 0 12px rgba(239, 68, 68, 0.5)" : "none",
                  }}
                >
                  🛡️ Teacher Approvals {adminTeachers.pending_count > 0 ? `(${adminTeachers.pending_count} Pending)` : ""}
                </button>
              )}

              {userRole === "teacher" && (
                <button
                  type="button"
                  onClick={() => setAiChatOpen(true)}
                  style={{ ...logoutStyle, background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white" }}
                >
                  🤖 {t.aiChatTitle}
                </button>
              )}

              <button
                onClick={logout}
                style={logoutStyle}
              >
                {t.logout}
              </button>
            </div>
          </div>

          {userRole === "student" && (
            <section style={{
              marginTop: "18px",
              padding: "20px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(30,64,175,0.34), rgba(15,118,110,0.22))",
              border: "1px solid rgba(125,211,252,0.18)",
              boxShadow: "0 18px 45px rgba(2,6,23,0.25)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <div style={{ width: "58px", height: "58px", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.12)", fontSize: "25px", fontWeight: 800 }}>
                    {String(currentUser?.name || name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", opacity: 0.7 }}>{t.studentProfile}</div>
                    <h2 style={{ margin: "3px 0 0" }}>{currentUser?.name || name || "Student"}</h2>
                    <div style={{ opacity: 0.75, fontSize: "14px" }}>{currentUser?.email || email || ""}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(110px, 1fr))", gap: "10px", width: "min(100%, 430px)" }}>
                  <div style={miniStatStyle}>📚 <strong>{studentDashboardProfile?.class_name || "—"}</strong><span>{t.classLabel}</span></div>
                  <div style={miniStatStyle}>🎓 <strong>{studentDashboardProfile?.board || "—"}</strong><span>{t.boardLabel}</span></div>
                  <div style={miniStatStyle}>🗣️ <strong>{studentDashboardProfile?.medium || "—"}</strong><span>{t.mediumLabel}</span></div>
                </div>
              </div>

              <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: "10px" }}>
                <div style={progressStatCard}>🌍 <strong>{studentActivity.length}</strong><span>{t.activityCount}</span></div>
                <div style={progressStatCard}>✨ <strong>{studentActivity.filter((item: any) => item.activity_type === "curiosity").length}</strong><span>{t.curiosityAnswered}</span></div>
                <div style={progressStatCard}>📝 <strong>{studentActivity.filter((item: any) => item.activity_type === "mock_test").length}</strong><span>{t.mockAttempts}</span></div>
              </div>
            </section>
          )}

          {teacherMockOpen && userRole === "teacher" && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(2, 6, 23, 0.84)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                zIndex: 11000,
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "850px",
                  background: "#111827",
                  color: "white",
                  borderRadius: "20px",
                  padding: "28px",
                  boxSizing: "border-box",
                  margin: "20px 0",
                  boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, opacity: 0.7 }}>Teacher Panel</p>
                    <h2 style={{ margin: "6px 0 0" }}>📝 Mock Test Manager</h2>
                  </div>

                  <button
                    type="button"
                    onClick={resetTeacherMockManager}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "white",
                      fontSize: "26px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>

                {message && (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "#1e3a5f",
                      marginBottom: "18px",
                    }}
                  >
                    {message}
                  </div>
                )}

                {!teacherTest && (
                  <div style={adminFormCard}>
                    <h3 style={{ marginTop: 0 }}>➕ Create Weekly Mock Test</h3>

                    <form onSubmit={createTeacherTest}>
                      <input
                        style={inputStyle}
                        placeholder="Test title (e.g. Geography Weekly Test - Week 1)"
                        value={teacherTestForm.title}
                        onChange={(e) =>
                          setTeacherTestForm({ ...teacherTestForm, title: e.target.value })
                        }
                        required
                      />

                      <textarea
                        style={{ ...inputStyle, minHeight: "80px", resize: "vertical" as const }}
                        placeholder="Short description"
                        value={teacherTestForm.description}
                        onChange={(e) =>
                          setTeacherTestForm({ ...teacherTestForm, description: e.target.value })
                        }
                      />

                      <input
                        type="number"
                        min="1"
                        style={inputStyle}
                        placeholder="Week number (e.g. 1)"
                        value={teacherTestForm.week}
                        onChange={(e) =>
                          setTeacherTestForm({ ...teacherTestForm, week: e.target.value })
                        }
                        required
                      />

                      <button
                        type="submit"
                        style={buttonStyle}
                        disabled={teacherSaving}
                      >
                        {teacherSaving ? "Creating..." : "Create Test →"}
                      </button>
                    </form>
                  </div>
                )}

                {teacherTest && (
                  <>
                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "14px",
                        background: "#1e293b",
                        marginBottom: "20px",
                      }}
                    >
                      <p style={{ margin: 0, opacity: 0.7 }}>Current Test</p>
                      <h2 style={{ margin: "6px 0" }}>{teacherTest.title}</h2>
                      <p style={{ margin: 0, opacity: 0.75 }}>Week {teacherTest.week}</p>
                      <p style={{ marginBottom: 0 }}>Questions added: {teacherQuestions.length}</p>
                    </div>

                    <div style={adminFormCard}>
                      <h3 style={{ marginTop: 0 }}>➕ Add Question</h3>

                      <form onSubmit={addTeacherQuestion}>
                        <textarea
                          style={{ ...inputStyle, minHeight: "90px", resize: "vertical" as const }}
                          placeholder="Question"
                          value={teacherQuestionForm.question}
                          onChange={(e) =>
                            setTeacherQuestionForm({ ...teacherQuestionForm, question: e.target.value })
                          }
                          required
                        />

                        <input
                          style={inputStyle}
                          placeholder="Option A"
                          value={teacherQuestionForm.option_a}
                          onChange={(e) =>
                            setTeacherQuestionForm({ ...teacherQuestionForm, option_a: e.target.value })
                          }
                          required
                        />

                        <input
                          style={inputStyle}
                          placeholder="Option B"
                          value={teacherQuestionForm.option_b}
                          onChange={(e) =>
                            setTeacherQuestionForm({ ...teacherQuestionForm, option_b: e.target.value })
                          }
                          required
                        />

                        <input
                          style={inputStyle}
                          placeholder="Option C"
                          value={teacherQuestionForm.option_c}
                          onChange={(e) =>
                            setTeacherQuestionForm({ ...teacherQuestionForm, option_c: e.target.value })
                          }
                          required
                        />

                        <input
                          style={inputStyle}
                          placeholder="Option D"
                          value={teacherQuestionForm.option_d}
                          onChange={(e) =>
                            setTeacherQuestionForm({ ...teacherQuestionForm, option_d: e.target.value })
                          }
                          required
                        />

                        <select
                          style={{ ...inputStyle, background: "white" }}
                          value={teacherQuestionForm.correct_answer}
                          onChange={(e) =>
                            setTeacherQuestionForm({ ...teacherQuestionForm, correct_answer: e.target.value })
                          }
                        >
                          <option value="0">Correct Answer: A</option>
                          <option value="1">Correct Answer: B</option>
                          <option value="2">Correct Answer: C</option>
                          <option value="3">Correct Answer: D</option>
                        </select>

                        <textarea
                          style={{ ...inputStyle, minHeight: "80px", resize: "vertical" as const }}
                          placeholder="Explanation shown to students after submission"
                          value={teacherQuestionForm.explanation}
                          onChange={(e) =>
                            setTeacherQuestionForm({ ...teacherQuestionForm, explanation: e.target.value })
                          }
                        />

                        <button
                          type="submit"
                          style={buttonStyle}
                          disabled={teacherSaving}
                        >
                          {teacherSaving ? "Adding..." : "Add Question ✓"}
                        </button>
                      </form>
                    </div>

                    {teacherQuestions.length > 0 && (
                      <div style={{ marginTop: "20px" }}>
                        <h3>📚 Questions in this test</h3>

                        <div style={{ display: "grid", gap: "12px" }}>
                          {teacherQuestions.map((question, index) => (
                            <div
                              key={question.id || index}
                              style={{
                                padding: "15px",
                                borderRadius: "12px",
                                background: "#1e293b",
                              }}
                            >
                              <strong>{index + 1}. {question.question}</strong>
                              <p style={{ margin: "8px 0 0", opacity: 0.75 }}>
                                Correct answer: {String.fromCharCode(65 + question.correct_answer)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                        marginTop: "22px",
                      }}
                    >
                      <button
                        type="button"
                        style={{ ...buttonStyle, background: "#475569" }}
                        onClick={() => {
                          setTeacherTest(null);
                          setTeacherQuestions([]);
                          setMessage("");
                        }}
                      >
                        Create Another Test
                      </button>

                      <button
                        type="button"
                        style={{ ...buttonStyle, background: "#16a34a" }}
                        onClick={publishTeacherTest}
                        disabled={teacherPublishing || teacherQuestions.length === 0 || teacherTest.published}
                      >
                        {teacherTest.published
                          ? "Published ✓"
                          : teacherPublishing
                            ? "Publishing..."
                            : "Publish Test 🚀"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div style={welcomeCard}>
            <div>
              <p
                style={{
                  margin: 0,
                  opacity: 0.8,
                }}
              >
                {t.welcomeBack}
              </p>

              <h2 style={{ margin: "8px 0" }}>
                {t.readyExplore}
              </h2>

              <p
                style={{
                  margin: 0,
                  opacity: 0.8,
                }}
              >
                {t.discoverPlaces}
              </p>
            </div>

            <div style={globeStyle}>🌍</div>
          </div>

          <div style={statsContainer}>
            <div style={statCard}>
              <div style={statIcon}>⭐</div>

              <div>
                <strong>{studentStats.points}</strong>
                <span> {t.points}</span>
              </div>
            </div>

            <div style={statCard}>
              <div style={statIcon}>🔥</div>

              <div>
                <strong>{studentStats.day_streak}</strong>
                <span> {t.dayStreak}</span>
              </div>
            </div>
          </div>

          <section style={dashboardHero}>
            <div>
              <span style={eyebrow}>🌍 CuriosityLearn</span>
              <h2 style={heroTitle}>{t.welcomeBack}, Explorer!</h2>
              <p style={heroSubtitle}>
                {t.readyExplore} Discover the world, one question at a time.
              </p>

              <div style={heroActions}>
                <button
                  type="button"
                  style={primaryAction}
                  onClick={() => setExplorerOpen(true)}
                >
                  🌍 Explore the World
                </button>

                <button
                  type="button"
                  style={secondaryAction}
                  onClick={openLearning}
                >
                  📚 Start Learning
                </button>
              </div>
            </div>

            <div style={heroOrb}>🌍</div>
          </section>

          <section style={statGrid}>
            <div style={dashboardStatCard}>
              <div style={dashboardStatIcon}>🌍</div>
              <div>
                <span style={dashboardStatLabel}>Geography Chapters</span>
                <strong style={dashboardStatValue}>{learningContent.length}</strong>
              </div>
            </div>

            <div style={dashboardStatCard}>
              <div style={dashboardStatIcon}>📝</div>
              <div>
                <span style={dashboardStatLabel}>Quizzes Taken</span>
                <strong style={dashboardStatValue}>
                  {studentActivity.filter((a: any) => a.activity_type === "quiz" || a.activity_type === "quick_quiz").length}
                </strong>
              </div>
            </div>

            <div style={dashboardStatCard}>
              <div style={dashboardStatIcon}>⭐</div>
              <div>
                <span style={dashboardStatLabel}>Best Score</span>
                <strong style={dashboardStatValue}>
                  {(() => {
                    const scores = studentActivity
                      .filter((a: any) => typeof a.score === "number" && a.score > 0)
                      .map((a: any) => {
                        // mock_test stores percentage (0-100), quick_quiz stores raw (0-N)
                        if (a.activity_type === "mock_test") return a.score;
                        // For quiz, normalize to percentage if score <= total questions count
                        const total = a.score <= 20 ? 10 : 100;
                        return Math.round((a.score / total) * 100);
                      });
                    return scores.length > 0 ? `${Math.max(...scores)}%` : "—";
                  })()}
                </strong>
              </div>
            </div>

            <div style={dashboardStatCard}>
              <div style={dashboardStatIcon}>🔥</div>
              <div>
                <span style={dashboardStatLabel}>Learning Streak</span>
                <strong style={dashboardStatValue}>
                  {studentStats.day_streak > 0 ? `${studentStats.day_streak} days` : "0 days"}
                </strong>
              </div>
            </div>
          </section>

          <div style={sectionHeading}>
            <div>
              <span style={sectionEyebrow}>LEARN • PRACTICE • EXPLORE</span>
              <h2 style={{ margin: "6px 0 0", fontSize: "28px" }}>
                Explore Learning
              </h2>
            </div>
            <p style={sectionHint}>Choose what you want to explore today.</p>
          </div>

          <section style={mainDashboardGrid}>
            <div style={featureGrid}>
              <div
                style={featureCard}
                onClick={openLearning}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>📖</div>
                <span style={featureTag}>LEARN</span>
                <h3>Learn Geography</h3>
                <p>Explore chapters, explanations, videos and curiosity-based lessons.</p>
                <span style={featureArrow}>→</span>
              </div>

              <div
                style={featureCard}
                onClick={openTakeQuizModal}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>🧠</div>
                <span style={featureTag}>PRACTICE</span>
                <h3>Take Quiz</h3>
                <p>Test what you know chapter-wise with interactive geography questions.</p>
                <span style={featureArrow}>→</span>
              </div>

              <div
                style={featureCard}
                onClick={loadMockTests}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>📝</div>
                <span style={featureTag}>EXAM PREP</span>
                <h3>Mock Tests</h3>
                <p>Practice weekly tests and review your answers instantly.</p>
                <span style={featureArrow}>→</span>
              </div>

              <div
                style={featureCard}
                onClick={loadMockTests}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>📚</div>
                <span style={featureTag}>RESOURCES</span>
                <h3>Study Resources</h3>
                <p>Teacher-added notes, lessons এবং learning material দেখো।</p>
                <span style={featureArrow}>→</span>
              </div>

              <div
                style={featureCard}
                onClick={() => setExplorerOpen(true)}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>🌎</div>
                <span style={featureTag}>DISCOVER</span>
                <h3>Explore the World</h3>
                <p>Click countries and discover capitals, population and geography.</p>
                <span style={featureArrow}>→</span>
              </div>

              <div
                style={{ ...featureCard, ...digitalCitizenshipFeatureCard }}
                onClick={openDigitalCitizenship}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>🌐</div>
                <span style={featureTag}>LIFE SKILLS</span>
                <h3>Digital Citizenship</h3>
                <p>Learn to verify information, stay safe online and use AI responsibly.</p>
                <div style={digitalCitizenshipProgress}>
                  {digitalCompletedTopics.length} / {DIGITAL_CITIZENSHIP_TOPICS.length} topics completed
                </div>
                <span style={featureArrow}>→</span>
              </div>

              <div
                style={{ ...featureCard, background: "linear-gradient(145deg, rgba(14,116,144,0.36), rgba(7,27,61,0.92))" }}
                onClick={() => setWeatherStationOpen(true)}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>🌦️</div>
                <span style={featureTag}>WEATHER</span>
                <h3>My Weather Station</h3>
                <p>Check your local weather, rainfall, wind and save daily observations.</p>
                <span style={featureArrow}>→</span>
              </div>

              <div
                style={{ ...featureCard, background: "linear-gradient(145deg, rgba(30,64,175,0.36), rgba(7,27,61,0.92))" }}
                onClick={() => setClimateChangeLabOpen(true)}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>🌍</div>
                <span style={featureTag}>CLIMATE LAB</span>
                <h3>Climate Change Lab</h3>
                <p>Explore global warming, greenhouse effect, El Niño, IOD, MJO and extreme weather.</p>
                <span style={featureArrow}>→</span>
              </div>

              {/* AI Tutor card – student */}
              <div
                style={{ ...featureCard, background: "linear-gradient(145deg, rgba(99,102,241,0.38), rgba(7,17,61,0.92))" }}
                onClick={() => setAiChatOpen(true)}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>🤖</div>
                <span style={featureTag}>{t.aiChatTag}</span>
                <h3>{t.aiChatTitle}</h3>
                <p>{t.aiChatDesc}</p>
                <span style={featureArrow}>→</span>
              </div>

              <div
                style={featureCard}
                onClick={() => {
                  loadStudentDashboardData();
                  loadCuriosityHistory();
                  setCuriosityHistoryOpen(true);
                }}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>📈</div>
                <span style={featureTag}>PROGRESS</span>
                <h3>Progress Tracker</h3>
                <p>আপনার curiosity journey, quiz scores এবং activity দেখুন।</p>
                <span style={featureArrow}>→</span>
              </div>
            </div>

            <aside style={latestPanel}>
              <div style={latestHeader}>
                <div>
                  <span style={sectionEyebrow}>LATEST</span>
                  <h3 style={{ margin: "6px 0 0", fontSize: "22px" }}>
                    Latest Learning
                  </h3>
                </div>
                <span style={latestBadge}>🚀</span>
              </div>

              <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
                {learningContent.slice(0, 4).map((lesson) => (
                  <button
                    key={lesson.id}
                    type="button"
                    style={latestLesson}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setLearningOpen(true);
                    }}
                  >
                    <span style={latestLessonIcon}>📘</span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <strong style={latestLessonTitle}>{lesson.title}</strong>
                      <small style={latestLessonMeta}>
                        {lesson.subject} • {lesson.chapter}
                      </small>
                    </span>
                    <span style={featureArrow}>→</span>
                  </button>
                ))}

                {learningContent.length === 0 && (
                  <div style={emptyLatest}>
                    No lessons yet. Add one from Content Admin.
                  </div>
                )}
              </div>

              <button
                type="button"
                style={latestViewAll}
                onClick={openLearning}
              >
                View all lessons →
              </button>
            </aside>
          </section>
          {/* ---------------------------------------- */}
          {/* Teacher-added Geography Topics */}
          {/* Student view only */}
          {/* ---------------------------------------- */}

          {userRole === "student" && (
            <section style={{ marginTop: "30px" }}>
              <h2>🌍 Geography Topics</h2>
              <p style={{ marginTop: "-8px", opacity: 0.72 }}>
                Teacher-এর যোগ করা Geography topics দেখো।
              </p>

              <div style={learningGrid}>
                {geographyTopics.map((topic) => (
                  <div key={topic.id} style={learningCard}>
                    {topic.image_url && (
                      <img
                        src={getGeographyImageUrl(topic.image_url)}
                        alt={topic.title}
                        style={{
                          width: "100%",
                          height: "210px",
                          objectFit: "cover",
                          borderRadius: "16px",
                          marginBottom: "14px",
                        }}
                      />
                    )}
                    <h3 style={{ marginBottom: 0 }}>{topic.title}</h3>
                  </div>
                ))}

                {geographyTopics.length === 0 && (
                  <div style={emptyLatest}>
                    এখনও কোনো Geography topic যোগ করা হয়নি।
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ---------------------------------------- */}
          {/* Student Innovation Zone */}
          {/* ---------------------------------------- */}

          <h2 style={{ marginTop: "30px" }}>
            🚀 Student Innovation Zone
          </h2>

          <div style={learningGrid}>
            <div style={learningCard}>
              <div style={learningEmoji}>🚀</div>

              <h3>Student Innovation Zone</h3>

              <p>নিজের Geography / Science project জমা দিন।</p>

              <p>• Geography Model</p>
              <p>• Poster</p>
              <p>• Short Video</p>
              <p>• Map</p>
              <p>• Environmental Solution</p>
              <p>• Science/Geography Experiment</p>

              <button
                type="button"
                style={exploreButton}
                onClick={() => setInnovationOpen(true)}
              >
                + Submit Project
              </button>
            </div>
          </div>

          {/* ---------------------------------------- */}
          {/* Geography Innovation Zone */}
          {/* ---------------------------------------- */}

          <h2 style={{ marginTop: "30px" }}>
            🌍 Geography Innovation Zone
          </h2>

          <p style={{ marginTop: "-8px", opacity: 0.72 }}>
            Geography-কে বাস্তব, digital, AI ও map-based learning-এর মাধ্যমে explore করুন।
          </p>

          <div style={learningGrid}>
            {(
              Object.entries(GEOGRAPHY_INNOVATION_SECTIONS) as [
                GeographyInnovationSection,
                (typeof GEOGRAPHY_INNOVATION_SECTIONS)[GeographyInnovationSection]
              ][]
            ).map(([sectionId, section]) => (
              <div
                key={sectionId}
                style={{
                  ...learningCard,
                  cursor: "pointer",
                  background:
                    "linear-gradient(145deg, rgba(14,116,144,0.28), rgba(7,27,61,0.92))",
                }}
                onClick={() => openGeographyInnovation(sectionId)}
                role="button"
                tabIndex={0}
              >
                <div style={learningEmoji}>{section.icon}</div>
                <span style={featureTag}>{section.tag}</span>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <span style={featureArrow}>→</span>
              </div>
            ))}
          </div>

          {/* ---------------------------------------- */}
          {/* My Impact */}
          {/* ---------------------------------------- */}

          <div style={impactCard}>
            <h2>⭐ My Impact</h2>

            <p>
              Before Learning → Activity → Assessment → Impact
            </p>

            <div style={impactGrid}>
              <div style={impactItem}>
                <strong>{impactStats.learning}</strong>
                <span>Learning</span>
              </div>

              <div style={impactItem}>
                <strong>{impactStats.activities}</strong>
                <span>Activities</span>
              </div>

              <div style={impactItem}>
                <strong>{impactStats.assessments}</strong>
                <span>Assessments</span>
              </div>

              <div style={impactItem}>
                <strong>{impactStats.projects}</strong>
                <span>Projects</span>
              </div>

              <div style={impactItem}>
                <strong>{impactStats.impactScore}</strong>
                <span>Impact Score</span>
              </div>
            </div>
          </div>

          {/* Innovation project submit popup */}

          {innovationOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(2, 6, 23, 0.75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "550px",
                  background: "#111827",
                  color: "white",
                  borderRadius: "20px",
                  padding: "28px",
                  boxSizing: "border-box",
                  boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
                }}
              >
                <h2>🚀 Submit Innovation Project</h2>

                <form onSubmit={submitInnovationProject}>
                  <select
                    style={inputStyle}
                    value={innovationForm.type}
                    onChange={(e) =>
                      setInnovationForm({
                        ...innovationForm,
                        type: e.target.value,
                      })
                    }
                  >
                    <option>Geography Model</option>
                    <option>Poster</option>
                    <option>Short Video</option>
                    <option>Map</option>
                    <option>Environmental Solution</option>
                    <option>Science/Geography Experiment</option>
                  </select>

                  <input
                    style={inputStyle}
                    placeholder="Project title"
                    value={innovationForm.title}
                    onChange={(e) =>
                      setInnovationForm({
                        ...innovationForm,
                        title: e.target.value,
                      })
                    }
                    required
                  />

                  <textarea
                    style={{
                      ...inputStyle,
                      minHeight: "120px",
                      resize: "vertical" as const,
                    }}
                    placeholder="Describe your project"
                    value={innovationForm.description}
                    onChange={(e) =>
                      setInnovationForm({
                        ...innovationForm,
                        description: e.target.value,
                      })
                    }
                    required
                  />

                  <button
                    type="submit"
                    style={buttonStyle}
                  >
                    Submit Project 🚀
                  </button>

                  <button
                    type="button"
                    onClick={() => setInnovationOpen(false)}
                    style={{
                      ...buttonStyle,
                      background: "#475569",
                    }}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}

          {!notificationsEnabled && (
            <section style={notificationPermissionCard}>
              <div style={{ fontSize: "34px" }}>🔔</div>

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 6px" }}>
                  Stay Curious Every Day 🌍
                </h3>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  Get a daily Geography Mystery notification so you never miss your curiosity.
                </p>
                {notificationMessage && (
                  <p
                    style={{
                      margin: "10px 0 0",
                      fontSize: "13px",
                      opacity: 0.8,
                    }}
                  >
                    {notificationMessage}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={enableCuriosityNotifications}
                disabled={notificationsLoading}
                style={notificationPermissionButton}
              >
                {notificationsLoading ? "Enabling..." : "Enable Alerts"}
              </button>
            </section>
          )}

          {!locationEnabled ? (
            <section style={locationPermissionCard}>
              <div style={{ fontSize: "34px" }}>📍</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 6px" }}>Make Curiosity Personal 🌍</h3>
                <p style={{ margin: 0, opacity: 0.8 }}>
                  Allow location to get Geography questions about your area, weather and nearby places.
                </p>
                {locationMessage && (
                  <p style={{ margin: "10px 0 0", fontSize: "13px", opacity: 0.8 }}>
                    {locationMessage}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={enableCuriosityLocation}
                disabled={locationLoading}
                style={locationPermissionButton}
              >
                {locationLoading ? "Getting location..." : "Allow Location"}
              </button>
            </section>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "10px 18px",
                borderRadius: "14px",
                marginBottom: "16px",
                fontSize: "14px",
                color: "#6ee7b7",
              }}
            >
              <span>📍</span>
              <span>Location active: Stay Curious is personalized for your area.</span>
            </div>
          )}

      <section style={curiosityCard}>
            <div style={curiosityCardHeader}>
              <div>
                <span style={curiosityBadge}>🌍 {t.curiosityAlert}</span>
                <h2 style={curiosityTitle}>{t.curiosityTitle}</h2>
                <p style={curiositySubtitle}>{t.curiositySubtitle}</p>
              </div>
              <div style={curiositySpark}>💡</div>
            </div>

            {curiosityLoading && !curiosity && (
              <div style={curiosityLoadingBox}>
                Loading today's curiosity... 🌍
              </div>
            )}

            {!curiosityLoading && !curiosity && (
              <div style={curiosityEmpty}>
                <p style={{ margin: 0 }}>{t.curiosityLoadFailed}</p>
                <button
                  type="button"
                  style={curiosityRetryButton}
                  onClick={loadTodayCuriosity}
                >
                  {t.curiosityRetry}
                </button>
              </div>
            )}

            {curiosity && (
              <>
                <div style={curiosityMetaRow}>
                  <span style={curiosityCategoryBadge}>
                    {t.curiosityCategory}: {curiosity.category}
                  </span>
                  {curiosity.personalization_level === "city" && (
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        background: "rgba(16, 185, 129, 0.2)",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        color: "#6ee7b7",
                        fontWeight: 700,
                      }}
                    >
                      📍 Local: {curiosity.city || "Kolkata"}
                    </span>
                  )}
                  {curiosity.personalization_level === "region" && (
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        background: "rgba(59, 130, 246, 0.2)",
                        border: "1px solid rgba(59, 130, 246, 0.4)",
                        color: "#93c5fd",
                        fontWeight: 700,
                      }}
                    >
                      📍 Regional: {curiosity.region || "West Bengal"}
                    </span>
                  )}
                  {curiosity.personalization_level === "country" && (
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        background: "rgba(245, 158, 11, 0.2)",
                        border: "1px solid rgba(245, 158, 11, 0.4)",
                        color: "#fcd34d",
                        fontWeight: 700,
                      }}
                    >
                      📍 India
                    </span>
                  )}
                  {curiosity.question_date && (
                    <span style={curiosityDate}>
                      {String(curiosity.question_date)}
                    </span>
                  )}
                </div>

                <h3 style={curiosityQuestion}>{curiosity.question}</h3>

                <div style={curiosityOptionsGrid} className="curiosity-options-grid">
                  {curiosity.options?.map((option: string, index: number) => {
                    const selected = curiositySelected === index;
                    const isCorrect = curiosityResult?.correct_answer === index;
                    const isSelectedWrong =
                      curiosityResult &&
                      curiosityResult.selected_answer === index &&
                      !curiosityResult.correct;

                    let background = "rgba(2,6,23,0.48)";
                    let border = "1px solid rgba(148,163,184,0.16)";

                    if (curiosityResult && isCorrect) {
                      background = "rgba(22,101,52,0.72)";
                      border = "1px solid rgba(74,222,128,0.55)";
                    } else if (curiosityResult && isSelectedWrong) {
                      background = "rgba(127,29,29,0.72)";
                      border = "1px solid rgba(248,113,113,0.55)";
                    } else if (selected) {
                      background = "rgba(37,99,235,0.72)";
                      border = "2px solid #60a5fa";
                    }

                    return (
                      <button
                        key={`${curiosity.id}-${index}`}
                        type="button"
                        disabled={!!curiosityResult}
                        onClick={() => setCuriositySelected(index)}
                        style={{
                          ...curiosityOptionButton,
                          background,
                          border,
                          cursor: curiosityResult ? "default" : "pointer",
                        }}
                      >
                        <span style={curiosityOptionLetter}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {!curiosityResult ? (
                  <button
                    type="button"
                    style={{
                      ...curiositySubmitButton,
                      opacity: curiositySelected === null || curiosityLoading ? 0.55 : 1,
                    }}
                    onClick={submitCuriosityAnswer}
                    disabled={curiositySelected === null || curiosityLoading}
                  >
                    {curiosityLoading ? t.curiositySubmitting : `${t.curiosityAnswer} →`}
                  </button>
                ) : (
                  <div
                    style={{
                      ...curiosityResultBox,
                      background: curiosityResult.correct
                        ? "rgba(22,101,52,0.28)"
                        : "rgba(127,29,29,0.28)",
                      border: curiosityResult.correct
                        ? "1px solid rgba(74,222,128,0.30)"
                        : "1px solid rgba(248,113,113,0.25)",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>
                      {curiosityResult.correct
                        ? t.curiosityCorrect
                        : t.curiosityTryAgain}
                    </h3>
                    <p style={{ margin: "8px 0 0" }}>
                      ⭐ {curiosityResult.xp_earned} {t.curiosityXp}
                    </p>
                    {curiosityResult.explanation && (
                      <div style={curiosityExplanationBox}>
                        <strong>💡 {t.curiosityExplanation}</strong>
                        <p style={{ margin: "6px 0 0", lineHeight: 1.6 }}>
                          {curiosityResult.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  style={curiosityHistoryButton}
                  onClick={() => {
                    setCuriosityHistoryOpen((open) => !open);
                    if (!curiosityHistoryOpen) loadCuriosityHistory();
                  }}
                >
                  📚 {t.curiosityHistory} ({curiosityHistory.length})
                </button>

                {curiosityHistoryOpen && (
                  <div style={curiosityHistoryPanel}>
                    {curiosityHistory.length === 0 ? (
                      <p style={{ margin: 0, color: "#94a3b8" }}>
                        {t.curiosityHistoryEmpty}
                      </p>
                    ) : (
                      curiosityHistory.slice(0, 8).map((item: any, index: number) => (
                        <div key={item.answer_id || index} style={curiosityHistoryItem}>
                          <div style={{ fontWeight: 700, lineHeight: 1.45 }}>
                            {item.question}
                          </div>
                          <div style={{ marginTop: "6px", fontSize: "12px", color: "#94a3b8" }}>
                            {item.category} • {item.correct ? "✅ Correct" : "❌ Wrong"} • +{item.xp_earned} XP
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          <section style={motivationCard}>
            <div style={{ fontSize: "42px" }}>✨</div>
            <div>
              <h3 style={{ margin: 0 }}>The more you explore, the more you learn.</h3>
              <p style={{ margin: "6px 0 0", opacity: 0.72 }}>
                Stay curious. Ask questions. Discover something new every day.
              </p>
            </div>
          </section>

          {mockTestOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(2, 6, 23, 0.82)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                zIndex: 10000,
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "750px",
                  background: "#111827",
                  color: "white",
                  borderRadius: "20px",
                  padding: "28px",
                  boxSizing: "border-box",
                  boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
                  margin: "20px 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0 }}>📝 Weekly Mock Test</h2>
                    <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
                      Weekly exam practice
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMockTestOpen(false);
                      setSelectedMockTest(null);
                      setMockResult(null);
                      setMockAnswers({});
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "white",
                      fontSize: "24px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>

                {message && (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: "#3f1d1d",
                      marginBottom: "15px",
                    }}
                  >
                    {message}
                  </div>
                )}

                {!selectedMockTest && !mockResult && (
                  <div>
                    <h3>Available Mock Tests</h3>

                    {mockTests.length === 0 ? (
                      <div
                        style={{
                          padding: "20px",
                          borderRadius: "12px",
                          background: "#1f2937",
                          textAlign: "center",
                        }}
                      >
                        <p>No published mock tests available yet.</p>
                        <p style={{ opacity: 0.7 }}>
                          Your teacher will publish the weekly test here.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: "14px" }}>
                        {mockTests.map((test) => (
                          <div
                            key={test.id}
                            style={{
                              padding: "18px",
                              borderRadius: "14px",
                              background: "#1f2937",
                              border: "1px solid #374151",
                            }}
                          >
                            <h3 style={{ marginTop: 0 }}>{test.title}</h3>
                            <p style={{ opacity: 0.75 }}>Week {test.week}</p>
                            {test.description && (
                              <p style={{ opacity: 0.8 }}>{test.description}</p>
                            )}
                            <button
                              type="button"
                              style={exploreButton}
                              onClick={() => openMockTest(test.id)}
                              disabled={mockLoading}
                            >
                              {mockLoading ? "Loading..." : "Start Test →"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedMockTest && !mockResult && (
                  <div>
                    <h2>{selectedMockTest.title}</h2>
                    <p style={{ opacity: 0.7 }}>Week {selectedMockTest.week}</p>

                    <div style={{ marginTop: "20px", display: "grid", gap: "22px" }}>
                      {selectedMockTest.questions.map((question: any, questionIndex: number) => (
                        <div
                          key={question.id}
                          style={{
                            padding: "20px",
                            borderRadius: "15px",
                            background: "#1f2937",
                            border: "1px solid #374151",
                          }}
                        >
                          <h3 style={{ lineHeight: 1.5 }}>
                            {questionIndex + 1}. {question.question}
                          </h3>

                          <div style={{ display: "grid", gap: "10px" }}>
                            {question.options.map((option: string, optionIndex: number) => {
                              const selected = mockAnswers[question.id] === optionIndex;

                              return (
                                <button
                                  key={optionIndex}
                                  type="button"
                                  onClick={() =>
                                    setMockAnswers((prev) => ({
                                      ...prev,
                                      [question.id]: optionIndex,
                                    }))
                                  }
                                  style={{
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "14px 16px",
                                    borderRadius: "10px",
                                    border: selected
                                      ? "2px solid #60a5fa"
                                      : "1px solid #374151",
                                    background: selected ? "#1d4ed8" : "#111827",
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                  }}
                                >
                                  {String.fromCharCode(65 + optionIndex)}. {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      style={{
                        ...exploreButton,
                        width: "100%",
                        marginTop: "25px",
                        opacity: mockSubmitting ? 0.6 : 1,
                      }}
                      onClick={submitMockTest}
                      disabled={mockSubmitting}
                    >
                      {mockSubmitting ? "Submitting..." : "Submit Mock Test ✓"}
                    </button>
                  </div>
                )}

                {mockResult && (
                  <div>
                    <div
                      style={{
                        textAlign: "center",
                        padding: "25px",
                        borderRadius: "15px",
                        background: "#1f2937",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ fontSize: "50px" }}>🎉</div>
                      <h2>Test Completed!</h2>
                      <h1>{mockResult.score} / {mockResult.total}</h1>
                      <p style={{ fontSize: "20px" }}>{mockResult.percentage}%</p>
                    </div>

                    <h2>📊 Answer Review</h2>

                    <div style={{ display: "grid", gap: "15px" }}>
                      {mockResult.results.map((result: any, index: number) => {
                        const question = selectedMockTest?.questions.find(
                          (q: any) => q.id === result.question_id
                        );

                        return (
                          <div
                            key={result.question_id}
                            style={{
                              padding: "18px",
                              borderRadius: "14px",
                              background: result.correct ? "#14532d" : "#7f1d1d",
                              border: "1px solid #374151",
                            }}
                          >
                            <h3>{index + 1}. {question?.question}</h3>
                            <p>{result.correct ? "✅ Correct" : "❌ Wrong"}</p>
                            <p>
                              <strong>Your answer:</strong>{" "}
                              {result.selected_answer >= 0
                                ? `${String.fromCharCode(65 + result.selected_answer)}. ${question?.options[result.selected_answer]}`
                                : "Not answered"}
                            </p>
                            <p>
                              <strong>Correct answer:</strong>{" "}
                              {String.fromCharCode(65 + result.correct_answer)}. {question?.options[result.correct_answer]}
                            </p>
                            {result.explanation && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  padding: "12px",
                                  borderRadius: "10px",
                                  background: "rgba(0,0,0,0.2)",
                                }}
                              >
                                💡 <strong>Explanation:</strong> {result.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      style={{ ...exploreButton, width: "100%", marginTop: "25px" }}
                      onClick={() => {
                        setMockTestOpen(false);
                        setSelectedMockTest(null);
                        setMockResult(null);
                        setMockAnswers({});
                      }}
                    >
                      Back to Dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chapter Quiz Selection Modal */}
          {chapterModalOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(2, 6, 23, 0.82)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                zIndex: 10000,
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "720px",
                  background: "#111827",
                  color: "white",
                  borderRadius: "24px",
                  padding: "30px",
                  boxSizing: "border-box",
                  boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
                  border: "1px solid rgba(148, 163, 184, 0.15)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#60a5fa", fontWeight: 700 }}>
                      CHAPTER PRACTICE
                    </span>
                    <h2 style={{ margin: "4px 0 0", fontSize: "24px" }}>🧠 Take Geography Quiz</h2>
                    <p style={{ margin: "4px 0 0", opacity: 0.72, fontSize: "14px" }}>
                      Choose a chapter to practice or test all geography topics:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChapterModalOpen(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "white",
                      fontSize: "26px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>

                {userRole === "teacher" && (
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))",
                      border: "1px dashed rgba(167, 139, 250, 0.5)",
                      borderRadius: "16px",
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#c4b5fd" }}>🧑‍🏫 Teacher Control</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", opacity: 0.8 }}>
                        Want to add or manage quiz questions by chapter?
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setChapterModalOpen(false);
                        setTeacherQuizManagerOpen(true);
                        loadQuizChapters();
                        loadTeacherQuizQuestions("All");
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        background: "#8b5cf6",
                        color: "white",
                        border: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      ➕ Add / Manage Chapter Questions →
                    </button>
                  </div>
                )}

                {chaptersLoading ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                    Loading chapters... 🌍
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", maxHeight: "400px", overflowY: "auto", paddingRight: "6px" }}>
                    <button
                      type="button"
                      onClick={() => startChapterQuiz("All")}
                      style={{
                        background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                        border: "1px solid #3b82f6",
                        borderRadius: "16px",
                        padding: "16px",
                        textAlign: "left",
                        color: "white",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gridColumn: "1 / -1",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "16px" }}>🌍 All Chapters • Mixed Quiz</div>
                        <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "3px" }}>
                          Practice random questions from all geography chapters
                        </div>
                      </div>
                      <span style={{ fontSize: "20px" }}>→</span>
                    </button>

                    {chapterList.map((ch, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => startChapterQuiz(ch.chapter)}
                        style={{
                          background: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "14px",
                          padding: "14px 16px",
                          textAlign: "left",
                          color: "white",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: "8px" }}>
                          <div style={{ fontWeight: 600, fontSize: "14px", lineHeight: 1.4 }}>
                            {ch.chapter}
                          </div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                            {ch.question_count > 0 ? `${ch.question_count} Questions available` : "Practice Chapter"}
                          </div>
                        </div>
                        <span style={{ fontSize: "16px", color: "#60a5fa" }}>▶</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Teacher Verification & Approval Modal */}
          {teacherApprovalsOpen && (userRole === "teacher" || userRole === "admin") && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(2, 6, 23, 0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                zIndex: 11000,
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "920px",
                  background: "#111827",
                  color: "white",
                  borderRadius: "24px",
                  padding: "30px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    paddingBottom: "16px",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, fontSize: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                      🛡️ Teacher Verification & Approval
                    </h2>
                    <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: "14px" }}>
                      যাচাই করুন এবং নতুন শিক্ষকদের নিবন্ধন অনুমোদন করুন (Review & verify teacher registrations).
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={loadAdminTeachers}
                      style={{
                        ...logoutStyle,
                        background: "#334155",
                        color: "white",
                        fontSize: "13px",
                      }}
                    >
                      ↻ Refresh
                    </button>
                    <button
                      onClick={() => {
                        setTeacherApprovalsOpen(false);
                        setAdminActionMessage("");
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "white",
                        fontSize: "24px",
                        cursor: "pointer",
                        padding: "4px 8px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {adminActionMessage && (
                  <div
                    style={{
                      padding: "12px 18px",
                      background: "rgba(34, 197, 94, 0.18)",
                      border: "1px solid rgba(34, 197, 94, 0.4)",
                      borderRadius: "12px",
                      marginBottom: "20px",
                      color: "#86efac",
                      fontSize: "14px",
                    }}
                  >
                    {adminActionMessage}
                  </div>
                )}

                {/* Pending Verification Section */}
                <div style={{ marginBottom: "32px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "#f87171" }}>
                      ⏳ Pending Verification ({adminTeachers.pending_count})
                    </h3>
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>
                      (অনুমোদনের জন্য অপেক্ষারত শিক্ষক)
                    </span>
                  </div>

                  {adminTeachersLoading ? (
                    <div style={{ padding: "20px", textAlign: "center", opacity: 0.7 }}>Loading teachers...</div>
                  ) : adminTeachers.pending.length === 0 ? (
                    <div
                      style={{
                        padding: "24px",
                        borderRadius: "16px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px dashed rgba(255, 255, 255, 0.15)",
                        textAlign: "center",
                        opacity: 0.8,
                      }}
                    >
                      ✅ কোনো অপেক্ষারত শিক্ষক নেই (No pending teacher registrations).
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "12px" }}>
                      {adminTeachers.pending.map((t: any) => (
                        <div
                          key={t.id}
                          style={{
                            padding: "18px",
                            borderRadius: "16px",
                            background: "rgba(239, 68, 68, 0.08)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "14px",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <strong style={{ fontSize: "17px" }}>{t.name}</strong>
                              <span
                                style={{
                                  fontSize: "11px",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  background: "#f87171",
                                  color: "#0f172a",
                                  fontWeight: "bold",
                                }}
                              >
                                Pending Review
                              </span>
                            </div>
                            <div style={{ fontSize: "13px", opacity: 0.7, marginTop: "4px" }}>
                              📧 {t.email}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              type="button"
                              onClick={() => approveTeacher(t.id, t.name)}
                              style={{
                                padding: "8px 18px",
                                background: "#16a34a",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "13px",
                              }}
                            >
                              ✅ Approve Teacher
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectTeacher(t.id, t.name)}
                              style={{
                                padding: "8px 14px",
                                background: "#dc2626",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontSize: "13px",
                              }}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Approved Teachers Section */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "#4ade80" }}>
                      ✅ Approved Teachers ({adminTeachers.approved_count})
                    </h3>
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>
                      (অনুমোদিত ও সক্রিয় শিক্ষকবৃন্দ)
                    </span>
                  </div>

                  {adminTeachers.approved.length === 0 ? (
                    <div style={{ padding: "16px", opacity: 0.7 }}>No approved teachers found.</div>
                  ) : (
                    <div style={{ display: "grid", gap: "10px" }}>
                      {adminTeachers.approved.map((t: any) => (
                        <div
                          key={t.id}
                          style={{
                            padding: "14px 18px",
                            borderRadius: "14px",
                            background: "rgba(34, 197, 94, 0.06)",
                            border: "1px solid rgba(34, 197, 94, 0.2)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <strong>{t.name}</strong>
                              <span
                                style={{
                                  fontSize: "11px",
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  background: "rgba(74, 222, 128, 0.2)",
                                  color: "#86efac",
                                  border: "1px solid rgba(74, 222, 128, 0.3)",
                                }}
                              >
                                Active
                              </span>
                            </div>
                            <div style={{ fontSize: "13px", opacity: 0.7, marginTop: "2px" }}>
                              📧 {t.email}
                            </div>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => revokeTeacher(t.id, t.name)}
                              style={{
                                padding: "6px 14px",
                                background: "rgba(239, 68, 68, 0.2)",
                                color: "#fca5a5",
                                border: "1px solid rgba(239, 68, 68, 0.4)",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              Revoke Approval ⚠️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Teacher Chapter Quiz Manager Modal */}
          {teacherQuizManagerOpen && userRole === "teacher" && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(2, 6, 23, 0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                zIndex: 11000,
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "900px",
                  background: "#111827",
                  color: "white",
                  borderRadius: "24px",
                  padding: "30px",
                  boxSizing: "border-box",
                  margin: "20px 0",
                  boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#c4b5fd", fontWeight: 700 }}>
                      TEACHER ACCESS
                    </span>
                    <h2 style={{ margin: "4px 0 0", fontSize: "24px" }}>🧠 Chapter Quiz Manager</h2>
                    <p style={{ margin: "4px 0 0", opacity: 0.72, fontSize: "14px" }}>
                      Take Quiz-এর জন্য অধ্যায়ভিত্তিক (Chapter-wise) প্রশ্ন যোগ ও পরিচালনা করুন।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTeacherQuizManagerOpen(false);
                      setMessage("");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "white",
                      fontSize: "26px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>

                {message && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "#1e3a5f",
                      border: "1px solid #3b82f6",
                      marginBottom: "20px",
                      fontSize: "14px",
                    }}
                  >
                    {message}
                  </div>
                )}

                {/* Form to Add Question */}
                <div style={{ ...adminFormCard, background: "#1f2937", border: "1px solid #374151" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "18px", color: "#93c5fd" }}>
                    ➕ Add Question by Chapter (অধ্যায়ভিত্তিক প্রশ্ন যোগ করুন)
                  </h3>

                  <form onSubmit={addTeacherQuizQuestion}>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#cbd5e1" }}>
                        Select or Create Chapter (অধ্যায় নির্বাচন করুন):
                      </label>
                      <select
                        style={{ ...inputStyle, cursor: "pointer" }}
                        value={teacherQuizForm.chapter}
                        onChange={(e) =>
                          setTeacherQuizForm({ ...teacherQuizForm, chapter: e.target.value })
                        }
                      >
                        {chapterList.map((ch, i) => (
                          <option key={i} value={ch.chapter}>
                            {ch.chapter} ({ch.question_count} Qs)
                          </option>
                        ))}
                        <option value="__new__">➕ + Create New Chapter (নতুন অধ্যায় লিখুন)</option>
                      </select>
                    </div>

                    {teacherQuizForm.chapter === "__new__" && (
                      <div style={{ marginBottom: "14px" }}>
                        <input
                          style={inputStyle}
                          placeholder="Enter new chapter name (e.g. Rocks and Minerals / শিলা ও খনিজ)"
                          value={teacherQuizForm.customChapter}
                          onChange={(e) =>
                            setTeacherQuizForm({ ...teacherQuizForm, customChapter: e.target.value })
                          }
                          required
                        />
                      </div>
                    )}

                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#cbd5e1" }}>
                        Question Text (প্রশ্নের বিবরণ):
                      </label>
                      <textarea
                        style={{ ...inputStyle, minHeight: "75px", resize: "vertical" as const }}
                        placeholder="Write the geography question here..."
                        value={teacherQuizForm.question}
                        onChange={(e) =>
                          setTeacherQuizForm({ ...teacherQuizForm, question: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8" }}>Option A:</label>
                        <input
                          style={inputStyle}
                          placeholder="Option A"
                          value={teacherQuizForm.option_a}
                          onChange={(e) =>
                            setTeacherQuizForm({ ...teacherQuizForm, option_a: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8" }}>Option B:</label>
                        <input
                          style={inputStyle}
                          placeholder="Option B"
                          value={teacherQuizForm.option_b}
                          onChange={(e) =>
                            setTeacherQuizForm({ ...teacherQuizForm, option_b: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8" }}>Option C:</label>
                        <input
                          style={inputStyle}
                          placeholder="Option C"
                          value={teacherQuizForm.option_c}
                          onChange={(e) =>
                            setTeacherQuizForm({ ...teacherQuizForm, option_c: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8" }}>Option D:</label>
                        <input
                          style={inputStyle}
                          placeholder="Option D"
                          value={teacherQuizForm.option_d}
                          onChange={(e) =>
                            setTeacherQuizForm({ ...teacherQuizForm, option_d: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginBottom: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#cbd5e1" }}>
                          Correct Answer:
                        </label>
                        <select
                          style={{ ...inputStyle, cursor: "pointer" }}
                          value={teacherQuizForm.correct_answer}
                          onChange={(e) =>
                            setTeacherQuizForm({ ...teacherQuizForm, correct_answer: e.target.value })
                          }
                        >
                          <option value="0">Option A</option>
                          <option value="1">Option B</option>
                          <option value="2">Option C</option>
                          <option value="3">Option D</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", color: "#cbd5e1" }}>
                          Explanation (ব্যাখ্যা - optional):
                        </label>
                        <input
                          style={inputStyle}
                          placeholder="Why is this answer correct?"
                          value={teacherQuizForm.explanation}
                          onChange={(e) =>
                            setTeacherQuizForm({ ...teacherQuizForm, explanation: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{ ...buttonStyle, background: "#8b5cf6" }}
                      disabled={teacherQuizSaving}
                    >
                      {teacherQuizSaving ? "Adding Question..." : "➕ Add Question to Chapter"}
                    </button>
                  </form>
                </div>

                {/* Existing Questions List */}
                <div style={{ marginTop: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>
                      📚 Existing Questions ({teacherQuizQuestions.length})
                    </h3>
                    <select
                      style={{ ...inputStyle, width: "auto", minWidth: "200px", padding: "6px 12px" }}
                      value={teacherQuizFilterChapter}
                      onChange={(e) => {
                        setTeacherQuizFilterChapter(e.target.value);
                        loadTeacherQuizQuestions(e.target.value);
                      }}
                    >
                      <option value="All">All Chapters (সব অধ্যায়)</option>
                      {chapterList.map((ch, idx) => (
                        <option key={idx} value={ch.chapter}>
                          {ch.chapter}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ maxHeight: "380px", overflowY: "auto", display: "grid", gap: "12px" }}>
                    {teacherQuizQuestions.map((q) => (
                      <div
                        key={q.id}
                        style={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "14px",
                          padding: "16px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                          <div>
                            <span
                              style={{
                                fontSize: "12px",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                background: "rgba(139, 92, 246, 0.25)",
                                color: "#c4b5fd",
                                fontWeight: 600,
                              }}
                            >
                              {q.chapter}
                            </span>
                            <h4 style={{ margin: "8px 0 6px", fontSize: "15px" }}>{q.question}</h4>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteTeacherQuizQuestion(q.id)}
                            style={{
                              background: "#7f1d1d",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              padding: "4px 10px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px", fontSize: "13px" }}>
                          {q.options.map((opt: string, optIdx: number) => {
                            const isCorrect = optIdx === q.answer;
                            return (
                              <div
                                key={optIdx}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  background: isCorrect ? "rgba(22, 101, 52, 0.5)" : "rgba(15, 23, 42, 0.5)",
                                  border: isCorrect ? "1px solid #22c55e" : "1px solid transparent",
                                  color: isCorrect ? "#86efac" : "#cbd5e1",
                                  fontWeight: isCorrect ? 600 : 400,
                                }}
                              >
                                {String.fromCharCode(65 + optIdx)}. {opt} {isCorrect && "✓"}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div style={{ marginTop: "8px", fontSize: "12px", color: "#94a3b8" }}>
                            💡 <em>{q.explanation}</em>
                          </div>
                        )}
                      </div>
                    ))}

                    {teacherQuizQuestions.length === 0 && (
                      <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8", background: "#1e293b", borderRadius: "12px" }}>
                        No questions found for this chapter yet. Use the form above to add questions!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Result Screen */}
          {quizOpen && quizShowResult && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 9999 }}>
              <div style={{ background: "#111827", borderRadius: "20px", padding: "36px 28px", maxWidth: "420px", width: "100%", textAlign: "center", color: "#fff" }}>
                <div style={{ fontSize: "64px", marginBottom: "12px" }}>
                  {quizScore === quizQuestions.length ? "🏆" : quizScore >= quizQuestions.length / 2 ? "🎉" : "📚"}
                </div>
                <h2 style={{ margin: "0 0 8px" }}>Quiz Completed!</h2>
                <p style={{ opacity: 0.7, margin: "0 0 20px" }}>Chapter: {selectedChapterName}</p>
                <div style={{ fontSize: "48px", fontWeight: 800, color: quizScore >= quizQuestions.length / 2 ? "#4ade80" : "#f87171" }}>
                  {quizScore} / {quizQuestions.length}
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, marginTop: "8px", color: "#a5f3fc" }}>
                  {Math.round((quizScore / quizQuestions.length) * 100)}%
                </div>
                <p style={{ opacity: 0.65, margin: "12px 0 24px", fontSize: "14px" }}>
                  {quizScore === quizQuestions.length ? "নিখুঁত স্কোর! অসাধারণ! 🌟" : quizScore >= quizQuestions.length / 2 ? "দারুণ কাজ! আরো practice করো।" : "চিন্তা নেই — আবার চেষ্টা করো! 💪"}
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => { setQuizOpen(false); setQuizShowResult(false); setQuizQuestion(0); setQuizAnswer(null); setQuizScore(0); }}
                    style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
                    ← Dashboard-এ ফিরুন
                  </button>
                  <button type="button" onClick={() => { setQuizShowResult(false); setQuizQuestion(0); setQuizAnswer(null); setQuizScore(0); }}
                    style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
                    🔄 আবার খেলো
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Question Screen */}
          {quizOpen && !quizShowResult && quizQuestions.length > 0 && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(2, 6, 23, 0.78)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "650px",
                  background: "#111827",
                  color: "white",
                  borderRadius: "20px",
                  padding: "28px",
                  boxSizing: "border-box",
                  boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0 }}>🧠 {selectedChapterName && selectedChapterName !== "All" ? selectedChapterName : "Quick Quiz"}</h2>
                    <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
                      Question {quizQuestion + 1} of {quizQuestions.length}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuizOpen(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "white",
                      fontSize: "24px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    height: "8px",
                    background: "#374151",
                    borderRadius: "999px",
                    overflow: "hidden",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      width: `${((quizQuestion + 1) / quizQuestions.length) * 100}%`,
                      height: "100%",
                      background: "#2563eb",
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>

                <h3
                  style={{
                    fontSize: "22px",
                    lineHeight: 1.4,
                    marginBottom: "22px",
                  }}
                >
                  {quizQuestions[quizQuestion].question}
                </h3>

                <div style={{ display: "grid", gap: "12px" }}>
                  {quizQuestions[quizQuestion].options.map((option, index) => {
                    const isCorrect =
                      index === quizQuestions[quizQuestion].answer;

                    let background = "#1f2937";
                    if (quizAnswer !== null && isCorrect) {
                      background = "#166534";
                    } else if (quizAnswer === index) {
                      background = "#991b1b";
                    }

                    return (
                      <button
                        key={`${quizQuestion}-${index}`}
                        type="button"
                        disabled={quizAnswer !== null}
                        onClick={() => {
                          if (quizAnswer !== null) return;

                          setQuizAnswer(index);

                          if (index === quizQuestions[quizQuestion].answer) {
                            setQuizScore((score) => score + 1);
                          }
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "15px 18px",
                          borderRadius: "12px",
                          border: "1px solid #374151",
                          background,
                          color: "white",
                          cursor: quizAnswer === null ? "pointer" : "default",
                          fontSize: "16px",
                        }}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </button>
                    );
                  })}
                </div>

                {quizAnswer !== null && (
                  <button
                    type="button"
                    style={{
                      ...exploreButton,
                      marginTop: "22px",
                      width: "100%",
                    }}
                    onClick={() => {
                      if (quizQuestion < quizQuestions.length - 1) {
                        setQuizQuestion((q) => q + 1);
                        setQuizAnswer(null);
                      } else {
                        void logStudentActivity(
                          "quick_quiz",
                          `Quiz: ${selectedChapterName}`,
                          Math.round((quizScore / quizQuestions.length) * 100),
                          { total: quizQuestions.length, chapter: selectedChapterName }
                        ).then(() => loadStudentDashboardData());
                        setQuizShowResult(true);
                      }
                    }}
                  >
                    {quizQuestion < quizQuestions.length - 1
                      ? "Next Question →"
                      : "Finish Quiz ✓"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Profile Setup
  // --------------------------------------------------

  if (loggedIn) {
    return (
      <div style={pageStyle}>
        <div
          style={{
          ...cardStyle,
          background: "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
          width: "400px",
          maxWidth: "100%",
          }}
        >
        <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "12px",
  }}
>
  <button
    type="button"
    onClick={logout}
    style={{
      ...logoutStyle,
      background: "#dc2626",
      color: "white",
      fontWeight: 700,
      padding: "9px 16px",
      borderRadius: "8px",
    }}
  >
    🔓 Logout
  </button>
</div>
          <h1>{t.setupProfile}</h1>

          <p>{t.profileDescription}</p>

          <form onSubmit={handleProfile}>
            <input
              placeholder={t.classPlaceholder}
              value={className}
              onChange={(e) =>
                setClassName(e.target.value)
              }
              required
              style={inputStyle}
            />

            <input
              placeholder={t.boardPlaceholder}
              value={board}
              onChange={(e) =>
                setBoard(e.target.value)
              }
              required
              style={inputStyle}
            />

            <input
              placeholder={t.mediumPlaceholder}
              value={medium}
              onChange={(e) =>
                setMedium(e.target.value)
              }
              required
              style={inputStyle}
            />

            <button
              type="submit"
              style={buttonStyle}
            >
              {t.continueGeography}
            </button>
          </form>

          {message && (
            <p style={{ textAlign: "center" }}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Login / Register
  // --------------------------------------------------

  return (
    <div style={authPageStyle} className="curiosity-auth-page">
      <div style={authGlowOne}></div>
      <div style={authGlowTwo}></div>

      <div style={authLayout} className="curiosity-auth-layout">
        <div style={authBrandSection} className="curiosity-auth-brand">
          <div style={authBrandBadge}>🌍 CURIOSITY LEARN</div>
          <h1 style={authBrandTitle} className="curiosity-auth-title">CuriosityLearn 🚀</h1>
          <p style={authBrandSubtitle}>
            Explore Geography.
            <br />
            Learn by curiosity.
          </p>

          <div style={authFeatureList} className="curiosity-auth-features">
            <div style={authFeatureItem}>
              <div style={authFeatureIcon}>🌍</div>
              <div>
                <strong>Explore the World</strong>
                <span style={authFeatureText}>Discover countries, maps and amazing places.</span>
              </div>
            </div>
            <div style={authFeatureItem}>
              <div style={authFeatureIcon}>📚</div>
              <div>
                <strong>Learn Geography</strong>
                <span style={authFeatureText}>Learn through interactive lessons and resources.</span>
              </div>
            </div>
            <div style={authFeatureItem}>
              <div style={authFeatureIcon}>🧠</div>
              <div>
                <strong>Practice & Improve</strong>
                <span style={authFeatureText}>Take quizzes and mock tests to test your knowledge.</span>
              </div>
            </div>
          </div>
        </div>

        <div style={authCard} className="curiosity-auth-card">
          <div style={authLanguageRow}>
            <button type="button" onClick={() => changeLanguage("en")} style={{ ...authLanguageButton, background: language === "en" ? "#2563eb" : "rgba(255,255,255,0.08)", color: language === "en" ? "white" : "#cbd5e1", border: language === "en" ? "1px solid #3b82f6" : "1px solid rgba(148,163,184,0.18)" }}>English</button>
            <button type="button" onClick={() => changeLanguage("bn")} style={{ ...authLanguageButton, background: language === "bn" ? "#2563eb" : "rgba(255,255,255,0.08)", color: language === "bn" ? "white" : "#cbd5e1", border: language === "bn" ? "1px solid #3b82f6" : "1px solid rgba(148,163,184,0.18)" }}>বাংলা</button>
          </div>

          <div style={authIconCircle}>{isLogin ? "👋" : "🚀"}</div>

          <div style={{ textAlign: "center" }}>
            <span style={authSmallLabel}>{isLogin ? "WELCOME BACK" : "GET STARTED"}</span>
            <h2 style={authTitle}>{isLogin ? "Welcome back, Explorer!" : "Create your Explorer account"}</h2>
            <p style={authDescription}>{isLogin ? "Continue your curiosity journey and explore the world." : "Join CuriosityLearn and start your geography journey."}</p>
          </div>

          <form onSubmit={handleAuth} style={{ marginTop: "24px" }}>
            {!isLogin && (
              <div style={authFieldGroup}>
                <label style={authLabel}>👤 {t.yourName}</label>
                <input type="text" placeholder={t.yourName} value={name} onChange={(e) => setName(e.target.value)} required style={authInput} />
              </div>
            )}
            <div style={authFieldGroup}>
              <label style={authLabel}>✉️ {t.email}</label>
              <input type="email" placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} required style={authInput} />
            </div>
            <div style={authFieldGroup}>
              <label style={authLabel}>🔒 {t.password}</label>
              <input type="password" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} required style={authInput} />
            </div>

            {!isLogin && (
              <div style={authFieldGroup}>
                <label style={authLabel}>👤 {t.role}</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                  style={{ ...authInput, cursor: "pointer" }}
                >
                  <option value="student">{t.studentRole}</option>
                  <option value="teacher">{t.teacherRole}</option>
                </select>
              </div>
            )}

            <button type="submit" style={authSubmitButton}>
              <span>{isLogin ? "🚀 Login to Dashboard" : "✨ Create Account"}</span>
              <span style={authButtonArrow}>→</span>
            </button>
          </form>

          {isLogin && !forgotMode && (
            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => { setForgotMode(true); setMessage(""); setResetStep("email"); }}
                style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}
              >
                🔑 Forgot password?
              </button>
            </div>
          )}

          {forgotMode && (
            <div style={{ marginTop: "20px", padding: "20px", borderRadius: "16px", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(96,165,250,0.2)" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "16px", color: "#93c5fd" }}>
                {resetStep === "email" ? "🔑 Password Reset" : "🔒 New Password"}
              </h3>

              {resetStep === "email" ? (
                <form onSubmit={handleForgotPassword}>
                  <p style={{ opacity: 0.75, fontSize: "13px", marginBottom: "12px" }}>
                    Registered email address লিখুন।
                  </p>
                  <input
                    type="email"
                    placeholder="আপনার email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    style={{ ...authInput, marginBottom: "10px" }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" style={{ ...authSubmitButton, flex: 1, justifyContent: "center" }}>
                      <span>Get Reset Code →</span>
                    </button>
                    <button type="button" onClick={() => { setForgotMode(false); setMessage(""); }} style={{ padding: "10px 16px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "13px" }}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <p style={{ opacity: 0.75, fontSize: "13px", marginBottom: "12px" }}>
                    নতুন password দিন (কমপক্ষে ৬ character)।
                  </p>
                  <input
                    type="password"
                    placeholder="নতুন password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ ...authInput, marginBottom: "10px" }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" style={{ ...authSubmitButton, flex: 1, justifyContent: "center" }}>
                      <span>✅ Reset Password</span>
                    </button>
                    <button type="button" onClick={() => { setResetStep("email"); setNewPassword(""); }} style={{ padding: "10px 16px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: "13px" }}>
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {message && <div style={{ ...authMessage, background: message.toLowerCase().includes("successful") ? "rgba(22,163,74,0.15)" : "rgba(239,68,68,0.12)", border: message.toLowerCase().includes("successful") ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.25)", color: message.toLowerCase().includes("successful") ? "#86efac" : "#fca5a5" }}>{message}</div>}

          <div style={authSwitchArea}>
            <div style={authDivider}><span style={authDividerLine}></span><small>{isLogin ? "New Explorer?" : "Already an Explorer?"}</small><span style={authDividerLine}></span></div>
            <button type="button" onClick={() => { setIsLogin(!isLogin); setMessage(""); setPassword(""); setSelectedRole("student"); }} style={authSwitchButton}>{isLogin ? "Create a new account →" : "← Back to Login"}</button>
          </div>
          <p style={authFooter}>🌍 Learn • Explore • Discover</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 850px) {
          .curiosity-auth-layout { grid-template-columns: 1fr !important; gap: 25px !important; max-width: 520px !important; }
          .curiosity-auth-brand { text-align: center; }
          .curiosity-auth-features { display: none; }
          .curiosity-auth-title { font-size: 46px !important; }
        }
        @media (max-width: 520px) {
          .curiosity-auth-page { padding: 15px !important; }
          .curiosity-auth-card { padding: 22px !important; border-radius: 20px !important; }
        }
      `}</style>
    </div>
  );
}

// --------------------------------------------------
// Styles
// --------------------------------------------------

const authPageStyle = {
  minHeight: "100vh", width: "100%", position: "relative" as const, overflow: "hidden",
  background: "radial-gradient(circle at 10% 15%, rgba(37,99,235,0.20), transparent 28%), radial-gradient(circle at 90% 10%, rgba(14,165,233,0.16), transparent 25%), linear-gradient(135deg, #020617 0%, #07152f 45%, #020617 100%)",
  color: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "30px", boxSizing: "border-box" as const,
};
const authGlowOne = { position: "absolute" as const, width: "420px", height: "420px", borderRadius: "50%", background: "rgba(37,99,235,0.10)", filter: "blur(80px)", top: "-140px", left: "-120px", pointerEvents: "none" as const };
const authGlowTwo = { position: "absolute" as const, width: "380px", height: "380px", borderRadius: "50%", background: "rgba(14,165,233,0.08)", filter: "blur(90px)", right: "-100px", bottom: "-140px", pointerEvents: "none" as const };
const authLayout = { width: "100%", maxWidth: "1180px", minHeight: "650px", display: "grid", gridTemplateColumns: "1fr 430px", gap: "50px", alignItems: "center", position: "relative" as const, zIndex: 2 };
const authBrandSection = { padding: "20px" };
const authBrandBadge = { display: "inline-flex", alignItems: "center", padding: "8px 14px", borderRadius: "999px", background: "rgba(37,99,235,0.12)", border: "1px solid rgba(96,165,250,0.22)", color: "#93c5fd", fontSize: "12px", fontWeight: 800, letterSpacing: "0.12em" };
const authBrandTitle = { margin: "22px 0 10px", fontSize: "clamp(42px, 6vw, 72px)", lineHeight: 1, letterSpacing: "-0.04em", background: "linear-gradient(135deg, #ffffff 20%, #93c5fd 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
const authBrandSubtitle = { margin: 0, color: "#cbd5e1", fontSize: "21px", lineHeight: 1.5, maxWidth: "520px" };
const authFeatureList = { display: "grid", gap: "14px", marginTop: "40px", maxWidth: "560px" };
const authFeatureItem = { display: "flex", alignItems: "center", gap: "15px", padding: "15px 16px", borderRadius: "16px", background: "rgba(15,23,42,0.55)", border: "1px solid rgba(96,165,250,0.12)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" };
const authFeatureIcon = { width: "46px", height: "46px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(37,99,235,0.15)", fontSize: "23px", flexShrink: 0 };
const authFeatureText = { display: "block", marginTop: "4px", color: "#94a3b8", fontSize: "12px", lineHeight: 1.4 };
const authCard = { width: "100%", boxSizing: "border-box" as const, padding: "30px", borderRadius: "26px", background: "linear-gradient(145deg, rgba(15,23,42,0.94), rgba(7,27,61,0.94))", border: "1px solid rgba(96,165,250,0.20)", boxShadow: "0 30px 90px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" };
const authLanguageRow = { display: "flex", justifyContent: "flex-end", gap: "7px", marginBottom: "20px" };
const authLanguageButton = { padding: "7px 11px", borderRadius: "9px", cursor: "pointer", fontSize: "12px", fontWeight: 700 };
const authIconCircle = { width: "58px", height: "58px", margin: "0 auto 18px", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(14,165,233,0.12))", border: "1px solid rgba(96,165,250,0.22)", fontSize: "27px", boxShadow: "0 12px 30px rgba(37,99,235,0.16)" };
const authSmallLabel = { color: "#60a5fa", fontSize: "10px", fontWeight: 800, letterSpacing: "0.16em" };
const authTitle = { margin: "8px 0", fontSize: "27px", lineHeight: 1.2, color: "#f8fafc" };
const authDescription = { margin: 0, color: "#94a3b8", fontSize: "13px", lineHeight: 1.6 };
const authFieldGroup = { marginBottom: "15px" };
const authLabel = { display: "block", marginBottom: "7px", color: "#cbd5e1", fontSize: "12px", fontWeight: 700 };
const authInput = { width: "100%", boxSizing: "border-box" as const, padding: "13px 14px", borderRadius: "12px", border: "1px solid rgba(148,163,184,0.20)", background: "rgba(2,6,23,0.65)", color: "#f8fafc", outline: "none", fontSize: "14px", transition: "all 0.2s ease" };
const authSubmitButton = { width: "100%", marginTop: "7px", padding: "14px 17px", border: "none", borderRadius: "13px", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "white", cursor: "pointer", fontWeight: 800, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 12px 30px rgba(37,99,235,0.28)" };
const authButtonArrow = { fontSize: "20px" };
const authMessage = { marginTop: "15px", padding: "11px 13px", borderRadius: "11px", fontSize: "13px", textAlign: "center" as const };
const authSwitchArea = { marginTop: "22px" };
const authDivider = { display: "flex", alignItems: "center", gap: "10px", color: "#64748b" };
const authDividerLine = { flex: 1, height: "1px", background: "rgba(148,163,184,0.14)" };
const authSwitchButton = { width: "100%", marginTop: "12px", padding: "11px", borderRadius: "11px", border: "1px solid rgba(96,165,250,0.18)", background: "rgba(37,99,235,0.08)", color: "#93c5fd", cursor: "pointer", fontWeight: 700, fontSize: "13px" };
const authFooter = { margin: "22px 0 0", textAlign: "center" as const, color: "#475569", fontSize: "11px" };

const pageStyle = {
  minHeight: "100vh",
  width: "100%",
  background: "transparent",
  color: "#f8fafc",
  padding: "clamp(10px, 3vw, 24px)",
  boxSizing: "border-box" as const,
};
const dashboardStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
  paddingBottom: "50px",
};

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  marginBottom: "24px",
  padding: "14px 16px",
  borderRadius: "18px",
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(96,165,250,0.16)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
  flexWrap: "wrap" as const,
};

const welcomeCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "30px",
  borderRadius: "20px",
  background: "linear-gradient(135deg, #0b2a61, #071b3d)",
  border: "1px solid rgba(96,165,250,0.22)",
  marginBottom: "20px",
};

const globeStyle = {
  fontSize: "80px",
  filter: "drop-shadow(0 15px 30px rgba(59,130,246,0.35))",
};

const statsContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: "12px",
  marginBottom: "30px",
};

const statCard = {
  padding: "20px",
  borderRadius: "16px",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(96,165,250,0.15)",
  display: "flex",
  alignItems: "center",
  gap: "15px",
  fontSize: "20px",
};

const statIcon = {
  fontSize: "32px",
};

const geoCard = {
  display: "flex",
  alignItems: "center",
  gap: "25px",
  padding: "30px",
  borderRadius: "20px",
  background: "linear-gradient(135deg, #1d4ed8, #0b3b8f)",
  border: "1px solid rgba(147,197,253,0.22)",
  marginBottom: "35px",
  boxShadow: "0 18px 45px rgba(29,78,216,0.20)",
};

const exploreButton = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "11px",
  cursor: "pointer",
  fontWeight: "bold",
  background: "#2563eb",
  color: "white",
  boxShadow: "0 10px 24px rgba(37,99,235,0.25)",
};

const startChallengeButton = {
  marginTop: "15px",
  padding: "12px 20px",
  border: "none",
  borderRadius: "10px",
  background: "#4A90E2",
  color: "white",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};

const nextChallengeButton = {
  marginTop: "15px",
  padding: "12px 20px",
  border: "none",
  borderRadius: "10px",
  background: "#22c55e",
  color: "white",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};

const languageButton = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
};

const learningGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "18px",
};

const learningCard = {
  padding: "25px",
  borderRadius: "18px",
  background: "rgba(15,23,42,0.78)",
  border: "1px solid rgba(96,165,250,0.16)",
  boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
};
const impactCard = {
  marginTop: "30px",
  padding: "25px",
  borderRadius: "18px",
  background: "#1e293b",
};

const impactGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "15px",
  marginTop: "20px",
};

const impactItem = {
  padding: "18px",
  borderRadius: "14px",
  background: "#0f172a",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: "6px",
};



const learningEmoji = {
  fontSize: "42px",
};

const mediaPlaceholder = {
  width: "100%",
  height: "150px",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
  border: "1px dashed rgba(255,255,255,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center" as const,
  marginBottom: "15px",
  overflow: "hidden",
};

const largeMediaPlaceholder = {
  minHeight: "320px",
  borderRadius: "16px",
  background: "#020617",
  border: "1px dashed rgba(255,255,255,0.25)",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center" as const,
  padding: "30px",
};

// contentPlaceholder and lessonGrid removed (no longer used)

const lessonSection = {
  padding: "20px",
  borderRadius: "18px",
  background: "rgba(30, 41, 59, 0.92)",
  marginBottom: "20px",
};

const lessonTag = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(37, 99, 235, 0.2)",
  color: "#93c5fd",
  fontSize: "12px",
  fontWeight: "bold",
};

const adminFormCard = {
  padding: "25px",
  borderRadius: "18px",
  background: "#1e293b",
  marginTop: "20px",
};

const dashboardHero = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  padding: "clamp(16px, 4vw, 34px)",
  borderRadius: "24px",
  background:
    "linear-gradient(135deg, rgba(7,29,64,0.96), rgba(11,40,85,0.86))",
  border: "1px solid rgba(96,165,250,0.24)",
  boxShadow: "0 25px 70px rgba(0,0,0,0.24)",
  overflow: "hidden",
  position: "relative" as const,
  marginBottom: "20px",
  flexWrap: "wrap" as const,
};

const eyebrow = {
  display: "inline-block",
  fontSize: "12px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "#60a5fa",
  fontWeight: 800,
};

const heroTitle = {
  margin: "10px 0 8px",
  fontSize: "clamp(30px, 4vw, 48px)",
  lineHeight: 1.05,
};

const heroSubtitle = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: "16px",
  maxWidth: "620px",
};

const heroOrb = {
  fontSize: "clamp(48px, 10vw, 110px)",
  lineHeight: 1,
  filter: "drop-shadow(0 20px 35px rgba(59,130,246,0.35))",
  flexShrink: 0,
};

const heroActions = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "10px",
  marginTop: "22px",
};

const primaryAction = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "11px",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const secondaryAction = {
  padding: "12px 18px",
  border: "1px solid rgba(148,163,184,0.28)",
  borderRadius: "11px",
  background: "rgba(15,23,42,0.58)",
  color: "#e2e8f0",
  cursor: "pointer",
  fontWeight: 700,
};

const statGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "12px",
  marginBottom: "24px",
};

const dashboardStatCard = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px",
  borderRadius: "17px",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(96,165,250,0.15)",
  boxShadow: "0 14px 35px rgba(0,0,0,0.14)",
  minWidth: 0,
};

const dashboardStatIcon = {
  width: "48px",
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "14px",
  background: "rgba(37,99,235,0.16)",
  fontSize: "24px",
  flexShrink: 0,
};

const dashboardStatLabel = {
  display: "block",
  color: "#94a3b8",
  fontSize: "12px",
  marginBottom: "5px",
};

const dashboardStatValue = {
  display: "block",
  fontSize: "24px",
  lineHeight: 1,
};

const sectionHeading = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: "20px",
  marginBottom: "16px",
};

const sectionEyebrow = {
  color: "#60a5fa",
  fontSize: "11px",
  letterSpacing: "0.13em",
  fontWeight: 800,
};

const sectionHint = {
  margin: 0,
  color: "#94a3b8",
  fontSize: "14px",
};

const mainDashboardGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "18px",
  alignItems: "start",
};

const featureGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "14px",
};

const featureCard = {
  position: "relative" as const,
  minHeight: "170px",
  padding: "18px",
  borderRadius: "19px",
  background:
    "linear-gradient(145deg, rgba(11,42,97,0.88), rgba(7,27,61,0.88))",
  border: "1px solid rgba(96,165,250,0.18)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
  cursor: "pointer",
  transition: "transform 0.2s ease, border-color 0.2s ease",
  boxSizing: "border-box" as const,
  wordBreak: "break-word" as const,
};

const digitalCitizenshipFeatureCard = {
  background:
    "linear-gradient(145deg, rgba(8,78,98,0.84), rgba(7,27,61,0.90))",
};

const digitalCitizenshipProgress = {
  marginTop: "16px",
  color: "#a5f3fc",
  fontSize: "12px",
  fontWeight: 700,
};

const digitalTopicGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "12px",
  marginTop: "20px",
};

const digitalTopicCard = {
  minHeight: "145px",
  padding: "18px",
  borderRadius: "17px",
  border: "1px solid rgba(96,165,250,0.16)",
  background: "rgba(15,23,42,0.78)",
  color: "white",
  textAlign: "left" as const,
  cursor: "pointer",
  boxShadow: "0 14px 38px rgba(0,0,0,0.16)",
};

const digitalTopicTopRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
};

const digitalTopicIcon = {
  fontSize: "32px",
};

const digitalCompletedBadge = {
  padding: "5px 8px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.14)",
  color: "#86efac",
  fontSize: "10px",
  fontWeight: 800,
};

const digitalTopicTitle = {
  display: "block",
  marginTop: "14px",
  fontSize: "17px",
  lineHeight: 1.3,
};

const digitalTopicOpenLabel = {
  display: "block",
  marginTop: "10px",
  color: "#7dd3fc",
  fontSize: "11px",
  fontWeight: 700,
};

const digitalLessonCard = {
  marginTop: "18px",
  padding: "24px",
  borderRadius: "20px",
  background: "rgba(15,23,42,0.78)",
  border: "1px solid rgba(96,165,250,0.18)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
};

const digitalLessonHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
};

const digitalLessonCounter = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(14,165,233,0.12)",
  color: "#7dd3fc",
  fontSize: "11px",
  fontWeight: 800,
  whiteSpace: "nowrap" as const,
};

const digitalLessonIntro = {
  margin: "14px 0 0",
  color: "#cbd5e1",
  lineHeight: 1.65,
};

const digitalPointsBox = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "15px",
  background: "rgba(2,6,23,0.32)",
  border: "1px solid rgba(148,163,184,0.10)",
};

const digitalQuizBox = {
  marginTop: "18px",
  padding: "18px",
  borderRadius: "15px",
  background: "rgba(7,27,61,0.56)",
  border: "1px solid rgba(125,211,252,0.12)",
};

const digitalAnswerGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
};

const digitalAnswerButton = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "13px",
  borderRadius: "12px",
  border: "1px solid rgba(148,163,184,0.16)",
  background: "rgba(2,6,23,0.34)",
  color: "white",
  textAlign: "left" as const,
  cursor: "pointer",
  fontSize: "14px",
  lineHeight: 1.45,
};

const digitalResultBox = {
  marginTop: "16px",
  padding: "16px",
  borderRadius: "14px",
};


const featureIcon = {
  fontSize: "34px",
  marginBottom: "13px",
};

const featureTag = {
  display: "inline-block",
  color: "#7dd3fc",
  fontSize: "10px",
  letterSpacing: "0.12em",
  fontWeight: 800,
  marginBottom: "8px",
};

const featureArrow = {
  color: "#60a5fa",
  fontSize: "22px",
  fontWeight: 800,
};

const latestPanel = {
  padding: "20px",
  borderRadius: "19px",
  background: "rgba(15,23,42,0.78)",
  border: "1px solid rgba(96,165,250,0.16)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
};

const latestHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const latestBadge = {
  width: "42px",
  height: "42px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "13px",
  background: "rgba(37,99,235,0.16)",
  fontSize: "21px",
};

const latestLesson = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px",
  textAlign: "left" as const,
  border: "1px solid rgba(148,163,184,0.12)",
  borderRadius: "13px",
  background: "rgba(2,6,23,0.42)",
  color: "white",
  cursor: "pointer",
};

const latestLessonIcon = {
  width: "38px",
  height: "38px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "11px",
  background: "rgba(14,165,233,0.13)",
  flexShrink: 0,
};

const latestLessonTitle = {
  display: "block",
  fontSize: "13px",
  lineHeight: 1.35,
};

const latestLessonMeta = {
  display: "block",
  marginTop: "4px",
  color: "#64748b",
  fontSize: "11px",
};

const latestViewAll = {
  width: "100%",
  marginTop: "14px",
  padding: "11px",
  border: "1px solid rgba(96,165,250,0.2)",
  borderRadius: "11px",
  background: "rgba(37,99,235,0.10)",
  color: "#93c5fd",
  cursor: "pointer",
  fontWeight: 700,
};

const emptyLatest = {
  padding: "20px",
  borderRadius: "12px",
  background: "rgba(2,6,23,0.35)",
  color: "#94a3b8",
  fontSize: "13px",
  textAlign: "center" as const,
};

const locationPermissionCard = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
  padding: "18px 20px",
  marginBottom: "20px",
  borderRadius: "18px",
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(96, 165, 250, 0.22)",
  boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
};

const locationPermissionButton = {
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
};
const notificationPermissionCard = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
  padding: "18px 20px",
  marginBottom: "20px",
  borderRadius: "18px",
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(251, 191, 36, 0.22)",
  boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
};

const notificationPermissionButton = {
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  background: "linear-gradient(135deg, #f59e0b, #f97316)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
};

const curiosityCard = {
  marginTop: "18px",
  padding: "24px",
  borderRadius: "20px",
  background: "linear-gradient(145deg, rgba(11,42,97,0.92), rgba(7,27,61,0.90))",
  border: "1px solid rgba(96,165,250,0.22)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.20)",
};

const curiosityCardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
};

const curiosityBadge = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(14,165,233,0.12)",
  border: "1px solid rgba(125,211,252,0.18)",
  color: "#7dd3fc",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const curiosityTitle = {
  margin: "10px 0 4px",
  fontSize: "25px",
};

const curiositySubtitle = {
  margin: 0,
  color: "#94a3b8",
  fontSize: "13px",
};

const curiositySpark = {
  width: "48px",
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "15px",
  background: "rgba(37,99,235,0.16)",
  fontSize: "25px",
  flexShrink: 0,
};

const curiosityLoadingBox = {
  marginTop: "20px",
  padding: "22px",
  borderRadius: "14px",
  background: "rgba(2,6,23,0.38)",
  color: "#cbd5e1",
  textAlign: "center" as const,
};

const curiosityEmpty = {
  marginTop: "20px",
  padding: "22px",
  borderRadius: "14px",
  background: "rgba(2,6,23,0.38)",
  textAlign: "center" as const,
};

const curiosityRetryButton = {
  marginTop: "12px",
  padding: "10px 16px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const curiosityMetaRow = {
  display: "flex",
  flexWrap: "wrap" as const,
  alignItems: "center",
  gap: "8px",
  marginTop: "20px",
};

const curiosityCategoryBadge = {
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(37,99,235,0.15)",
  color: "#93c5fd",
  fontSize: "11px",
  fontWeight: 700,
};

const curiosityDate = {
  color: "#64748b",
  fontSize: "11px",
};

const curiosityQuestion = {
  margin: "16px 0 18px",
  fontSize: "22px",
  lineHeight: 1.5,
};

const curiosityOptionsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
};

const curiosityOptionButton = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px",
  borderRadius: "12px",
  color: "white",
  textAlign: "left" as const,
  fontSize: "14px",
  lineHeight: 1.45,
};

const curiosityOptionLetter = {
  width: "30px",
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "9px",
  background: "rgba(255,255,255,0.10)",
  color: "#bfdbfe",
  fontWeight: 800,
  flexShrink: 0,
};

const curiositySubmitButton = {
  width: "100%",
  marginTop: "14px",
  padding: "13px",
  border: "none",
  borderRadius: "11px",
  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const curiosityResultBox = {
  marginTop: "14px",
  padding: "16px",
  borderRadius: "14px",
};

const curiosityExplanationBox = {
  marginTop: "12px",
  padding: "13px",
  borderRadius: "11px",
  background: "rgba(2,6,23,0.28)",
  color: "#dbeafe",
};

const curiosityHistoryButton = {
  width: "100%",
  marginTop: "12px",
  padding: "10px",
  border: "1px solid rgba(96,165,250,0.18)",
  borderRadius: "10px",
  background: "rgba(37,99,235,0.08)",
  color: "#93c5fd",
  cursor: "pointer",
  fontWeight: 700,
};

const curiosityHistoryPanel = {
  display: "grid",
  gap: "8px",
  marginTop: "10px",
  maxHeight: "300px",
  overflowY: "auto" as const,
};

const curiosityHistoryItem = {
  padding: "12px",
  borderRadius: "11px",
  background: "rgba(2,6,23,0.34)",
  border: "1px solid rgba(148,163,184,0.10)",
};

const cardStyle = {
  width: "360px",
  maxWidth: "calc(100% - 40px)",
  margin: "80px auto",
  padding: "30px",
  background: "rgba(15, 23, 42, 0.88)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  borderRadius: "20px",
  border: "1px solid rgba(96,165,250,0.16)",
  boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
  boxSizing: "border-box" as const,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px 14px",
  marginTop: "12px",
  borderRadius: "10px",
  border: "1px solid #475569",
  background: "#f8fafc",
  color: "#0f172a",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  marginTop: "18px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};


const motivationCard = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginTop: "18px",
  padding: "20px 22px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(30,64,175,0.25), rgba(14,116,144,0.14))",
  border: "1px solid rgba(96,165,250,0.15)",
};

const miniStatStyle = {
  padding: "11px 12px",
  borderRadius: "12px",
  background: "rgba(2,6,23,0.22)",
  border: "1px solid rgba(148,163,184,0.12)",
  textAlign: "center" as const,
  display: "grid",
  gap: "3px",
  fontSize: "13px",
};

const progressStatCard = {
  padding: "13px",
  borderRadius: "14px",
  background: "rgba(2,6,23,0.28)",
  border: "1px solid rgba(148,163,184,0.12)",
  display: "grid",
  gap: "4px",
};

const teacherMetricStyle = {
  padding: "8px",
  borderRadius: "10px",
  background: "rgba(15,23,42,0.65)",
  display: "grid",
  gap: "2px",
  textAlign: "center" as const,
  fontSize: "12px",
};

const logoutStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};

export default App;