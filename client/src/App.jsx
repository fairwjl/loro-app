import { useState } from 'react'
import Breathe from './components/Breathe'
import Calm from './components/Calm'
import Journal from './components/Journal'
import SafetyPlan from './components/SafetyPlan'
import Reasons from './components/Reasons'
import MoodCheckin from './components/MoodCheckin'

const TABS = [
  { key: 'breathe', label: 'Breathe', component: Breathe },
  { key: 'calm', label: 'Calm', component: Calm },
  { key: 'journal', label: 'Journal', component: Journal },
  { key: 'mood', label: 'Mood', component: MoodCheckin },
  { key: 'reasons', label: 'Reasons', component: Reasons },
  { key: 'safety', label: 'Safety', component: SafetyPlan },
]

export default function App(){
  const [tab, setTab] = useState('breathe')
  const Active = TABS.find(t=>t.key===tab)?.component || Breathe

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Loro</div>
        <nav className="tabs">
          {TABS.map(t => (
            <button key={t.key} className={tab===t.key ? 'active' : ''} onClick={()=>setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="container">
        <Active />
      </main>

      <footer className="footer">
        <div>
          Crisis: In the U.S., call or text <strong>988</strong>. If in immediate danger, call <strong>911</strong>.
        </div>
      </footer>
    </div>
  )
}