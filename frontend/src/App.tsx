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

const API_URL = "http://127.0.0.1:8000";
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
    welcomeBack: "Welcome back 👋",
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
  },
  {
    id: "geo-cyclone",
    subject: "Geography",
    chapter: "Atmosphere",
    title: "How does a cyclone form?",
    description: "See how warm ocean water, rising air and pressure create a cyclone.",
    videoUrl: "",
    imageUrl: "",
  },
  {
    id: "geo-river",
    subject: "Geography",
    chapter: "Rivers",
    title: "How does a river shape the land?",
    description: "Understand erosion, transportation and deposition with visuals.",
    videoUrl: "",
    imageUrl: "",
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
    fact: "India has a wide variety of landscapes, from mountains and deserts to river plains and coasts.",
  },

  "West Bengal": {
    famousPlaces: ["Victoria Memorial", "Sundarbans", "Darjeeling"],
    geography: ["Ganges Delta", "Mangrove Forest", "Himalayan Foothills"],
    fact: "The Sundarbans lies in the Ganges delta and is famous for its mangrove ecosystem.",
  },

  Odisha: {
    famousPlaces: [
      "Jagannath Temple",
      "Konark Sun Temple",
      "Chilika Lake",
    ],
    geography: [
      "Eastern Coastal Plains",
      "Chilika Lagoon",
      "Bay of Bengal Coast",
    ],
    fact: "Odisha has a long coastline and is home to the famous Chilika Lagoon.",
  },

  Rajasthan: {
    famousPlaces: ["Amber Fort", "Hawa Mahal", "Jaisalmer Fort"],
    geography: ["Thar Desert", "Aravalli Range"],
    fact: "The Thar Desert covers a large part of western Rajasthan.",
  },

  Uttarakhand: {
    famousPlaces: ["Kedarnath", "Badrinath", "Valley of Flowers"],
    geography: ["Himalayas", "Mountain Valleys", "Glaciers"],
    fact: "Uttarakhand is a Himalayan state with many high-altitude valleys and peaks.",
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

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem("language") as Language) || "en"
  );

  const t = translations[language];

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [profileSaved, setProfileSaved] = useState(false);

  const [explorerOpen, setExplorerOpen] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState("");

  const [indiaMapOpen, setIndiaMapOpen] = useState(false);

  const [selectedState, setSelectedState] = useState("");

  const [challengeOpen, setChallengeOpen] = useState(false);

  const [challengeTarget, setChallengeTarget] = useState("");
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
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
  const [selectedTeacherStudent, setSelectedTeacherStudent] = useState<any>(null);
  const [teacherProgressLoading, setTeacherProgressLoading] = useState(false);
  const [teacherStudentLoading, setTeacherStudentLoading] = useState(false);
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
  });

  const [challengePoints, setChallengePoints] = useState(0);

  const [challengeMessage, setChallengeMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [className, setClassName] = useState("");
  const [board, setBoard] = useState("");
  const [medium, setMedium] = useState("");

  const [message, setMessage] = useState("");
  const [countryDetails, setCountryDetails] = useState<any>(null);

  const [loadingCountry, setLoadingCountry] = useState(false);

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

  function changeLanguage(lang: Language) {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }

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
        };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Something went wrong");
        return;
      }

      if (isLogin) {
        localStorage.setItem("access_token", data.access_token);

        const role = await loadCurrentUser();
        if (role === "teacher") {
          setProfileSaved(true);
        }

        setLoggedIn(true);
      } else {
        setMessage("Registration successful! 🎉");
        setIsLogin(true);
      }
    } catch {
      setMessage(t.backendError);
    }
  }

  async function handleProfile(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API_URL}/student-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          class_name: className,
          board,
          medium,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.detail === "Profile already exists"
        ) {
          setProfileSaved(true);
          return;
        }

        setMessage(data.detail || "Profile save failed");
        return;
      }

      setProfileSaved(true);
    } catch {
      setMessage(t.backendError);
    }
  }

  async function loadStudentDashboardData() {
    const token = localStorage.getItem("access_token");
    if (!token || userRole !== "student") return;

    try {
      const [profileResponse, activityResponse] = await Promise.all([
        fetch(`${API_URL}/student-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/student/activity`, {
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
    } catch (error) {
      console.error("Student dashboard data error:", error);
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
          setLocationMessage(
            "Location enabled! Your Curiosity will now be personalized 🌍"
          );
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

    if (!("serviceWorker" in navigator)) {
      setNotificationMessage(
        "Service Worker is not supported by this browser."
      );
      return;
    }

    if (!("PushManager" in window)) {
      setNotificationMessage(
        "Push notifications are not supported by this browser."
      );
      return;
    }

    setNotificationsLoading(true);
    setNotificationMessage("");

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setNotificationMessage(
          "Notification permission was not allowed."
        );
        return;
      }

      const registration = await navigator.serviceWorker.register(
        "/sw.js"
      );

      const keyResponse = await fetch(
        `${API_URL}/notifications/vapid-public-key`
      );

      const keyData = await keyResponse.json();

      if (!keyResponse.ok || !keyData.public_key) {
        throw new Error("VAPID public key could not be loaded.");
      }

      function urlBase64ToUint8Array(base64String: string) {
        const padding = "=".repeat(
          (4 - (base64String.length % 4)) % 4
        );

        const base64 = (
          base64String +
          padding
        )
          .replace(/-/g, "+")
          .replace(/_/g, "/");

        const rawData = window.atob(base64);

        return Uint8Array.from(
          [...rawData].map((char) => char.charCodeAt(0))
        );
      }

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(
                keyData.public_key
              ),
          });
      }

      const subscriptionJson =
        subscription.toJSON();

      if (
        !subscriptionJson.endpoint ||
        !subscriptionJson.keys?.p256dh ||
        !subscriptionJson.keys?.auth
      ) {
        throw new Error(
          "Push subscription data is incomplete."
        );
      }

      const saveResponse = await fetch(
        `${API_URL}/notifications/subscribe`,
        {
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
        }
      );

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveData.detail ||
          "Could not save push subscription."
        );
      }

      setNotificationsEnabled(true);
      setNotificationMessage(
        "Curiosity Alerts enabled! 🔔🌍"
      );
    } catch (error) {
      console.error(
        "Notification setup error:",
        error
      );

      setNotificationMessage(
        error instanceof Error
          ? error.message
          : "Could not enable notifications."
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
    } catch (error) {
      console.error("Curiosity answer error:", error);
      setMessage(t.backendError);
    } finally {
      setCuriosityLoading(false);
    }
  }

  useEffect(() => {
    if (loggedIn && profileSaved) {
      loadTodayCuriosity();
      loadCuriosityHistory();
      if (userRole === "student") {
        loadStudentDashboardData();
      } else if (userRole === "teacher") {
        loadTeacherStudents();
      }
    }
  }, [loggedIn, profileSaved, userRole]);

