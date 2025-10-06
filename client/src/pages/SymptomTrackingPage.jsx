// client/src/pages/SymptomTrackingPage.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * SymptomTrackingPage — Phase 1 (local-only)
 * Tools:
 * - PCL-5 (past month)
 * - PCL-5 (past week)
 * - PMBS (Posttraumatic Maladaptive Beliefs Scale)
 *
 * Notes:
 * - Local storage only (no network).
 * - Trauma-informed, neutral, non-diagnostic language.
 * - Users can delete single entries or all entries.
 */

/* ---------------------------- PCL-5 (shared) ---------------------------- */

const PCL5_SCALE = [
  { v: 0, label: "Not at all" },
  { v: 1, label: "A little bit" },
  { v: 2, label: "Moderately" },
  { v: 3, label: "Quite a bit" },
  { v: 4, label: "Extremely" },
];

// Items are the same; timeframe shown in title/intro
const PCL5_ITEMS = [
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
  "Being \"superalert,\" watchful, or on guard?",
  "Feeling jumpy or easily startled?",
  "Having difficulty concentrating?",
  "Trouble falling or staying asleep?",
];

/* ------------------------------ PMBS block ------------------------------ */

// Public-domain wording available via VA materials.
// 15 statements, 1–7 Likert; some are reverse-coded.
const PMBS_ITEMS = [
  "I don't feel safe anywhere anymore",
  "Other people can be genuinely loving toward me",
  "I am a good person",
  "The world is very dangerous",
  "I don't trust anyone anymore",
  "It is possible for me to have close and loving feelings with other people",
  "I trust my own judgment",
  "I avoid other people because they might hurt me",
  "I have lost respect for myself",
  "I don't feel confident that I can make good decisions for myself",
  "Some people can be trusted",
  "Because I don't feel able to protect myself, I have lost my sense of freedom",
  "I feel as though I can depend on other people",
  "Most people are basically caring",
  "I comfort myself very well when I'm upset",
];

// Reverse-coded indices for PMBS (0-based): items 2,3,6,7,11,13,14,15
const PMBS_REVERSE = new Set([1, 2, 5, 6, 10, 12, 13, 14]);

/* --------------------------- Local storage keys ------------------------- */

const LS_SCOPE = {
  // drafts
  pcl5MonthDraft: "symptoms.pcl5.month.draft.v1",
  pcl5WeekDraft: "symptoms.pcl5.week.draft.v1",
  pmbsDraft: "symptoms.pmbs.draft.v1",
  // saved entries
  pcl5MonthEntries: "symptoms.pcl5.month.entries.v1",
  pcl5WeekEntries: "symptoms.pcl5.week.entries.v1",
  pmbsEntries: "symptoms.pmbs.entries.v1",
};

/* --------------------------------- Page -------------------------------- */

