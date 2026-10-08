import React, { useMemo, useState } from "react";

type Continent = {
  id: string;
  name: string;
  emoji: string;
  region: string;
  facts: string[];
};

type Lesson = {
  id: string;
  icon: string;
  title: string;
  description: string;
  topics: string[];
};

type LessonTopicDetail = {
  explanation: string;
  points: string[];
  example: string;
};

const LESSON_TOPIC_DETAILS: Record<string, LessonTopicDetail[]> = {
  latitude: [
    { explanation: "Equator হলো 0° latitude-এর কাল্পনিক রেখা, যা পৃথিবীকে Northern ও Southern Hemisphere-এ ভাগ করে।", points: ["0° latitude", "পৃথিবীর মাঝ বরাবর বিস্তৃত", "উত্তর ও দক্ষিণ গোলার্ধ আলাদা করে"], example: "উদাহরণ: Ecuador, Kenya ও Indonesia-এর কিছু অংশ Equator-এর কাছাকাছি।" },
    { explanation: "Prime Meridian হলো 0° longitude-এর reference line। এখান থেকে পূর্ব ও পশ্চিম longitude মাপা হয়।", points: ["0° longitude", "Greenwich, London-এর মধ্য দিয়ে যায়", "East ও West longitude-এর reference"], example: "উদাহরণ: কোনো স্থানের longitude 90°E হলে সেটি Prime Meridian-এর পূর্বে।" },
    { explanation: "Latitude কোনো স্থান Equator-এর কতটা উত্তরে বা দক্ষিণে আছে তা বোঝায়।", points: ["0° থেকে 90°N/S", "N = Northern Hemisphere", "S = Southern Hemisphere"], example: "উদাহরণ: Kolkata প্রায় 22.6°N latitude-এ অবস্থিত।" },
    { explanation: "Longitude কোনো স্থান Prime Meridian-এর কতটা পূর্বে বা পশ্চিমে আছে তা বোঝায়।", points: ["0° থেকে 180°E/W", "E = East", "W = West"], example: "উদাহরণ: কোনো শহরের longitude 88°E হলে সেটি Prime Meridian-এর পূর্বে।" },
  ],
  weather: [
    { explanation: "Temperature হলো কোনো স্থানের বায়ু কতটা গরম বা ঠান্ডা তার পরিমাপ।", points: ["সাধারণত °C বা °F-এ মাপা হয়", "দিন ও ঋতু অনুযায়ী বদলায়", "Weather বোঝার গুরুত্বপূর্ণ উপাদান"], example: "উদাহরণ: গ্রীষ্মকালে দিনের temperature সাধারণত বেশি থাকে।" },
    { explanation: "Rainfall হলো নির্দিষ্ট সময়ে কোনো এলাকায় কত বৃষ্টি হয়েছে তার পরিমাণ।", points: ["Millimetre-এ মাপা হয়", "বৃষ্টির pattern জলবায়ুকে প্রভাবিত করে", "বন্যা ও কৃষির সঙ্গে সম্পর্কিত"], example: "উদাহরণ: বর্ষাকালে বেশি rainfall নদীর জলস্তর বাড়াতে পারে।" },
    { explanation: "Wind হলো বায়ুর এক স্থান থেকে অন্য স্থানে চলাচল।", points: ["দিক ও গতি থাকে", "চাপের পার্থক্যের কারণে বায়ু চলে", "Weather পরিবর্তনে ভূমিকা রাখে"], example: "উদাহরণ: সমুদ্রের দিক থেকে আসা বাতাস উপকূলীয় আবহাওয়াকে প্রভাবিত করতে পারে।" },
    { explanation: "Weather হলো স্বল্প সময়ের atmospheric condition, আর climate হলো দীর্ঘ সময়ের সাধারণ pattern।", points: ["Weather দ্রুত বদলাতে পারে", "Climate দীর্ঘ সময়ের pattern", "দুটিই temperature, rainfall ও wind-এর সঙ্গে সম্পর্কিত"], example: "উদাহরণ: আজ বৃষ্টি হওয়া weather; কোনো অঞ্চলে বহু বছর ধরে বর্ষাকালে বেশি বৃষ্টি হওয়া climate pattern।" },
  ],
  rivers: [
    { explanation: "River erosion হলো নদীর প্রবাহে মাটি ও শিলা ক্ষয় হওয়ার প্রক্রিয়া।", points: ["নদীর স্রোত ক্ষয় ঘটায়", "তীর ও নদীর তলদেশ বদলাতে পারে", "Valley ও channel তৈরি হতে পারে"], example: "উদাহরণ: দ্রুত স্রোতের নদীতে bank erosion বেশি হতে পারে।" },
    { explanation: "Transportation হলো নদীর ক্ষয় করা sediment এক স্থান থেকে অন্য স্থানে বহন করা।", points: ["বালি, কাদা ও ছোট পাথর বহন করে", "প্রবাহের শক্তি বেশি হলে বেশি sediment বহন করতে পারে", "নদীর course বরাবর sediment সরায়"], example: "উদাহরণ: পাহাড়ি নদী উজান থেকে বালি ও পাথর ভাটির দিকে নিয়ে যায়।" },
    { explanation: "Deposition হলো নদীর বহন করা sediment কোনো স্থানে জমা হওয়ার প্রক্রিয়া।", points: ["প্রবাহের গতি কমলে deposition বাড়ে", "বালি ও পলি জমতে পারে", "Delta ও sandbar তৈরি হতে পারে"], example: "উদাহরণ: নদীর মোহনায় পলি জমে delta তৈরি হতে পারে।" },
    { explanation: "Floodplain হলো নদীর পাশের অপেক্ষাকৃত সমতল এলাকা, যা বন্যার সময় প্লাবিত হতে পারে।", points: ["নদীর পাশে গড়ে ওঠে", "বন্যার সময় জল ছড়িয়ে পড়তে পারে", "পলি জমে মাটি উর্বর হতে পারে"], example: "উদাহরণ: বড় নদীর আশেপাশের সমতল floodplain কৃষির জন্য গুরুত্বপূর্ণ হতে পারে।" },
  ],
  maps: [
    { explanation: "Map symbols হলো মানচিত্রে বিভিন্ন feature বোঝানোর জন্য ব্যবহৃত চিহ্ন।", points: ["Road, river, city ইত্যাদি দেখাতে পারে", "Legend বা key অর্থ বুঝতে সাহায্য করে", "Map পড়া সহজ করে"], example: "উদাহরণ: নীল রেখা অনেক map-এ নদী বোঝাতে ব্যবহার করা হয়।" },
    { explanation: "Direction দিয়ে কোনো স্থানের relative অবস্থান বোঝানো হয়। প্রধান direction হলো North, South, East ও West।", points: ["N, S, E, W প্রধান direction", "NE, NW, SE, SW intermediate direction", "Compass direction বুঝতে সাহায্য করে"], example: "উদাহরণ: কোনো শহর অন্য শহরের উত্তরে হলে বলা যায় সেটি north of the city।" },
    { explanation: "Map scale map-এর দূরত্ব ও বাস্তব দূরত্বের সম্পর্ক দেখায়।", points: ["Representative fraction বা statement scale হতে পারে", "ছোট map-এ বড় এলাকা দেখানো যায়", "বাস্তব দূরত্ব হিসাব করতে সাহায্য করে"], example: "উদাহরণ: 1 cm = 10 km scale হলে map-এ 2 cm বাস্তবে 20 km।" },
    { explanation: "Map-এ মাপা distance-কে scale ব্যবহার করে বাস্তব-world distance-এ রূপান্তর করা যায়।", points: ["Map distance মাপো", "Scale প্রয়োগ করো", "Real distance বের করো"], example: "উদাহরণ: scale অনুযায়ী 3 cm যদি 30 km হয়, তবে 3 cm map distance = 30 km বাস্তবে।" },
  ],
};

