import React, { useMemo, useState } from "react";

type LivingTopic =
  | "flood"
  | "river"
  | "cyclone"
  | "earthquake"
  | "climate";

type Topic = {
  id: LivingTopic;
  icon: string;
  title: string;
  description: string;
  learning: string[];
};

const TOPICS: Topic[] = [
  {
    id: "flood",
    icon: "🌧️",
    title: "Flood Simulator",
    description:
      "বৃষ্টির পরিমাণ বাড়লে কীভাবে জল জমে এবং flood risk পরিবর্তিত হয় তা explore করো।",
    learning: [
      "Rainfall ও flood risk-এর সম্পর্ক",
      "Low-lying area কেন বেশি ঝুঁকিতে থাকে",
      "Flood preparedness-এর গুরুত্ব",
    ],
  },
  {
    id: "river",
    icon: "🌊",
    title: "River Erosion Lab",
    description:
      "নদীর স্রোত ও erosion বাড়লে river bank কীভাবে পরিবর্তিত হয় তা দেখো।",
    learning: [
      "River erosion",
      "Sediment transportation",
      "Deposition ও river-bank change",
    ],
  },
  {
    id: "cyclone",
    icon: "🌀",
    title: "Cyclone Simulator",
    description:
      "Wind speed ও storm intensity পরিবর্তন করে cyclone-এর প্রভাব বোঝো।",
    learning: [
      "Wind speed",
      "Storm intensity",
      "Coastal risk",
    ],
  },
  {
    id: "earthquake",
    icon: "🌍",
    title: "Earthquake Lab",
    description:
      "Earthquake magnitude বাড়লে ground shaking কীভাবে পরিবর্তিত হতে পারে তা explore করো।",
    learning: [
      "Magnitude",
      "Ground shaking",
      "Earthquake preparedness",
    ],
  },
  {
    id: "climate",
    icon: "🌡️",
    title: "Climate Change Lab",
    description:
      "Temperature ও greenhouse effect-এর পরিবর্তনকে একটি learning simulation-এর মাধ্যমে বোঝো।",
    learning: [
      "Global temperature",
      "Greenhouse effect",
      "Climate change ও extreme weather",
    ],
  },
];

