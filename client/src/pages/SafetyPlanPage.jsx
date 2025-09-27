import React, { useEffect, useMemo, useState } from "react";

/**
 * Safety Plan (Stanley–Brown) – Local-only MVP with print polish
 * Storage: localStorage only (no cloud). Export via browser Print dialog.
 */

const STORAGE_KEY = "loro_safety_plan_v1";

function useSafetyPlan() {
  const [plan, setPlan] = useState({
    warningSigns: [""],
    copingStrategies: [""],
    placesForDistraction: [""],
    peopleForSupport: [{ name: "", contact: "" }],
    professionals: [
      { label: "Therapist/Clinician", contact: "" },
      { label: "988 Suicide & Crisis Lifeline (US)", contact: "Call/Text 988" },
      { label: "Emergency (US)", contact: "Call 911" },
    ],
    meansSafety: [""],
    lastSavedAt: null,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPlan((p) => ({ ...p, ...JSON.parse(raw) }));
    } catch {}
  }, []);

  const save = useMemo(
    () => (next) => {
      const data = typeof next === "function" ? next(plan) : next;
      const withStamp = { ...data, lastSavedAt: new Date().toISOString() };
      setPlan(withStamp);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(withStamp));
      } catch {}
    },
    [plan]
  );

  return { plan, save };
}

function ArrayEditor({ label, value, onChange, idPrefix, placeholder }) {
  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <h3 className="card-title" style={{ marginBottom: 8 }}>{label}</h3>
      {value.map((item, idx) => (
        <div key={`${idPrefix}-${idx}`} className="form-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            value={item}
            placeholder={placeholder}
            onChange={(e) => {
              const copy = [...value];
              copy[idx] = e.target.value;
              onChange(copy);
            }}
            style={{ flex: 1, borderRadius: 10 }}
          />
          <button
            type="button"
            className="btn"
            onClick={() => {
              const copy = value.filter((_, i) => i !== idx);
              onChange(copy.length ? copy : [""]);
            }}
            aria-label={`Remove ${label} item ${idx + 1}`}
          >
            ✕
          </button>
        </div>
      ))}
      <div className="controls-row" style={{ marginTop: 8 }}>
        <button
          type="button"
          className="btn"
          onClick={() => onChange([...value, ""])}
        >
          + Add another
        </button>
      </div>
    </div>
  );
}

function PeopleEditor({ label, value, onChange, idPrefix }) {
  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <h3 className="card-title" style={{ marginBottom: 8 }}>{label}</h3>
      {value.map((p, idx) => (
        <div
          key={`${idPrefix}-${idx}`}
          className="form-row"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center" }}
        >
          <input
            type="text"
            value={p.name}
            placeholder="Name"
            onChange={(e) => {
              const copy = [...value];
              copy[idx] = { ...copy[idx], name: e.target.value };
              onChange(copy);
            }}
            style={{ borderRadius: 10 }}
          />
          <input
            type="text"
            value={p.contact}
            placeholder="Phone / Email"
            onChange={(e) => {
              const copy = [...value];
              copy[idx] = { ...copy[idx], contact: e.target.value };
              onChange(copy);
            }}
            style={{ borderRadius: 10 }}
          />
          <button
            type="button"
            className="btn"
            onClick={() => {
              const copy = value.filter((_, i) => i !== idx);
              onChange(copy.length ? copy : [{ name: "", contact: "" }]);
            }}
            aria-label={`Remove contact ${idx + 1}`}
          >
            ✕
          </button>
        </div>
      ))}
      <div className="controls-row" style={{ marginTop: 8 }}>
        <button
          type="button"
          className="btn"
          onClick={() => onChange([...value, { name: "", contact: "" }])}
        >
          + Add contact
        </button>
      </div>
    </div>
  );
}

function ProfessionalsEditor({ value, onChange }) {
  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <h3 className="card-title" style={{ marginBottom: 8 }}>Professionals & Agencies</h3>
      {value.map((row, idx) => (
        <div
          key={`pro-${idx}`}
          className="form-row"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignItems: "center" }}
        >
          <input
            type="text"
            value={row.label}
            onChange={(e) => {
              const copy = [...value];
              copy[idx] = { ...copy[idx], label: e.target.value };
              onChange(copy);
            }}
            style={{ borderRadius: 10 }}
            placeholder="Label (e.g., Therapist)"
          />
          <input
            type="text"
            value={row.contact}
            onChange={(e) => {
              const copy = [...value];
              copy[idx] = { ...copy[idx], contact: e.target.value };
              onChange(copy);
            }}
            style={{ borderRadius: 10 }}
            placeholder="Phone / Email / Address"
          />
        </div>
      ))}
      <div className="controls-row" style={{ marginTop: 8 }}>
        <button
          type="button"
          className="btn"
          onClick={() => onChange([...value, { label: "", contact: "" }])}
        >
          + Add professional/agency
        </button>
      </div>
    </div>
  );
}

