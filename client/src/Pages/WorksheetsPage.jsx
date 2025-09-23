// client/src/pages/WorksheetsPage.jsx
import AppShell from "../ui/AppShell.jsx";

export default function WorksheetsPage(){
  return (
    <AppShell
      title="Therapeutic Worksheets"
      subtitle="Structured exercises based on evidence-based practices to support your healing journey through CBT, CPT, and DBT techniques."
    >
      <div style={{display:"grid", gap:20}}>
        <div className="card" style={{display:"grid", gap:16}}>
          <div style={{display:"grid", gridTemplateColumns:"320px 1fr", gap:20}}>
            {/* Left: Filters / Progress */}
            <div className="panel" style={{display:"grid", gap:12}}>
              <label>
                Choose Therapy Type
                <select defaultValue="All">
                  <option>All Worksheets</option>
                  <option>CBT</option>
                  <option>CPT</option>
                  <option>DBT</option>
                  <option>Mindfulness</option>
                </select>
              </label>

              <div className="panel" style={{display:"grid", gap:8}}>
                <strong>Your Progress</strong>
                <div className="muted">Completed</div>
                <div className="muted">In Progress</div>
                <button className="secondary">Start New Worksheet</button>
              </div>
            </div>

            {/* Right: Available + Your Worksheets */}
            <div style={{display:"grid", gap:16}}>
              <section className="panel" style={{display:"grid", gap:12}}>
                <h3 style={{margin:"0 0 4px"}}>Available Worksheets</h3>

                <WorksheetTile
                  tag="Mindfulness"
                  title="Mindfulness Meditation Template"
                  blurb="Guides through a meditation practice to enhance focus."
                />

                <WorksheetTile
                  tag="Cognitive Behavioral"
                  title="CBT Worksheet for Thought Patterns"
                  blurb="Helps users identify and change negative thought patterns."
                />
              </section>

              <section className="panel" style={{display:"grid", gap:12}}>
                <h3 style={{margin:"0 0 4px"}}>Your Worksheets</h3>
                <WorksheetTile
                  tag="Cognitive Behavioral"
                  title="CBT Worksheet for Thought Patterns"
                  blurb="Realized distortions in thought process, aiming for positive reframing."
                  actions={<button>Continue Working</button>}
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function WorksheetTile({ tag, title, blurb, actions }){
  return (
    <div className="list-row" style={{alignItems:"flex-start"}}>
      <div style={{display:"grid", gap:4, flex:1, minWidth:0}}>
        <div className="muted" style={{fontSize:12}}>{tag}</div>
        <div style={{fontWeight:600}}>{title}</div>
        <div className="muted" style={{whiteSpace:"break-spaces"}}>{blurb}</div>
      </div>
      <div>{actions ?? <button className="secondary">Open</button>}</div>
    </div>
  );
}