type Challenge = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const CHALLENGES: Record<LivingTopic, Challenge[]> = {
  flood: [
    { question: "Rainfall খুব বেশি হলে কোন ঝুঁকি সাধারণত বাড়ে?", options: ["Flood risk", "Earthquake risk", "Longitude", "Day length"], answer: 0, explanation: "অতিরিক্ত rainfall নদী ও drainage system-এর ওপর চাপ বাড়িয়ে flood risk বাড়াতে পারে।" },
    { question: "Low-lying area-তে flood risk কেন বেশি হতে পারে?", options: ["জল সহজে জমে", "সূর্য কাছে থাকে", "বায়ুচাপ থাকে না", "Longitude বদলায়"], answer: 0, explanation: "নিচু এলাকায় পানি বের হতে বেশি সময় লাগতে পারে, তাই জলাবদ্ধতার ঝুঁকি বাড়ে।" },
  ],
  river: [
    { question: "River flow বাড়লে কোন process সাধারণত বাড়তে পারে?", options: ["Erosion", "Latitude", "Sunrise", "Earthquake magnitude"], answer: 0, explanation: "দ্রুত স্রোত নদীর তীর ও তলদেশ ক্ষয় করার ক্ষমতা বাড়াতে পারে।" },
    { question: "নদীর বহন করা sediment কোথাও জমলে তাকে কী বলে?", options: ["Deposition", "Rotation", "Evaporation", "Latitude"], answer: 0, explanation: "Sediment জমে যাওয়ার প্রক্রিয়াকে deposition বলা হয়।" },
  ],
  cyclone: [
    { question: "Cyclone-এর wind speed বাড়লে কোনটি বাড়তে পারে?", options: ["Storm impact", "Map scale", "Latitude", "Day length"], answer: 0, explanation: "বেশি wind speed সাধারণত ঝড়ের destructive impact বাড়াতে পারে।" },
    { question: "Cyclone-এর ক্ষেত্রে coastal area কেন বিশেষ ঝুঁকিতে থাকতে পারে?", options: ["Strong wind ও storm surge", "Longitude কম", "Mountains disappear", "Day length বাড়ে"], answer: 0, explanation: "উপকূলে strong wind, heavy rain ও storm surge-এর প্রভাব পড়তে পারে।" },
  ],
  earthquake: [
    { question: "Earthquake magnitude বাড়লে কী পরিবর্তন হতে পারে?", options: ["Ground shaking", "Latitude", "Ocean salinity", "Day length"], answer: 0, explanation: "বড় magnitude-এর earthquake শক্তিশালী ground motion তৈরি করতে পারে।" },
    { question: "Earthquake-এর সময় সবচেয়ে গুরুত্বপূর্ণ প্রস্তুতির একটি কী?", options: ["Drop, Cover, Hold On", "River flow বাড়ানো", "Rainfall বাড়ানো", "Map scale বদলানো"], answer: 0, explanation: "Drop, Cover, Hold On ভূমিকম্পের সময় নিরাপদ থাকার একটি বহুল ব্যবহৃত প্রস্তুতি-পদ্ধতি।" },
  ],
  climate: [
    { question: "Global temperature বাড়লে কোন ধরনের পরিবর্তন দেখা যেতে পারে?", options: ["Climate impacts", "Longitude", "Earth rotation", "Continents move instantly"], answer: 0, explanation: "উষ্ণতা বৃদ্ধির সঙ্গে heat extremes, sea-level rise ও অন্যান্য climate impacts বাড়তে পারে।" },
    { question: "Greenhouse gases কী করে?", options: ["Heat আটকে রাখতে সাহায্য করে", "Earth-এর rotation বন্ধ করে", "Longitude বদলায়", "Rainfall সবসময় বন্ধ করে"], answer: 0, explanation: "Greenhouse gases পৃথিবীর outgoing heat-এর একটি অংশ আটকে রাখে, যা warming-এ ভূমিকা রাখে।" },
  ],
};

