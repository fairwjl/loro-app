export default function BilateralPage() {
  return (
    <div>
      <h2>Bilateral Page</h2>
      <p>This is a placeholder page so the app can compile.</p>

      {/* Non-emergency & safety disclaimer for Bilateral Stimulation */}
      <section
        className="legal-disclaimer"
        role="note"
        aria-label="Bilateral stimulation safety disclaimer"
        style={{ marginTop: 16 }}
      >
        <p>
          <strong>Important:</strong> Bilateral stimulation exercises in this
          app are educational and <strong>not a substitute</strong> for EMDR,
          therapy, or medical advice. These tools may support calming or focus
          but are <strong>not treatment</strong> for trauma or mental health
          conditions.
        </p>
        <p className="note" style={{ marginTop: 8 }}>
          Stop if you feel overwhelmed, dizzy, or emotionally flooded. If you
          have a neurological or psychiatric condition (such as epilepsy, PTSD,
          or severe anxiety), consult a qualified professional before using
          bilateral stimulation. This app is <strong>not a crisis service</strong>.
          In an emergency, call <strong>911</strong> (U.S.) or your local
          emergency number.
        </p>
      </section>
    </div>
  );
}