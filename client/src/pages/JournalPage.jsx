import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * JournalPage — private, local-only journaling:
 * - Draft (title/body) autosaves locally
 * - "Save" stores a snapshot in a Saved entries list
 * - Export/print current draft
 * - Optional gentle prompts
 * - Simple session timer
 */

const LS_KEY_TITLE = "journal.title.v1";
const LS_KEY_BODY = "journal.body.v1";
const LS_KEY_LASTSAVED = "journal.lastsaved.v1";
const LS_KEY_PROMPTS_ON = "journal.promptsOn.v1";
const LS_KEY_ENTRIES = "journal.entries.v1"; // saved snapshots array

// Gentle, trauma-informed prompts
const PROMPTS = [
  "What is one thing you noticed today (something you saw, heard, felt, or experienced)?",
  "Name something that felt even slightly less difficult than yesterday. If nothing did, that's okay too.",
  "What do you need right now? (It's okay if you don't know or if it feels impossible.)",
  "If you're feeling stuck, what would you say to someone else who felt this way?",
  "Describe where you are right now using your five senses (what you see, hear, feel, smell, taste).",
  "What emotion is strongest right now? Where do you notice it in your body? (No need to change it, just notice.)",
  "What mattered to you today, even if it was very small?",
  "What is one boundary you want to set (or tried to set) recently?",
  "Today was _____ (fill in the blank with one word, any word).",
  "What do you wish someone understood about how you're feeling?",
];