const startQuiz = () => {
  console.log("START QUIZ CLICKED");

  setQuizLoading(true);
  setQuizQuestion(0);
  setQuizScore(0);
  setQuizAnswer(null);

  const generatedQuestions = generateQuizQuestions([], 10);

  console.log("Generated questions:", generatedQuestions);

  if (generatedQuestions.length === 0) {
    alert("No quiz questions available!");
    setQuizLoading(false);
    return;
  }

  setQuizQuestions(generatedQuestions);
  setQuizOpen(true);
  setQuizLoading(false);
};

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

  function openLearning() {
    setSelectedLesson(null);
    setLearningOpen(true);
    setAdminOpen(false);
  }

  function openAdmin() {
    setAdminOpen(true);
    setLearningOpen(false);
    setSelectedLesson(null);
  }

  function saveLearningContent(e: FormEvent) {
    e.preventDefault();

    if (!contentForm.title.trim() || !contentForm.chapter.trim()) {
      alert("Please add a lesson title and chapter.");
      return;
    }

    const newItem: LearningContent = {
      id: `${Date.now()}`,
      subject: contentForm.subject.trim() || "Geography",
      chapter: contentForm.chapter.trim(),
      title: contentForm.title.trim(),
      description: contentForm.description.trim() || "New lesson added by admin.",
      videoUrl: contentForm.videoUrl.trim(),
      imageUrl: contentForm.imageUrl.trim(),
    };

    const updated = [...learningContent, newItem];
    setLearningContent(updated);
    localStorage.setItem("curiosity_learning_content", JSON.stringify(updated));

    setContentForm({
      subject: "Geography",
      chapter: "",
      title: "",
      description: "",
      videoUrl: "",
      imageUrl: "",
    });

    alert("Lesson added successfully! 🎉");
  }

  function deleteLearningContent(id: string) {
    const updated = learningContent.filter((item) => item.id !== id);
    setLearningContent(updated);
    localStorage.setItem("curiosity_learning_content", JSON.stringify(updated));
  }

  function logout() {
    localStorage.removeItem("access_token");

    setLoggedIn(false);
    setProfileSaved(false);
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
                        }}
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
                            }}
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
                              geo.properties.name;

                            setSelectedCountry(countryName);

                            getCountryDetails(countryName);

                            if (countryName === "India") {
                              setIndiaMapOpen(true);
                            }
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
                          }}
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
                          <strong>
                            {t.countryCode}:
                          </strong>{" "}
                          {countryDetails.isoAlpha3 ||
                            "N/A"}
                        </p>

                        <p>
                          🧭{" "}
                          <strong>
                            {t.region}:
                          </strong>{" "}
                          {countryDetails.continentName ||
                            "N/A"}
                        </p>

                        <p>
                          🕐{" "}
                          <strong>
                            {t.timezone}:
                          </strong>{" "}
                          {language === "bn"
                            ? "GeoNames timezone data"
                            : "GeoNames timezone data"}
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
            {selectedLesson.videoUrl ? (
              <video
                controls
                src={selectedLesson.videoUrl}
                style={{ width: "100%", maxHeight: "500px", borderRadius: "16px", background: "#020617" }}
              />
            ) : (
              <div style={largeMediaPlaceholder}>
                <div style={{ fontSize: "56px" }}>🎬</div>
                <h3>Video will be added by Admin</h3>
                <p style={{ opacity: 0.65 }}>This lesson is ready. The teacher video can be uploaded later.</p>
              </div>
            )}
          </div>

          <div style={lessonGrid}>
            <div style={lessonSection}>
              <h2>🧑‍🏫 Sir's Explanation</h2>
              <div style={contentPlaceholder}>Teacher explanation area — add the explanation video later.</div>
            </div>
            <div style={lessonSection}>
              <h2>✍️ Board Work</h2>
              <div style={contentPlaceholder}>Board-work image/video area — add it later from Admin.</div>
            </div>
          </div>

          <div style={lessonSection}>
            <h2>📝 Quick Notes</h2>
            <div style={contentPlaceholder}>Notes will be added by Admin.</div>
          </div>

          <div style={lessonSection}>
            <h2>🎯 Think First</h2>
            <p>Before watching the full explanation, predict what happens and then test your idea.</p>
            <button style={exploreButton} type="button" onClick={startQuiz}>
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

  if (loggedIn && profileSaved && adminOpen) {
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
                placeholder="Curiosity-based lesson title"
                value={contentForm.title}
                onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                required
              />
              <textarea
                style={{ ...inputStyle, minHeight: "90px", resize: "vertical" as const }}
                placeholder="Short description"
                value={contentForm.description}
                onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
              />
              <input
                style={inputStyle}
                placeholder="Video URL (leave empty for now)"
                value={contentForm.videoUrl}
                onChange={(e) => setContentForm({ ...contentForm, videoUrl: e.target.value })}
              />
              <input
                style={inputStyle}
                placeholder="Image URL (leave empty for now)"
                value={contentForm.imageUrl}
                onChange={(e) => setContentForm({ ...contentForm, imageUrl: e.target.value })}
              />

              <button type="submit" style={buttonStyle}>Save Lesson</button>
            </form>
          </div>

          <h2 style={{ marginTop: "30px" }}>📚 Existing Lessons</h2>
          <div style={learningGrid}>
            {learningContent.map((lesson) => (
              <div key={lesson.id} style={learningCard}>
                <span style={lessonTag}>{lesson.subject} • {lesson.chapter}</span>
                <h3>{lesson.title}</h3>
                <p style={{ opacity: 0.7 }}>{lesson.videoUrl ? "🎥 Video added" : "🎥 Video empty"}</p>
                <p style={{ opacity: 0.7 }}>{lesson.imageUrl ? "🖼️ Image added" : "🖼️ Image empty"}</p>
                <button
                  type="button"
                  style={{ ...logoutStyle, background: "#7f1d1d", color: "white" }}
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
              <button
                type="button"
                onClick={openAdmin}
                style={{ ...logoutStyle, background: "#334155", color: "white" }}
              >
                ⚙️ Content Admin
              </button>

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
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "12px" }}>
                        <div style={teacherMetricStyle}><strong>{student.progress.curiosity_answered}</strong><span>Curiosity</span></div>
                        <div style={teacherMetricStyle}><strong>{student.progress.mock_attempts}</strong><span>Mocks</span></div>
                        <div style={teacherMetricStyle}><strong>{student.progress.activity_count}</strong><span>Activity</span></div>
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
                    <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
                      <div style={progressStatCard}>🌍 <strong>{selectedTeacherStudent.progress.curiosity_answered}</strong><span>{t.curiosityAnswered}</span></div>
                      <div style={progressStatCard}>🎯 <strong>{selectedTeacherStudent.progress.curiosity_accuracy}%</strong><span>{t.curiosityAccuracy}</span></div>
                      <div style={progressStatCard}>✨ <strong>{selectedTeacherStudent.progress.curiosity_xp}</strong><span>{t.curiosityXp}</span></div>
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
                <strong>0</strong>
                <span> {t.points}</span>
              </div>
            </div>

            <div style={statCard}>
              <div style={statIcon}>🔥</div>

              <div>
                <strong>0</strong>
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
                <strong style={dashboardStatValue}>0</strong>
              </div>
            </div>

            <div style={dashboardStatCard}>
              <div style={dashboardStatIcon}>⭐</div>
              <div>
                <span style={dashboardStatLabel}>Best Score</span>
                <strong style={dashboardStatValue}>—</strong>
              </div>
            </div>

            <div style={dashboardStatCard}>
              <div style={dashboardStatIcon}>🔥</div>
              <div>
                <span style={dashboardStatLabel}>Learning Streak</span>
                <strong style={dashboardStatValue}>0 days</strong>
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
                onClick={startQuiz}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>🧠</div>
                <span style={featureTag}>PRACTICE</span>
                <h3>Take Quiz</h3>
                <p>Test what you know with quick interactive geography questions.</p>
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
                onClick={openLearning}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>📚</div>
                <span style={featureTag}>RESOURCES</span>
                <h3>Study Resources</h3>
                <p>Find lesson notes, concepts and teacher-added learning material.</p>
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
                style={featureCard}
                onClick={() => setExplorerOpen(true)}
                role="button"
                tabIndex={0}
              >
                <div style={featureIcon}>📈</div>
                <span style={featureTag}>PROGRESS</span>
                <h3>Progress Tracker</h3>
                <p>Keep building your curiosity journey through quizzes and lessons.</p>
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

          {!locationEnabled && (
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

          {quizOpen && quizQuestions.length > 0 && (
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
                    <h2 style={{ margin: 0 }}>🧠 Quick Quiz</h2>
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
                    const isSelected = quizAnswer === index;
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
                          "Completed Quick Quiz",
                          quizScore,
                          { total: quizQuestions.length }
                        ).then(() => loadStudentDashboardData());
                        alert(`Quiz completed! Your score: ${quizScore} / ${quizQuestions.length}`);
                        setQuizOpen(false);
                        setQuizQuestion(0);
                        setQuizAnswer(null);
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
            <button type="submit" style={authSubmitButton}>
              <span>{isLogin ? "🚀 Login to Dashboard" : "✨ Create Account"}</span>
              <span style={authButtonArrow}>→</span>
            </button>
          </form>

          {message && <div style={{ ...authMessage, background: message.toLowerCase().includes("successful") ? "rgba(22,163,74,0.15)" : "rgba(239,68,68,0.12)", border: message.toLowerCase().includes("successful") ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.25)", color: message.toLowerCase().includes("successful") ? "#86efac" : "#fca5a5" }}>{message}</div>}

          <div style={authSwitchArea}>
            <div style={authDivider}><span style={authDividerLine}></span><small>{isLogin ? "New Explorer?" : "Already an Explorer?"}</small><span style={authDividerLine}></span></div>
            <button type="button" onClick={() => { setIsLogin(!isLogin); setMessage(""); setPassword(""); }} style={authSwitchButton}>{isLogin ? "Create a new account →" : "← Back to Login"}</button>
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
  background:
    "radial-gradient(circle at 15% 10%, rgba(37,99,235,0.20), transparent 28%), radial-gradient(circle at 85% 20%, rgba(14,165,233,0.14), transparent 24%), linear-gradient(135deg, #020617 0%, #07152f 48%, #020617 100%)",
  color: "#f8fafc",
  padding: "24px",
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
  gap: "20px",
  marginBottom: "24px",
  padding: "18px 20px",
  borderRadius: "18px",
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(96,165,250,0.16)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
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
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "15px",
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

const geoIcon = {
  fontSize: "70px",
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

const contentPlaceholder = {
  minHeight: "130px",
  padding: "25px",
  borderRadius: "14px",
  background: "#0f172a",
  border: "1px dashed rgba(255,255,255,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center" as const,
  opacity: 0.8,
};

const lessonSection = {
  padding: "25px",
  borderRadius: "18px",
  background: "rgba(30, 41, 59, 0.92)",
  marginBottom: "20px",
};

const lessonGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "20px",
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
  gap: "30px",
  padding: "34px",
  borderRadius: "24px",
  background:
    "linear-gradient(135deg, rgba(7,29,64,0.96), rgba(11,40,85,0.86))",
  border: "1px solid rgba(96,165,250,0.24)",
  boxShadow: "0 25px 70px rgba(0,0,0,0.24)",
  overflow: "hidden",
  position: "relative" as const,
  marginBottom: "20px",
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
  fontSize: "110px",
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
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "34px",
};

const dashboardStatCard = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "18px",
  borderRadius: "17px",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(96,165,250,0.15)",
  boxShadow: "0 14px 35px rgba(0,0,0,0.14)",
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
  gridTemplateColumns: "minmax(0, 1fr) 330px",
  gap: "18px",
  alignItems: "start",
};

const featureGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px",
};

const featureCard = {
  position: "relative" as const,
  minHeight: "205px",
  padding: "23px",
  borderRadius: "19px",
  background:
    "linear-gradient(145deg, rgba(11,42,97,0.88), rgba(7,27,61,0.88))",
  border: "1px solid rgba(96,165,250,0.18)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
  cursor: "pointer",
  transition: "transform 0.2s ease, border-color 0.2s ease",
  boxSizing: "border-box" as const,
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

const switchButtonStyle = {
  width: "100%",
  marginTop: "15px",
  padding: "10px",
  background: "transparent",
  color: "#60a5fa",
  border: "none",
  cursor: "pointer",
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