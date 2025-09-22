import { useEffect, useState } from 'react'
import { encryptJSON, decryptJSON } from '../lib/crypto'

/**
 * Encrypted Safety Plan (local-only).
 * - Stores encrypted blob in localStorage under KEY
 * - Requires passphrase to unlock each session (not stored)
 * - All edits remain in memory until you Save → re-encrypt
 * - Enforces passphrase: at least 4 characters when creating a new plan
 */

const KEY = 'loro:safetyplan:v2:enc'

// A fresh empty plan (in-memory structure)
const emptyPlan = {
  triggers: '',
  warningSigns: '',
  copingSteps: '',
  contacts: '',
  safePlaces: '',
  medications: ''
}

export default function SafetyPlan(){
  const [locked, setLocked] = useState(true)
  const [pass, setPass] = useState('')
  const [plan, setPlan] = useState(emptyPlan)
  const [savedAt, setSavedAt] = useState(null)
  const [error, setError] = useState('')
  const [hasExistingBlob, setHasExistingBlob] = useState(false)

  // On mount, check if we have an encrypted blob
  useEffect(()=>{
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        JSON.parse(raw) // only checking shape
        setHasExistingBlob(true)
      } else {
        setHasExistingBlob(false)
      }
    } catch {
      // Corrupted blob - treat as none
      setHasExistingBlob(false)
    }
  }, [])

  // Attempt unlock with passphrase
  const unlock = async () => {
    setError('')
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) {
        // No stored plan → allow editing a fresh plan; require 4+ chars on save
        setPlan(emptyPlan)
        setLocked(false)
        setHasExistingBlob(false)
        return
      }
      const blob = JSON.parse(raw)
      const obj = await decryptJSON(blob, pass)
      setPlan(obj?.data || emptyPlan)
      setSavedAt(obj?.savedAt || null)
      setLocked(false)
    } catch (e) {
      console.error(e)
      setError('Unable to unlock. Check your passphrase and try again.')
    }
  }

  // Save (encrypt) the plan with the current passphrase
  const saveEncrypted = async () => {
    setError('')
    try {
      if (!pass || pass.length < 4) {
        setError('Passphrase must be at least 4 characters.')
        return
      }
      const payload = {
        data: plan,
        savedAt: new Date().toISOString()
      }
      const blob = await encryptJSON(payload, pass)
      localStorage.setItem(KEY, JSON.stringify(blob))
      setSavedAt(payload.savedAt)
      setHasExistingBlob(true)
    } catch (e) {
      console.error(e)
      setError('Save failed. Please try again.')
    }
  }

  // Change handler for fields
  const onChange = (e) => {
    const { name, value } = e.target
    setPlan(prev => ({ ...prev, [name]: value }))
  }

  // Lock again (forget passphrase from memory)
  const relock = () => {
    setPlan(emptyPlan)
    setPass('')
    setLocked(true)
  }

  // Completely wipe the saved encrypted blob
  const wipe = () => {
    if (!confirm('This will permanently delete your saved Safety Plan from this device. Continue?')) return
    localStorage.removeItem(KEY)
    setPlan(emptyPlan)
    setSavedAt(null)
    setHasExistingBlob(false)
    setPass('')
    setLocked(true)
  }

  // UI — Locked screen (enter passphrase or set a new one if no blob)
  if (locked) {
    return (
      <section className="card">
        <h2>Safety Plan (Encrypted)</h2>
        <p className="muted">
          Your safety plan is encrypted on this device. Enter your passphrase to unlock.
        </p>
        <label>
          Passphrase {hasExistingBlob ? '' : '(new — at least 4 characters)'}
          <input
            type="password"
            value={pass}
            onChange={e=>setPass(e.target.value)}
            placeholder={hasExistingBlob ? 'Enter passphrase to unlock' : 'Create a passphrase'}
          />
        </label>

        {/* Inline guidance if user is creating a new passphrase and it's too short */}
        {!hasExistingBlob && pass.length > 0 && pass.length < 4 && (
          <p className="error">Passphrase must be at least 4 characters.</p>
        )}

        <div className="actions" style={{gap: '0.5rem', display: 'flex', flexWrap: 'wrap'}}>
          {/* Keep button disabled + show message above for clearer UX */}
          <button onClick={unlock} disabled={!pass || pass.length < (hasExistingBlob ? 1 : 4)}>
            {hasExistingBlob ? 'Unlock' : 'Create & Unlock'}
          </button>
          {hasExistingBlob && <button className="secondary danger" onClick={wipe}>Delete Saved Plan</button>}
        </div>

        {/* Existing async error (e.g., wrong passphrase) */}
        {error && <p className="error">{error}</p>}

        <p className="note">
          Tip: Choose a passphrase you won’t forget. We don’t store or transmit it.
          If you lose it, the encrypted data cannot be recovered.
        </p>
      </section>
    )
  }

  // UI — Unlocked (edit + save re-encrypted)
  return (
    <section className="card">
      <h2>Safety Plan (Encrypted)</h2>
      <p className="muted">
        Your plan is currently <strong>unlocked in memory</strong>. It will be
        saved encrypted when you click <em>Save Encrypted</em>.
      </p>

      <div className="form-grid">
        <label>
          Triggers
          <textarea name="triggers" value={plan.triggers} onChange={onChange} rows={3} />
        </label>
        <label>
          Warning Signs
          <textarea name="warningSigns" value={plan.warningSigns} onChange={onChange} rows={3} />
        </label>
        <label>
          Coping Steps (first 3 steps are most important)
          <textarea name="copingSteps" value={plan.copingSteps} onChange={onChange} rows={4} />
        </label>
        <label>
          Trusted Contacts (names + numbers)
          <textarea name="contacts" value={plan.contacts} onChange={onChange} rows={3} />
        </label>
        <label>
          Safe Places (home/park/clinic)
          <textarea name="safePlaces" value={plan.safePlaces} onChange={onChange} rows={2} />
        </label>
        <label>
          Medications / Notes
          <textarea name="medications" value={plan.medications} onChange={onChange} rows={2} />
        </label>
      </div>

      <div className="actions" style={{gap: '0.5rem', display: 'flex', flexWrap: 'wrap'}}>
        <button onClick={saveEncrypted}>Save Encrypted</button>
        <button className="secondary" onClick={relock}>Lock</button>
        <button className="secondary danger" onClick={wipe}>Delete Saved Plan</button>
      </div>

      {savedAt && <p className="muted">Last saved: {new Date(savedAt).toLocaleString()}</p>}

      <p className="note">
        In the U.S., call or text <strong>988</strong> for crisis support. If you or someone is in immediate danger, call <strong>911</strong>.
      </p>

      <details style={{marginTop: '0.75rem'}}>
        <summary>Security notes</summary>
        <ul className="muted">
          <li>Encryption: AES-GCM (256-bit) with a key derived from your passphrase via PBKDF2 (SHA-256, 200k iterations).</li>
          <li>Your passphrase is never stored; we only keep it in memory while unlocked.</li>
          <li>If you forget your passphrase, the encrypted data cannot be recovered.</li>
        </ul>
      </details>
    </section>
  )
}