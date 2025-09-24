import { useState } from "react";

export default function Journal() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");

  const reflect = async () => {
    const r = await fetch("http://localhost:8787/reflect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry: text }),
    });
    const data = await r.json();
    setReply(data.reflection || "Error");
  };

  return (
    <div className="page-section">
      <h2>Reflections</h2>
      <p>
        <p>
  A quiet space for reflections. Write freely, then
  receive gentle feedback grounded in supportive, evidence-informed
  guidance.
</p>
      </p>

      <section className="card">
        <textarea
          rows={8}
          placeholder="Write what's on your mind..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="actions">
          <button onClick={reflect} disabled={!text.trim()}>
            Reflect
          </button>
        </div>

        {reply && (
          <div className="reflection">
            <h3>Your Reflections</h3>
            <p>{reply}</p>
          </div>
        )}
      </section>
    </div>
  );
}