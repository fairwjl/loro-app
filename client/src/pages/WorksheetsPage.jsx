// client/src/pages/WorksheetsPage.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Worksheets – Thought Record (CBT/CPT-style)
 * Local-only storage. No PHI. Export via print.
 * Based on materials from the U.S. Department of Veterans Affairs (public domain).
 */

const STORAGE_KEY = "loro_thought_record_v1";

function useThoughtRecord() {
  const [rec, setRec] = useState({
    date: new Date().toISOString().slice(0, 10),
    situation: "",
    emotions: [{ name: "", intensity: 50 }],
    automaticThoughts: [""],
    evidenceFor: [""],
    evidenceAgainst: [""],
    alternativeThought: "",
    outcome: { notes: "", intensityAfter: 40 },
    lastSavedAt: null,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setRec((r) => ({ ...r, ...parsed }));
      }
    } catch {}
  }, []);

  const save = useMemo(
    () => (next) => {
      const data = typeof next === "function" ? next(rec) : next;
      const withStamp = { ...data, lastSavedAt: new Date().toISOString() };
      setRec(withStamp);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(withStamp));
      } catch {}
    },
    [rec]
  );

  return { rec, save };
}

function ListEditor({ label, items, onChange, idPrefix, placeholder }) {
  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <h3 className="card-title" style={{ marginBottom: 8 }}>{label}</h3>
      {items.map((val, idx) => (
        <div
          key={`${idPrefix}-${idx}`}
          className="form-row"
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            type="text"
            value={val}
            placeholder={placeholder}
            onChange={(e) => {
              const copy = [...items];
              copy[idx] = e.target.value;
              onChange(copy);
            }}
            style={{ flex: 1, borderRadius: 10 }}
          />
          <button
            type="button"
            className="btn"
            onClick={() => {
              const copy = items.filter((_, i) => i !== idx);
              onChange(copy.length ? copy : [""]);
            }}
            aria-label={`Remove item ${idx + 1} from ${label}`}
          >
            ✕
          </button>
        </div>
      ))}
      <div className="controls-row" style={{ marginTop: 8 }}>
        <button
          type="button"
          className="btn"
          onClick={() => onChange([...items, ""])}
        >
          + Add another
        </button>
      </div>
    </div>
  );
}

function EmotionsEditor({ emotions, onChange }) {
  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <h3 className="card-title" style={{ marginBottom: 8 }}>Emotions (before)</h3>
      {emotions.map((e, idx) => (
        <div
          key={`emo-${idx}`}
          className="form-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 160px auto",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={e.name}
            placeholder="Emotion (e.g., fear, shame, anger)"
            onChange={(ev) => {
              const copy = [...emotions];
              copy[idx] = { ...copy[idx], name: ev.target.value };
              onChange(copy);
            }}
            style={{ borderRadius: 10 }}
          />
          <label htmlFor={`emo-int-${idx}`} style={{ justifySelf: "end" }}>
            Intensity
          </label>
          <input
            id={`emo-int-${idx}`}
            type="range"
            min={0}
            max={100}
            value={e.intensity}
            onChange={(ev) => {
              const copy = [...emotions];
              copy[idx] = {
                ...copy[idx],
                intensity: parseInt(ev.target.value, 10),
              };
              onChange(copy);
            }}
          />
          <div style={{ width: 42, textAlign: "right" }}>{e.intensity}</div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                const copy = emotions.filter((_, i) => i !== idx);
                onChange(copy.length ? copy : [{ name: "", intensity: 50 }]);
              }}
              aria-label={`Remove emotion ${idx + 1}`}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="controls-row" style={{ marginTop: 8 }}>
        <button
          type="button"
          className="btn"
          onClick={() =>
            onChange([...emotions, { name: "", intensity: 50 }])
          }
        >
          + Add emotion
        </button>
      </div>
    </div>
  );
}