const CONTINENTS: Continent[] = [
  {
    id: "asia",
    name: "Asia",
    emoji: "🌏",
    region: "Eastern Hemisphere",
    facts: [
      "এশিয়া পৃথিবীর সবচেয়ে বড় মহাদেশ।",
      "এখানেই পৃথিবীর সবচেয়ে বেশি মানুষ বসবাস করে।",
      "হিমালয় পর্বতমালা এশিয়ায় অবস্থিত।",
    ],
  },
  {
    id: "africa",
    name: "Africa",
    emoji: "🌍",
    region: "Mostly Eastern Hemisphere",
    facts: [
      "আফ্রিকা আয়তনে দ্বিতীয় বৃহত্তম মহাদেশ।",
      "সাহারা মরুভূমি আফ্রিকায় অবস্থিত।",
      "Equator আফ্রিকার মধ্য দিয়ে গেছে।",
    ],
  },
  {
    id: "europe",
    name: "Europe",
    emoji: "🌍",
    region: "Northern Hemisphere",
    facts: [
      "ইউরোপ আয়তনে ছোট হলেও অনেক দেশের সমন্বয়ে গঠিত।",
      "আল্পস পর্বতমালা ইউরোপে অবস্থিত।",
      "ইউরোপের বড় অংশ Northern Hemisphere-এ।",
    ],
  },
  {
    id: "north-america",
    name: "North America",
    emoji: "🌎",
    region: "Northern & Western Hemisphere",
    facts: [
      "North America-এর মধ্যে Canada, USA ও Mexico রয়েছে।",
      "Rocky Mountains এই মহাদেশের একটি গুরুত্বপূর্ণ পর্বতমালা।",
      "উত্তর ও মধ্য আমেরিকার বিভিন্ন climate zone এখানে দেখা যায়।",
    ],
  },
  {
    id: "south-america",
    name: "South America",
    emoji: "🌎",
    region: "Mostly Southern & Western Hemisphere",
    facts: [
      "Amazon Basin South America-এ অবস্থিত।",
      "Andes পৃথিবীর দীর্ঘতম continental mountain range-গুলোর একটি।",
      "Amazon rainforest এই মহাদেশের গুরুত্বপূর্ণ ecosystem।",
    ],
  },
  {
    id: "australia",
    name: "Australia",
    emoji: "🌏",
    region: "Southern & Eastern Hemisphere",
    facts: [
      "Australia একটি দেশ এবং একই সঙ্গে একটি মহাদেশ।",
      "এটি Southern Hemisphere-এ অবস্থিত।",
      "এখানে unique wildlife ও diverse ecosystems রয়েছে।",
    ],
  },
  {
    id: "antarctica",
    name: "Antarctica",
    emoji: "🧊",
    region: "Southern Hemisphere",
    facts: [
      "Antarctica পৃথিবীর সবচেয়ে দক্ষিণের মহাদেশ।",
      "মহাদেশটির অধিকাংশ অংশ বরফে ঢাকা।",
      "South Pole Antarctica-তে অবস্থিত।",
    ],
  },
];