export default function LivingGeography({ onActivityLog }: { onActivityLog?: (title: string, score: number) => void }) {
  const [selectedTopic, setSelectedTopic] = useState<LivingTopic>("flood");
  const [floodRain, setFloodRain] = useState(55);
  const [riverFlow, setRiverFlow] = useState(50);
  const [cycloneWind, setCycloneWind] = useState(70);
  const [quakeMagnitude, setQuakeMagnitude] = useState(5);
  const [temperature, setTemperature] = useState(1.5);
  const [challengeScore, setChallengeScore] = useState(() => {
    try {
      return Number(localStorage.getItem("curiositylearn_living_geo_xp") || "0");
    } catch {
      return 0;
    }
  });
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeAnswer, setChallengeAnswer] = useState<number | null>(null);

  const topic = TOPICS.find((item) => item.id === selectedTopic)!;

  const challenge = CHALLENGES[selectedTopic][challengeIndex % CHALLENGES[selectedTopic].length];

  const floodRisk = floodRain < 35 ? "Low" : floodRain < 70 ? "Medium" : "High";
  const riverErosion = riverFlow < 35 ? "Low" : riverFlow < 70 ? "Medium" : "High";
  const cycloneRisk =
    cycloneWind < 60 ? "Low" : cycloneWind < 100 ? "Medium" : "High";
  const earthquakeRisk =
    quakeMagnitude < 4 ? "Low" : quakeMagnitude < 6 ? "Medium" : "High";
  const climateLevel =
    temperature < 1 ? "Lower warming" : temperature < 2 ? "Moderate warming" : "Higher warming";

  const floodWater = `${Math.max(8, Math.min(86, floodRain * 0.9))}%`;
  const riverBank = `${Math.max(8, Math.min(44, riverFlow * 0.38))}%`;
  const cycloneSize = `${Math.max(90, Math.min(240, cycloneWind * 1.7))}px`;
  const quakeShake = `${Math.max(0, Math.min(18, (quakeMagnitude - 2) * 2.5))}px`;

  const climateBars = useMemo(
    () => [
      Math.max(15, Math.min(95, 35 + temperature * 18)),
      Math.max(15, Math.min(95, 25 + temperature * 22)),
      Math.max(15, Math.min(95, 20 + temperature * 26)),
    ],
    [temperature]
  );

  return (
    <div style={shellStyle}>
      <div style={heroStyle}>
        <div style={{ fontSize: "50px" }}>🌊</div>
        <span style={tagStyle}>জ্যান্ত ভূগোল • LIVING GEOGRAPHY</span>
        <h1 style={{ margin: "8px 0" }}>জ্যান্ত ভূগোল Lab</h1>
        <p style={mutedStyle}>
          বইয়ের ছবি নয়—পরিবর্তন করে দেখো, কীভাবে rainfall, river flow, wind,
          earthquake magnitude ও temperature বাস্তব ভূগোলের ঘটনাকে প্রভাবিত
          করতে পারে।
        </p>
      </div>

      <div style={topicGridStyle}>
        {TOPICS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedTopic(item.id)}
            style={{
              ...topicButtonStyle,
              borderColor:
                selectedTopic === item.id
                  ? "#38bdf8"
                  : "rgba(148,163,184,0.20)",
              background:
                selectedTopic === item.id
                  ? "rgba(14,165,233,0.16)"
                  : "rgba(15,23,42,0.92)",
            }}
          >
            <span style={{ fontSize: "32px" }}>{item.icon}</span>
            <strong>{item.title}</strong>
            <span style={{ fontSize: "12px", opacity: 0.68 }}>
              Explore simulation →
            </span>
          </button>
        ))}
      </div>

      <div style={labStyle}>
        <div>
          <span style={tagStyle}>INTERACTIVE LAB</span>
          <h2 style={{ margin: "7px 0" }}>
            {topic.icon} {topic.title}
          </h2>
          <p style={mutedStyle}>{topic.description}</p>
        </div>

        {selectedTopic === "flood" && (
          <FloodLab
            rain={floodRain}
            setRain={setFloodRain}
            water={floodWater}
            risk={floodRisk}
          />
        )}

        {selectedTopic === "river" && (
          <RiverLab
            flow={riverFlow}
            setFlow={setRiverFlow}
            bank={riverBank}
            risk={riverErosion}
          />
        )}

        {selectedTopic === "cyclone" && (
          <CycloneLab
            wind={cycloneWind}
            setWind={setCycloneWind}
            size={cycloneSize}
            risk={cycloneRisk}
          />
        )}

        {selectedTopic === "earthquake" && (
          <EarthquakeLab
            magnitude={quakeMagnitude}
            setMagnitude={setQuakeMagnitude}
            shake={quakeShake}
            risk={earthquakeRisk}
          />
        )}

        {selectedTopic === "climate" && (
          <ClimateLab
            temperature={temperature}
            setTemperature={setTemperature}
            bars={climateBars}
            level={climateLevel}
          />
        )}

        <div style={learningStyle}>
          <h3 style={{ marginTop: 0 }}>🎓 এই simulation থেকে কী শিখবে?</h3>
          <div style={{ display: "grid", gap: "9px" }}>
            {topic.learning.map((item) => (
              <div key={item} style={learningItemStyle}>
                ✓ {item}
              </div>
            ))}
          </div>
        </div>

        <GeographyChallenge
          challenge={challenge}
          score={challengeScore}
          selectedAnswer={challengeAnswer}
          onAnswer={(answer) => {
            if (challengeAnswer !== null) return;
            setChallengeAnswer(answer);
            if (answer === challenge.answer) {
              setChallengeScore((current) => {
                const next = current + 10;
                try {
                  localStorage.setItem("curiositylearn_living_geo_xp", String(next));
                } catch {}
                onActivityLog?.(`Living Geography: ${topic.title}`, 100);
                return next;
              });
            }
          }}
          onNext={() => {
            setChallengeAnswer(null);
            setChallengeIndex((current) => current + 1);
          }}
        />
      </div>
    </div>
  );
}

