import { useEffect, useMemo, useState } from 'react'

/**
 * MoodCheckin with CSV export
 * - stores entries in localStorage under KEY
 * - supports Save today, Remove, and Export CSV of stored entries
 */

const KEY = 'loro:mood:v1'

function todayKey() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

function escapeCsvCell(cell) {
  if (cell == null) return ''
  const str = String(cell)
  // If cell contains comma, quote, newline -> wrap in quotes and escape quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function entriesToCsv(entries) {
  // columns
  const cols = ['date', 'mood', 'arousal', 'sleep', 'notes']
  const header = cols.join(',')
  // rows: ensure consistent order (desc by date)
  const rows = entries
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((e) => cols.map((c) => escapeCsvCell(e[c] ?? '')).join(','))
  return [header, ...rows].join('\n')
}

function downloadBlob(filename, content, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export default function MoodCheckin() {
  const [entries, setEntries] = useState([])
  const [mood, setMood] = useState(5)
  const [arousal, setArousal] = useState(5)
  const [sleep, setSleep] = useState(5)
  const [notes, setNotes] = useState('')
  const [savedAt, setSavedAt] = useState(null)

  // Load saved entries on mount
  useEffect(() => {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setEntries(parsed)
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  // Persist helper
  const persist = (list) => {
    localStorage.setItem(KEY, JSON.stringify(list))
  }

  // Save today's record (replace if exists)
  const saveToday = () => {
    const record = {
      date: todayKey(),
      mood: Number(mood),
      arousal: Number(arousal),
      sleep: Number(sleep),
      notes: notes.trim()
    }
    const rest = entries.filter(e => e.date !== record.date)
    const next = [record, ...rest].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 365)
    setEntries(next)
    persist(next)
    setNotes('')
    setSavedAt(new Date().toISOString())
  }

  // Delete a record
  const remove = (date) => {
    const next = entries.filter(e => e.date !== date)
    setEntries(next)
    persist(next)
  }

  // Export CSV of last N days (default N = 90)
  const exportCsv = (opts = {}) => {
    const { lastNDays = 90 } = opts
    // filter entries to lastNDays by date
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - lastNDays + 1)
    const cutoffKey = cutoff.toISOString().slice(0, 10)
    const filtered = entries.filter(e => e.date >= cutoffKey)
    const csv = entriesToCsv(filtered)
    const today = new Date().toISOString().slice(0,10)
    const filename = `loro-mood-${today}.csv`
    downloadBlob(filename, csv)
  }

  // Build last 7 days array sorted ascending for the sparkline
  const last7Asc = useMemo(() => {
    const last7 = [...entries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7)
      .sort((a, b) => a.date.localeCompare(b.date))
    return last7
  }, [entries])

  // Sparkline points (0–10 mapped to viewBox height)
  const sparkPoints = useMemo(() => {
    const w = 140
    const h = 40
    if (last7Asc.length === 0) return { w, h, d: '' }
    const step = last7Asc.length > 1 ? w / (last7Asc.length - 1) : 0
    const yScale = (val) => h - (val / 10) * h

    const pts = last7Asc.map((e, i) => `${i * step},${yScale(e.mood ?? 0)}`).join(' ')
    return { w, h, d: pts }
  }, [last7Asc])

  return (
    <section className="card">
      <h2>Daily Check-in</h2>
      <p className="muted">
        Log mood, arousal, sleep, and quick notes. We’ll keep recent data locally on your device.
      </p>

      <div className="form-grid">
        <label>
          Mood (0–10)
          <input type="range" min="0" max="10" step="1" value={mood} onChange={e => setMood(e.target.value)} />
          <div className="muted">{mood}</div>
        </label>
        <label>
          Arousal (0–10)
          <input type="range" min="0" max="10" step="1" value={arousal} onChange={e => setArousal(e.target.value)} />
          <div className="muted">{arousal}</div>
        </label>
        <label>
          Sleep Quality (0–10)
          <input type="range" min="0" max="10" step="1" value={sleep} onChange={e => setSleep(e.target.value)} />
          <div className="muted">{sleep}</div>
        </label>
        <label>
          Notes
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Triggers, nightmares, avoidance, what helped…"
          />
        </label>
      </div>

      <div className="actions" style={{gap: '0.5rem', display: 'flex', flexWrap: 'wrap'}}>
        <button onClick={saveToday}>Save today</button>
        <button onClick={() => exportCsv({ lastNDays: 365 })} className="secondary">Export CSV (365 days)</button>
        <button onClick={() => exportCsv({ lastNDays: 90 })} className="secondary">Export CSV (90 days)</button>
      </div>

      {savedAt && (
        <p className="muted">
          Saved at {new Date(savedAt).toLocaleString()}
        </p>
      )}

      <div className="sparkline-card">
        <div className="sparkline-head">
          <strong>Last 7 days — mood</strong>
          <span className="muted">0 → 10</span>
        </div>
        <svg className="sparkline" viewBox={`0 0 ${sparkPoints.w} ${sparkPoints.h}`} preserveAspectRatio="none" role="img" aria-label="Mood last 7 days">
          <polyline fill="none" stroke="currentColor" strokeWidth="2" points={sparkPoints.d} />
        </svg>
        <div className="sparkline-labels">
          {last7Asc.map(e => (
            <span key={e.date}>{e.date.slice(5)}</span>
          ))}
        </div>
      </div>

      <h3>Entries</h3>
      <ul className="list">
        {entries.slice(0, 7).map(e => (
          <li key={e.date}>
            <div className="row">
              <strong>{e.date}</strong>
              <button className="link danger" onClick={() => remove(e.date)}>Remove</button>
            </div>
            <div>mood <strong>{e.mood}</strong> / arousal <strong>{e.arousal}</strong> / sleep <strong>{e.sleep}</strong></div>
            {e.notes ? <div className="muted">{e.notes}</div> : null}
          </li>
        ))}
        {entries.length === 0 && <li className="muted">No entries yet.</li>}
      </ul>
    </section>
  )
}