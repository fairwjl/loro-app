// client/src/App.jsx
import { useState } from 'react';

import Breathe from './components/Breathe.jsx';
import Calm from './components/Calm.jsx';
import Journal from './components/Journal.jsx';
import Reasons from './components/Reasons.jsx';
import SafetyPlan from './components/SafetyPlan.jsx';
import Effectiveness from './components/Effectiveness.jsx';
import Mood from './components/Mood.jsx'; // <-- new full-feature mood tracker

export default function App() {
  const [tab, setTab] = useState('breathe');

  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">Loro</div>
        <nav className="tabs">
          <button className={tab==='breathe'?'active':''} onClick={()=>setTab('breathe')}>Breathe</button>
          <button className={tab==='calm'?'active':''} onClick={()=>setTab('calm')}>Calm</button>
          <button className={tab==='journal'?'active':''} onClick={()=>setTab('journal')}>Journal</button>
          <button className={tab==='mood'?'active':''} onClick={()=>setTab('mood')}>Mood</button>
          <button className={tab==='reasons'?'active':''} onClick={()=>setTab('reasons')}>Reasons</button>
          <button className={tab==='safety'?'active':''} onClick={()=>setTab('safety')}>Safety</button>
          {/* Optional tools bucket */}
          <button className={tab==='effectiveness'?'active':''} onClick={()=>setTab('effectiveness')}>Effectiveness</button>
        </nav>
      </header>

      <main className="main">
        {tab==='breathe' && <Breathe />}
        {tab==='calm' && <Calm />}
        {tab==='journal' && <Journal />}
        {tab==='mood' && <Mood />}
        {tab==='reasons' && <Reasons />}
        {tab==='safety' && <SafetyPlan />}
        {tab==='effectiveness' && <Effectiveness />}
      </main>

      <footer className="footer">
        <small>
          Self-help prototype — not a replacement for therapy. In the U.S., dial 988 for crises.
        </small>
      </footer>
    </div>
  );
}