const LESSONS: Lesson[] = [
  {
    id: "earth",
    icon: "🌍",
    title: "Earth & Continents",
    description:
      "পৃথিবী, ৭টি মহাদেশ ও মহাসাগরকে interactive exploration-এর মাধ্যমে শেখো।",
    topics: [
      "পৃথিবীর প্রধান অংশ",
      "৭টি মহাদেশ",
      "মহাসাগর",
      "উত্তর ও দক্ষিণ গোলার্ধ",
    ],
  },
  {
    id: "latitude",
    icon: "🧭",
    title: "Latitude & Longitude",
    description:
      "Latitude ও longitude ব্যবহার করে পৃথিবীর যেকোনো location বোঝা শিখো।",
    topics: ["Equator", "Prime Meridian", "Latitude", "Longitude"],
  },
  {
    id: "weather",
    icon: "🌦️",
    title: "Weather & Climate",
    description:
      "Weather এবং climate-এর পার্থক্য এবং পৃথিবীর বিভিন্ন climate সম্পর্কে শেখো।",
    topics: ["Temperature", "Rainfall", "Wind", "Weather vs Climate"],
  },
  {
    id: "rivers",
    icon: "🌊",
    title: "Rivers & Landforms",
    description:
      "নদী কীভাবে ভূমির পরিবর্তন ঘটায় এবং বিভিন্ন landform তৈরি করে তা শেখো।",
    topics: ["River erosion", "Transportation", "Deposition", "Floodplain"],
  },
  {
    id: "maps",
    icon: "🗺️",
    title: "Maps & Scale",
    description:
      "Map, direction, distance ও scale ব্যবহার করে geographical information বুঝতে শেখো।",
    topics: ["Map symbols", "Direction", "Map scale", "Distance"],
  },
];

const QUIZ_QUESTIONS = [
  {
    question: "পৃথিবীর সবচেয়ে বড় মহাদেশ কোনটি?",
    options: ["Africa", "Asia", "Europe", "Australia"],
    answer: "Asia",
  },
  {
    question: "South Pole কোন মহাদেশে অবস্থিত?",
    options: ["Asia", "Africa", "Antarctica", "Europe"],
    answer: "Antarctica",
  },
  {
    question: "Amazon rainforest কোন মহাদেশে অবস্থিত?",
    options: ["South America", "Africa", "Asia", "Europe"],
    answer: "South America",
  },
];