function GeographyChallenge({
  challenge,
  score,
  selectedAnswer,
  onAnswer,
  onNext,
}: {
  challenge: Challenge;
  score: number;
  selectedAnswer: number | null;
  onAnswer: (answer: number) => void;
  onNext: () => void;
}) {
  return (
    <div style={challengeStyle}>
      <div style={challengeHeaderStyle}>
        <div>
          <span style={tagStyle}>🎯 SCENARIO CHALLENGE</span>
          <h3 style={{ margin: "7px 0 0" }}>Geography Challenge</h3>
        </div>
        <div style={xpBadgeStyle}>⭐ {score} XP</div>
      </div>

      <p style={{ fontSize: "17px", lineHeight: 1.6, marginBottom: "16px" }}>
        {challenge.question}
      </p>

      <div style={{ display: "grid", gap: "10px" }}>
        {challenge.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === challenge.answer;
          let background = "rgba(255,255,255,0.05)";
          let border = "1px solid rgba(148,163,184,0.18)";
          if (selectedAnswer !== null && isCorrect) {
            background = "rgba(34,197,94,0.15)";
            border = "1px solid rgba(34,197,94,0.55)";
          } else if (isSelected) {
            background = "rgba(239,68,68,0.14)";
            border = "1px solid rgba(239,68,68,0.5)";
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => onAnswer(index)}
              style={{ ...answerButtonStyle, background, border }}
            >
              <span>{String.fromCharCode(65 + index)}.</span> {option}
            </button>
          );
        })}
      </div>

      {selectedAnswer !== null && (
        <div style={feedbackStyle}>
          <strong>
            {selectedAnswer === challenge.answer ? "🎉 সঠিক! +10 XP" : "❌ এবার ঠিক হয়নি"}
          </strong>
          <div style={{ marginTop: "7px", opacity: 0.86 }}>{challenge.explanation}</div>
          <button type="button" onClick={onNext} style={nextButtonStyle}>
            🎯 Next Challenge
          </button>
        </div>
      )}
    </div>
  );
}

function FloodLab({
  rain,
  setRain,
  water,
  risk,
}: {
  rain: number;
  setRain: (value: number) => void;
  water: string;
  risk: string;
}) {
  return (
    <>
      <Control
        label="🌧️ Rainfall intensity"
        value={rain}
        min={0}
        max={100}
        unit="%"
        onChange={setRain}
      />

      <div style={sceneStyle}>
        <div style={cloudStyle}>☁️ ☁️ ☁️</div>
        <div
          style={{
            ...rainLayerStyle,
            opacity: 0.25 + rain / 130,
          }}
        />
        <div
          style={{
            ...waterStyle,
            height: water,
          }}
        />
        <div style={houseStyle}>🏠</div>
        <div style={treeStyle}>🌳</div>
        <div style={sceneLabelStyle}>
          Flood risk: <strong>{risk}</strong>
        </div>
      </div>

      <RiskBadge level={risk} />
    </>
  );
}

function RiverLab({
  flow,
  setFlow,
  bank,
  risk,
}: {
  flow: number;
  setFlow: (value: number) => void;
  bank: string;
  risk: string;
}) {
  return (
    <>
      <Control
        label="🌊 River flow"
        value={flow}
        min={0}
        max={100}
        unit="%"
        onChange={setFlow}
      />

      <div style={riverSceneStyle}>
        <div
          style={{
            ...riverStyle,
            height: `${Math.max(26, flow * 0.75)}%`,
          }}
        />
        <div
          style={{
            ...bankStyle,
            width: bank,
          }}
        />
        <div style={{ ...riverTreeStyle, left: "12%" }}>🌳</div>
        <div style={{ ...riverTreeStyle, right: "12%" }}>🌳</div>
        <div style={sceneLabelStyle}>
          Bank erosion: <strong>{risk}</strong>
        </div>
      </div>

      <RiskBadge level={risk} />
    </>
  );
}

