// client/src/pages/BreathingPage.jsx
import AppShell from "../ui/AppShell.jsx";
import Breathe from "../components/Breathe.jsx";

export default function BreathingPage(){
  return (
    <AppShell
      title="Guided Breathing Exercises"
      subtitle="Find your center with personalized breathing techniques designed to calm your nervous system and restore inner peace."
      right={
        <div className="card" style={{position:"sticky", top:88, display:"grid", gap:12}}>
          <h3 style={{margin:"0 0 4px"}}>Popular Techniques</h3>
          <ul className="muted" style={{margin:0, paddingLeft:18, display:"grid", gap:6}}>
            <li>4-7-8 Technique — Inhale 4, Hold 7, Exhale 8</li>
            <li>Box Breathing — 4-second intervals</li>
            <li>Triangle Breathing — Inhale 4, Hold 4, Exhale 4</li>
          </ul>
          <hr />
          <p className="muted" style={{margin:0}}>
            Tip: Adjust settings to a comfortable pace. Discontinue if you feel light-headed.
          </p>
        </div>
      }
    >
      {/* Left column content */}
      <section className="card" style={{padding:20}}>
        {/* Your existing breathing widget (kept intact) */}
        <Breathe />
      </section>
    </AppShell>
  );
}