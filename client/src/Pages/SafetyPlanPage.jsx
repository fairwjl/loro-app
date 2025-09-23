// client/src/pages/SafetyPlanPage.jsx
import AppShell from "../ui/AppShell.jsx";
import SafetyPlan from "../components/SafetyPlan.jsx";

export default function SafetyPlanPage(){
  return (
    <AppShell
      title="Your Safety Plan"
      subtitle="Create a personalized safety plan with emergency contacts and meaningful reminders to support you through difficult moments."
    >
      <section className="card" style={{padding:20}}>
        {/* Your existing component (kept intact) */}
        <SafetyPlan />
      </section>

      <section className="card" style={{marginTop:20}}>
        <h3 style={{marginTop:0}}>Crisis Resources</h3>
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(3, minmax(0,1fr))",
          gap:16
        }}>
          <CrisisCard
            title="National Suicide Prevention Lifeline"
            line1="988"
            line2="24/7 free and confidential support"
          />
          <CrisisCard
            title="Crisis Text Line"
            line1="Text HOME to 741741"
            line2="Connect with a crisis counselor"
          />
          <CrisisCard
            title="PTSD Foundation"
            line1="ptsdfoundation.org"
            line2="Resources and support for trauma survivors"
          />
        </div>
      </section>
    </AppShell>
  );
}

function CrisisCard({ title, line1, line2 }){
  return (
    <div className="panel" style={{display:"grid", gap:6}}>
      <strong>{title}</strong>
      <div>{line1}</div>
      <div className="muted">{line2}</div>
    </div>
  );
}