function SocraticChecklist({ open, setOpen, picked, onToggle }) {
  const questions = [
    "What is the evidence for and against this thought?",
    "Am I confusing a possibility with a certainty?",
    "Is there another way to look at this situation?",
    "What would I say to a friend who had this thought?",
    "Am I focusing on the worst-case scenario?",
    "What is the most likely outcome?",
    "Am I overlooking strengths or coping skills?",
  ];
  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <button
        type="button"
        className="btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open ? "true" : "false"}
        style={{ borderRadius: 10 }}
      >
        {open ? "Hide Challenging Questions" : "Show Challenging Questions"}
      </button>
      {open && (
        <ul style={{ marginTop: 10, paddingLeft: 18 }}>
          {questions.map((q, i) => (
            <li key={`sq-${i}`} style={{ marginBottom: 6 }}>
              <label
                style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
              >
                <input
                  type="checkbox"
                  checked={picked.includes(q)}
                  onChange={() => onToggle(q)}
                  aria-label={`Select question: ${q}`}
                />
                <span>{q}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function WorksheetsPage() {
  const { rec, save } = useThoughtRecord();
  const [showChecklist, setShowChecklist] = useState(false);
  const [pickedQs, setPickedQs] = useState([]);
  const [view, setView] = useState("menu"); // "menu" | "thoughtRecord"

  function handlePrint() {
    window.print();
  }

  function togglePicked(q) {
    setPickedQs((curr) =>
      curr.includes(q) ? curr.filter((x) => x !== q) : [...curr, q]
    );
  }

  // -------- MENU (landing) --------
  if (view === "menu") {
    return (
      <div>
        <h2 className="section-title">Worksheets</h2>
        <p className="card-text">
          A collection of evidence-informed self-guided worksheets to support reflection and skills
          practice. You can complete them privately in the app, <strong>save</strong> your work locally,
          or <strong>print</strong> a copy. Before launch, you’ll also be able to <strong>invite your therapist</strong> to view
          your saved worksheets (optional).
        </p>

        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 4 }}>What you’ll find here</h3>
          <ul className="card-text" style={{ paddingLeft: 18, lineHeight: 1.5, marginTop: 6 }}>
            <li>CBT/CPT-style <em>Thought Record</em> for examining difficult moments and rebalancing “stuck” thoughts.</li>
            <li>Skills-focused exercises (e.g., emotion awareness, coping plans) — more coming soon.</li>
            <li>Simple print/export with your entries stored on this device only.</li>
          </ul>
        </div>

        {/* Menu list */}
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Available worksheets</h3>

          <div
            role="button"
            onClick={() => setView("thoughtRecord")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setView("thoughtRecord")}
            tabIndex={0}
            className="panel"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
              gap: 8,
              padding: 12,
              borderRadius: 12,
              cursor: "pointer",
              marginTop: 8,
            }}
            aria-label="Open Thought Record worksheet"
          >
            <div>
              <div className="card-title" style={{ margin: 0 }}>Thought Record</div>
              <div className="card-text" style={{ marginTop: 4 }}>
                Examine a situation, list automatic thoughts, weigh evidence, and draft a balanced alternative.
              </div>
            </div>
            <div aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>›</div>
          </div>
        </div>

        {/* Safety note */}
        <div
          style={{
            backgroundColor: "#f7f7f7",
            border: "1px solid #e5e5e5",
            borderRadius: 8,
            padding: 12,
            marginTop: 20,
            fontSize: 12,
            lineHeight: 1.45,
            color: "#333",
          }}
        >
          <strong>Important:</strong> Worksheets are for self-reflection and education only and are{" "}
          <strong>not medical advice or psychotherapy</strong>. If you’re in crisis, call <strong>911</strong> (U.S.), dial or text{" "}
          <strong>988</strong>, or use your local emergency number. Avoid entering personal identifiers or PHI.
        </div>
      </div>
    );
  }

  // -------- THOUGHT RECORD (detail) --------
  return (
    <div>
      <h2 className="section-title">Worksheets</h2>
      <p className="card-text">
        Thought Record (CBT/CPT-style). Use this to examine a difficult moment,
        surface stuck thoughts, and develop a more balanced alternative. Stored
        on your device only.
      </p>

      {/* Back to menu */}
      <div className="controls-row" style={{ marginTop: 6 }}>
        <button type="button" className="btn" onClick={() => setView("menu")}>
          ← All worksheets
        </button>
      </div>

      {/* Scoped print styles (detail view only) */}
      <style>{`
        @media print {
          button, input[type=checkbox], input[type=range] {
            display: none !important;
          }
          .controls-row {
            display: none !important;
          }
          textarea, input[type=text], input[type=date] {
            border: none !important;
            resize: none !important;
          }
          .panel {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
          }
          .note {
            color: #000 !important;
          }
          body, html {
            background: #fff !important;
          }
        }
      `}</style>

      <form
        className="panel"
        onSubmit={(e) => e.preventDefault()}
        style={{ marginTop: 12 }}
      >
        <div
          className="form-row"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 160px",
            gap: 8,
            alignItems: "center",
          }}
        >
          <label htmlFor="tr-date">Date</label>
          <input
            id="tr-date"
            type="date"
            value={rec.date}
            onChange={(e) => save({ ...rec, date: e.target.value })}
            style={{ borderRadius: 10 }}
          />
        </div>

        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Situation</h3>
          <textarea
            rows={3}
            placeholder="Briefly describe what happened (when/where/who). Avoid personal identifiers."
            value={rec.situation}
            onChange={(e) => save({ ...rec, situation: e.target.value })}
            style={{ borderRadius: 12 }}
          />
        </div>

        <EmotionsEditor
          emotions={rec.emotions}
          onChange={(v) => save({ ...rec, emotions: v })}
        />

        <ListEditor
          label="Automatic thoughts"
          items={rec.automaticThoughts}
          onChange={(v) =>
            save({ ...rec, automaticThoughts: v })
          }
          idPrefix="at"
          placeholder="Write the thought as it came up (e.g., 'I'm in danger', 'I can't cope')"
        />

        <ListEditor
          label="Evidence for the thought"
          items={rec.evidenceFor}
          onChange={(v) => save({ ...rec, evidenceFor: v })}
          idPrefix="ef"
          placeholder="Facts supporting the thought"
        />

        <ListEditor
          label="Evidence against the thought"
          items={rec.evidenceAgainst}
          onChange={(v) => save({ ...rec, evidenceAgainst: v })}
          idPrefix="ea"
          placeholder="Facts that don’t fit / alternative explanations"
        />

        <SocraticChecklist
          open={showChecklist}
          setOpen={setShowChecklist}
          picked={pickedQs}
          onToggle={togglePicked}
        />

        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>
            Alternative / Balanced thought
          </h3>
          <textarea
            rows={3}
            placeholder="Craft a more balanced view that accounts for all of the evidence you listed."
            value={rec.alternativeThought}
            onChange={(e) =>
              save({ ...rec, alternativeThought: e.target.value })
            }
            style={{ borderRadius: 12 }}
          />
          {pickedQs.length > 0 && (
            <p className="note" style={{ marginTop: 8 }}>
              Guided by: {pickedQs.join(" • ")}
            </p>
          )}
        </div>

        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>
            Outcome / Re-rate emotions
          </h3>
          <div
            className="form-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 160px 42px",
              gap: 8,
              alignItems: "center",
            }}
          >
            <textarea
              rows={2}
              placeholder="After writing an alternative thought, what do you notice (feelings, urges, perspective)?"
              value={rec.outcome.notes}
              onChange={(e) =>
                save({
                  ...rec,
                  outcome: { ...rec.outcome, notes: e.target.value },
                })
              }
              style={{ borderRadius: 12 }}
            />
            <label htmlFor="int-after" style={{ justifySelf: "end" }}>
              Intensity after
            </label>
            <input
              id="int-after"
              type="range"
              min={0}
              max={100}
              value={rec.outcome.intensityAfter}
              onChange={(e) =>
                save({
                  ...rec,
                  outcome: {
                    ...rec.outcome,
                    intensityAfter: parseInt(e.target.value, 10),
                  },
                })
              }
            />
          </div>
        </div>

        <div
          className="controls-row"
          style={{ marginTop: 16, gap: 8, alignItems: "center" }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => save(rec)}
          >
            Save
          </button>
          <button type="button" className="btn" onClick={handlePrint}>
            Export / Print
          </button>
          <span className="note" style={{ marginLeft: 8 }}>
            {rec.lastSavedAt
              ? `Last saved: ${new Date(rec.lastSavedAt).toLocaleString()}`
              : "Not saved yet"}
          </span>
        </div>
      </form>

      {/* Compact safety + attribution (bottom) */}
      <div
        style={{
          backgroundColor: "#f7f7f7",
          border: "1px solid #e5e5e5",
          borderRadius: 8,
          padding: 12,
          marginTop: 20,
          fontSize: 12,
          lineHeight: 1.45,
          color: "#333",
        }}
      >
        <strong>Important:</strong> This worksheet is for self-reflection and
        education only. It is <strong>not medical advice or psychotherapy</strong>.
        If you’re in crisis or thinking about harming yourself or others, call{" "}
        <strong>911</strong> (U.S.), dial or text <strong>988</strong>, or use
        your local emergency number. Avoid entering personal identifiers or
        Protected Health Information (PHI).
        <br />
        <span style={{ color: "#666" }}>
          Based on materials from the U.S. Department of Veterans Affairs (public
          domain).
        </span>
      </div>
    </div>
  );
}