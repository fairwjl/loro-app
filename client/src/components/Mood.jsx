// client/src/components/Mood.jsx
import { loadJSON, saveJSON } from '../lib/storage.js';
import { useEffect, useMemo, useState } from 'react';

/**
 * Mood tracker with local persistence and a 7-day sparkline.
 * Fields per day: mood (1–5), arousal (1–5), sleepHours (0–12), notes.
 * Stored under key: loro:mood:entries  →  { 'YYYY-MM-DD': {mood, arousal, sleepHours, notes, ts} }
 */

const STORE_KEY = 'mood:entries';

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function isoDaysBack(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

// Tiny inline SVG sparkline (no deps)
function Sparkline({ values = [], width = 140, height = 36, strokeWidth = 2 }) {
  if (!values.length) {
    return <svg width={width} height={height} aria-label="sparkline" />;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const stepX = width / Math.max(1, values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / spread) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} aria-label="sparkline">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        points={points}
      />
    </svg>
  );
}

export default function Mood() {
  const [date, setDate] = useState(todayISO());
  const [entries, setEntries] = useState(() => loadJSON(STORE_KEY, {}));
  const [mood, setMood] = useState(3);
  const [arousal, setArousal] = useState(3);
  const [sleepHours, setSleepHours] = useState(7);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');

  // Load selected date if we already have data
  useEffect(() => {
    const e = entries[date];
    if (e) {
      setMood(e.mood ?? 3);
      setArousal(e.arousal ?? 3);
      setSleepHours(e.sleepHours ?? 7);
      setNotes(e.notes ?? '');
    } else {
      setMood(3); setArousal(3); setSleepHours(7); setNotes('');
    }
  }, [date, entries]);

  const onSave = () => {
    const trimmed = (notes || '').trim();
    const record = {
      mood: Number(mood),
      arousal: Number(arousal),
      sleepHours: Number(sleepHours),
      notes: trimmed,
      ts: Date.now(),
    };
    const next = { ...entries, [date]: record };
    setEntries(next);
    saveJSON(STORE_KEY, next);
    setMsg('Saved ✓');
    setTimeout(() => setMsg(''), 1200);
  };

  // Last 7 days (oldest → newest) for sparkline of mood
  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = isoDaysBack(i);
      const e = entries[d];
      days.push(e?.mood ?? null);
    }
    // Fill gaps by carrying forward nearest known value (basic smoothing)
    let last = 3;
    const filled = days.map(v => {
      if (v == null) return last;
      last = v;
      return v;
    });
    return filled;
  }, [entries]);

  // Recent list (up to 10)
  const recent = useMemo(() => {
    const rows = Object.entries(entries)
      .map(([d, e]) => ({ d, ...e }))
      .sort((a, b) => a.d.localeCompare(b.d))
      .reverse()
      .slice(0, 10);
    return rows;
  }, [entries]);

  // CSV export (90 or 365 days)
  const exportCSV = (days = 90) => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    const startISO = start.toISOString().slice(0, 10);
    const endISO = end.toISOString().slice(0, 10);

    const header = ['date', 'mood(1-5)', 'arousal(1-5)', 'sleepHours', 'notes'];
    const lines = [header.join(',')];

    const cur = new Date(start);
    while (cur <= end) {
      const d = cur.toISOString().slice(0, 10);
      const e = entries[d] || {};
      lines.push([
        d,
        e.mood ?? '',
        e.arousal ?? '',
        e.sleepHours ?? '',
        e.notes ? JSON.stringify(e.notes) : ''
      ].join(','));
      cur.setDate(cur.getDate() + 1);
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loro_mood_${startISO}_to_${endISO}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card">
      <h2>Mood Tracker</h2>

      <div style={{display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem'}}>
        <span className="muted">Last 7 days</span>
        <div style={{color:'var(--accent)'}}>
          <Sparkline values={last7} />
        </div>
      </div>

      <div className="form-grid">
        <label>
          Date
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </label>

        <label>
          Mood (1 = low, 5 = good)
          <input type="range" min="1" max="5" value={mood} onChange={e=>setMood(e.target.value)} />
          <div className="muted">Current: {mood}</div>
        </label>

        <label>
          Arousal (1 = calm, 5 = keyed up)
          <input type="range" min="1" max="5" value={arousal} onChange={e=>setArousal(e.target.value)} />
          <div className="muted">Current: {arousal}</div>
        </label>

        <label>
          Sleep (hours)
          <input type="number" min="0" max="12" step="0.5"
                 value={sleepHours} onChange={e=>setSleepHours(e.target.value)} />
        </label>

        <label style={{gridColumn:'1 / -1'}}>
          Notes
          <textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Triggers, context, wins…" />
        </label>
      </div>

      <div className="actions" style={{gap:'0.5rem', display:'flex', flexWrap:'wrap'}}>
        <button onClick={onSave}>Save</button>
        <button className="secondary" onClick={()=>exportCSV(90)}>Export CSV (90d)</button>
        <button className="secondary" onClick={()=>exportCSV(365)}>Export CSV (365d)</button>
      </div>

      {msg && <p className="muted">{msg}</p>}

      {!!recent.length && (
        <>
          <h3 style={{marginTop:'1rem'}}>Recent entries</h3>
          <div className="list">
            {recent.map(r => (
              <div key={r.d} className="list-row">
                <div className="muted" style={{minWidth:100}}>{r.d}</div>
                <div>Mood: <strong>{r.mood}</strong></div>
                <div>Arousal: <strong>{r.arousal}</strong></div>
                <div>Sleep: <strong>{r.sleepHours ?? '-'}</strong>h</div>
                {r.notes && <div className="muted" title={r.notes} style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:280}}>{r.notes}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}