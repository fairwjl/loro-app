import { useState } from "react";

// Never put your OpenAI key in the client.
// Use the server endpoint and the dev env base URL.
const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:8787";

export default function Journal() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function reflect() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setReply("");

    try {
      const res = await fetch(`${API_BASE}/reflect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry: text.trim() }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setReply(data.reflection || "");
    } catch (e) {
      setError("Sorry, I couldn’t generate a reflection right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="section-title">Reflections</h2>
      <p className="card-text">
        A quiet space for reflections. Write freely, then receive gentle feedback
        grounded in supportive, evidence-informed guidance.
      </p>

      <div className="panel">
        <div className="form-row">
          <label htmlFor="reflection-input" className="sr-only">
            Your reflection
          </label>
          <textarea
            id="reflection-input"
            rows={8}
            placeholder="Write what's on your mind..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ borderRadius: 12 }}
          />
        </div>

        <div className="controls-row">
          <button
            className="btn btn-primary"
            onClick={reflect}
            disabled={!text.trim() || loading}
            aria-busy={loading ? "true" : "false"}
          >
            {loading ? "Reflecting…" : "Reflect"}
          </button>
        </div>

        {error && (
          <p className="note" role="alert" style={{ marginTop: 10 }}>
            {error}
          </p>
        )}

        {reply && (
          <div className="panel" style={{ marginTop: 16 }}>
            <h3 className="card-title">Your Reflection</h3>
            <p className="card-text">{reply}</p>
          </div>
        )}
      </div>
    </div>
  );
}