import { useEffect, useState } from 'react'

const KEY = 'loro:mood:v1'

export default function MoodCheckin(){
  const [entries, setEntries] = useState([])
  const [mood, setMood] = useState(5)
  const [arousal, setArousal] = useState(5)
  const [sleep, setSleep] = useState(5)
  const [notes, setNotes] = useState('')

  useEffect(()=>{
    const raw = localStorage.getItem(KEY)
    if(raw) setEntries(JSON.parse(raw))
  }, [])

  const persist = (list) => localStorage.setItem(KEY, JSON.stringify(list))

  const todayKey = new Date().toISOString().slice(0,10) // YYYY-MM-DD

  const save = () => {
    const record = { date: todayKey, mood: Number(mood), arousal: Number(arousal), sleep: Number(sleep), notes: notes.trim() }
    // replace today's if exists
    const rest = entries.filter(e => e.date !== todayKey)
    const next = [record, ...rest].sort((a,b)=> b.date.localeCompare(a.date)).slice(0,30)
    setEntries(next)
    persist(next)
    setNotes('')
  }

  return (
    <section className="card">
      <h2>Daily Check-in</h2>
      <div className="form-grid">
        <label>
          Mood (0–10)
          <input type="range" min="0" max="10" step="1" value={mood} onChange={e=>setMood(e.target.value)} />
          <div className="muted">{mood}</div>
        </label>
        <label>
          Arousal (0–10)
          <input type="range" min="0" max="10" step="1" value={arousal} onChange={e=>setArousal(e.target.value)} />
          <div className="muted">{arousal}</div>
        </label>
        <label>
          Sleep Quality (0–10)
          <input type="range" min="0" max="10" step="1" value={sleep} onChange={e=>setSleep(e.target.value)} />
          <div className="muted">{sleep}</div>
        </label>
        <label>
          Notes
          <textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Triggers, nightmares, avoidance, helpful tools…" />
        </label>
      </div>
      <div className="actions">
        <button onClick={save}>Save today</button>
      </div>

      <h3>Last 7 days</h3>
      <ul className="list">
        {entries.slice(0,7).map(e => (
          <li key={e.date}>
            <strong>{e.date}</strong> — mood {e.mood}/10, arousal {e.arousal}/10, sleep {e.sleep}/10
            {e.notes ? <div className="muted">{e.notes}</div> : null}
          </li>
        ))}
        {entries.length === 0 && <li className="muted">No entries yet.</li>}
      </ul>
    </section>
  )
}