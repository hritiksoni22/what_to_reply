import { useState } from "react";

const TONE_COLORS = {
  friendly: { bg: "#E8F5E9", text: "#2E7D32", dot: "#43A047" },
  angry: { bg: "#FFEBEE", text: "#C62828", dot: "#E53935" },
  passive_aggressive: { bg: "#FFF3E0", text: "#E65100", dot: "#FB8C00" },
  sad: { bg: "#E3F2FD", text: "#1565C0", dot: "#1E88E5" },
  formal: { bg: "#F3E5F5", text: "#6A1B9A", dot: "#8E24AA" },
  confused: { bg: "#F9FBE7", text: "#827717", dot: "#C0CA33" },
  neutral: { bg: "#F5F5F5", text: "#424242", dot: "#757575" },
};

const TONE_LABELS = {
  friendly: "Friendly 😊",
  angry: "Angry 😠",
  passive_aggressive: "Passive Aggressive 😒",
  sad: "Sad 😔",
  formal: "Formal 🤝",
  confused: "Confused 🤔",
  neutral: "Neutral 😐",
};

export default function WhatToReply() {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const analyze = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

const prompt = `You are a message analysis and reply assistant. Analyze the following text message and respond ONLY in valid JSON with no markdown, no explanation, no backticks.

IMPORTANT: Detect the language of the message and reply in the SAME language. If the message is in Hindi, reply in Hindi. If in English, reply in English. If mixed (Hinglish), reply in Hinglish.
Message: "${message}"
${context ? `Context: ${context}` : ""}

Respond with this exact JSON structure:
{
  "tone": "<one of: friendly, angry, passive_aggressive, sad, formal, confused, neutral>",
  "tone_explanation": "<1 sentence explaining the tone of the message>",
  "summary": "<1 sentence plain English summary of what the person is saying/feeling>",
  "replies": [
    { "label": "Friendly", "text": "<a warm, friendly reply>" },
    { "label": "Professional", "text": "<a calm, professional reply>" },
    { "label": "Firm", "text": "<a direct, firm but respectful reply>" }
  ]
}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const raw = data.content.map((i) => i.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const copyReply = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const reset = () => {
    setMessage("");
    setContext("");
    setResult(null);
    setError("");
  };

  const toneStyle = result ? TONE_COLORS[result.tone] || TONE_COLORS.neutral : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAFAF8",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 16px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px", maxWidth: "520px" }}>
        <div style={{
          fontSize: "11px",
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "#999",
          marginBottom: "16px",
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: 500,
        }}>
          Message Assistant
        </div>
        <h1 style={{
          fontSize: "clamp(32px, 6vw, 48px)",
          fontWeight: 400,
          color: "#1a1a1a",
          margin: "0 0 12px",
          lineHeight: 1.1,
          letterSpacing: "-1px",
        }}>
          What should I reply?
        </h1>
        <p style={{
          fontSize: "15px",
          color: "#888",
          margin: 0,
          lineHeight: 1.6,
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: 300,
        }}>
          Paste any message you received. We'll read the mood and write replies for you.
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: "560px",
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #EBEBEB",
        padding: "32px",
        boxShadow: "0 2px 24px rgba(0,0,0,0.04)",
      }}>
        {!result ? (
          <>
            {/* Message Input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "11px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#aaa",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 500,
                marginBottom: "10px",
              }}>
                The message you received
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste or type the message here..."
                rows={5}
                style={{
                  width: "100%",
                  border: "1px solid #E8E8E8",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  fontSize: "15px",
                  fontFamily: "'Georgia', serif",
                  color: "#1a1a1a",
                  background: "#FAFAF8",
                  resize: "vertical",
                  outline: "none",
                  lineHeight: 1.6,
                  boxSizing: "border-box",
                  transition: "border 0.2s",
                }}
                onFocus={(e) => e.target.style.border = "1px solid #bbb"}
                onBlur={(e) => e.target.style.border = "1px solid #E8E8E8"}
              />
            </div>

            {/* Context Input */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{
                display: "block",
                fontSize: "11px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#aaa",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 500,
                marginBottom: "10px",
              }}>
                Context <span style={{ letterSpacing: 0, textTransform: "none", color: "#ccc" }}>(optional)</span>
              </label>
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. this is from my boss, we had an argument yesterday..."
                style={{
                  width: "100%",
                  border: "1px solid #E8E8E8",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontFamily: "'Helvetica Neue', sans-serif",
                  color: "#1a1a1a",
                  background: "#FAFAF8",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border 0.2s",
                }}
                onFocus={(e) => e.target.style.border = "1px solid #bbb"}
                onBlur={(e) => e.target.style.border = "1px solid #E8E8E8"}
              />
            </div>

            {/* Button */}
            <button
              onClick={analyze}
              disabled={!message.trim() || loading}
              style={{
                width: "100%",
                padding: "14px",
                background: message.trim() && !loading ? "#1a1a1a" : "#e0e0e0",
                color: message.trim() && !loading ? "#fff" : "#aaa",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 500,
                letterSpacing: "1px",
                cursor: message.trim() && !loading ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Analyzing..." : "Analyze & Get Replies →"}
            </button>

            {error && (
              <p style={{ color: "#E53935", fontSize: "13px", marginTop: "12px", textAlign: "center", fontFamily: "sans-serif" }}>
                {error}
              </p>
            )}
          </>
        ) : (
          <>
            {/* Tone Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: toneStyle.bg,
              border: `1px solid ${toneStyle.dot}22`,
              borderRadius: "999px",
              padding: "6px 14px",
              marginBottom: "16px",
            }}>
              <div style={{
                width: "8px", height: "8px",
                borderRadius: "50%",
                background: toneStyle.dot,
              }} />
              <span style={{
                fontSize: "13px",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 500,
                color: toneStyle.text,
              }}>
                {TONE_LABELS[result.tone] || result.tone}
              </span>
            </div>

            {/* Tone explanation */}
            <p style={{
              fontSize: "14px",
              color: "#666",
              fontFamily: "'Helvetica Neue', sans-serif",
              lineHeight: 1.6,
              margin: "0 0 6px",
            }}>
              {result.tone_explanation}
            </p>

            {/* Summary */}
            <div style={{
              background: "#F5F5F3",
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "28px",
              borderLeft: "3px solid #1a1a1a",
            }}>
              <div style={{
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#aaa",
                fontFamily: "sans-serif",
                marginBottom: "6px",
              }}>What they mean</div>
              <p style={{
                margin: 0,
                fontSize: "14px",
                color: "#333",
                fontFamily: "'Georgia', serif",
                lineHeight: 1.6,
              }}>
                {result.summary}
              </p>
            </div>

            {/* Replies */}
            <div style={{
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#aaa",
              fontFamily: "sans-serif",
              marginBottom: "14px",
            }}>
              Choose a reply
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {result.replies.map((reply, i) => (
                <div key={i} style={{
                  border: "1px solid #EBEBEB",
                  borderRadius: "10px",
                  padding: "16px",
                  background: "#FAFAF8",
                  position: "relative",
                }}>
                  <div style={{
                    fontSize: "10px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#aaa",
                    fontFamily: "sans-serif",
                    marginBottom: "8px",
                  }}>
                    {reply.label}
                  </div>
                  <p style={{
                    margin: "0 0 12px",
                    fontSize: "14px",
                    color: "#1a1a1a",
                    fontFamily: "'Georgia', serif",
                    lineHeight: 1.6,
                  }}>
                    {reply.text}
                  </p>
                  <button
                    onClick={() => copyReply(reply.text, i)}
                    style={{
                      background: copiedIndex === i ? "#E8F5E9" : "#fff",
                      border: "1px solid #E0E0E0",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontFamily: "sans-serif",
                      color: copiedIndex === i ? "#2E7D32" : "#555",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {copiedIndex === i ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              ))}
            </div>

            {/* Try another */}
            <button
              onClick={reset}
              style={{
                width: "100%",
                padding: "12px",
                background: "transparent",
                color: "#888",
                border: "1px solid #E8E8E8",
                borderRadius: "10px",
                fontSize: "13px",
                fontFamily: "'Helvetica Neue', sans-serif",
                cursor: "pointer",
                letterSpacing: "0.5px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.target.style.background = "#F5F5F3"; e.target.style.color = "#333"; }}
              onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#888"; }}
            >
              ← Try another message
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <p style={{
        marginTop: "32px",
        fontSize: "12px",
        color: "#ccc",
        fontFamily: "sans-serif",
        letterSpacing: "0.5px",
      }}>
        Free to use · No sign up required
      </p>
    </div>
  );
}
