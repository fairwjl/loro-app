// client/src/pages/BilateralPage.jsx
import AppShell from "../ui/AppShell.jsx";
import BLS from "../components/BLS.jsx";

export default function BilateralPage(){
  return (
    <AppShell
      title="Bilateral Stimulus"
      subtitle="Engage your mind and body with rhythmic bilateral stimulation. These exercises help process emotions and reduce stress through gentle, alternating movements that activate both sides of your brain."
      right={
        <div className="card" style={{position:"sticky", top:88}}>
          <h3 style={{marginTop:0}}>How to Use Bilateral Stimulus</h3>
          <div style={{display:"grid", gap:12}}>
            <div>
              <strong>Getting Started</strong>
              <ul className="muted" style={{margin: "6px 0 0", paddingLeft:18}}>
                <li>Find a comfortable, quiet space where you won’t be disturbed.</li>
                <li>Adjust the settings to match your comfort level.</li>
                <li>Focus on the moving stimulus with your eyes.</li>
                <li>Allow thoughts and feelings to come and go naturally.</li>
                <li>Start with 2–5 minutes and increase gradually.</li>
              </ul>
            </div>
            <div>
              <strong>Therapeutic Benefits</strong>
              <ul className="muted" style={{margin: "6px 0 0", paddingLeft:18}}>
                <li>Reduces intensity of difficult memories.</li>
                <li>Supports natural processing of trauma.</li>
                <li>Helps integrate thoughts and feelings.</li>
                <li>Creates a calming, meditative state.</li>
              </ul>
            </div>
          </div>
        </div>
      }
    >
      {/* Left column: your existing BLS tool exactly as is */}
      <section className="card" style={{padding:20}}>
        <BLS />
      </section>
    </AppShell>
  );
}