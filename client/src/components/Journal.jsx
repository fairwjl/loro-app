import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export default function Journal(){
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reply, setReply] = useState('')

  const reflect = async () => {
    setLoading(true)
    setError('')
    setReply('')
    try {
      const r = await fetch(`${API}/reflect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry: text }),
      })
      if (!r.ok) {
        const msg = (await r.json().catch(()=>null))?.error || r.statusText
        throw new Error(msg || 'Request failed')
      }
      const data = await r.json()
      setReply(data.reflection || '')
    } catch (e) {
      console.error(e)
      setError(e.message || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card">
      <h2>Journal & Reflection</h2>
      <textarea
        rows={8}
        value={text}
        onChange={(e)=>setText(e.target.value)}
        placeholder="Write what's on your mind..."
      />
      <div className="actions">
        <button onClick={reflect} disabled={loading || !text.trim()}>
          {loading ? 'Reflecting…' : 'Reflect'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {reply && (
        <div className="reflection">
          <h3>Your Reflection</h3>
          <p>{reply}</p>
        </div>
      )}
    </section>
  )
}