export default function DigitalGeographyClassroom({ onActivityLog }: { onActivityLog?: (title: string, score: number) => void }) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedContinent, setSelectedContinent] =
    useState<Continent | null>(null);
  const [mode, setMode] = useState<"learn" | "explore" | "quiz">("learn");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(
        "curiositylearn_digital_geography_completed"
      );
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  function completeLesson(id: string) {
    const updated = completedLessons.includes(id)
      ? completedLessons
      : [...completedLessons, id];

    setCompletedLessons(updated);

    localStorage.setItem(
      "curiositylearn_digital_geography_completed",
      JSON.stringify(updated)
    );
  }

  function startQuiz() {
    setMode("quiz");
    setQuizIndex(0);
    setQuizScore(0);
    setAnswered(null);
  }

  function answerQuiz(option: string) {
    if (answered) return;

    const current = QUIZ_QUESTIONS[quizIndex];
    setAnswered(option);

    if (option === current.answer) {
      setQuizScore((score) => score + 1);
    }
  }

  function nextQuestion() {
    setAnswered(null);
    if (quizIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizIndex((index) => index + 1);
    } else {
      const finalScore = Math.round((quizScore / QUIZ_QUESTIONS.length) * 100);
      onActivityLog?.(`Digital Geography Classroom Quiz`, finalScore);
      setMode("learn");
    }
  }

  const progress = Math.round(
    (completedLessons.length / LESSONS.length) * 100
  );

  const currentQuiz = QUIZ_QUESTIONS[quizIndex];

  const explorationHint = useMemo(
    () =>
      selectedContinent
        ? `তুমি ${selectedContinent.name} explore করছো।`
        : "নিচের মহাদেশে click করে exploration শুরু করো।",
    [selectedContinent]
  );

  if (selectedLesson && selectedLesson.id !== "earth") {
    const completed = completedLessons.includes(selectedLesson.id);
    const topicDetails = LESSON_TOPIC_DETAILS[selectedLesson.id] || [];
    const safeTopicIndex = Math.min(
      selectedTopicIndex,
      Math.max(topicDetails.length - 1, 0)
    );
    const activeTopic = topicDetails[safeTopicIndex];

    return (
      <div style={lessonPageStyle}>
        <div style={lessonTopBarStyle}>
          <button
            type="button"
            onClick={() => setSelectedLesson(null)}
            style={backButtonStyle}
          >
            ← Back to Classroom
          </button>
          <span style={lessonBreadcrumbStyle}>Digital Geography Classroom / Lesson</span>
        </div>

        <div style={lessonHeroGridStyle}>
          <div style={lessonHeroContentStyle}>
            <div style={lessonIconStyle}>{selectedLesson.icon}</div>
            <div style={lessonEyebrowStyle}>GEOGRAPHY LESSON</div>
            <h1 style={lessonTitleStyle}>{selectedLesson.title}</h1>
            <p style={lessonHeroDescriptionStyle}>{selectedLesson.description}</p>
            <div style={lessonMetaRowStyle}>
              <span style={lessonMetaPillStyle}>📚 {selectedLesson.topics.length} Topics</span>
              <span style={lessonMetaPillStyle}>🧠 Interactive Learning</span>
              <span style={{ ...lessonMetaPillStyle, background: completed ? "rgba(34,197,94,0.18)" : "rgba(56,189,248,0.14)", borderColor: completed ? "rgba(34,197,94,0.35)" : "rgba(56,189,248,0.28)" }}>
                {completed ? "✓ Completed" : `Topic ${safeTopicIndex + 1} of ${selectedLesson.topics.length}`}
              </span>
            </div>
          </div>

          <div style={lessonVisualCardStyle}>
            <div style={lessonVisualGlowStyle} />
            <div style={lessonVisualIconStyle}>{selectedLesson.icon}</div>
            <div style={lessonVisualCaptionStyle}>
              <strong>Click a topic to learn</strong>
              <span>Read the explanation, example and key points.</span>
            </div>
          </div>
        </div>

        <div style={lessonLearningGridStyle}>
          <section style={lessonSectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <div style={sectionEyebrowStyle}>LESSON TOPICS</div>
                <h2 style={sectionTitleStyle}>What you will learn</h2>
              </div>
              <span style={goalCountStyle}>{selectedLesson.topics.length} topics</span>
            </div>

            <div style={lessonTopicGridStyle}>
              {selectedLesson.topics.map((topic, index) => {
                const active = index === safeTopicIndex;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopicIndex(index)}
                    style={{
                      ...lessonTopicCardStyle,
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "inherit",
                      background: active ? "rgba(56,189,248,0.14)" : "rgba(255,255,255,0.045)",
                      borderColor: active ? "rgba(56,189,248,0.45)" : "rgba(148,163,184,0.12)",
                      boxShadow: active ? "0 10px 28px rgba(14,165,233,0.12)" : "none",
                    }}
                  >
                    <div style={topicNumberStyle}>{String(index + 1).padStart(2, "0")}</div>
                    <div>
                      <strong style={topicTitleStyle}>{topic}</strong>
                      <p style={topicHintStyle}>Click to learn this topic →</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside style={lessonActionCardStyle}>
            <div style={sectionEyebrowStyle}>YOUR PROGRESS</div>
            <div style={progressCircleStyle}>
              <span>{completed ? "100%" : `${Math.round(((safeTopicIndex + 1) / selectedLesson.topics.length) * 100)}%`}</span>
            </div>
            <h3 style={{ margin: "8px 0 6px", fontSize: "20px" }}>
              {completed ? "Great job! 🎉" : `Topic ${safeTopicIndex + 1} selected`}
            </h3>
            <p style={topicHintStyle}>
              {completed ? "You have completed this lesson. Keep exploring!" : "Read each topic and mark the lesson complete when you finish."}
            </p>
            <button
              type="button"
              onClick={() => completeLesson(selectedLesson.id)}
              style={{
                ...lessonCompleteButtonStyle,
                background: completed ? "#16a34a" : "#38bdf8",
                color: completed ? "white" : "#082f49",
              }}
            >
              {completed ? "✓ Lesson Completed" : "✓ Mark as Completed"}
            </button>
          </aside>
        </div>

        {activeTopic && (
          <section style={lessonTopicDetailStyle}>
            <div style={sectionEyebrowStyle}>TOPIC {safeTopicIndex + 1}</div>
            <h2 style={{ margin: "6px 0 10px", fontSize: "30px" }}>{selectedLesson.topics[safeTopicIndex]}</h2>
            <p style={topicExplanationStyle}>{activeTopic.explanation}</p>

            <div style={detailGridStyle}>
              <div style={detailPanelStyle}>
                <strong>🔑 Key points</strong>
                <div style={{ display: "grid", gap: "9px", marginTop: "12px" }}>
                  {activeTopic.points.map((point) => (
                    <div key={point} style={detailPointStyle}>✓ {point}</div>
                  ))}
                </div>
              </div>
              <div style={detailPanelStyle}>
                <strong>💡 Example</strong>
                <p style={{ margin: "12px 0 0", lineHeight: 1.7, opacity: 0.82 }}>{activeTopic.example}</p>
              </div>
            </div>

            <div style={topicNavigationStyle}>
              <button
                type="button"
                disabled={safeTopicIndex === 0}
                onClick={() => setSelectedTopicIndex((index) => Math.max(0, index - 1))}
                style={secondaryButtonStyle}
              >
                ← Previous Topic
              </button>
              <button
                type="button"
                disabled={safeTopicIndex === selectedLesson.topics.length - 1}
                onClick={() => setSelectedTopicIndex((index) => Math.min(selectedLesson.topics.length - 1, index + 1))}
                style={primaryButtonStyle}
              >
                Next Topic →
              </button>
            </div>
          </section>
        )}
      </div>
    );
  }

  if (selectedLesson?.id === "earth") {
    return (
      <div style={shellStyle}>
        <button
          type="button"
          onClick={() => {
            setSelectedLesson(null);
            setSelectedContinent(null);
            setMode("learn");
          }}
          style={backButtonStyle}
        >
          ← Back to Classroom
        </button>

        <div style={heroStyle}>
          <div style={{ fontSize: "50px" }}>🌍</div>
          <h1 style={{ margin: "8px 0" }}>Earth & Continents Lab</h1>
          <p style={mutedTextStyle}>
            শুধু পড়া নয়—explore করো, continent-এ click করো এবং quiz দিয়ে নিজের
            শেখা যাচাই করো।
          </p>

          <div style={modeBarStyle}>
            <button
              type="button"
              onClick={() => setMode("learn")}
              style={mode === "learn" ? activeModeStyle : modeButtonStyle}
            >
              📘 Learn
            </button>
            <button
              type="button"
              onClick={() => setMode("explore")}
              style={mode === "explore" ? activeModeStyle : modeButtonStyle}
            >
              🌐 Explore
            </button>
            <button
              type="button"
              onClick={startQuiz}
              style={mode === "quiz" ? activeModeStyle : modeButtonStyle}
            >
              🧠 Quiz
            </button>
          </div>
        </div>

        {mode === "learn" && (
          <div style={sectionCardStyle}>
            <h2>🌍 Earth Learning Mission</h2>
            <p style={mutedTextStyle}>
              পৃথিবীকে একটি system হিসেবে ভাবো—land, water, atmosphere এবং
              বিভিন্ন মহাদেশ একে অপরের সঙ্গে কীভাবে সম্পর্কিত তা বুঝে শেখো।
            </p>

            <div style={missionGridStyle}>
              <div style={missionCardStyle}>
                <div style={{ fontSize: "34px" }}>🌎</div>
                <h3>7 Continents</h3>
                <p>প্রতিটি continent explore করো এবং key facts শিখো।</p>
              </div>

              <div style={missionCardStyle}>
                <div style={{ fontSize: "34px" }}>🌊</div>
                <h3>Oceans</h3>
                <p>পৃথিবীর land ও water distribution সম্পর্কে ধারণা নাও।</p>
              </div>

              <div style={missionCardStyle}>
                <div style={{ fontSize: "34px" }}>🧭</div>
                <h3>Hemispheres</h3>
                <p>Equator-এর মাধ্যমে Northern ও Southern Hemisphere বোঝো।</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMode("explore")}
              style={primaryButtonStyle}
            >
              Start Interactive Exploration →
            </button>
          </div>
        )}

        {mode === "explore" && (
          <div style={sectionCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ marginBottom: "6px" }}>🌐 Interactive World</h2>
                <p style={{ ...mutedTextStyle, margin: 0 }}>
                  {explorationHint}
                </p>
              </div>
              <span style={badgeStyle}>7 CONTINENTS</span>
            </div>

            <div style={worldMapStyle}>
              {CONTINENTS.map((continent, index) => (
                <button
                  key={continent.id}
                  type="button"
                  onClick={() => setSelectedContinent(continent)}
                  style={{
                    ...continentButtonStyle,
                    transform: `translateY(${index % 2 === 0 ? 0 : 18}px)`,
                  }}
                >
                  <span style={{ fontSize: "30px" }}>{continent.emoji}</span>
                  <strong>{continent.name}</strong>
                  <span style={{ fontSize: "12px", opacity: 0.7 }}>
                    Click to explore
                  </span>
                </button>
              ))}
            </div>

            {selectedContinent && (
              <div style={continentDetailStyle}>
                <div style={{ fontSize: "44px" }}>
                  {selectedContinent.emoji}
                </div>
                <h2 style={{ margin: "6px 0" }}>
                  {selectedContinent.name}
                </h2>
                <p style={{ marginTop: 0, opacity: 0.7 }}>
                  {selectedContinent.region}
                </p>

                <div style={{ display: "grid", gap: "10px" }}>
                  {selectedContinent.facts.map((fact) => (
                    <div key={fact} style={topicStyle}>
                      ✓ {fact}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedContinent(null)}
                  style={secondaryButtonStyle}
                >
                  Close Explorer
                </button>
              </div>
            )}
          </div>
        )}

        {mode === "quiz" && (
          <div style={sectionCardStyle}>
            <div style={quizTopStyle}>
              <span>🧠 Geography Quiz</span>
              <span>
                Question {quizIndex + 1} / {QUIZ_QUESTIONS.length}
              </span>
            </div>

            <h2 style={{ lineHeight: 1.5 }}>{currentQuiz.question}</h2>

            <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
              {currentQuiz.options.map((option) => {
                const isCorrect = option === currentQuiz.answer;
                const isSelected = option === answered;

                let background = "rgba(255,255,255,0.06)";
                if (answered && isCorrect) background = "rgba(34,197,94,0.28)";
                if (answered && isSelected && !isCorrect) {
                  background = "rgba(239,68,68,0.28)";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={Boolean(answered)}
                    onClick={() => answerQuiz(option)}
                    style={{
                      ...quizOptionStyle,
                      background,
                      opacity: answered && !isCorrect && !isSelected ? 0.65 : 1,
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  borderRadius: "14px",
                  background:
                    answered === currentQuiz.answer
                      ? "rgba(34,197,94,0.16)"
                      : "rgba(239,68,68,0.16)",
                }}
              >
                <strong>
                  {answered === currentQuiz.answer
                    ? "🎉 Correct!"
                    : `❌ Correct answer: ${currentQuiz.answer}`}
                </strong>

                <p style={{ marginBottom: 0, opacity: 0.75 }}>
                  {quizIndex === QUIZ_QUESTIONS.length - 1
                    ? `Final score: ${quizScore + (answered === currentQuiz.answer ? 1 : 0)} / ${QUIZ_QUESTIONS.length}`
                    : "পরের প্রশ্নে যাও।"}
                </p>
              </div>
            )}

            {answered && (
              <button
                type="button"
                onClick={nextQuestion}
                style={primaryButtonStyle}
              >
                {quizIndex === QUIZ_QUESTIONS.length - 1
                  ? "Finish Quiz ✓"
                  : "Next Question →"}
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => completeLesson("earth")}
          style={{
            ...primaryButtonStyle,
            marginTop: "18px",
            background: completedLessons.includes("earth")
              ? "#16a34a"
              : "#38bdf8",
            color: completedLessons.includes("earth") ? "white" : "#082f49",
          }}
        >
          {completedLessons.includes("earth")
            ? "✓ Earth & Continents Completed"
            : "✓ Mark Earth & Continents Completed"}
        </button>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div style={{ fontSize: "50px" }}>🌍</div>
        <h1 style={{ margin: "8px 0" }}>Digital Geography Classroom</h1>
        <p style={mutedTextStyle}>
          Geography-কে interactive lessons, exploration, quiz, maps, weather,
          climate এবং real-world examples-এর মাধ্যমে শেখো।
        </p>

        <div style={progressTrackStyle}>
          <div style={{ ...progressFillStyle, width: `${progress}%` }} />
        </div>

        <p style={{ marginBottom: 0, opacity: 0.75 }}>
          Learning Progress: {completedLessons.length} / {LESSONS.length}{" "}
          lessons ({progress}%)
        </p>
      </div>

      <div style={lessonGridStyle}>
        {LESSONS.map((lesson) => {
          const completed = completedLessons.includes(lesson.id);

          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => {
                setSelectedLesson(lesson);
                setSelectedTopicIndex(0);
                setMode("learn");
              }}
              style={lessonCardStyle}
            >
              <div style={{ fontSize: "42px" }}>{lesson.icon}</div>
              <h3 style={{ margin: "12px 0 8px" }}>{lesson.title}</h3>
              <p style={lessonDescriptionStyle}>{lesson.description}</p>

              <div
                style={{
                  marginTop: "16px",
                  fontWeight: 800,
                  color: completed ? "#4ade80" : "#38bdf8",
                }}
              >
                {completed ? "✓ Completed" : "Start Learning →"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


const lessonLearningGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 300px",
  gap: "18px",
  marginTop: "18px",
};

const lessonTopicDetailStyle: React.CSSProperties = {
  marginTop: "18px",
  padding: "26px",
  borderRadius: "24px",
  background: "linear-gradient(145deg, rgba(14,30,50,0.98), rgba(15,23,42,0.96))",
  border: "1px solid rgba(56,189,248,0.20)",
  boxShadow: "0 18px 50px rgba(0,0,0,0.20)",
};

const topicExplanationStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: "900px",
  fontSize: "17px",
  lineHeight: 1.8,
  opacity: 0.88,
};

const detailGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "14px",
  marginTop: "20px",
};

const detailPanelStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "17px",
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(148,163,184,0.12)",
};

const detailPointStyle: React.CSSProperties = {
  padding: "9px 11px",
  borderRadius: "11px",
  background: "rgba(56,189,248,0.08)",
  fontSize: "13px",
  lineHeight: 1.5,
};

const topicNavigationStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  marginTop: "20px",
};

const lessonPageStyle: React.CSSProperties = {
  maxWidth: "1120px",
  margin: "0 auto",
  padding: "28px 22px 60px",
  color: "white",
};

const lessonTopBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  marginBottom: "18px",
};

const lessonBreadcrumbStyle: React.CSSProperties = {
  fontSize: "13px",
  opacity: 0.58,
};

const lessonHeroGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.35fr) minmax(260px, 0.65fr)",
  gap: "18px",
  padding: "30px",
  borderRadius: "28px",
  background: "linear-gradient(135deg, #0f2740, #111827 62%, #172554)",
  border: "1px solid rgba(96,165,250,0.22)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
};

const lessonHeroContentStyle: React.CSSProperties = {
  minWidth: 0,
};

const lessonIconStyle: React.CSSProperties = {
  width: "64px",
  height: "64px",
  display: "grid",
  placeItems: "center",
  borderRadius: "20px",
  background: "rgba(56,189,248,0.14)",
  border: "1px solid rgba(56,189,248,0.25)",
  fontSize: "34px",
  marginBottom: "18px",
};

const lessonEyebrowStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "1.8px",
  opacity: 0.62,
};

const lessonTitleStyle: React.CSSProperties = {
  margin: "7px 0 10px",
  fontSize: "clamp(32px, 5vw, 50px)",
  lineHeight: 1.05,
};

const lessonHeroDescriptionStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: "680px",
  lineHeight: 1.75,
  fontSize: "16px",
  opacity: 0.78,
};

const lessonMetaRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "9px",
  marginTop: "22px",
};

const lessonMetaPillStyle: React.CSSProperties = {
  padding: "8px 11px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.10)",
  fontSize: "12px",
  fontWeight: 700,
};

const lessonVisualCardStyle: React.CSSProperties = {
  position: "relative",
  minHeight: "260px",
  overflow: "hidden",
  borderRadius: "24px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  background: "linear-gradient(145deg, rgba(14,165,233,0.16), rgba(30,41,59,0.62))",
  border: "1px solid rgba(148,163,184,0.16)",
};

const lessonVisualGlowStyle: React.CSSProperties = {
  position: "absolute",
  width: "180px",
  height: "180px",
  borderRadius: "50%",
  background: "rgba(56,189,248,0.14)",
  filter: "blur(20px)",
};

const lessonVisualIconStyle: React.CSSProperties = {
  position: "relative",
  fontSize: "88px",
  marginBottom: "18px",
};

const lessonVisualCaptionStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  fontSize: "13px",
  opacity: 0.86,
};

// const lessonContentGridStyle: React.CSSProperties = {
//   display: "grid",
//   gridTemplateColumns: "minmax(0, 1fr) 300px",
//   gap: "18px",
//   marginTop: "18px",
// };

const lessonSectionCardStyle: React.CSSProperties = {
  padding: "24px",
  borderRadius: "24px",
  background: "rgba(15,23,42,0.86)",
  border: "1px solid rgba(148,163,184,0.16)",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "18px",
};

const sectionEyebrowStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "1.5px",
  fontWeight: 800,
  opacity: 0.55,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "5px 0 0",
  fontSize: "25px",
};

const goalCountStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: "999px",
  background: "rgba(56,189,248,0.10)",
  color: "#7dd3fc",
  fontSize: "12px",
  fontWeight: 800,
};

const lessonTopicGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const lessonTopicCardStyle: React.CSSProperties = {
  display: "flex",
  gap: "13px",
  padding: "17px",
  borderRadius: "17px",
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(148,163,184,0.12)",
};

const topicNumberStyle: React.CSSProperties = {
  flex: "0 0 auto",
  width: "34px",
  height: "34px",
  display: "grid",
  placeItems: "center",
  borderRadius: "11px",
  background: "rgba(56,189,248,0.12)",
  color: "#7dd3fc",
  fontSize: "11px",
  fontWeight: 900,
};

const topicTitleStyle: React.CSSProperties = {
  display: "block",
  lineHeight: 1.35,
};

const topicHintStyle: React.CSSProperties = {
  margin: "5px 0 0",
  fontSize: "12px",
  lineHeight: 1.5,
  opacity: 0.55,
};

const lessonActionCardStyle: React.CSSProperties = {
  padding: "24px",
  borderRadius: "24px",
  background: "linear-gradient(160deg, rgba(30,41,59,0.98), rgba(15,23,42,0.94))",
  border: "1px solid rgba(148,163,184,0.16)",
  alignSelf: "start",
};

