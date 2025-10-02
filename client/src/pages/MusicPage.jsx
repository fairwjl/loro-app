// client/src/pages/MusicPage.jsx
import React from "react";

/**
 * MusicPage — placeholder
 * Gentle, non-directive copy; no claims.
 * We’ll add 10-minute calming/bilateral tracks with a loop option later.
 */
export default function MusicPage() {
  return (
    <div className="page-container">
      <h2 className="section-title">Music</h2>
      <p className="card-text" style={{ marginTop: -6 }}>
        A calm space for supportive audio during breathing, meditation, or bilateral activities.
        You choose what helps. We’ll add options here that are gentle and steady.
      </p>

      <div className="panel" style={{ padding: 16, marginTop: 12 }}>
        <h3 className="card-title" style={{ marginTop: 0 }}>Coming soon</h3>
        <p className="card-text">
          We’re preparing 10-minute calming and bilateral tracks with a simple loop option, so you can
          listen longer without interruptions. Audio will be available for both desktop and mobile.
        </p>
        <p className="note" style={{ marginTop: 8 }}>
          This feature supports grounding and self-regulation. It is not medical advice or therapy.
          If you’re in crisis, call <strong>911</strong> (U.S.), dial or text <strong>988</strong>, or use your local emergency number.
        </p>
      </div>
    </div>
  );
}