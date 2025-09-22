import { useEffect, useState } from 'react'

const KEY = 'loro:safetyplan:v1'

export default function SafetyPlan(){
  const [data, setData] = useState({
    triggers: '',
    warningSigns: '',
    copingSteps: '',
    contacts: '',
    safePlaces: '',
    medications: ''
  })
  const [savedAt, setSavedAt] = useState(null)

  useEffect(()=>{
    const raw = localStorage.getItem(KEY)
    if(raw){
      const parsed = JSON.parse(raw)
      setData(parsed.data || data)
      setSavedAt(parsed.savedAt || null)
    }
    // eslint-disable-next-line
  }, [])

  const save = () => {
    const payload = { data, savedAt: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify(payload))
    setSavedAt(payload.savedAt)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setData(prev => ({ ...prev, [name]: value }))
  }

  const printPlan = () => window.print()

  return (
    <section className="card">
      <h2>Safety Plan</h2>
      <p className="muted">
        Create a personal action plan you can follow during difficult moments.
      </p>

      <div className="form-grid">
        <label>
          Triggers
          <textarea name="triggers" value={data.triggers} onChange={onChange} rows={3} />
        </label>
        <label>
          Warning Signs
          <textarea name="warningSigns" value={data.warningSigns} onChange={onChange} rows={3} />
        </label>
        <label>
          Coping Steps (first 3 steps are most important)
          <textarea name="copingSteps" value={data.copingSteps} onChange={onChange} rows={4} />
        </label>
        <label>
          Trusted Contacts (names + numbers)
          <textarea name="contacts" value={data.contacts} onChange={onChange} rows={3} />
        </label>
        <label>
          Safe Places (home/park/clinic)
          <textarea name="safePlaces" value={data.safePlaces} onChange={onChange} rows={2} />
        </label>
        <label>
          Medications / Notes
          <textarea name="medications" value={data.medications} onChange={onChange} rows={2} />
        </label>
      </div>

      <div className="actions">
        <button onClick={save}>Save</button>
        <button onClick={printPlan} className="secondary">Print</button>
      </div>

      {savedAt && <p className="muted">Last saved: {new Date(savedAt).toLocaleString()}</p>}

      <p className="note">
        In the U.S., call or text <strong>988</strong> for crisis support. If you or someone is in immediate danger, call <strong>911</strong>.
      </p>
    </section>
  )
}