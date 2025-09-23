import { useState } from "react";

export default function SafetyPlan() {
  const [plan, setPlan] = useState("");

  return (
    <div className="page-section">
      <h2>Your Safety Plan</h2>
      <p>
        Create and keep a personalized plan with contacts, steps, and reminders
        to support you during difficult moments. Your plan is encrypted and
        stays on this device.
      </p>

      <section className="card">
        <textarea
          rows={8}
          placeholder="Write your safety plan..."
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        />
      </section>
    </div>
  );
}