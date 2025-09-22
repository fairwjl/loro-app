import { useState } from 'react'

export default function Journal(){
  const [text, setText] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [crisis, setCrisis] = useState(null)

  async function reflect(){
    setLoading(true); setError(''); setReply(''); setCrisis(null)
    try{
      const res = await fetch('http://localhost:8787/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || 'Request failed')
      setReply(data.reflection)
      setCrisis(data.crisis)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card">
      <h2>Journal & Reflection</h2>
      <textarea
        placeholder="Type a few words about what you feel or notice..."
        value={text}
        onChange={e=>setText(e.target.value)}
        rows={6}
      />
      <div className="actions">
        <button onClick={reflect} disabled={loading || text.trim().length<3}>
          {loading ? 'Reflecting…' : 'Reflect'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {reply && <div className="response"><p>{reply}</p></div>}
      {crisis && <div className="crisis">{crisis}</div>}
    </section>
  )
}