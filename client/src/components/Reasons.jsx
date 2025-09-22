import { useEffect, useState } from 'react'

const KEY = 'loro:reasons:v1'

export default function Reasons(){
  const [reasons, setReasons] = useState([])
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(()=>{
    const raw = localStorage.getItem(KEY)
    if(raw) setReasons(JSON.parse(raw))
  }, [])

  const persist = (list) => localStorage.setItem(KEY, JSON.stringify(list))

  const add = () => {
    if(!text.trim() && !imageUrl.trim()) return
    const item = { id: crypto.randomUUID(), text: text.trim(), imageUrl: imageUrl.trim(), ts: Date.now() }
    const next = [item, ...reasons]
    setReasons(next)
    persist(next)
    setText('')
    setImageUrl('')
  }

  const removeItem = (id) => {
    const next = reasons.filter(r => r.id !== id)
    setReasons(next)
    persist(next)
  }

  return (
    <section className="card">
      <h2>Reasons to Live</h2>
      <div className="form-grid">
        <label>
          Reason (short text)
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="e.g., My dog waits for me every morning" />
        </label>
        <label>
          (Optional) Image URL
          <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://…" />
        </label>
      </div>
      <div className="actions">
        <button onClick={add}>Add</button>
      </div>

      <div className="reasons-grid">
        {reasons.length === 0 && <p className="muted">Add a few items that remind you why you want to stay safe.</p>}
        {reasons.map(r => (
          <div key={r.id} className="reason-card">
            {r.imageUrl && <img src={r.imageUrl} alt="" />}
            {r.text && <p>{r.text}</p>}
            <button className="link danger" onClick={()=>removeItem(r.id)}>Remove</button>
          </div>
        ))}
      </div>
    </section>
  )
}