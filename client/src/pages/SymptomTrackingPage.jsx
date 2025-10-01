// client/src/pages/SymptomTrackingPage.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * SymptomTrackingPage — PCL-5 weekly/monthly + PMBS placeholder
 * - Local-only storage
 * - Neutral, non-diagnostic language
 */

const LS_PCL5_ENTRIES = "symptoms.pcl5.entries.v1";
const LS_PCL5_DRAFT   = "symptoms.pcl5.draft.v1";

const SCALE = [
  { v: 0, label: "Not at all" },
  { v: 1, label: "A little bit" },
  { v: 2, label: "Moderately" },
  { v: 3, label: "Quite a bit" },
  { v: 4, label: "Extremely" },
];

// PCL-5 items (public domain wording)
const ITEMS = [
  "Repeated, disturbing, and unwanted memories of the stressful experience?",
  "Repeated, disturbing dreams of the stressful experience?",
  "Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)?",
  "Feeling very upset when something reminded you of the stressful experience?",
  "Having strong physical reactions when something reminded you of the stressful experience (for example, heart pounding, trouble breathing, sweating)?",
  "Avoiding memories, thoughts, or feelings related to the stressful experience?",
  "Avoiding external reminders of the stressful experience (for example, people, places, conversations, activities, objects, or situations)?",
  "Trouble remembering important parts of the stressful experience?",
  "Having strong negative beliefs about yourself, other people, or the world (for example, having thoughts such as: I am bad, there is something seriously wrong with me, no one can be trusted, the world is completely dangerous)?",
  "Blaming yourself or someone else for the stressful experience or what happened after it?",
  "Having strong negative feelings such as fear, horror, anger, guilt, or shame?",
  "Loss of interest in activities that you used to enjoy?",
  "Feeling distant or cut off from other people?",
  "Trouble experiencing positive feelings (for example, being unable to feel happiness or have loving feelings for people close to you)?",
  "Irritable behavior, angry outbursts, or acting aggressively?",
  "Taking too many risks or doing things that could cause you harm?",
  "Being “superalert,” watchful, or on guard?",
  "Feeling jumpy or easily startled?",
  "Having difficulty concentrating?",
  "Trouble falling or staying asleep?"
];