export default function SafetyPlanPage() {
  const { plan, save } = useSafetyPlan();

  function handlePrint() {
    window.print();
  }

  return (
    <div id="safety-plan-page">
      {/* Scoped print styles for Safety Plan only */}
      <style>{`
        @media print {
          /* Print only this page content */
          body > *:not(#safety-plan-page) { display: none !important; }
          #safety-plan-page { display: block !important; }

          @page { margin: 12mm; }

          #safety-plan-page {
            color: #000 !important;
            background: #fff !important;
          }

          #safety-plan-page .btn,
          #safety-plan-page .controls-row,
          #safety-plan-page nav,
          #safety-plan-page footer {
            display: none !important;
          }

          #safety-plan-page .panel {
            box-shadow: none !important;
            border: 1px solid #000 !important;
          }

          #safety-plan-page input,
          #safety-plan-page textarea {
            border: 1px solid #000 !important;
          }

          /* Show link URLs in print for clarity */
          #safety-plan-page a::after {
            content: " (" attr(href) ")";
            font-size: 10px;
          }
        }
      `}</style>

      <h2 className="section-title">Safety Plan</h2>
      <p className="card-text">
        Create a personal plan for staying safe during tough moments. This plan is for{" "}
        <em>self-management and education only</em> and does not replace professional care.
      </p>

      <form
        className="panel"
        onSubmit={(e) => e.preventDefault()}
        style={{ marginTop: 12 }}
      >
        <ArrayEditor
          label="1) Warning signs (thoughts, feelings, situations)"
          value={plan.warningSigns}
          onChange={(v) => save({ ...plan, warningSigns: v })}
          idPrefix="ws"
          placeholder="e.g., can't sleep, racing thoughts, isolating"
        />

        <ArrayEditor
          label="2) Internal coping strategies (do on your own)"
          value={plan.copingStrategies}
          onChange={(v) => save({ ...plan, copingStrategies: v })}
          idPrefix="cs"
          placeholder="e.g., paced breathing, grounding, music, walk"
        />

        <ArrayEditor
          label="3) People & places for distraction (do not need to talk about feelings)"
          value={plan.placesForDistraction}
          onChange={(v) => save({ ...plan, placesForDistraction: v })}
          idPrefix="pp"
          placeholder="e.g., friend’s house, park, coffee shop"
        />

        <PeopleEditor
          label="4) People to ask for help (name & phone/email)"
          value={plan.peopleForSupport}
          onChange={(v) => save({ ...plan, peopleForSupport: v })}
          idPrefix="pf"
        />

        <ProfessionalsEditor
          value={plan.professionals}
          onChange={(v) => save({ ...plan, professionals: v })}
        />

        <ArrayEditor
          label="6) Means safety (steps to make my environment safer)"
          value={plan.meansSafety}
          onChange={(v) => save({ ...plan, meansSafety: v })}
          idPrefix="ms"
          placeholder="e.g., lock up meds/firearms, remove alcohol, give keys to trusted person"
        />

        <div className="controls-row" style={{ marginTop: 16, gap: 8 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => save(plan)} // triggers timestamp and save
          >
            Save
          </button>
          <button type="button" className="btn" onClick={handlePrint}>
            Export / Print
          </button>
          <span className="note" style={{ marginLeft: 8 }}>
            {plan.lastSavedAt ? `Last saved: ${new Date(plan.lastSavedAt).toLocaleString()}` : "Not saved yet"}
          </span>
        </div>
      </form>

      {/* Compact disclaimer at the bottom */}
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
        <strong>Important:</strong> This tool is for self-management and educational purposes only. It is{" "}
        <strong>not medical advice or therapy</strong>. If you are in crisis or thinking about harming yourself or others, call{" "}
        <strong>911</strong> (U.S.), dial or text <strong>988</strong> for the Suicide &amp; Crisis Lifeline, or use your local emergency number.
        Do not enter personal identifiers or Protected Health Information (PHI).
      </div>
    </div>
  );
}