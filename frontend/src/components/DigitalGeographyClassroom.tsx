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

export default function DigitalGeographyClassroom() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedContinent, setSelectedContinent] =
    useState<Continent | null>(null);
  const [mode, setMode] = useState<"learn" | "explore" | "quiz">("learn");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
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

    return (
      <div style={shellStyle}>
        <button
          type="button"
          onClick={() => setSelectedLesson(null)}
          style={backButtonStyle}
        >
          ← Back to Classroom
        </button>

        <div style={heroStyle}>
          <div style={{ fontSize: "54px" }}>{selectedLesson.icon}</div>
          <h1 style={{ margin: "8px 0" }}>{selectedLesson.title}</h1>
          <p style={mutedTextStyle}>{selectedLesson.description}</p>

          <h3 style={{ marginTop: "28px" }}>What you will learn</h3>

          <div style={topicGridStyle}>
            {selectedLesson.topics.map((topic) => (
              <div key={topic} style={topicStyle}>
                📘 {topic}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => completeLesson(selectedLesson.id)}
            style={{
              ...primaryButtonStyle,
              background: completed ? "#16a34a" : "#38bdf8",
              color: completed ? "white" : "#082f49",
            }}
          >
            {completed ? "✓ Lesson Completed" : "✓ Mark as Completed"}
          </button>
        </div>
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
              onClick={() => setSelectedLesson(lesson)}
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

const topicGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
  marginTop: "12px",
};

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
