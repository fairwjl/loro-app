import { useState, useEffect } from 'react'
import { encryptJSON, decryptJSON } from '../lib/crypto'   // ← TEMP: for quick passphrase test

const API = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// ---- TEMP TEST (you can delete this block after verifying) ----
async function testCrypto() {
  try {
    const data = { note: 'test entry' }
    const pass = 'abcd' // 4 characters (new minimum)
    const encrypted = await encryptJSON(data, pass)
    console.log('Encrypted OK:', encrypted)
    const decrypted = await decryptJSON(encrypted, pass)
    console.log('Decrypted OK:', decrypted)
  } catch (err) {
    console.error('Crypto test failed:', err)
  }
}
// ---------------------------------------------------------------

export default function Journal(){
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reply, setReply] = useState('')

  // TEMP: run the crypto test once on mount
  useEffect(() => {
    testCrypto() // ← TEMP: remove after you see "Encrypted OK" and "Decrypted OK" in the console
  }, [])

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