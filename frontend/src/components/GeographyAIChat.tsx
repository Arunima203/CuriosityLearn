import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GeographyAIChatProps {
  /** JWT token from localStorage – passed in so the component stays stateless
   *  about authentication. */
  token: string;
  /** "en" | "bn" – for bilingual UI labels. */
  language?: string;
}

// ─── i18n strings ─────────────────────────────────────────────────────────────

const i18n = {
  en: {
    title: "Geography AI Tutor",
    subtitle: "Ask me anything about Geography!",
    inputPlaceholder: "Ask a question about Geography…",
    send: "Send",
    sending: "…",
    errorNetwork: "Could not connect to the AI service. Please try again.",
    errorAuth: "Session expired. Please log in again.",
    disclaimer:
      "AI can make mistakes. Always verify important facts with your textbook.",
    thinking: "Thinking…",
    clearChat: "Clear chat",
    quickPrompts: [
      "What causes the Indian monsoon?",
      "Explain the water cycle.",
      "What is erosion?",
      "Name the major rivers of India.",
    ],
  },
  bn: {
    title: "Geography AI টিউটর",
    subtitle: "Geography সম্পর্কে যেকোনো প্রশ্ন করুন!",
    inputPlaceholder: "Geography বিষয়ে প্রশ্ন লিখুন…",
    send: "পাঠাও",
    sending: "…",
    errorNetwork: "AI service-এ connect করা যাচ্ছে না। আবার চেষ্টা করুন।",
    errorAuth: "Session শেষ হয়ে গেছে। আবার login করুন।",
    disclaimer:
      "AI ভুল করতে পারে। গুরুত্বপূর্ণ তথ্য পাঠ্যবই দিয়ে যাচাই করুন।",
    thinking: "ভাবছে…",
    clearChat: "Chat মুছুন",
    quickPrompts: [
      "ভারতের মৌসুমী বায়ু কেন হয়?",
      "জলচক্র কী?",
      "ক্ষয়ীভবন কাকে বলে?",
      "ভারতের প্রধান নদীগুলোর নাম বলো।",
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Very light markdown → HTML converter (bold, italic, inline code, bullets). */
function renderMarkdown(text: string): string {
  return (
    text
      // Bold: **text**
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic: *text*
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Inline code: `code`
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Bullet lines: "- item" or "• item"
      .replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>")
      // Wrap consecutive <li> in <ul>
      .replace(/(<li>.*<\/li>(\n|$))+/gs, (match) => `<ul>${match}</ul>`)
      // Line breaks
      .replace(/\n/g, "<br />")
  );
}

const API_URL = (() => {
  // In Capacitor native app, always use production
  if (typeof window !== "undefined" && (window as any).Capacitor?.isNativePlatform?.()) {
    return "https://curiositylearn.onrender.com";
  }
  // In web dev, use localhost
  if (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://127.0.0.1:8000";
  }
  return "https://curiositylearn.onrender.com";
})();

// ─── Component ────────────────────────────────────────────────────────────────

export default function GeographyAIChat({
  token,
  language = "en",
}: GeographyAIChatProps) {
  const t = i18n[language === "bn" ? "bn" : "en"];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-grow textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  }

  function clearChat() {
    setMessages([]);
    setError(null);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmed,
          // Send the last 12 turns as history (same cap the backend already
          // enforces, but trimming here avoids large payloads)
          history: nextMessages.slice(-12).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.status === 401) {
        setError(t.errorAuth);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail ?? t.errorNetwork);
        setLoading(false);
        return;
      }

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply ?? "",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setError(t.errorNetwork);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // ─── Styles (inline, matching the app's dark-space theme) ─────────────────

  const wrap: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: "500px",
    maxHeight: "78vh",
    background: "rgba(7,17,38,0.92)",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.50)",
    overflow: "hidden",
    fontFamily: "inherit",
  };

  const header: React.CSSProperties = {
    padding: "18px 22px 14px",
    background:
      "linear-gradient(135deg, rgba(99,102,241,0.30), rgba(14,116,144,0.28))",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexShrink: 0,
  };

  const headerLeft: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const avatarStyle: React.CSSProperties = {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #0e7490)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  };

  const headerTitle: React.CSSProperties = {
    margin: 0,
    fontSize: "17px",
    fontWeight: 700,
    color: "#fff",
  };

  const headerSub: React.CSSProperties = {
    margin: "2px 0 0",
    fontSize: "12px",
    color: "rgba(255,255,255,0.60)",
  };

  const clearBtn: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.60)",
    fontSize: "12px",
    padding: "5px 10px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  const messagesArea: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "18px 18px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255,255,255,0.15) transparent",
  };

  const emptyState: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
    padding: "30px 10px",
  };

  const emptyOrb: React.CSSProperties = {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(14,116,144,0.25))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
  };

  const quickPromptGrid: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "center",
    maxWidth: "520px",
  };

  const quickPromptBtn: React.CSSProperties = {
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.30)",
    borderRadius: "20px",
    color: "rgba(255,255,255,0.80)",
    fontSize: "12px",
    padding: "7px 14px",
    cursor: "pointer",
    transition: "background 0.15s",
  };

  function bubbleStyle(role: "user" | "assistant"): React.CSSProperties {
    return {
      maxWidth: "82%",
      alignSelf: role === "user" ? "flex-end" : "flex-start",
      background:
        role === "user"
          ? "linear-gradient(135deg, #6366f1, #4f46e5)"
          : "rgba(255,255,255,0.07)",
      color: "#fff",
      borderRadius:
        role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
      padding: "12px 16px",
      fontSize: "14px",
      lineHeight: "1.65",
      border: role === "assistant" ? "1px solid rgba(255,255,255,0.10)" : "none",
      wordBreak: "break-word" as const,
    };
  }

  const roleLabel: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.40)",
    marginBottom: "4px",
    textTransform: "uppercase",
  };

  const thinkingBubble: React.CSSProperties = {
    ...bubbleStyle("assistant"),
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "rgba(255,255,255,0.55)",
    fontStyle: "italic",
  };

  const dotsStyle: React.CSSProperties = {
    display: "inline-flex",
    gap: "4px",
  };

  const errorBox: React.CSSProperties = {
    background: "rgba(239,68,68,0.14)",
    border: "1px solid rgba(239,68,68,0.30)",
    borderRadius: "12px",
    color: "#fca5a5",
    fontSize: "13px",
    padding: "10px 14px",
    margin: "4px 0",
  };

  const footerArea: React.CSSProperties = {
    padding: "14px 18px 16px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
    flexShrink: 0,
  };

  const inputRow: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  };

  const textareaStyle: React.CSSProperties = {
    flex: 1,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "14px",
    color: "#fff",
    fontSize: "14px",
    padding: "10px 14px",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    lineHeight: "1.55",
    minHeight: "42px",
    maxHeight: "160px",
    overflowY: "auto",
    transition: "border-color 0.2s",
  };

  const sendBtn: React.CSSProperties = {
    background:
      loading || !input.trim()
        ? "rgba(99,102,241,0.30)"
        : "linear-gradient(135deg, #6366f1, #4f46e5)",
    border: "none",
    borderRadius: "14px",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    padding: "0 20px",
    height: "42px",
    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
    flexShrink: 0,
    transition: "background 0.2s",
    whiteSpace: "nowrap",
  };

  const disclaimerStyle: React.CSSProperties = {
    marginTop: "8px",
    fontSize: "10px",
    color: "rgba(255,255,255,0.30)",
    textAlign: "center",
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={wrap}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={header}>
        <div style={headerLeft}>
          <div style={avatarStyle}>🌍</div>
          <div>
            <p style={headerTitle}>{t.title}</p>
            <p style={headerSub}>{t.subtitle}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            style={clearBtn}
            onClick={clearChat}
            aria-label="Clear chat"
          >
            {t.clearChat}
          </button>
        )}
      </div>

      {/* ── Messages ───────────────────────────────────────────────────────── */}
      <div style={messagesArea} role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 ? (
          <div style={emptyState}>
            <div style={emptyOrb}>🌐</div>
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                color: "rgba(255,255,255,0.55)",
                textAlign: "center",
              }}
            >
              {t.subtitle}
            </p>
            {/* Quick-prompt chips */}
            <div style={quickPromptGrid}>
              {t.quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  style={quickPromptBtn}
                  onClick={() => sendMessage(prompt)}
                  aria-label={`Ask: ${prompt}`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <p style={roleLabel}>
                {msg.role === "user" ? "You" : "AI Tutor"}
              </p>
              <div
                style={bubbleStyle(msg.role)}
                // Only assistant messages may contain our own rendered HTML
                // (markdown). User input is always text-only.
                {...(msg.role === "assistant"
                  ? {
                      dangerouslySetInnerHTML: {
                        __html: renderMarkdown(msg.content),
                      },
                    }
                  : { children: msg.content })}
              />
            </div>
          ))
        )}

        {/* Thinking indicator */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <p style={roleLabel}>AI Tutor</p>
            <div style={thinkingBubble}>
              <span style={dotsStyle}>
                <DotPulse />
              </span>
              {t.thinking}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div style={errorBox}>⚠️ {error}</div>}

        <div ref={bottomRef} />
      </div>

      {/* ── Footer / Input ─────────────────────────────────────────────────── */}
      <div style={footerArea}>
        <form onSubmit={handleSubmit} style={inputRow}>
          <textarea
            ref={inputRef}
            style={textareaStyle}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={t.inputPlaceholder}
            rows={1}
            aria-label={t.inputPlaceholder}
            disabled={loading}
          />
          <button
            type="submit"
            style={sendBtn}
            disabled={loading || !input.trim()}
            aria-label={loading ? t.sending : t.send}
          >
            {loading ? "⏳" : "↑ " + t.send}
          </button>
        </form>
        <p style={disclaimerStyle}>{t.disclaimer}</p>
      </div>
    </div>
  );
}

// ─── Dot Pulse animation (pure CSS, no extra dep) ─────────────────────────────

function DotPulse() {
  const dot: React.CSSProperties = {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.55)",
    display: "inline-block",
    animation: "dotPulse 1.2s infinite ease-in-out",
  };

  return (
    <>
      {/* keyframes injected once via a <style> tag */}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.1); }
        }
      `}</style>
      <span style={{ ...dot, animationDelay: "0s" }} />
      <span style={{ ...dot, animationDelay: "0.2s" }} />
      <span style={{ ...dot, animationDelay: "0.4s" }} />
    </>
  );
}
