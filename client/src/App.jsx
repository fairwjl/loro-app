// client/src/App.jsx
import { useState } from "react";
import Breathe from "./components/Breathe.jsx";
import Calm from "./components/Calm.jsx";
import Journal from "./components/Journal.jsx";
import Mood from "./components/Mood.jsx";
import Reasons from "./components/Reasons.jsx";
import SafetyPlan from "./components/SafetyPlan.jsx";
import Effectiveness from "./components/Effectiveness.jsx";
import Crisis from "./components/Crisis.jsx";
import Thoughts from "./components/Thoughts.jsx";
import Relax from "./components/Relax.jsx";
import BLS from "./components/BLS.jsx";
import "./styles.css";

export default function App(){
  const [tab, setTab] = useState("bls");

  const TABS = [
    { id:"relax",    label:"Relax",   comp:<Relax/> },
    { id:"bls",      label:"BLS",     comp:<BLS/> },
    { id:"breathe",  label:"Breathe", comp:<Breathe/> },
    { id:"calm",     label:"Calm",    comp:<Calm/> },
    { id:"journal",  label:"Journal", comp:<Journal/> },
    { id:"mood",     label:"Mood",    comp:<Mood/> },
    { id:"thoughts", label:"Thoughts",comp:<Thoughts/> },
    { id:"reasons",  label:"Reasons", comp:<Reasons/> },
    { id:"safety",   label:"Safety",  comp:<SafetyPlan/> },
    { id:"crisis",   label:"Crisis",  comp:<Crisis/> },
    { id:"effect",   label:"Effectiveness", comp:<Effectiveness/> },
  ];

  const active = TABS.find(t => t.id === tab) ?? TABS[0];

  return (
    <div className="app">
      <header className="header">
        <div className="brand-row">
          <span className="brand">
            <span className="brand-badge" aria-hidden="true"></span>
            Loro
          </span>
          <span className="kicker muted">Calm · Safety · Progress</span>
        </div>
        <nav className="tabs" aria-label="Primary">
          {TABS.map(t=>(
            <button
              key={t.id}
              className={`tab ${tab===t.id? "active":""}`}
              onClick={()=>setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="grid">
        <section className="card" style={{gridColumn:'1 / -1'}}>
          <h2>{active.label}</h2>
          <div className="muted" style={{marginBottom:12}}>
            {active.id==="relax"   && "Jaw/face slackening, throat drop, eye relaxation, convergence, and spotting."}
            {active.id==="bls"     && "Left–right visual sweep with optional audio panning and vibration."}
            {active.id==="breathe" && "Guided breathwork and down-regulation tools."}
            {active.id==="calm"    && "Quick parasympathetic activations and grounding."}
            {active.id==="journal" && "Reflect safely; AI reflections stay local unless you send them."}
            {active.id==="mood"    && "Daily check-ins with a simple sparkline and CSV export."}
            {active.id==="thoughts"&& "Challenge unhelpful thoughts and write a balanced reframe."}
            {active.id==="reasons" && "Keep reasons to live visible and close at hand."}
            {active.id==="safety"  && "Encrypted, local-only safety plan (lock to protect)."}
            {active.id==="crisis"  && "Immediate support options, grounding, and quick contacts."}
            {active.id==="effect"  && "Rate whether a tool lowered distress after use."}
          </div>
          {active.comp}
        </section>
      </main>

      <footer className="footer">
        Crisis: In the U.S., call or text <strong>988</strong>. If in immediate danger, call <strong>911</strong>.
      </footer>
    </div>
  );
}