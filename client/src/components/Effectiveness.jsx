import { useState, useEffect } from 'react'

/**
 * Effectiveness (SUDS) micro-rating: 0 (no distress) → 10 (max distress)
 * Props:
 * - id: string (unique per tool e.g., "breathe", "calm")
 * - phase: "before" | "after"
 */
export default function Effectiveness({ id, phase }) {
  const storageKey = `loro:suds:${id}:${phase}`
  const [value, setValue] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved !== null) setValue(saved)
  }, [storageKey])

  const handleChange = (e) => {
    const v = e.target.value
    setValue(v)
    localStorage.setItem(storageKey, v)
    // also store a log entry for trend charts later
    const logKey = `loro:suds:log`
    const now = new Date().toISOString()
    const entry = { id, phase, value: Number(v), ts: now }
    const prev = JSON.parse(localStorage.getItem(logKey) || '[]')
    localStorage.setItem(logKey, JSON.stringify([...prev, entry]))
  }

  return (
    <div className="effectiveness">
      <label className="effectiveness-label">
        SUDS {phase === 'before' ? '(before)' : '(after)'} — 0–10:
      </label>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={value || 0}
        onChange={handleChange}
        aria-label={`SUDS ${phase}`}
      />
      <div className="effectiveness-value">{value === '' ? '—' : value}</div>
    </div>
  )
}