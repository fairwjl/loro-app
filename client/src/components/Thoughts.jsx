// client/src/components/Thoughts.jsx
import { useEffect, useMemo, useState } from "react";
import { loadJSON, saveJSON } from "../lib/storage.js";

/**
 * Thought Challenger (CBT-style)
 * - Situation, automatic thought, emotion(s), intensity (0–100)
 * - Distortions checklist
 * - Evidence for / against
 * - Balanced reframe, action step
 * - SUDS before/after; effectiveness rating
 * - Save locally + CSV export
 */

const KEY = "cog:entries";

const DISTORTIONS = [
  "All-or-nothing thinking",
  "Overgeneralization",
  "Mental filter",
  "Disqualifying the positive",
  "Jumping to conclusions",
  "Catastrophizing",
  "Emotional reasoning",
  "Should/must statements",
  "Labeling",
  "Personalization/blame",
];

export default function Thoughts() {
  const [entries, setEntries] = useState(() => loadJSON(KEY, []));
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [situation, setSituation] = useState("");
  const [thought, setThought] = useState("");
  const [emotions, setEmotions] = useState("");
  const [intensity, setIntensity] = useState(60);
  const [distortions, setDistortions] = useState([]);
  const [evidenceFor, setEvidenceFor] = useState("");
  const [evidenceAgainst, setEvidenceAgainst] = useState("");
  const [reframe, setReframe] = useState("");
  const [action, setAction] = useState("");
  const [sudsBefore, setSudsBefore] = useState(6);
  const [sudsAfter, setSudsAfter] = useState(3);
  const [msg, setMsg] = useState("");

  const toggleDistortion = (name) => {
    setDistortions(d =>
      d.includes(name) ? d.filter(x => x !== name) : [...d, name]
    );
  };

  const save = () => {
    const row = {
      date,
      situation: situation.trim(),
      thought: thought.trim(),
      emotions: emotions.trim(),
      intensity: Number(intensity),
      distortions: [...distortions],
      evidenceFor: evidenceFor.trim(),
      evidenceAgainst: evidenceAgainst.trim(),
      reframe: reframe.trim(),
      action: action.trim(),
      sudsBefore: Number(sudsBefore),
      sudsAfter: Number(sudsAfter),
      effectiveness: Number(sudsBefore) - Number(sudsAfter),
      ts: Date.now(),
    };
    const next = [row, ...entries].slice(0, 500);
    setEntries(next);
    saveJSON(KEY, next);
    setMsg("Saved ✓");
    setTimeout(()=>setMsg(""), 1000);
  };

  const recent = useMemo(() => entries.slice(0, 8), [entries]);

  const exportCSV = () => {
    const header = [
      "date","situation","thought","emotions","intensity",
      "distortions","evidenceFor","evidenceAgainst","reframe","action",
      "sudsBefore","sudsAfter","effectiveness"
    ].join(",");
    const lines = entries.map(e => ([
      e.date,
      JSON.stringify(e.situation || ""),
      JSON.stringify(e.thought || ""),
      JSON.stringify(e.emotions || ""),
      e.intensity ?? "",
      JSON.stringify((e.distortions || []).join("; ")),
      JSON.stringify(e.evidenceFor || ""),
      JSON.stringify(e.evidenceAgainst || ""),
      JSON.stringify(e.reframe || ""),
      JSON.stringify(e.action || ""),
      e.sudsBefore ?? "",
      e.sudsAfter ?? "",
      e.effectiveness ?? ""
    ].join(",")));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "loro_thoughts.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card">
      <h2>Thought Challenger (CBT)</h2>
      <div className="muted" style={{marginBottom:8}}>
        Identify the thought, check distortions, gather evidence, and write a balanced reframe.
      </div>

      <div className="form-grid">
        <label>
          Date
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </label>

        <label>
          Situation (facts)
          <textarea rows={2} value={situation} onChange={e=>setSituation(e.target.value)} placeholder="Where were you? What happened?" />
        </label>

        <label>
          Automatic thought
          <textarea rows={2} value={thought} onChange={e=>setThought(e.target.value)} placeholder="What went through your mind?" />
        </label>

        <label>
          Emotion(s)
          <input value={emotions} onChange={e=>setEmotions(e.target.value)} placeholder="e.g., fear, shame, sadness" />
        </label>

        <label>
          Intensity (0–100)
          <input type="range" min="0" max="100" value={intensity} onChange={e=>setIntensity(e.target.value)} />
          <div className="muted">Current: {intensity}</div>
        </label>

        <div style={{gridColumn:'1 / -1'}}>
          <div className="muted" style={{marginBottom:6}}>Cognitive distortions (check any that apply):</div>
          <div className="list" style={{gap:6}}>
            {DISTORTIONS.map(d => (
              <label key={d} className="list-row" style={{alignItems:'center', gap:10}}>
                <input
                  type="checkbox"
                  checked={distortions.includes(d)}
                  onChange={()=>toggleDistortion(d)}
                  style={{width:18, height:18}}
                />
                <span>{d}</span>
              </label>
            ))}
          </div>
        </div>

        <label style={{gridColumn:'1 / -1'}}>
          Evidence for the thought
          <textarea rows={3} value={evidenceFor} onChange={e=>setEvidenceFor(e.target.value)} />
        </label>

        <label style={{gridColumn:'1 / -1'}}>
          Evidence against the thought
          <textarea rows={3} value={evidenceAgainst} onChange={e=>setEvidenceAgainst(e.target.value)} />
        </label>

        <label style={{gridColumn:'1 / -1'}}>
          Balanced reframe (more accurate thought)
          <textarea rows={3} value={reframe} onChange={e=>setReframe(e.target.value)} />
        </label>

        <label style={{gridColumn:'1 / -1'}}>
          Action plan (small next step)
          <textarea rows={2} value={action} onChange={e=>setAction(e.target.value)} />
        </label>

        <label>
          SUDS before (0–10)
          <input type="range" min="0" max="10" value={sudsBefore} onChange={e=>setSudsBefore(e.target.value)} />
          <div className="muted">Current: {sudsBefore}</div>
        </label>

        <label>
          SUDS after (0–10)
          <input type="range" min="0" max="10" value={sudsAfter} onChange={e=>setSudsAfter(e.target.value)} />
          <div className="muted">Current: {sudsAfter}</div>
        </label>
      </div>

      <div className="actions" style={{gap:'8px', marginTop:10}}>
        <button onClick={save}>Save</button>
        <button className="secondary" onClick={exportCSV}>Export CSV</button>
      </div>
      {msg && <div className="muted" style={{marginTop:6}}>{msg}</div>}

      {!!recent.length && (
        <>
          <h3 style={{marginTop:16}}>Recent (latest 8)</h3>
          <div className="list">
            {recent.map((r, i) => (
              <div key={i} className="list-row" style={{flexDirection:'column', alignItems:'flex-start'}}>
                <div className="muted">{r.date}</div>
                <div><strong>Thought:</strong> {r.thought || "—"}</div>
                <div><strong>Reframe:</strong> {r.reframe || "—"}</div>
                <div className="muted">
                  Distortions: {(r.distortions || []).join(", ") || "—"} •
                  SUDS: {r.sudsBefore ?? "—"} → {r.sudsAfter ?? "—"} (Δ { (r.effectiveness ?? 0) })
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}