export default function SymptomTrackingPage() {
  // Which tool is active
  const [tool, setTool] = useState("pcl5-month"); // "pcl5-month" | "pcl5-week" | "pmbs"

  // PCL-5 (month)
  const [pclMonthResponses, setPclMonthResponses] = useState(() =>
    Array(PCL5_ITEMS.length).fill(null)
  );
  const [pclMonthNotes, setPclMonthNotes] = useState("");
  const [pclMonthEntries, setPclMonthEntries] = useState([]);

  // PCL-5 (week)
  const [pclWeekResponses, setPclWeekResponses] = useState(() =>
    Array(PCL5_ITEMS.length).fill(null)
  );
  const [pclWeekNotes, setPclWeekNotes] = useState("");
  const [pclWeekEntries, setPclWeekEntries] = useState([]);

  // PMBS
  const [pmbsResponses, setPmbsResponses] = useState(() =>
    Array(PMBS_ITEMS.length).fill(null)
  );
  const [pmbsEntries, setPmbsEntries] = useState([]);

  // Load saved entries + drafts (once)
  useEffect(() => {
    try {
      const m = localStorage.getItem(LS_SCOPE.pcl5MonthEntries);
      if (m) {
        const parsed = JSON.parse(m);
        if (Array.isArray(parsed)) setPclMonthEntries(parsed);
      }
    } catch {}
    try {
      const w = localStorage.getItem(LS_SCOPE.pcl5WeekEntries);
      if (w) {
        const parsed = JSON.parse(w);
        if (Array.isArray(parsed)) setPclWeekEntries(parsed);
      }
    } catch {}
    try {
      const b = localStorage.getItem(LS_SCOPE.pmbsEntries);
      if (b) {
        const parsed = JSON.parse(b);
        if (Array.isArray(parsed)) setPmbsEntries(parsed);
      }
    } catch {}

    try {
      const mdraft = localStorage.getItem(LS_SCOPE.pcl5MonthDraft);
      if (mdraft) {
        const parsed = JSON.parse(mdraft);
        if (Array.isArray(parsed?.responses)) {
          setPclMonthResponses(parsed.responses.slice(0, PCL5_ITEMS.length));
        }
        if (typeof parsed?.notes === "string") setPclMonthNotes(parsed.notes);
      }
    } catch {}
    try {
      const wdraft = localStorage.getItem(LS_SCOPE.pcl5WeekDraft);
      if (wdraft) {
        const parsed = JSON.parse(wdraft);
        if (Array.isArray(parsed?.responses)) {
          setPclWeekResponses(parsed.responses.slice(0, PCL5_ITEMS.length));
        }
        if (typeof parsed?.notes === "string") setPclWeekNotes(parsed.notes);
      }
    } catch {}
    try {
      const bdraft = localStorage.getItem(LS_SCOPE.pmbsDraft);
      if (bdraft) {
        const parsed = JSON.parse(bdraft);
        if (Array.isArray(parsed?.responses)) {
          setPmbsResponses(parsed.responses.slice(0, PMBS_ITEMS.length));
        }
      }
    } catch {}
  }, []);

  // Gentle autosave of drafts
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          LS_SCOPE.pcl5MonthDraft,
          JSON.stringify({ responses: pclMonthResponses, notes: pclMonthNotes })
        );
      } catch {}
    }, 400);
    return () => clearTimeout(id);
  }, [pclMonthResponses, pclMonthNotes]);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          LS_SCOPE.pcl5WeekDraft,
          JSON.stringify({ responses: pclWeekResponses, notes: pclWeekNotes })
        );
      } catch {}
    }, 400);
    return () => clearTimeout(id);
  }, [pclWeekResponses, pclWeekNotes]);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          LS_SCOPE.pmbsDraft,
          JSON.stringify({ responses: pmbsResponses })
        );
      } catch {}
    }, 400);
    return () => clearTimeout(id);
  }, [pmbsResponses]);

  // Helpers
  function formatTs(ms) {
    const d = new Date(ms);
    return d.toLocaleString();
  }

  /* ------------------------- PCL-5 (shared UI/logic) ------------------------- */

  function pclTotal(responses) {
    return responses.reduce((sum, v) => sum + (typeof v === "number" ? v : 0), 0);
  }
  const pclMonthTotal = useMemo(() => pclTotal(pclMonthResponses), [pclMonthResponses]);
  const pclWeekTotal = useMemo(() => pclTotal(pclWeekResponses), [pclWeekResponses]);

  const pclMonthAllAnswered = pclMonthResponses.every((v) => typeof v === "number");
  const pclWeekAllAnswered = pclWeekResponses.every((v) => typeof v === "number");

  function setPclMonthAnswer(idx, value) {
    setPclMonthResponses((prev) => {
      const next = prev.slice();
      next[idx] = value;
      return next;
    });
  }
  function setPclWeekAnswer(idx, value) {
    setPclWeekResponses((prev) => {
      const next = prev.slice();
      next[idx] = value;
      return next;
    });
  }

  function savePcl(kind) {
    const isMonth = kind === "month";
    const all = isMonth ? pclMonthAllAnswered : pclWeekAllAnswered;
    if (!all) {
      alert("Please answer all items before saving.");
      return;
    }
    const now = Date.now();
    const entry = {
      id: now,
      ts: now,
      total: isMonth ? pclMonthTotal : pclWeekTotal,
      responses: (isMonth ? pclMonthResponses : pclWeekResponses).slice(),
      notes: (isMonth ? pclMonthNotes : pclWeekNotes).trim() || "",
    };
    if (isMonth) {
      const next = [entry, ...pclMonthEntries];
      setPclMonthEntries(next);
      try { localStorage.setItem(LS_SCOPE.pcl5MonthEntries, JSON.stringify(next)); } catch {}
    } else {
      const next = [entry, ...pclWeekEntries];
      setPclWeekEntries(next);
      try { localStorage.setItem(LS_SCOPE.pcl5WeekEntries, JSON.stringify(next)); } catch {}
    }
  }

  function deletePclOne(kind, id) {
    const isMonth = kind === "month";
    if (!confirm("Delete this saved assessment? This cannot be undone.")) return;
    if (isMonth) {
      setPclMonthEntries((list) => {
        const next = list.filter((e) => e.id !== id);
        try { localStorage.setItem(LS_SCOPE.pcl5MonthEntries, JSON.stringify(next)); } catch {}
        return next;
      });
    } else {
      setPclWeekEntries((list) => {
        const next = list.filter((e) => e.id !== id);
        try { localStorage.setItem(LS_SCOPE.pcl5WeekEntries, JSON.stringify(next)); } catch {}
        return next;
      });
    }
  }

  function deletePclAll(kind) {
    const isMonth = kind === "month";
    if (isMonth && !pclMonthEntries.length) return;
    if (!isMonth && !pclWeekEntries.length) return;
    if (!confirm("Delete ALL saved assessments? This cannot be undone.")) return;
    if (isMonth) {
      setPclMonthEntries([]);
      try { localStorage.setItem(LS_SCOPE.pcl5MonthEntries, JSON.stringify([])); } catch {}
    } else {
      setPclWeekEntries([]);
      try { localStorage.setItem(LS_SCOPE.pcl5WeekEntries, JSON.stringify([])); } catch {}
    }
  }

  /* ------------------------------ PMBS logic ------------------------------ */

  const pmbsAllAnswered = pmbsResponses.every((v) => typeof v === "number");
  function setPmbsAnswer(idx, value) {
    setPmbsResponses((prev) => {
      const next = prev.slice();
      next[idx] = value;
      return next;
    });
  }
  function pmbsTotal(responses) {
    // 1–7 scale; reverse-code select items: reversed = 8 - v
    return responses.reduce((sum, v, idx) => {
      if (typeof v !== "number") return sum;
      const score = PMBS_REVERSE.has(idx) ? (8 - v) : v;
      return sum + score;
    }, 0);
  }
  const pmbsSum = useMemo(() => pmbsTotal(pmbsResponses), [pmbsResponses]);

  function savePmbs() {
    if (!pmbsAllAnswered) {
      alert("Please respond to all belief statements before saving.");
      return;
    }
    const now = Date.now();
    const entry = { id: now, ts: now, total: pmbsSum, responses: pmbsResponses.slice() };
    const next = [entry, ...pmbsEntries];
    setPmbsEntries(next);
    try { localStorage.setItem(LS_SCOPE.pmbsEntries, JSON.stringify(next)); } catch {}
  }

  function deletePmbsOne(id) {
    if (!confirm("Delete this saved belief assessment? This cannot be undone.")) return;
    setPmbsEntries((list) => {
      const next = list.filter((e) => e.id !== id);
      try { localStorage.setItem(LS_SCOPE.pmbsEntries, JSON.stringify(next)); } catch {}
      return next;
    });
  }
  function deletePmbsAll() {
    if (!pmbsEntries.length) return;
    if (!confirm("Delete ALL saved belief assessments? This cannot be undone.")) return;
    setPmbsEntries([]);
    try { localStorage.setItem(LS_SCOPE.pmbsEntries, JSON.stringify([])); } catch {}
  }

  /* -------------------------------- Render -------------------------------- */

  return (
    <div className="page-container">
      <h2 className="section-title">Symptom Tracking</h2>
      <p className="card-text" style={{ marginTop: -6 }}>
        Personal check-ins you control. Everything here is saved only on this device.
        You can delete it at any time. These tools support reflection and self-monitoring and
        are not a diagnosis or medical advice.
      </p>

      <div
        style={{
          backgroundColor: "var(--accent-muted)",
          border: "1px solid var(--accent)",
          borderRadius: 8,
          padding: 12,
          marginTop: 12,
          fontSize: 14,
          lineHeight: 1.5,
          color: "var(--text)",
        }}
      >
        <strong>About these measures:</strong> These are validated screening tools, not diagnostic instruments. 
        Scores can help you notice patterns over time. If you notice significant increases in your scores, 
        or if symptoms interfere with daily functioning, discuss results with your therapist or healthcare provider.
      </div>

      {/* Tool switcher */}
      <div className="panel" style={{ padding: 12, marginTop: 8 }}>
        <label htmlFor="tool" className="card-text" style={{ display: "block", marginBottom: 6 }}>
          Choose a check-in
        </label>
        <select
          id="tool"
          value={tool}
          onChange={(e) => setTool(e.target.value)}
          style={{ width: "100%", borderRadius: 10, padding: "8px 10px", border: "1px solid var(--border)" }}
        >
          <option value="pcl5-month">PCL-5 (past month)</option>
          <option value="pcl5-week">PCL-5 (past week)</option>
          <option value="pmbs">Trauma-Related Beliefs (PMBS)</option>
        </select>
      </div>

      {/* PCL-5 (month) */}
      {tool === "pcl5-month" && (
        <div className="panel" style={{ padding: 16, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <h3 className="card-title" style={{ margin: 0 }}>PCL-5 (past month)</h3>
            <div className="note">Total: <strong>{pclMonthTotal}</strong> (0–80)</div>
          </div>
          <p className="card-text" style={{ marginTop: 0 }}>
            This checklist can help you notice patterns over time. If you're in crisis, call <strong>911</strong> (U.S.) or dial/text <strong>988</strong>, or use your local emergency number.
          </p>

          <div style={{ display: "grid", gap: 14, marginTop: 10 }}>
            {PCL5_ITEMS.map((text, idx) => (
              <div key={idx} className="panel" style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div style={{ marginBottom: 10, color: "var(--text)" }}>
                  <span style={{ fontWeight: 600, marginRight: 8 }}>{idx + 1}.</span>{text}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PCL5_SCALE.map((s) => (
                    <label key={s.v} className="btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name={`pcl5m-${idx}`}
                        value={s.v}
                        checked={pclMonthResponses[idx] === s.v}
                        onChange={() => setPclMonthAnswer(idx, s.v)}
                      />
                      <span style={{ fontSize: 14 }}>{s.v} – {s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="form-row" style={{ marginTop: 14 }}>
            <label htmlFor="pcl5-month-notes">Notes (optional)</label>
            <textarea
              id="pcl5-month-notes"
              rows={4}
              value={pclMonthNotes}
              onChange={(e) => setPclMonthNotes(e.target.value)}
              placeholder="Anything you want to remember about today's check-in…"
            />
          </div>

          {pclMonthTotal >= 33 && (
            <div style={{ 
              marginTop: 12, 
              padding: 10, 
              backgroundColor: 'var(--accent-muted)', 
              border: '1px solid var(--accent)', 
              borderRadius: 8,
              fontSize: 14,
              color: 'var(--text)'
            }}>
              <strong>Score interpretation:</strong> Scores ≥33 may indicate clinical-level symptoms. Consider discussing these results with your therapist.
            </div>
          )}

          <div className="controls-row" style={{ marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => savePcl("month")} disabled={!pclMonthAllAnswered}>
              Save assessment
            </button>
            <button className="btn" onClick={() => { setPclMonthResponses(Array(PCL5_ITEMS.length).fill(null)); setPclMonthNotes(""); }}>
              Clear current
            </button>
            {pclMonthEntries.length > 0 && (
              <button className="btn btn-ghost" onClick={() => deletePclAll("month")}>Delete all…</button>
            )}
          </div>

          <SavedPclList
            title="Saved PCL-5 (month) assessments"
            entries={pclMonthEntries}
            onDeleteOne={(id) => deletePclOne("month", id)}
          />
        </div>
      )}

      {/* PCL-5 (week) */}
      {tool === "pcl5-week" && (
        <div className="panel" style={{ padding: 16, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <h3 className="card-title" style={{ margin: 0 }}>PCL-5 (past week)</h3>
            <div className="note">Total: <strong>{pclWeekTotal}</strong> (0–80)</div>
          </div>
          <p className="card-text" style={{ marginTop: 0 }}>
            A shorter timeframe can help some people track changes more closely week to week. If you're in crisis, call <strong>911</strong> (U.S.) or dial/text <strong>988</strong>.
          </p>

          <div style={{ display: "grid", gap: 14, marginTop: 10 }}>
            {PCL5_ITEMS.map((text, idx) => (
              <div key={idx} className="panel" style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div style={{ marginBottom: 10, color: "var(--text)" }}>
                  <span style={{ fontWeight: 600, marginRight: 8 }}>{idx + 1}.</span>{text}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PCL5_SCALE.map((s) => (
                    <label key={s.v} className="btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name={`pcl5w-${idx}`}
                        value={s.v}
                        checked={pclWeekResponses[idx] === s.v}
                        onChange={() => setPclWeekAnswer(idx, s.v)}
                      />
                      <span style={{ fontSize: 14 }}>{s.v} – {s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="form-row" style={{ marginTop: 14 }}>
            <label htmlFor="pcl5-week-notes">Notes (optional)</label>
            <textarea
              id="pcl5-week-notes"
              rows={4}
              value={pclWeekNotes}
              onChange={(e) => setPclWeekNotes(e.target.value)}
              placeholder="Anything you want to remember about today's check-in…"
            />
          </div>

          {pclWeekTotal >= 33 && (
            <div style={{ 
              marginTop: 12, 
              padding: 10, 
              backgroundColor: 'var(--accent-muted)', 
              border: '1px solid var(--accent)', 
              borderRadius: 8,
              fontSize: 14,
              color: 'var(--text)'
            }}>
              <strong>Score interpretation:</strong> Scores ≥33 may indicate clinical-level symptoms. Consider discussing these results with your therapist.
            </div>
          )}

          <div className="controls-row" style={{ marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => savePcl("week")} disabled={!pclWeekAllAnswered}>
              Save assessment
            </button>
            <button className="btn" onClick={() => { setPclWeekResponses(Array(PCL5_ITEMS.length).fill(null)); setPclWeekNotes(""); }}>
              Clear current
            </button>
            {pclWeekEntries.length > 0 && (
              <button className="btn btn-ghost" onClick={() => deletePclAll("week")}>Delete all…</button>
            )}
          </div>

          <SavedPclList
            title="Saved PCL-5 (week) assessments"
            entries={pclWeekEntries}
            onDeleteOne={(id) => deletePclOne("week", id)}
          />
        </div>
      )}

      {/* PMBS */}
      {tool === "pmbs" && (
        <div className="panel" style={{ padding: 16, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <h3 className="card-title" style={{ margin: 0 }}>Trauma-Related Beliefs (PMBS)</h3>
            <div className="note">Total: <strong>{pmbsSum}</strong> (range: 15-105)</div>
          </div>
          <p className="card-text" style={{ marginTop: 0 }}>
            The PMBS can help you notice trauma-related beliefs and track how they shift over time. Answers are private to your device.
          </p>
          <p className="note" style={{ marginTop: 8 }}>
            Credit: Vogt, Shipherd, &amp; Resick (2012), Posttraumatic Maladaptive Beliefs Scale. Public-domain wording available via VA materials.
          </p>

          <div style={{ display: "grid", gap: 14, marginTop: 10 }}>
            {PMBS_ITEMS.map((text, idx) => (
              <div key={idx} className="panel" style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div style={{ marginBottom: 10, color: "var(--text)" }}>
                  <span style={{ fontWeight: 600, marginRight: 8 }}>{idx + 1}.</span>{text}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[1,2,3,4,5,6,7].map((v) => (
                    <label key={v} className="btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name={`pmbs-${idx}`}
                        value={v}
                        checked={pmbsResponses[idx] === v}
                        onChange={() => setPmbsAnswer(idx, v)}
                      />
                      <span style={{ fontSize: 14 }}>{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {pmbsSum >= 60 && (
            <div style={{ 
              marginTop: 12, 
              padding: 10, 
              backgroundColor: 'var(--accent-muted)', 
              border: '1px solid var(--accent)', 
              borderRadius: 8,
              fontSize: 14,
              color: 'var(--text)'
            }}>
              <strong>Score interpretation:</strong> Elevated trauma-related beliefs. Consider reviewing these patterns with your therapist.
            </div>
          )}

          <div className="controls-row" style={{ marginTop: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={savePmbs} disabled={!pmbsAllAnswered}>
              Save beliefs assessment
            </button>
            <button className="btn" onClick={() => setPmbsResponses(Array(PMBS_ITEMS.length).fill(null))}>
              Clear current
            </button>
            {pmbsEntries.length > 0 && (
              <button className="btn btn-ghost" onClick={deletePmbsAll}>Delete all…</button>
            )}
          </div>

          <div className="panel" style={{ padding: 16, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h3 style={{ margin: 0, color: "var(--text)", fontSize: 18 }}>Saved Belief Assessments</h3>
              <div className="note">Stored only on this device</div>
            </div>

            {pmbsEntries.length === 0 ? (
              <p className="card-text" style={{ margin: 0 }}>
                No saved belief assessments yet.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                {pmbsEntries.map((e) => (
                  <li key={e.id} className="panel" style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <div style={{ fontWeight: 600, color: "var(--text)", flex: 1 }}>
                        {formatTs(e.ts)}
                      </div>
                      <div className="note">Total: <strong>{e.total}</strong></div>
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
                    </details>
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <button className="btn btn-ghost" onClick={() => deletePmbsOne(e.id)}>Delete…</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Footer (global microcopy) */}
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
          These tools support reflection and education. They are not a diagnosis or medical advice.
          If you're in crisis, call <strong>911</strong> (U.S.), dial or text <strong>988</strong>, or use your local emergency number.
        </p>
      </div>
    </div>
  );
}

/* --------------------------- Small helper piece --------------------------- */

function SavedPclList({ title, entries, onDeleteOne }) {
  return (
    <div className="panel" style={{ padding: 16, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h3 style={{ margin: 0, color: "var(--text)", fontSize: 18 }}>{title}</h3>
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
                  {new Date(e.ts).toLocaleString()}
                </div>
                <div className="note">Total: <strong>{e.total}</strong></div>
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
                <button className="btn btn-ghost" onClick={() => onDeleteOne(e.id)}>Delete…</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}