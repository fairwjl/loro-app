// client/src/pages/WorksheetsPage.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Worksheets – Menu + Public-Domain (VA) worksheets + Thought Record (ABC)
 * Local-only storage (no PHI). Print/export friendly.
 * Public-domain worksheet stubs are derived from U.S. Dept. of Veterans Affairs psychoeducational tools.
 * Thought Record component preserved from your existing implementation.
 */

/* -------------------------- Utilities -------------------------- */

function useLocalDoc(key, initial) {
  const [doc, setDoc] = useState(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setDoc((d) => ({ ...d, ...JSON.parse(raw) }));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const save = useMemo(
    () => (next) => {
      const data = typeof next === "function" ? next(doc) : next;
      const withStamp = { ...data, lastSavedAt: new Date().toISOString() };
      setDoc(withStamp);
      try {
        localStorage.setItem(key, JSON.stringify(withStamp));
      } catch {}
    },
    [doc, key]
  );
  return { doc, save };
}

function Controls({ onSave, lastSavedAt, onPrint, onBack }) {
  return (
    <>
      <div className="controls-row" style={{ marginTop: 6 }}>
        <button type="button" className="btn" onClick={onBack}>
          ← All worksheets
        </button>
      </div>

      <div className="controls-row" style={{ marginTop: 16, gap: 8, alignItems: "center" }}>
        <button type="button" className="btn btn-primary" onClick={onSave}>Save</button>
        <button type="button" className="btn" onClick={onPrint}>Export / Print</button>
        <span className="note" style={{ marginLeft: 8 }}>
          {lastSavedAt ? `Last saved: ${new Date(lastSavedAt).toLocaleString()}` : "Not saved yet"}
        </span>
      </div>
    </>
  );
}

function Disclaimer() {
  return (
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
      <strong>Important:</strong> These worksheets are for self-reflection and education only and are{" "}
      <strong>not medical advice or psychotherapy</strong>. If you’re in crisis or thinking about harming yourself or others, call{" "}
      <strong>911</strong> (U.S.), dial or text <strong>988</strong>, or use your local emergency number. Avoid entering personal identifiers
      or Protected Health Information (PHI). <span style={{ color: "#666" }}>Content derived from U.S. Dept. of Veterans Affairs psychoeducational
      resources (public domain).</span>
    </div>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        button, input[type=checkbox], input[type=range], .controls-row {
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
        .note { color: #000 !important; }
        body, html { background: #fff !important; }
      }
    `}</style>
  );
}

/* ---------------- Thought Record (ABC) – existing, preserved ---------------- */

const TR_STORAGE_KEY = "loro_thought_record_v1";

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
      const raw = localStorage.getItem(TR_STORAGE_KEY);
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
        localStorage.setItem(TR_STORAGE_KEY, JSON.stringify(withStamp));
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
        <button type="button" className="btn" onClick={() => onChange([...items, ""])}>+ Add another</button>
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
          style={{ display: "grid", gridTemplateColumns: "1fr auto 160px auto", gap: 8, alignItems: "center" }}
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
          <label htmlFor={`emo-int-${idx}`} style={{ justifySelf: "end" }}>Intensity</label>
          <input
            id={`emo-int-${idx}`}
            type="range"
            min={0}
            max={100}
            value={e.intensity}
            onChange={(ev) => {
              const copy = [...emotions];
              copy[idx] = { ...copy[idx], intensity: parseInt(ev.target.value, 10) };
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
        <button type="button" className="btn" onClick={() => onChange([...emotions, { name: "", intensity: 50 }])}>
          + Add emotion
        </button>
      </div>
    </div>
  );
}

/* -------------------------- PD Worksheet Stubs -------------------------- */
/* All of these use simple fields + localStorage + print; wording is PD-style. */

function Worksheet_ChangeNegativeThinking({ onBack }) {
  const { doc, save } = useLocalDoc("va_change_negative_thinking_v1", {
    date: new Date().toISOString().slice(0, 10),
    situation: "",
    thought: "",
    evidenceFor: [""],
    evidenceAgainst: [""],
    balanced: "",
    lastSavedAt: null,
  });
  const handlePrint = () => window.print();
  return (
    <div>
      <h2 className="section-title">Change Negative Thinking Patterns</h2>
      <p className="card-text">Identify a difficult situation, examine the thought, weigh evidence, and draft a more balanced alternative.</p>
      <PrintStyles />
      <div className="panel" style={{ marginTop: 12 }}>
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "auto 160px", gap: 8, alignItems: "center" }}>
          <label htmlFor="cnt-date">Date</label>
          <input id="cnt-date" type="date" value={doc.date} onChange={(e) => save({ ...doc, date: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Situation</h3>
          <textarea rows={3} value={doc.situation} onChange={(e) => save({ ...doc, situation: e.target.value })} style={{ borderRadius: 12 }} />
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Automatic thought</h3>
          <input type="text" value={doc.thought} onChange={(e) => save({ ...doc, thought: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
        <ListEditor label="Evidence for the thought" items={doc.evidenceFor} onChange={(v) => save({ ...doc, evidenceFor: v })} idPrefix="cnt-ef" placeholder="Fact supporting the thought" />
        <ListEditor label="Evidence against the thought" items={doc.evidenceAgainst} onChange={(v) => save({ ...doc, evidenceAgainst: v })} idPrefix="cnt-ea" placeholder="Fact that doesn’t fit / alternative explanation" />
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Balanced alternative</h3>
          <textarea rows={3} value={doc.balanced} onChange={(e) => save({ ...doc, balanced: e.target.value })} style={{ borderRadius: 12 }} />
        </div>
      </div>
      <Controls onSave={() => save(doc)} lastSavedAt={doc.lastSavedAt} onPrint={handlePrint} onBack={onBack} />
      <Disclaimer />
    </div>
  );
}

function Worksheet_ChallengingQuestions({ onBack }) {
  const { doc, save } = useLocalDoc("va_challenging_questions_v1", {
    date: new Date().toISOString().slice(0, 10),
    questionsPicked: [],
    notes: "",
    lastSavedAt: null,
  });
  const handleToggle = (q) =>
    save((d) => ({
      ...d,
      questionsPicked: d.questionsPicked.includes(q)
        ? d.questionsPicked.filter((x) => x !== q)
        : [...d.questionsPicked, q],
    }));
  const handlePrint = () => window.print();
  const questions = [
    "What is the evidence for and against this thought?",
    "Am I confusing a possibility with a certainty?",
    "Is there another way to look at this situation?",
    "What would I say to a friend who had this thought?",
    "Am I focusing on the worst-case scenario? What is most likely?",
    "Am I overlooking strengths or coping skills?",
    "What are the costs and benefits of holding this thought?",
  ];
  return (
    <div>
      <h2 className="section-title">Challenging Questions</h2>
      <p className="card-text">Use Socratic prompts to examine an unhelpful thought or belief.</p>
      <PrintStyles />
      <div className="panel" style={{ marginTop: 12 }}>
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "auto 160px", gap: 8, alignItems: "center" }}>
          <label htmlFor="cq-date">Date</label>
          <input id="cq-date" type="date" value={doc.date} onChange={(e) => save({ ...doc, date: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Pick questions</h3>
          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
            {questions.map((q, i) => (
              <li key={`cq-${i}`} style={{ marginBottom: 6 }}>
                <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <input
                    type="checkbox"
                    checked={doc.questionsPicked.includes(q)}
                    onChange={() => handleToggle(q)}
                    aria-label={`Select: ${q}`}
                  />
                  <span>{q}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Notes / Balanced view</h3>
          <textarea rows={4} value={doc.notes} onChange={(e) => save({ ...doc, notes: e.target.value })} style={{ borderRadius: 12 }} />
        </div>
      </div>
      <Controls onSave={() => save(doc)} lastSavedAt={doc.lastSavedAt} onPrint={handlePrint} onBack={onBack} />
      <Disclaimer />
    </div>
  );
}

function Worksheet_TraumaReminders({ onBack }) {
  const { doc, save } = useLocalDoc("va_trauma_reminders_v1", {
    date: new Date().toISOString().slice(0, 10),
    reminder: "",
    earlySigns: [""],
    copingPlan: [""],
    lastSavedAt: null,
  });
  const handlePrint = () => window.print();
  return (
    <div>
      <h2 className="section-title">Deal with Trauma Reminders</h2>
      <p className="card-text">Identify a reminder (trigger), notice early signs, and plan coping steps.</p>
      <PrintStyles />
      <div className="panel" style={{ marginTop: 12 }}>
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "auto 160px", gap: 8, alignItems: "center" }}>
          <label htmlFor="trig-date">Date</label>
          <input id="trig-date" type="date" value={doc.date} onChange={(e) => save({ ...doc, date: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Reminder / Situation</h3>
          <textarea rows={3} value={doc.reminder} onChange={(e) => save({ ...doc, reminder: e.target.value })} style={{ borderRadius: 12 }} />
        </div>
        <ListEditor label="Early signs (body, thoughts, urges)" items={doc.earlySigns} onChange={(v) => save({ ...doc, earlySigns: v })} idPrefix="tr-early" placeholder="e.g., heart racing, tightness, 'not safe', urge to leave" />
        <ListEditor label="Coping plan (steps)" items={doc.copingPlan} onChange={(v) => save({ ...doc, copingPlan: v })} idPrefix="tr-plan" placeholder="e.g., breathing, grounding, step outside, call a friend" />
      </div>
      <Controls onSave={() => save(doc)} lastSavedAt={doc.lastSavedAt} onPrint={handlePrint} onBack={onBack} />
      <Disclaimer />
    </div>
  );
}

function Worksheet_ValuesGoals({ onBack }) {
  const { doc, save } = useLocalDoc("va_values_goals_v1", {
    date: new Date().toISOString().slice(0, 10),
    values: [""],
    goals: [""],
    firstStep: "",
    lastSavedAt: null,
  });
  const handlePrint = () => window.print();
  return (
    <div>
      <h2 className="section-title">Identify Values & Goals</h2>
      <p className="card-text">Clarify what matters and define small, doable goals that align with your values.</p>
      <PrintStyles />
      <div className="panel" style={{ marginTop: 12 }}>
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "auto 160px", gap: 8, alignItems: "center" }}>
          <label htmlFor="vg-date">Date</label>
          <input id="vg-date" type="date" value={doc.date} onChange={(e) => save({ ...doc, date: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
        <ListEditor label="My values" items={doc.values} onChange={(v) => save({ ...doc, values: v })} idPrefix="vg-values" placeholder="e.g., family, compassion, learning, service" />
        <ListEditor label="Goals that fit my values" items={doc.goals} onChange={(v) => save({ ...doc, goals: v })} idPrefix="vg-goals" placeholder="e.g., call a friend weekly, volunteer monthly" />
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>First small step</h3>
          <input type="text" value={doc.firstStep} onChange={(e) => save({ ...doc, firstStep: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
      </div>
      <Controls onSave={() => save(doc)} lastSavedAt={doc.lastSavedAt} onPrint={handlePrint} onBack={onBack} />
      <Disclaimer />
    </div>
  );
}

function Worksheet_Assertive({ onBack }) {
  const { doc, save } = useLocalDoc("va_assertive_v1", {
    date: new Date().toISOString().slice(0, 10),
    situation: "",
    rightsNeeds: "",
    statement: "",
    practiceNotes: "",
    lastSavedAt: null,
  });
  const handlePrint = () => window.print();
  return (
    <div>
      <h2 className="section-title">Learn to Be Assertive</h2>
      <p className="card-text">Practice clear, respectful communication: describe the situation, state needs, make a request.</p>
      <PrintStyles />
      <div className="panel" style={{ marginTop: 12 }}>
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "auto 160px", gap: 8, alignItems: "center" }}>
          <label htmlFor="as-date">Date</label>
          <input id="as-date" type="date" value={doc.date} onChange={(e) => save({ ...doc, date: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Situation</h3>
          <textarea rows={2} value={doc.situation} onChange={(e) => save({ ...doc, situation: e.target.value })} style={{ borderRadius: 12 }} />
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>My rights / needs</h3>
          <textarea rows={2} value={doc.rightsNeeds} onChange={(e) => save({ ...doc, rightsNeeds: e.target.value })} style={{ borderRadius: 12 }} />
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Assertive statement (I-statement)</h3>
          <textarea rows={2} value={doc.statement} onChange={(e) => save({ ...doc, statement: e.target.value })} style={{ borderRadius: 12 }} />
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Practice notes</h3>
          <textarea rows={3} value={doc.practiceNotes} onChange={(e) => save({ ...doc, practiceNotes: e.target.value })} style={{ borderRadius: 12 }} />
        </div>
      </div>
      <Controls onSave={() => save(doc)} lastSavedAt={doc.lastSavedAt} onPrint={handlePrint} onBack={onBack} />
      <Disclaimer />
    </div>
  );
}

function Worksheet_Enjoyable({ onBack }) {
  const { doc, save } = useLocalDoc("va_enjoyable_v1", {
    date: new Date().toISOString().slice(0, 10),
    ideas: [""],
    plan: "",
    lastSavedAt: null,
  });
  const handlePrint = () => window.print();
  return (
    <div>
      <h2 className="section-title">Plan Something Enjoyable</h2>
      <p className="card-text">Brainstorm small, positive activities and choose one to schedule.</p>
      <PrintStyles />
      <div className="panel" style={{ marginTop: 12 }}>
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "auto 160px", gap: 8, alignItems: "center" }}>
          <label htmlFor="en-date">Date</label>
          <input id="en-date" type="date" value={doc.date} onChange={(e) => save({ ...doc, date: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
        <ListEditor label="Ideas list" items={doc.ideas} onChange={(v) => save({ ...doc, ideas: v })} idPrefix="en-ideas" placeholder="e.g., short walk, music, art, call a friend" />
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>My plan (what/when/with whom)</h3>
          <textarea rows={2} value={doc.plan} onChange={(e) => save({ ...doc, plan: e.target.value })} style={{ borderRadius: 12 }} />
        </div>
      </div>
      <Controls onSave={() => save(doc)} lastSavedAt={doc.lastSavedAt} onPrint={handlePrint} onBack={onBack} />
      <Disclaimer />
    </div>
  );
}

function Worksheet_WriteToReflect({ onBack }) {
  const { doc, save } = useLocalDoc("va_write_to_reflect_v1", {
    date: new Date().toISOString().slice(0, 10),
    prompt: "Write freely about a recent challenge. Notice thoughts, feelings, and what matters to you.",
    entry: "",
    lastSavedAt: null,
  });
  const handlePrint = () => window.print();
  return (
    <div>
      <h2 className="section-title">Write to Reflect</h2>
      <p className="card-text">Open-ended writing to process experiences and clarify meaning.</p>
      <PrintStyles />
      <div className="panel" style={{ marginTop: 12 }}>
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "auto 160px", gap: 8, alignItems: "center" }}>
          <label htmlFor="wr-date">Date</label>
          <input id="wr-date" type="date" value={doc.date} onChange={(e) => save({ ...doc, date: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Prompt (optional)</h3>
          <input type="text" value={doc.prompt} onChange={(e) => save({ ...doc, prompt: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Entry</h3>
          <textarea rows={6} value={doc.entry} onChange={(e) => save({ ...doc, entry: e.target.value })} style={{ borderRadius: 12 }} />
        </div>
      </div>
      <Controls onSave={() => save(doc)} lastSavedAt={doc.lastSavedAt} onPrint={handlePrint} onBack={onBack} />
      <Disclaimer />
    </div>
  );
}

function Worksheet_ProblemSolve({ onBack }) {
  const { doc, save } = useLocalDoc("va_problem_solve_v1", {
    date: new Date().toISOString().slice(0, 10),
    problem: "",
    options: [""],
    chosen: "",
    steps: [""],
    lastSavedAt: null,
  });
  const handlePrint = () => window.print();
  return (
    <div>
      <h2 className="section-title">Learn to Problem Solve</h2>
      <p className="card-text">Define the problem, list options, choose one, and plan small steps.</p>
      <PrintStyles />
      <div className="panel" style={{ marginTop: 12 }}>
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "auto 160px", gap: 8, alignItems: "center" }}>
          <label htmlFor="ps-date">Date</label>
          <input id="ps-date" type="date" value={doc.date} onChange={(e) => save({ ...doc, date: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Problem</h3>
          <textarea rows={2} value={doc.problem} onChange={(e) => save({ ...doc, problem: e.target.value })} style={{ borderRadius: 12 }} />
        </div>
        <ListEditor label="Options" items={doc.options} onChange={(v) => save({ ...doc, options: v })} idPrefix="ps-opt" placeholder="Idea to try" />
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Chosen approach</h3>
          <input type="text" value={doc.chosen} onChange={(e) => save({ ...doc, chosen: e.target.value })} style={{ borderRadius: 10 }} />
        </div>
        <ListEditor label="First small steps" items={doc.steps} onChange={(v) => save({ ...doc, steps: v })} idPrefix="ps-steps" placeholder="Small, doable step" />
      </div>
      <Controls onSave={() => save(doc)} lastSavedAt={doc.lastSavedAt} onPrint={handlePrint} onBack={onBack} />
      <Disclaimer />
    </div>
  );
}

/* -------------------------- Page: Menu + Router -------------------------- */

export default function WorksheetsPage() {
  const [view, setView] = useState("menu"); // "menu" | "thoughtRecord" | each stub key

  // --- MENU ---
  if (view === "menu") {
    return (
      <div>
        <h2 className="section-title">Worksheets</h2>
        <p className="card-text">
          Evidence-informed, self-guided worksheets. Complete privately on this device, <strong>save</strong> locally,
          or <strong>print</strong> a copy. Before launch, you’ll also be able to <strong>invite your therapist</strong> to view entries (optional).
        </p>

        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 4 }}>What you’ll find here</h3>
          <ul className="card-text" style={{ paddingLeft: 18, lineHeight: 1.5, marginTop: 6 }}>
            <li>CBT/CPT-style <em>Thought Record</em> to examine difficult moments and re-balance “stuck” thoughts.</li>
            <li>Skills-based VA worksheets (public domain): thinking, triggers, values, problem-solving, assertiveness, and more.</li>
            <li>Simple print/export; your entries are stored on your device only.</li>
          </ul>
        </div>

        {/* Menu list (clickable panels) */}
        <MenuItem label="Thought Record (ABC)" onOpen={() => setView("thoughtRecord")} />
        <MenuItem label="Change Negative Thinking Patterns" onOpen={() => setView("cnt")} />
        <MenuItem label="Challenging Questions (Socratic)" onOpen={() => setView("cq")} />
        <MenuItem label="Deal with Trauma Reminders" onOpen={() => setView("triggers")} />
        <MenuItem label="Identify Values & Goals" onOpen={() => setView("values")} />
        <MenuItem label="Learn to Be Assertive" onOpen={() => setView("assertive")} />
        <MenuItem label="Plan Something Enjoyable" onOpen={() => setView("enjoyable")} />
        <MenuItem label="Write to Reflect" onOpen={() => setView("reflect")} />
        <MenuItem label="Learn to Problem Solve" onOpen={() => setView("problemSolve")} />

        <Disclaimer />
      </div>
    );
  }

  // --- ROUTER TO WORKSHEETS ---
  const goBack = () => setView("menu");
  switch (view) {
    case "thoughtRecord":
      return <ThoughtRecordDetail onBack={goBack} />;
    case "cnt":
      return <Worksheet_ChangeNegativeThinking onBack={goBack} />;
    case "cq":
      return <Worksheet_ChallengingQuestions onBack={goBack} />;
    case "triggers":
      return <Worksheet_TraumaReminders onBack={goBack} />;
    case "values":
      return <Worksheet_ValuesGoals onBack={goBack} />;
    case "assertive":
      return <Worksheet_Assertive onBack={goBack} />;
    case "enjoyable":
      return <Worksheet_Enjoyable onBack={goBack} />;
    case "reflect":
      return <Worksheet_WriteToReflect onBack={goBack} />;
    case "problemSolve":
      return <Worksheet_ProblemSolve onBack={goBack} />;
    default:
      return null;
  }
}

function MenuItem({ label, onOpen }) {
  return (
    <div
      role="button"
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
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
      aria-label={`Open ${label}`}
    >
      <div>
        <div className="card-title" style={{ margin: 0 }}>{label}</div>
        <div className="card-text" style={{ marginTop: 4 }}>
          Click to open and complete. Save locally or print a copy.
        </div>
      </div>
      <div aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>›</div>
    </div>
  );
}

/* -------------------------- Thought Record Detail Wrapper -------------------------- */

function ThoughtRecordDetail({ onBack }) {
  const { rec, save } = useThoughtRecord();
  const handlePrint = () => window.print();

  return (
    <div>
      <h2 className="section-title">Worksheets</h2>
      <p className="card-text">
        Thought Record (CBT/CPT-style). Use this to examine a difficult moment, surface stuck thoughts, and develop a more balanced alternative.
        Stored on your device only.
      </p>

      <div className="controls-row" style={{ marginTop: 6 }}>
        <button type="button" className="btn" onClick={onBack}>← All worksheets</button>
      </div>

      <PrintStyles />

      <form className="panel" onSubmit={(e) => e.preventDefault()} style={{ marginTop: 12 }}>
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "auto 160px", gap: 8, alignItems: "center" }}>
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

        <EmotionsEditor emotions={rec.emotions} onChange={(v) => save({ ...rec, emotions: v })} />

        <ListEditor
          label="Automatic thoughts"
          items={rec.automaticThoughts}
          onChange={(v) => save({ ...rec, automaticThoughts: v })}
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

        {/* Optional helper: you already have a Socratic checklist elsewhere; omitted here to avoid extra changes */}
        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Alternative / Balanced thought</h3>
          <textarea
            rows={3}
            placeholder="Craft a more balanced view that accounts for all of the evidence you listed."
            value={rec.alternativeThought}
            onChange={(e) => save({ ...rec, alternativeThought: e.target.value })}
            style={{ borderRadius: 12 }}
          />
        </div>

        <div className="panel" style={{ marginTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Outcome / Re-rate emotions</h3>
          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 160px 42px", gap: 8, alignItems: "center" }}>
            <textarea
              rows={2}
              placeholder="After writing an alternative thought, what do you notice (feelings, urges, perspective)?"
              value={rec.outcome.notes}
              onChange={(e) => save({ ...rec, outcome: { ...rec.outcome, notes: e.target.value } })}
              style={{ borderRadius: 12 }}
            />
            <label htmlFor="int-after" style={{ justifySelf: "end" }}>Intensity after</label>
            <input
              id="int-after"
              type="range"
              min={0}
              max={100}
              value={rec.outcome.intensityAfter}
              onChange={(e) => save({ ...rec, outcome: { ...rec.outcome, intensityAfter: parseInt(e.target.value, 10) } })}
            />
          </div>
        </div>

        <div className="controls-row" style={{ marginTop: 16, gap: 8, alignItems: "center" }}>
          <button type="button" className="btn btn-primary" onClick={() => save(rec)}>Save</button>
          <button type="button" className="btn" onClick={handlePrint}>Export / Print</button>
          <span className="note" style={{ marginLeft: 8 }}>
            {rec.lastSavedAt ? `Last saved: ${new Date(rec.lastSavedAt).toLocaleString()}` : "Not saved yet"}
          </span>
        </div>
      </form>

      <Disclaimer />
    </div>
  );
}