import { useState } from 'react'
import Breathe from './components/Breathe'
import Calm from './components/Calm'
import Journal from './components/Journal'

export default function App() {
  const [tab, setTab] = useState('breathe')

  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">Loro</div>
        <nav className="tabs">
          <button className={tab==='breathe'?'active':''} onClick={()=>setTab('breathe')}>Breathe</button>
          <button className={tab==='calm'?'active':''} onClick={()=>setTab('calm')}>Calm</button>
          <button className={tab==='journal'?'active':''} onClick={()=>setTab('journal')}>Journal</button>
        </nav>
      </header>

      <main className="main">
        {tab==='breathe' && <Breathe />}
        {tab==='calm' && <Calm />}
        {tab==='journal' && <Journal />}
      </main>

      <footer className="footer">
        <small>Self-help prototype — not a replacement for therapy. In the U.S., dial 988 for crises.</small>
      </footer>
    </div>
  )
}