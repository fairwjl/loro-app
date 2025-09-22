import Effectiveness from './Effectiveness'

export default function Calm(){
  return (
    <section className="card">
      <h2>Grounding (5-4-3-2-1)</h2>

      {/* BEFORE rating */}
      <Effectiveness id="calm" phase="before" />

      <ol className="grounding">
        <li>5 things you can see</li>
        <li>4 things you can feel (chair, floor, clothing)</li>
        <li>3 things you can hear</li>
        <li>2 things you can smell</li>
        <li>1 thing you can taste or a slow sip of water</li>
      </ol>

      <h3>Quick Body Softeners</h3>
      <ul>
        <li>Jaw & Face: let cheeks/lips slacken; teeth apart.</li>
        <li>Forehead: smooth the brow; relax around the eyes.</li>
        <li>Eyes: soften your gaze; do one near–far shift, then rest.</li>
        <li>Throat: sense the back of the throat dropping down.</li>
      </ul>

      {/* AFTER rating */}
      <Effectiveness id="calm" phase="after" />

      <p className="note">
        Tip: If very activated, try a cool pack on the cheeks/forehead 
        for 10–30 seconds and return to slow exhale.
      </p>
    </section>
  )
}