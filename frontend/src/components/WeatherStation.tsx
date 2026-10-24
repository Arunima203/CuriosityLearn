import { useEffect, useState } from "react";
import { Geolocation } from "@capacitor/geolocation";

type WeatherData = {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    rain?: number;
    weather_code?: number;
    cloud_cover?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
  };
  hourly?: {
    time?: string[];
    precipitation?: number[];
    precipitation_probability?: number[];
    temperature_2m?: number[];
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
  };
};

type Observation = {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  cloud: number;
  windSpeed: number;
  windDirection: number;
};

const STORAGE_KEY = "curiositylearn_weather_observations";

function getWeatherText(code?: number) {
  if (code === undefined) return "Unknown";

  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([66, 67].includes(code)) return "Freezing rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";

  return "Cloudy";
}

function getWindDirection(degrees?: number) {
  if (degrees === undefined) return "-";

  const directions = [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW",
  ];

  return directions[Math.round(degrees / 45) % 8];
}

export default function WeatherStation({ onActivityLog }: { onActivityLog?: (title: string, score: number) => void }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string>("Getting location...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [observations, setObservations] = useState<Observation[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setObservations(JSON.parse(saved));
      } catch {
        setObservations([]);
      }
    }

    loadWeather();
  }, []);

  async function loadWeather() {
    setLoading(true);
    setError("");

    try {
      // Request permission first (needed on Android)
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== "granted") {
        setError("Location permission was denied. Please allow location access in Settings.");
        setLoading(false);
        return;
      }

      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      setLocation("Loading location name...");

      try {
        const locationResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        if (locationResponse.ok) {
          const locationData = await locationResponse.json();
          const address = locationData.address;
          const placeName = address.city || address.town || address.village || address.suburb || address.county;
          const stateName = address.state;
          const countryName = address.country;
          setLocation(
            [placeName, stateName, countryName].filter(Boolean)
              .filter((v, i, a) => a.indexOf(v) === i).join(", ") ||
            `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`
          );
        } else {
          setLocation(`${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);
        }
      } catch {
        setLocation(`${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`);
      }

      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${latitude}` +
          `&longitude=${longitude}` +
          `&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m` +
          `&hourly=precipitation,precipitation_probability,temperature_2m` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
          `&past_days=1` +
          `&forecast_days=7` +
          `&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather service failed");
        const data: WeatherData = await response.json();
        setWeather(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load weather data.");
      } finally {
        setLoading(false);
      }

    } catch (err) {
      console.error(err);
      setError("Could not get location. Please check location permissions.");
      setLoading(false);
    }
  }

  function saveObservation() {
    if (!weather?.current) return;

    const current = weather.current;

    const newObservation: Observation = {
      date: new Date().toLocaleString(),
      temperature: current.temperature_2m ?? 0,
      humidity: current.relative_humidity_2m ?? 0,
      rainfall: current.precipitation ?? 0,
      cloud: current.cloud_cover ?? 0,
      windSpeed: current.wind_speed_10m ?? 0,
      windDirection: current.wind_direction_10m ?? 0,
    };

    const updated = [newObservation, ...observations].slice(0, 7);

    setObservations(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
    onActivityLog?.("My Weather Station — observation saved", 100);
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>🌦️ My Weather Station</h2>
        <p>Getting your current weather...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2>🌦️ My Weather Station</h2>

        <div style={styles.error}>
          {error}
        </div>

        <button style={styles.button} onClick={loadWeather}>
          🔄 Try Again
        </button>
      </div>
    );
  }

  const current = weather?.current;

  const hourlyProbabilities =
    weather?.hourly?.precipitation_probability ?? [];

  const next12HoursRainChance = Math.max(
    ...hourlyProbabilities.slice(0, 12),
    0
  );

  const daily = weather?.daily;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2>🌦️ My Weather Station</h2>

          <p style={styles.location}>
            📍 Current location: {location}
          </p>
        </div>

        <button style={styles.refreshButton} onClick={loadWeather}>
          🔄 Refresh
        </button>
      </div>

      {/* Current Weather */}
      <div style={styles.mainCard}>
        <div style={styles.temperature}>
          {current?.temperature_2m ?? "--"}°C
        </div>

        <div>
          <h3>
            {getWeatherText(current?.weather_code)}
          </h3>

          <p>
            Cloud cover: {current?.cloud_cover ?? "--"}%
          </p>
        </div>
      </div>

      {/* Weather Information */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <span>💧</span>
          <strong>Humidity</strong>
          <p>{current?.relative_humidity_2m ?? "--"}%</p>
        </div>

        <div style={styles.card}>
          <span>🌧️</span>
          <strong>Rain Now</strong>
          <p>
            {(current?.rain ?? 0) > 0
              ? "Yes"
              : "No"}
          </p>
        </div>

        <div style={styles.card}>
          <span>☔</span>
          <strong>Rain Probability</strong>
          <p>{next12HoursRainChance}%</p>
        </div>

        <div style={styles.card}>
          <span>💨</span>
          <strong>Wind</strong>
          <p>
            {current?.wind_speed_10m ?? "--"} km/h
          </p>
        </div>

        <div style={styles.card}>
          <span>🧭</span>
          <strong>Wind Direction</strong>
          <p>
            {getWindDirection(
              current?.wind_direction_10m
            )}
          </p>
        </div>

        <div style={styles.card}>
          <span>🌧️</span>
          <strong>Rainfall Now</strong>
          <p>
            {current?.precipitation ?? 0} mm
          </p>
        </div>
      </div>

      {/* Daily Observation */}
      <div style={styles.section}>
        <h3>📝 Daily Observation</h3>

        <p>
          Record today's weather data for your
          Climate Change Lab.
        </p>

        <button
          style={styles.saveButton}
          onClick={saveObservation}
        >
          💾 Save Today's Observation
        </button>
      </div>

      {/* 7 Day Forecast */}
      <div style={styles.section}>
        <h3>📊 7-Day Weather Forecast</h3>

        <div style={styles.forecastGrid}>
          {daily?.time?.map((date, index) => (
            <div style={styles.forecastCard} key={date}>
              <strong>
                {new Date(date).toLocaleDateString(
                  undefined,
                  {
                    weekday: "short",
                  }
                )}
              </strong>

              <p>
                🌡️{" "}
                {daily.temperature_2m_min?.[index] ??
                  "--"}
                ° /{" "}
                {daily.temperature_2m_max?.[index] ??
                  "--"}
                °C
              </p>

              <p>
                🌧️{" "}
                {daily.precipitation_sum?.[index] ??
                  0}{" "}
                mm
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Observations */}
      <div style={styles.section}>
        <h3>📚 My Weather Observations</h3>

        {observations.length === 0 ? (
          <p>
            No observations saved yet.
          </p>
        ) : (
          <div>
            {observations.map((item, index) => (
              <div
                key={index}
                style={styles.observation}
              >
                <strong>{item.date}</strong>

                <span>
                  🌡️ {item.temperature}°C
                </span>

                <span>
                  💧 {item.humidity}%
                </span>

                <span>
                  🌧️ {item.rainfall} mm
                </span>

                <span>
                  💨 {item.windSpeed} km/h
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
 container: {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "24px",
  fontFamily: "Arial, sans-serif",
  color: "#1f2937",
},

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },

  location: {
    color: "#666",
    marginTop: "5px",
  },

  mainCard: {
    color: "#1f2937",
    background: "linear-gradient(135deg, #dff3ff, #eef9ff)",
    borderRadius: "18px",
    padding: "30px",
    display: "flex",
    alignItems: "center",
    gap: "30px",
    marginBottom: "20px",
  },

  temperature: {
    fontSize: "52px",
    fontWeight: "bold",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "15px",
  },

  card: {
    color: "#1f2937",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "18px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  section: {
    marginTop: "30px",
  },

  button: {
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    cursor: "pointer",
    background: "#2563eb",
    color: "#1f2937",
  },

  refreshButton: {
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    cursor: "pointer",
    background: "#2563eb",
    color: "#fff",
  },

  saveButton: {
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    background: "#16a34a",
    color: "#fff",
    fontWeight: "bold",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
  },

  forecastGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
  },

  forecastCard: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "15px",
    textAlign: "center",
  },

  observation: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    padding: "12px",
    marginBottom: "8px",
    background: "#f8fafc",
    borderRadius: "10px",
  },
};