export default function SymptomTrackingPage() {
  // timeframe: "month" (past month) or "week" (past week)
  const [timeframe, setTimeframe] = useState("month");

  // PCL-5 draft + saved entries
  const [responses, setResponses] = useState(() => Array(ITEMS.length).fill(null));
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState([]);

  // Load saved entries + draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_PCL5_ENTRIES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setEntries(parsed);
      }
    } catch {}
    try {
      const rawDraft = localStorage.getItem(LS_PCL5_DRAFT);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        if (parsed && Array.isArray(parsed.responses)) {
          setResponses(parsed.responses.slice(0, ITEMS.length));
        }
        if (typeof parsed?.notes === "string") setNotes(parsed.notes);
        if (parsed?.timeframe === "week" || parsed?.timeframe === "month") {
          setTimeframe(parsed.timeframe);
        }
      }
    } catch {}
  }, []);

  // Gentle autosave of draft
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          LS_PCL5_DRAFT,
          JSON.stringify({ responses, notes, timeframe })
        );
      } catch {}
    }, 350);
    return () => clearTimeout(id);
  }, [responses, notes, timeframe]);

  const total = useMemo(
    () => responses.reduce((sum, v) => sum + (typeof v === "number" ? v : 0), 0),
    [responses]
  );

  const allAnswered = responses.every((v) => typeof v === "number");

  function setAnswer(idx, value) {
    setResponses((prev) => {
      const next = prev.slice();
      next[idx] = value;
      return next;
    });
  }

  function clearDraft() {
    setResponses(Array(ITEMS.length).fill(null));
    setNotes("");
  }

  function saveAssessment() {
    if (!allAnswered) {
      alert("Please answer all items (0–4) before saving.");
      return;
    }
    const now = Date.now();
    const entry = {
      id: now,
      ts: now,
      timeframe,          // "month" or "week"
      total,              // 0–80
      responses: responses.slice(),
      notes: notes.trim() || "",
    };
    setEntries((list) => [entry, ...list]);
    try { localStorage.setItem(LS_PCL5_ENTRIES, JSON.stringify([entry, ...entries])); } catch {}
  }

  function deleteOne(id) {
    if (!confirm("Delete this saved assessment? This cannot be undone.")) return;
    setEntries((list) => {
      const next = list.filter((e) => e.id !== id);
      try { localStorage.setItem(LS_PCL5_ENTRIES, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function deleteAll() {
    if (!entries.length) return;
    if (!confirm("Delete ALL saved assessments? This cannot be undone.")) return;
    setEntries([]);
    try { localStorage.setItem(LS_PCL5_ENTRIES, JSON.stringify([])); } catch {}
  }

  function formatTs(ms) {
    const d = new Date(ms);
    return d.toLocaleString();
  }

  return (
    <div className="page-container">
      <h2 className="section-title">Symptom Tracking</h2>
      <p className="card-text" style={{ marginTop: -6 }}>
        Personal check-ins you control. Results are saved only on this device. You can delete them at any time.
      </p>

      {/* timeframe + total */}
      <div className="panel" style={{ padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <label htmlFor="tf" style={{ fontWeight: 600 }}>Timeframe</label>
        <select
          id="tf"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          style={{ minWidth: 220 }}
        >
          <option value="month">PCL-5 (past month)</option>
          <option value="week">PCL-5 (past week)</option>
        </select>
        <div style={{ marginLeft: "auto" }} className="note">
          Total: <strong>{total}</strong> (0–80)
        </div>
      </div>

      {/* PCL-5 panel */}
      <div className="panel" style={{ padding: 16, marginTop: 12 }}>
        <h3 className="card-title" style={{ margin: 0 }}>
          {timeframe === "month" ? "PCL-5 (past month)" : "PCL-5 (past week)"}
        </h3>
        <p className="card-text" style={{ marginTop: 0 }}>
          This self-report checklist helps you notice patterns over time. It isn’t a diagnosis or medical advice.
          If you’re in crisis, call <strong>911</strong> (U.S.) or dial/text <strong>988</strong>, or use your local emergency number.
        </p>

        <div style={{ display: "grid", gap: 14, marginTop: 10 }}>
          {ITEMS.map((text, idx) => (
            <div key={idx} className="panel" style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div style={{ marginBottom: 10, color: "var(--text)" }}>
                <span style={{ fontWeight: 600, marginRight: 8 }}>{idx + 1}.</span>{text}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SCALE.map((s) => (
                  <label key={s.v} className="btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={`pcl5-${idx}`}
                      value={s.v}
                      checked={responses[idx] === s.v}
                      onChange={() => setAnswer(idx, s.v)}
                    />
                    <span style={{ fontSize: 14 }}>{s.v} — {s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Optional personal notes */}
        <div className="form-row" style={{ marginTop: 14 }}>
          <label htmlFor="pcl5-notes">Notes (optional)</label>
          <textarea
            id="pcl5-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything you want to remember about today's check-in…"
          />
        </div>

        {/* Actions */}
        <div className="controls-row" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={saveAssessment} disabled={!allAnswered}>
            Save assessment
          </button>
          <button className="btn" onClick={clearDraft}>Clear current</button>
          {entries.length > 0 && (
            <button className="btn btn-ghost" onClick={deleteAll}>Delete all…</button>
          )}
        </div>
      </div>

      {/* Saved assessments */}
      <div className="panel" style={{ padding: 16, marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h3 style={{ margin: 0, color: "var(--text)", fontSize: 18 }}>Saved PCL-5 assessments</h3>
          <div className="note">Stored only on this device</div>
        </div>

        {entries.length === 0 ? (
          <p className="card-text" style={{ margin: 0 }}>
            No saved assessments yet. Complete all items and press <strong>Save assessment</strong>.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {entries.map((e) => (
              <li
                key={e.id}
                className="panel"
                style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <div style={{ fontWeight: 600, color: "var(--text)", flex: 1 }}>
                    {formatTs(e.ts)}
                  </div>
                  <div className="note">
                    {e.timeframe === "week" ? "Past week" : "Past month"} — Total: <strong>{e.total}</strong>
                  </div>
                </div>

                <details style={{ marginTop: 6 }}>
                  <summary className="btn" style={{ display: "inline-block", padding: "6px 10px" }}>
                    View item responses
                  </summary>
                  <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                    {e.responses.map((v, i) => (
                      <div key={i} className="panel" style={{ padding: 8, borderRadius: 8 }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Item {i + 1}</div>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {e.notes && (
                    <div className="panel" style={{ marginTop: 10, padding: 10 }}>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Notes</div>
                      <div style={{ whiteSpace: "pre-wrap", color: "var(--text)" }}>{e.notes}</div>
                    </div>
                  )}
                </details>

                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => deleteOne(e.id)}>Delete…</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PMBS placeholder (not wired in) */}
      <div className="panel" style={{ padding: 16, marginTop: 16 }}>
        <h3 className="card-title" style={{ marginTop: 0 }}>Trauma-Related Beliefs (PMBS)</h3>
        <p className="card-text" style={{ marginTop: 0 }}>
          Placeholder — a public-domain beliefs measure will be available here soon. Your responses will be saved only on this device.
        </p>
      </div>

      {/* Footer microcopy */}
      <div
        className="panel"
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "var(--text-muted)",
          background: "var(--surface-muted)",
        }}
      >
        <p style={{ margin: "4px 0" }}>
          These tools support self-reflection and education. They are not a diagnosis or medical advice.
          If you’re in crisis, call <strong>911</strong> (U.S.), dial or text <strong>988</strong>, or use your local emergency number.
        </p>
      </div>
    </div>
  );
}