function CycloneLab({
  wind,
  setWind,
  size,
  risk,
}: {
  wind: number;
  setWind: (value: number) => void;
  size: string;
  risk: string;
}) {
  return (
    <>
      <Control
        label="🌀 Wind speed"
        value={wind}
        min={20}
        max={140}
        unit=" km/h"
        onChange={setWind}
      />

      <div style={cycloneSceneStyle}>
        <div
          style={{
            ...cycloneOuterStyle,
            width: size,
            height: size,
          }}
        >
          🌀
        </div>
        <div style={{ fontSize: "52px", position: "absolute", right: "12%" }}>
          🏠
        </div>
        <div style={{ position: "absolute", bottom: "12px", left: "16px" }}>
          Wind: <strong>{wind} km/h</strong> • Risk: <strong>{risk}</strong>
        </div>
      </div>

      <RiskBadge level={risk} />
    </>
  );
}

function EarthquakeLab({
  magnitude,
  setMagnitude,
  shake,
  risk,
}: {
  magnitude: number;
  setMagnitude: (value: number) => void;
  shake: string;
  risk: string;
}) {
  return (
    <>
      <Control
        label="🌍 Earthquake magnitude"
        value={magnitude}
        min={2}
        max={8}
        step={0.1}
        unit=""
        onChange={setMagnitude}
      />

      <div
        style={{
          ...earthSceneStyle,
          transform: `translateX(${
            magnitude >= 5 ? Math.sin(Date.now() / 80) * Number.parseFloat(shake) : 0
          }px)`,
        }}
      >
        <div style={{ fontSize: "72px" }}>🏙️</div>
        <div style={{ fontSize: "52px" }}>〰️〰️〰️</div>
        <div style={sceneLabelStyle}>
          Magnitude: <strong>{magnitude.toFixed(1)}</strong> • Risk:{" "}
          <strong>{risk}</strong>
        </div>
      </div>

      <RiskBadge level={risk} />
    </>
  );
}

function ClimateLab({
  temperature,
  setTemperature,
  bars,
  level,
}: {
  temperature: number;
  setTemperature: (value: number) => void;
  bars: number[];
  level: string;
}) {
  return (
    <>
      <Control
        label="🌡️ Global temperature anomaly"
        value={temperature}
        min={0}
        max={4}
        step={0.1}
        unit="°C"
        onChange={setTemperature}
      />

      <div style={climateSceneStyle}>
        <div style={{ fontSize: "60px" }}>🌍</div>
        <div style={{ display: "flex", alignItems: "end", gap: "12px" }}>
          {bars.map((height, index) => (
            <div
              key={index}
              style={{
                width: "48px",
                height: `${height * 1.2}px`,
                borderRadius: "8px 8px 0 0",
                background: "rgba(248,113,113,0.72)",
              }}
            />
          ))}
        </div>
        <div style={sceneLabelStyle}>
          Warming level: <strong>{level}</strong>
        </div>
      </div>

      <RiskBadge level={temperature < 1 ? "Low" : temperature < 2 ? "Medium" : "High"} />
    </>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div style={controlStyle}>
      <div style={controlHeaderStyle}>
        <strong>{label}</strong>
        <span>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  return (
    <div style={riskBadgeStyle}>
      Current learning indicator: <strong>{level}</strong>
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
    "linear-gradient(135deg, rgba(14,116,144,0.34), rgba(15,23,42,0.97))",
  border: "1px solid rgba(148,163,184,0.25)",
  marginBottom: "20px",
};

const tagStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "1.5px",
  fontWeight: 900,
  color: "#7dd3fc",
};

const mutedStyle: React.CSSProperties = {
  opacity: 0.78,
  lineHeight: 1.7,
};

const topicGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
};

const topicButtonStyle: React.CSSProperties = {
  minHeight: "150px",
  borderRadius: "17px",
  border: "1px solid",
  color: "white",
  padding: "16px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  textAlign: "center",
};

const labStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "24px",
  borderRadius: "22px",
  background:
    "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,41,59,0.97))",
  border: "1px solid rgba(148,163,184,0.22)",
};

const controlStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "16px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.06)",
};

const controlHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "12px",
};

const sceneStyle: React.CSSProperties = {
  position: "relative",
  height: "280px",
  marginTop: "18px",
  overflow: "hidden",
  borderRadius: "18px",
  background: "linear-gradient(#94a3b8 0 55%, #64748b 55% 100%)",
  border: "1px solid rgba(148,163,184,0.2)",
};