const progressCircleStyle: React.CSSProperties = {
  width: "112px",
  height: "112px",
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  margin: "20px auto",
  background: "radial-gradient(circle, #0f172a 55%, transparent 57%), conic-gradient(#38bdf8 0deg, #38bdf8 0deg, rgba(148,163,184,0.16) 0deg)",
  border: "8px solid rgba(56,189,248,0.10)",
  fontSize: "21px",
  fontWeight: 900,
};

const lessonCompleteButtonStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  borderRadius: "13px",
  padding: "13px 16px",
  marginTop: "16px",
  cursor: "pointer",
  fontWeight: 900,
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "24px",
  color: "white",
};

const heroStyle: React.CSSProperties = {
  borderRadius: "24px",
  padding: "28px",
  background:
    "linear-gradient(135deg, rgba(14,116,144,0.30), rgba(15,23,42,0.96))",
  border: "1px solid rgba(148,163,184,0.25)",
  marginBottom: "22px",
};

const sectionCardStyle: React.CSSProperties = {
  borderRadius: "22px",
  padding: "24px",
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))",
  border: "1px solid rgba(148,163,184,0.22)",
  marginTop: "18px",
};

const mutedTextStyle: React.CSSProperties = {
  opacity: 0.78,
  lineHeight: 1.7,
};

const backButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "10px",
  padding: "10px 16px",
  cursor: "pointer",
  background: "#e2e8f0",
  color: "#0f172a",
  fontWeight: 700,
  marginBottom: "18px",
};

const primaryButtonStyle: React.CSSProperties = {
  marginTop: "24px",
  border: "none",
  borderRadius: "12px",
  padding: "13px 20px",
  cursor: "pointer",
  background: "#38bdf8",
  color: "#082f49",
  fontWeight: 800,
};

const secondaryButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  background: "#334155",
  color: "white",
};

// const topicGridStyle: React.CSSProperties = {
//   display: "grid",
//   gap: "10px",
//   marginTop: "12px",
// };

const topicStyle: React.CSSProperties = {
  padding: "13px 15px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.07)",
  lineHeight: 1.5,
};

const modeBarStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "20px",
};

const modeButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,0.25)",
  borderRadius: "10px",
  padding: "10px 15px",
  cursor: "pointer",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 700,
};

const activeModeStyle: React.CSSProperties = {
  ...modeButtonStyle,
  background: "#0ea5e9",
  color: "#082f49",
};

const missionGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "14px",
  marginTop: "18px",
};

const missionCardStyle: React.CSSProperties = {
  padding: "18px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(148,163,184,0.14)",
};

const worldMapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
  gap: "14px",
  marginTop: "22px",
  padding: "18px",
  borderRadius: "20px",
  background:
    "radial-gradient(circle at center, rgba(14,165,233,0.16), rgba(2,6,23,0.7))",
  border: "1px solid rgba(56,189,248,0.16)",
};

const continentButtonStyle: React.CSSProperties = {
  minHeight: "130px",
  borderRadius: "16px",
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(15,23,42,0.86)",
  color: "white",
  cursor: "pointer",
  padding: "14px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  transition: "transform 0.2s ease, border-color 0.2s ease",
};

const continentDetailStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "22px",
  borderRadius: "18px",
  background: "rgba(14,116,144,0.18)",
  border: "1px solid rgba(56,189,248,0.22)",
};

const badgeStyle: React.CSSProperties = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(56,189,248,0.14)",
  color: "#7dd3fc",
  fontSize: "12px",
  fontWeight: 800,
};

const quizTopStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
  color: "#7dd3fc",
  fontWeight: 800,
};

const quizOptionStyle: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,0.2)",
  borderRadius: "12px",
  padding: "15px",
  color: "white",
  textAlign: "left",
  cursor: "pointer",
  fontWeight: 700,
};

const progressTrackStyle: React.CSSProperties = {
  height: "10px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.12)",
  overflow: "hidden",
  marginTop: "20px",
};

const progressFillStyle: React.CSSProperties = {
  height: "100%",
  background: "#38bdf8",
  transition: "width 0.3s ease",
};

const lessonGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "18px",
};

const lessonCardStyle: React.CSSProperties = {
  borderRadius: "20px",
  padding: "22px",
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(30,41,59,0.96))",
  border: "1px solid rgba(148,163,184,0.22)",
  color: "white",
  cursor: "pointer",
  textAlign: "left",
};

const lessonDescriptionStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.6,
  opacity: 0.72,
  margin: 0,
};
