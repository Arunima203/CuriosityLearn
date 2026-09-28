export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
};

const LOCAL_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is the capital of India?",
    options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
    answer: 1,
  },

  {
    question: "Which is the largest continent in the world?",
    options: ["Africa", "Asia", "Europe", "North America"],
    answer: 1,
  },

  {
    question: "Which is the longest river in India?",
    options: [
      "Yamuna",
      "Ganga",
      "Godavari",
      "Brahmaputra",
    ],
    answer: 1,
  },

  {
    question: "Which ocean lies to the south of India?",
    options: [
      "Atlantic Ocean",
      "Pacific Ocean",
      "Indian Ocean",
      "Arctic Ocean",
    ],
    answer: 2,
  },

  {
    question: "Which country is known as the Land of the Rising Sun?",
    options: ["China", "Japan", "Thailand", "South Korea"],
    answer: 1,
  },

  {
    question: "Which is the largest ocean in the world?",
    options: [
      "Indian Ocean",
      "Atlantic Ocean",
      "Pacific Ocean",
      "Arctic Ocean",
    ],
    answer: 2,
  },

  {
    question: "Mount Everest is located in which mountain range?",
    options: [
      "Andes",
      "Alps",
      "Himalayas",
      "Rocky Mountains",
    ],
    answer: 2,
  },

  {
    question: "Which desert is located in India?",
    options: [
      "Sahara Desert",
      "Thar Desert",
      "Gobi Desert",
      "Atacama Desert",
    ],
    answer: 1,
  },

  {
    question: "Which is the smallest continent?",
    options: [
      "Europe",
      "Australia",
      "South America",
      "Antarctica",
    ],
    answer: 1,
  },

  {
    question: "Which line divides the Earth into Northern and Southern Hemispheres?",
    options: [
      "Tropic of Cancer",
      "Equator",
      "Prime Meridian",
      "Tropic of Capricorn",
    ],
    answer: 1,
  },

  {
    question: "What is the capital of Japan?",
    options: ["Kyoto", "Osaka", "Tokyo", "Hiroshima"],
    answer: 2,
  },

  {
    question: "Which is the largest country by area?",
    options: ["Canada", "China", "Russia", "USA"],
    answer: 2,
  },

  {
    question: "Which river flows through Egypt?",
    options: ["Nile", "Amazon", "Yangtze", "Danube"],
    answer: 0,
  },

  {
    question: "Which continent is known as the Dark Continent?",
    options: ["Africa", "Asia", "Europe", "Australia"],
    answer: 0,
  },

  {
    question: "What is the capital of France?",
    options: ["Rome", "Paris", "Madrid", "Berlin"],
    answer: 1,
  },
];

const shuffle = <T,>(items: T[]): T[] => {
  return [...items].sort(() => Math.random() - 0.5);
};

export const generateQuizQuestions = (
  _countries: unknown[] = [],
  amount = 10
): QuizQuestion[] => {
  return shuffle(LOCAL_QUESTIONS).slice(
    0,
    Math.min(amount, LOCAL_QUESTIONS.length)
  );
};