const cloudStyle: React.CSSProperties = {
  position: "absolute",
  top: "18px",
  left: "20%",
  fontSize: "38px",
  letterSpacing: "14px",
  zIndex: 3,
};

const rainLayerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "repeating-linear-gradient(105deg, transparent 0 10px, rgba(255,255,255,0.5) 11px 13px)",
  zIndex: 2,
};

const waterStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  background: "rgba(14,116,144,0.78)",
  transition: "height 0.25s ease",
  zIndex: 1,
};

const houseStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "30%",
  left: "22%",
  fontSize: "62px",
  zIndex: 4,
};

const treeStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "27%",
  right: "20%",
  fontSize: "56px",
  zIndex: 4,
};

const sceneLabelStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "12px",
  left: "14px",
  right: "14px",
  padding: "10px 12px",
  borderRadius: "10px",
  background: "rgba(2,6,23,0.68)",
  zIndex: 6,
};

const riverSceneStyle: React.CSSProperties = {
  position: "relative",
  height: "280px",
  marginTop: "18px",
  overflow: "hidden",
  borderRadius: "18px",
  background: "linear-gradient(135deg, #64748b, #94a3b8)",
};

const riverStyle: React.CSSProperties = {
  position: "absolute",
  left: "34%",
  bottom: 0,
  width: "32%",
  background: "#0284c7",
  borderRadius: "50% 50% 0 0",
  transition: "height 0.25s ease",
};

const bankStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  bottom: 0,
  height: "100%",
  background: "rgba(120,53,15,0.45)",
  transition: "width 0.25s ease",
};

const riverTreeStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "18%",
  fontSize: "54px",
};

const cycloneSceneStyle: React.CSSProperties = {
  position: "relative",
  height: "300px",
  marginTop: "18px",
  borderRadius: "18px",
  overflow: "hidden",
  background: "radial-gradient(circle, #475569, #0f172a)",
};

const cycloneOuterStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "radial-gradient(circle, #f8fafc, #64748b, #1e293b)",
  fontSize: "70px",
  transition: "width 0.25s ease, height 0.25s ease",
};

const earthSceneStyle: React.CSSProperties = {
  position: "relative",
  height: "280px",
  marginTop: "18px",
  borderRadius: "18px",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(#1e3a5f, #0f172a)",
  overflow: "hidden",
};

const climateSceneStyle: React.CSSProperties = {
  position: "relative",
  minHeight: "300px",
  marginTop: "18px",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "30px",
  background: "linear-gradient(#0c4a6e, #172554)",
  overflow: "hidden",
};

const riskBadgeStyle: React.CSSProperties = {
  marginTop: "14px",
  padding: "12px 15px",
  borderRadius: "12px",
  background: "rgba(56,189,248,0.10)",
  border: "1px solid rgba(56,189,248,0.16)",
  color: "#bae6fd",
};

const challengeStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "20px",
  borderRadius: "18px",
  background: "linear-gradient(145deg, rgba(30,64,175,0.18), rgba(15,23,42,0.96))",
  border: "1px solid rgba(56,189,248,0.22)",
};

const challengeHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "10px",
};

const xpBadgeStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(250,204,21,0.12)",
  border: "1px solid rgba(250,204,21,0.28)",
  color: "#fde68a",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const answerButtonStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "12px 14px",
  borderRadius: "12px",
  color: "inherit",
  cursor: "pointer",
  fontSize: "14px",
};

const feedbackStyle: React.CSSProperties = {
  marginTop: "15px",
  padding: "14px",
  borderRadius: "13px",
  background: "rgba(255,255,255,0.05)",
};

const nextButtonStyle: React.CSSProperties = {
  marginTop: "12px",
  padding: "10px 14px",
  border: 0,
  borderRadius: "10px",
  background: "#0284c7",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const learningStyle: React.CSSProperties = {
  marginTop: "20px",
  padding: "18px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.05)",
};

const learningItemStyle: React.CSSProperties = {
  padding: "11px 13px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.05)",
};
