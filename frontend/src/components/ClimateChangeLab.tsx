import { useEffect, useState } from "react";

type Topic = {
  id: string;
  icon: string;
  title: string;
  description: string;
  points: string[];
};

type Question = {
  question: string;
  options: string[];
  answer: number;
};

const topics: Topic[] = [
  {
    id: "global-warming",
    icon: "🌡️",
    title: "Global Warming",
    description:
      "Learn how the Earth's average temperature is changing.",
    points: [
      "Earth's average temperature has been increasing.",
      "Human activities are a major cause of recent warming.",
      "Burning fossil fuels releases greenhouse gases.",
    ],
  },

  {
    id: "greenhouse-effect",
    icon: "🌍",
    title: "Greenhouse Effect",
    description:
      "Understand how gases in the atmosphere trap heat.",
    points: [
      "Greenhouse gases absorb and re-emit heat.",
      "Carbon dioxide and methane are important greenhouse gases.",
      "The natural greenhouse effect makes Earth habitable.",
    ],
  },

  {
    id: "carbon-footprint",
    icon: "👣",
    title: "Carbon Footprint",
    description:
      "Explore how everyday activities produce greenhouse gases.",
    points: [
      "Transport can contribute to carbon emissions.",
      "Electricity generation can create emissions.",
      "Saving energy can reduce your carbon footprint.",
    ],
  },

  {
    id: "sea-level-rise",
    icon: "🌊",
    title: "Sea-Level Rise",
    description:
      "Learn why sea levels are changing.",
    points: [
      "Warming oceans expand as they heat.",
      "Melting land ice adds water to oceans.",
      "Coastal communities can be affected by rising seas.",
    ],
  },

  {
    id: "el-nino",
    icon: "🌊",
    title: "El Niño",
    description:
      "Explore a major climate pattern in the Pacific Ocean.",
    points: [
      "El Niño involves unusual warming of the central and eastern Pacific.",
      "It can influence rainfall and temperature patterns.",
      "Its effects can be felt in different parts of the world.",
    ],
  },

  {
    id: "iod",
    icon: "🌏",
    title: "Indian Ocean Dipole",
    description:
      "Understand an important climate pattern of the Indian Ocean.",
    points: [
      "IOD describes differences in sea-surface temperatures across the Indian Ocean.",
      "Positive and negative phases can influence rainfall.",
      "It can interact with other climate patterns.",
    ],
  },

  {
    id: "mjo",
    icon: "☁️",
    title: "MJO",
    description:
      "Discover the Madden-Julian Oscillation.",
    points: [
      "MJO is a moving pattern of tropical rainfall.",
      "It moves eastward around the tropics.",
      "It can influence rainfall and weather over several weeks.",
    ],
  },

  {
    id: "extreme-weather",
    icon: "⛈️",
    title: "Extreme Weather",
    description:
      "Study heatwaves, heavy rainfall, storms and other extremes.",
    points: [
      "Extreme weather can affect people, agriculture and infrastructure.",
      "Climate change can influence the likelihood or intensity of some extremes.",
      "Preparedness can reduce risks.",
    ],
  },
];

const questions: Question[] = [
  {
    question:
      "Which gas is an important greenhouse gas?",
    options: [
      "Carbon dioxide",
      "Oxygen only",
      "Helium",
      "Neon",
    ],
    answer: 0,
  },

  {
    question:
      "What does a carbon footprint represent?",
    options: [
      "The size of a person's foot",
      "Greenhouse gas emissions associated with activities",
      "The amount of rainfall",
      "Ocean depth",
    ],
    answer: 1,
  },

  {
    question:
      "What can contribute to sea-level rise?",
    options: [
      "Melting land ice",
      "More trees",
      "Lower humidity",
      "Less sunlight",
    ],
    answer: 0,
  },

  {
    question:
      "Where does El Niño mainly involve unusual ocean warming?",
    options: [
      "Atlantic Ocean",
      "Indian Ocean",
      "Pacific Ocean",
      "Arctic Ocean",
    ],
    answer: 2,
  },

  {
    question:
      "What does MJO describe?",
    options: [
      "A moving tropical rainfall pattern",
      "A type of mountain",
      "A type of soil",
      "A permanent ocean current",
    ],
    answer: 0,
  },
];

const STORAGE_KEY =
  "curiositylearn_climate_lab_progress";