export default function JournalPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [promptsOn, setPromptsOn] = useState(true);
  const [promptIndex, setPromptIndex] = useState(0);
  const [lastSavedTs, setLastSavedTs] = useState(null);

  // saved entries
  const [entries, setEntries] = useState([]);

  // Simple session timer
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);

  // Load from localStorage once
  useEffect(() => {
    try {
      const t = localStorage.getItem(LS_KEY_TITLE) || "";
      const b = localStorage.getItem(LS_KEY_BODY) || "";
      const ls = localStorage.getItem(LS_KEY_LASTSAVED);
      const po = localStorage.getItem(LS_KEY_PROMPTS_ON);
      const rawEntries = localStorage.getItem(LS_KEY_ENTRIES);

      setTitle(t);
      setBody(b);
      if (ls) setLastSavedTs(Number(ls));
      if (po === "false") setPromptsOn(false);
      if (rawEntries) {
        try {
          const parsed = JSON.parse(rawEntries);
          if (Array.isArray(parsed)) setEntries(parsed);
        } catch { /* ignore parse errors */ }
      }
    } catch {
      /* no-op */
    }
  }, []);

  // Autosave draft (debounced-ish)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(LS_KEY_TITLE, title);
        localStorage.setItem(LS_KEY_BODY, body);
        const now = Date.now();
        localStorage.setItem(LS_KEY_LASTSAVED, String(now));
        setLastSavedTs(now);
      } catch { /* no-op */ }
    }, 600);
    return () => clearTimeout(id);
  }, [title, body]);

  // Persist prompts toggle
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_PROMPTS_ON, String(promptsOn));
    } catch { /* no-op */ }
  }, [promptsOn]);

  // Persist saved entries
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY_ENTRIES, JSON.stringify(entries));
    } catch { /* no-op */ }
  }, [entries]);

  // Timer
  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
      return;
    }
    const loop = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setElapsed((e) => e + dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [running]);

  // Helpers
  const words = useMemo(() => {
    const w = body.trim().split(/\s+/).filter(Boolean);
    return w.length;
  }, [body]);

  const characters = body.length;

  function formatTs(ms) {
    const d = new Date(ms);
    return d.toLocaleString();
  }

  function insertTimestamp() {
    const stamp = `[${new Date().toLocaleString()}]`;
    setBody((b) => (b ? `${b}\n${stamp}\n` : `${stamp}\n`));
  }

  function exportTxt() {
    const blob = new Blob(
      [`${title ? title + "\n\n" : ""}${body}`],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fn = title ? title.replace(/[^\w\- ]+/g, "_").slice(0, 60) : "journal";
    a.download = `${fn || "journal"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function printEntry() {
    window.print();
  }

  function newPrompt() {
    setPromptIndex((i) => (i + 1) % PROMPTS.length);
  }

  function clearEntry() {
    if (!confirm("Clear the current draft? (Your saved entries will not be affected.)")) return;
    setTitle("");
    setBody("");
  }

  // Save current draft as a snapshot entry
  function saveSnapshot() {
    const trimmed = (title || body).trim();
    if (!trimmed) {
      alert("Write something to save.");
      return;
    }
    const now = Date.now();
    const entry = {
      id: now,
      ts: now,
      title: title.trim() || "Untitled",
      body,
      words: words,
    };
    setEntries((arr) => [entry, ...arr]);
    // keep draft as-is
  }

  // Delete single entry
  function deleteEntry(id) {
    if (!confirm("Delete this saved entry? This cannot be undone.")) return;
    setEntries((arr) => arr.filter((e) => e.id !== id));
  }

  // Delete all entries
  function deleteAll() {
    if (!entries.length) return;
    if (
      !confirm(
        "Delete ALL saved entries? This cannot be undone and only affects saved snapshots (not your current draft)."
      )
    )
      return;
    setEntries([]);
  }

  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60)
    .toString()
    .padStart(2, "0");

  return (
    <div className="page-container">
      <h2 className="section-title">Journal</h2>
      <p className="card-text" style={{ marginTop: -6 }}>
        A quiet, private space for writing. Your entries are saved only on this device.
        You can export or print anytime.
      </p>

      <div
        style={{
          backgroundColor: "#fff3cd",
          border: "2px solid #856404",
          borderRadius: 8,
          padding: 12,
          marginTop: 12,
          fontSize: 14,
          lineHeight: 1.5,
          color: "#856404",
        }}
      >
        <strong>If emotions become overwhelming while writing:</strong> It's okay to stop, close this page, 
        and use a grounding tool instead (like 5-4-3-2-1 or paced breathing). You can always come back later. 
        Writing about trauma without support can sometimes increase distress rather than relieve it.
      </div>

      <p className="journal-note">
        Use gentle prompts as optional cues to support reflection and grounding.
        Use them only if helpful. You can enable them by checking the
        {" "}"Show gentle prompts"{" "}box and disable them by unchecking the box.
      </p>

      <div className="panel" style={{ padding: 16 }}>
        <div className="form-row" style={{ alignItems: "center" }}>
          <label htmlFor="j-title">Title</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
            <input
              id="j-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="(optional)"
            />
            <div
              aria-label="Session timer"
              style={{
                alignSelf: "center",
                fontSize: 12,
                color: "#627e74",
                whiteSpace: "nowrap",
              }}
            >
              Session: {mins}:{secs}{" "}
              <button
                className="btn btn-ghost"
                onClick={() => setRunning((r) => !r)}
                style={{ padding: "6px 10px", marginLeft: 8 }}
              >
                {running ? "Pause" : "Start"} timer
              </button>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                (Optional - some find this helpful, others don't. Use only if it works for you.)
              </div>
            </div>
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="j-text">Journal text</label>
          <textarea
            id="j-text"
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Start writing..."
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#627e74",
            }}
          >
            <span>{words} words · {characters} characters</span>
            <span>
              {lastSavedTs ? `Last saved: ${formatTs(lastSavedTs)}` : "Not saved yet"}
            </span>
          </div>
        </div>

        {/* Prompts section */}
        <div className="panel" style={{ padding: 12, marginTop: 8 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={promptsOn}
              onChange={(e) => setPromptsOn(e.target.checked)}
            />
            Show gentle prompts
          </label>

          {promptsOn && (
            <>
              <p className="card-text" style={{ margin: "10px 0 8px" }}>
                {PROMPTS[promptIndex]}
              </p>
              <button className="btn" onClick={newPrompt}>New prompt</button>
            </>
          )}
        </div>

        {/* Actions for current draft */}
        <div className="controls-row" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={saveSnapshot}>Save</button>
          <button className="btn" onClick={insertTimestamp}>Insert timestamp</button>
          <button className="btn" onClick={exportTxt}>Export (.txt)</button>
          <button className="btn" onClick={printEntry}>Print</button>

          <div style={{ marginLeft: "auto" }}>
            <button className="btn btn-ghost" onClick={clearEntry}>Clear entry…</button>
          </div>
        </div>
      </div>

      {/* Saved entries list */}
      <div className="panel" style={{ padding: 16, marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h3 style={{ margin: 0, color: "#2f4f46", fontSize: 18 }}>Saved entries</h3>
          {!!entries.length && (
            <button className="btn btn-ghost" onClick={deleteAll}>Delete all…</button>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="card-text" style={{ margin: 0 }}>
            No saved entries yet. Write and press <strong>Save</strong> to store a snapshot here.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {entries.map((e) => (
              <li
                key={e.id}
                style={{
                  border: "1px solid #e7edea",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <div style={{ fontWeight: 600, color: "#2f4f46", flex: 1 }}>
                    {e.title || "Untitled"}
                  </div>
                  <div style={{ fontSize: 12, color: "#627e74" }}>
                    {formatTs(e.ts)} · {e.words ?? "-"} words
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 6,
                    color: "#516e64",
                    fontSize: 14,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {e.body.length > 220 ? e.body.slice(0, 220) + "…" : e.body}
                </div>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => deleteEntry(e.id)}>
                    Delete…
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer microcopy (privacy/scope) */}
      <div
        className="panel"
        style={{
          marginTop: 16,
          fontSize: 12,
          color: "#627e74",
          background: "#f6faf8",
        }}
      >
        <p style={{ margin: "4px 0" }}>
          <strong>Privacy:</strong> Entries are saved only on this device (local storage).
          Do not include personal identifiers or Protected Health Information (PHI).
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>Support:</strong> Journaling is for self-reflection and education and is
          <em> not</em> medical advice or therapy. If you're in crisis, call <strong>911</strong> (U.S.),
          dial or text <strong>988</strong>, or use your local emergency number.
        </p>
      </div>
    </div>
  );
}