export default function Home() {
  return (
    <div className="page-section">
      <h1>Welcome to Your Safe Space</h1>
      <p>
        Loro provides evidence-based tools and gentle guidance to support your
        healing journey. Take your time, move at your pace, and know that
        you’re not alone.
      </p>

      <section className="card">
        <ul className="list">
          <li className="list-row"><a href="/breathing">Breathing</a></li>
          <li className="list-row"><a href="/bls">Bilateral Stimulation</a></li>
          <li className="list-row"><a href="/safety">Safety Plan</a></li>
          <li className="list-row"><a href="/journal">Journal</a></li>
          <li className="list-row"><a href="/mood">Mood Tracker</a></li>
        </ul>
      </section>
    </div>
  );
}