export default function ClimateChangeLab({ onActivityLog }: { onActivityLog?: (title: string, score: number) => void }) {
  const [selectedTopic, setSelectedTopic] =
    useState(topics[0]);

  const [completedTopics, setCompletedTopics] =
    useState<string[]>([]);

  const [questionIndex, setQuestionIndex] =
    useState(0);

  const [score, setScore] = useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);

  const [quizFinished, setQuizFinished] =
    useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setCompletedTopics(JSON.parse(saved));
      } catch {
        setCompletedTopics([]);
      }
    }
  }, []);

  function completeTopic() {
    if (completedTopics.includes(selectedTopic.id)) {
      return;
    }

    const updated = [
      ...completedTopics,
      selectedTopic.id,
    ];

    setCompletedTopics(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  }

  function selectAnswer(index: number) {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);

    if (
      index === questions[questionIndex].answer
    ) {
      setScore((previous) => previous + 1);
    }
  }

  function nextQuestion() {
    if (
      questionIndex <
      questions.length - 1
    ) {
      setQuestionIndex(
        (previous) => previous + 1
      );

      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
      onActivityLog?.(`Climate Change Lab Quiz`, Math.round((score / questions.length) * 100));
    }
  }

  function restartQuiz() {
    setQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setQuizFinished(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2>🌍 Climate Change Lab</h2>

          <p style={styles.subtitle}>
            Explore climate science, understand
            climate patterns and test your knowledge.
          </p>
        </div>

        <div style={styles.progressBadge}>
          {completedTopics.length}/{topics.length}
          <br />
          Topics Completed
        </div>
      </div>

      {/* Topics */}
      <div style={styles.topicGrid}>
        {topics.map((topic) => {
          const completed =
            completedTopics.includes(topic.id);

          const selected =
            selectedTopic.id === topic.id;

          return (
            <button
              key={topic.id}
              onClick={() => {
                setSelectedTopic(topic);
                setSelectedAnswer(null);
              }}
              style={{
                ...styles.topicCard,
                ...(selected
                  ? styles.selectedTopic
                  : {}),
              }}
            >
              <div style={styles.topicIcon}>
                {topic.icon}
              </div>

              <strong>{topic.title}</strong>

              <small>
                {completed
                  ? "✅ Completed"
                  : "Start learning"}
              </small>
            </button>
          );
        })}
      </div>

      {/* Selected Topic */}
      <div style={styles.lessonCard}>
        <div style={styles.lessonTitle}>
          <span>
            {selectedTopic.icon}
          </span>

          <div>
            <h3>
              {selectedTopic.title}
            </h3>

            <p>
              {selectedTopic.description}
            </p>
          </div>
        </div>

        <h4>🔎 Key Points</h4>

        <ul>
          {selectedTopic.points.map(
            (point, index) => (
              <li key={index}>
                {point}
              </li>
            )
          )}
        </ul>

        <button
          style={styles.completeButton}
          onClick={completeTopic}
          disabled={completedTopics.includes(
            selectedTopic.id
          )}
        >
          {completedTopics.includes(
            selectedTopic.id
          )
            ? "✅ Topic Completed"
            : "Mark Topic as Completed"}
        </button>
      </div>

      {/* Challenge */}
      <div style={styles.quizCard}>
        <div style={styles.quizHeader}>
          <div>
            <h3>🧠 Climate Challenge</h3>

            {!quizFinished && (
              <p>
                Question {questionIndex + 1} of{" "}
                {questions.length}
              </p>
            )}
          </div>

          {!quizFinished && (
            <div style={styles.score}>
              Score: {score}
            </div>
          )}
        </div>

        {quizFinished ? (
          <div style={styles.result}>
            <div style={styles.bigScore}>
              🎉
            </div>

            <h3>
              Challenge Complete!
            </h3>

            <p>
              You scored{" "}
              <strong>
                {score}/{questions.length}
              </strong>
            </p>

            <button
              style={styles.completeButton}
              onClick={restartQuiz}
            >
              🔄 Try Again
            </button>
          </div>
        ) : (
          <div>
            <h4>
              {questions[questionIndex].question}
            </h4>

            <div>
              {questions[
                questionIndex
              ].options.map((option, index) => {
                const isSelected =
                  selectedAnswer === index;

                const isCorrect =
                  index ===
                  questions[questionIndex]
                    .answer;

                let background =
                  "#f8fafc";

                if (selectedAnswer !== null) {
                  if (isCorrect) {
                    background = "#dcfce7";
                  } else if (isSelected) {
                    background = "#fee2e2";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() =>
                      selectAnswer(index)
                    }
                    style={{
                      ...styles.answer,
                      background,
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <button
                style={styles.nextButton}
                onClick={nextQuestion}
              >
                {questionIndex ===
                questions.length - 1
                  ? "Finish Challenge"
                  : "Next Question →"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  },

  subtitle: {
    color: "#64748b",
  },

  progressBadge: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "12px 18px",
    borderRadius: "12px",
    textAlign: "center",
    fontWeight: "bold",
    minWidth: "120px",
  },

  topicGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
  },

  topicCard: {
    border: "1px solid #e2e8f0",
    background: "#fff",
    borderRadius: "14px",
    padding: "18px",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  selectedTopic: {
    border: "2px solid #2563eb",
    background: "#eff6ff",
  },

  topicIcon: {
    fontSize: "30px",
  },

  lessonCard: {
    marginTop: "25px",
    padding: "25px",
    borderRadius: "18px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  lessonTitle: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
  },

  completeButton: {
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
  },

  quizCard: {
    marginTop: "25px",
    padding: "25px",
    borderRadius: "18px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 3px 12px rgba(0,0,0,0.06)",
  },

  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  score: {
    background: "#fef3c7",
    padding: "8px 14px",
    borderRadius: "10px",
    fontWeight: "bold",
  },

  answer: {
    display: "block",
    width: "100%",
    padding: "13px",
    marginTop: "10px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    cursor: "pointer",
    textAlign: "left",
  },

  nextButton: {
    marginTop: "18px",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  result: {
    textAlign: "center",
    padding: "25px",
  },

  bigScore: {
    fontSize: "50px",
  },
};