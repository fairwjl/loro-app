// client/src/components/Relax.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { loadJSON, saveJSON } from "../lib/storage.js";

/**
 * Somatic Face & Eye Relaxation
 * - Jaw/face slackening + back-of-throat drop
 * - Extraocular muscle relaxation scan (eyes: L/R/Up/Down + soft blinking)
 * - Convergence drill (near/far focusing with fingertip or card)
 * - Gaze spotting (fix a neutral/pleasant point in room)
 * - Resource spotting (list calming items/places to glance at)
 * - Optional SUDS before/after logging to Effectiveness dashboard
 *
 * Local storage keys:
 *   relax:resources  : string[] (user saved resources)
 *   effect:sessions  : (from Effectiveness) append SUDS logs here
 */

const RES_KEY = "relax:resources";
const EFFECT_KEY = "effect:sessions";

// -------- small helpers --------
function useInterval(callback, delay, enabled = true) {
  const saved = useRef(callback);
  useEffect(() => { saved.current = callback; }, [callback]);
  useEffect(() => {
    if (!enabled || delay == null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay, enabled]);
}

function round1(n) {
  return Math.round((Number(n) + Number.EPSILON) * 10) / 10;
}

// A simple step header with subtext
function StepHeader({ title, desc }) {
  return (
    <div style={{marginBottom:10}}>
      <h3 style={{margin:'6px 0 2px'}}>{title}</h3>
      {desc && <div className="muted">{desc}</div>}
    </div>
  );
}

export default function Relax(){
  const [before, setBefore] = useState(6);
  const [after, setAfter]   = useState(3);
  const [logMsg, setLogMsg] = useState("");

  // flow state
  const [step, setStep] = useState(0); // 0..4
  const [seconds, setSeconds] = useState(0);

  // convergence drill state
  const [convergenceSecs, setConvergenceSecs] = useState(60); // total time target
  const [nearFar, setNearFar] = useState("near"); // toggles every few seconds
  const [cycleSec, setCycleSec] = useState(0);

  // gaze spotting
  const [spotSecs, setSpotSecs] = useState(45);
  const [spotElapsed, setSpotElapsed] = useState(0);

  // resource spotting
  const [resources, setResources] = useState(()=>loadJSON(RES_KEY, []));
  const [newRes, setNewRes] = useState("");

  // timers
  useInterval(()=>{
    setSeconds(s=>s+1);
  }, 1000, true);

  // convergence oscillation: swap near/far every 5 seconds
  useInterval(()=>{
    if (step !== 2) return;
    setCycleSec(s=>{
      const nxt = s + 1;
      if (nxt % 5 === 0) setNearFar(prev => prev === "near" ? "far" : "near");
      return nxt;
    });
  }, 1000, step === 2);

  // gaze spotting countdown
  useInterval(()=>{
    if (step !== 3) return;
    setSpotElapsed(e => Math.min(spotSecs, e + 1));
  }, 1000, step === 3);

  useEffect(()=>{ saveJSON(RES_KEY, resources); }, [resources]);

  const resetFlow = () => {
    setStep(0);
    setSeconds(0);
    setCycleSec(0);
    setNearFar("near");
    setSpotElapsed(0);
  };

  const completeAndLog = () => {
    const b = Number(before);
    const a = Number(after);
    const delta = b - a;
    const now = new Date();
    const row = {
      tool: "Somatic Relax",
      before: b,
      after: a,
      delta,
      notes: "Face/eyes relaxation sequence",
      dateISO: now.toISOString().slice(0,10),
      ts: now.getTime(),
      origin: "manual",
    };
    const cur = loadJSON(EFFECT_KEY, []);
    const next = [row, ...cur].slice(0, 1000);
    saveJSON(EFFECT_KEY, next);
    setLogMsg("Logged to Effectiveness ✓");
    setTimeout(()=>setLogMsg(""), 1100);
  };

  const totalMins = useMemo(()=>{
    // quick estimate of total practice duration
    // Step0 (jaw/face): ~90s, Step1 (extraocular): ~60s, Step2 (convergence): user-config,
    // Step3 (gaze): user-config, Step4 (resources): open-ended
    return Math.ceil((90 + 60 + convergenceSecs + spotSecs) / 60);
  }, [convergenceSecs, spotSecs]);

  return (
    <section className="card">
      <h2>Somatic Relax</h2>
      <div className="muted" style={{marginBottom:8}}>
        Guided jaw/face slackening, back-of-throat drop, eye muscle relaxation, convergence, and spotting.
      </div>

      {/* SUDS quick log */}
      <div className="form-grid" style={{marginBottom:10}}>
        <label>
          SUDS before (0–10)
          <input type="range" min="0" max="10" value={before} onChange={e=>setBefore(e.target.value)} />
          <div className="muted">Current: {before}</div>
        </label>
        <label>
          SUDS after (0–10)
          <input type="range" min="0" max="10" value={after} onChange={e=>setAfter(e.target.value)} />
          <div className="muted">Current: {after} (Δ {round1(before - after)})</div>
        </label>
      </div>
      <div className="actions" style={{gap:8, marginBottom:10}}>
        <button onClick={completeAndLog}>Save to Effectiveness</button>
        {logMsg && <span className="muted">{logMsg}</span>}
      </div>

      {/* Step nav */}
      <div className="list-row" style={{justifyContent:'space-between', flexWrap:'wrap'}}>
        <div className="muted">Elapsed: {seconds}s • Est. total ~ {totalMins} min</div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {[0,1,2,3,4].map(i=>(
            <button key={i} className={`secondary ${step===i?'':''}`} onClick={()=>{setStep(i); setSeconds(0);}}>
              {i+1}
            </button>
          ))}
          <button className="secondary" onClick={resetFlow}>Reset</button>
        </div>
      </div>

      {/* STEP 1 */}
      {step === 0 && (
        <div style={{marginTop:12}}>
          <StepHeader
            title="Jaw / Face Slackening + Back-of-Throat Drop"
            desc="Unclench jaw; let tongue rest heavy at floor of mouth; soften soft palate so the back of the throat feels like it’s ‘dropping’ or widening."
          />
          <ol className="muted" style={{marginTop:6}}>
            <li>Unhinge the jaw slightly. Lips touch softly. Imagine the lower jaw floating.</li>
            <li>Let the tongue go heavy at the floor of the mouth. Tip behind lower teeth.</li>
            <li>Invite the soft palate to soften; feel the back of the throat widen and ‘drop.’</li>
            <li>Let cheeks, eyelids, and brow soften. Forehead smooths; scalp releases.</li>
            <li>Take 3–4 slow breaths: inhale through nose ⟶ exhale longer than inhale.</li>
          </ol>
          <div className="note" style={{marginTop:8}}>
            Tip: Slight nasal breathing with longer exhale supports vagal down-regulation.
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 1 && (
        <div style={{marginTop:12}}>
          <StepHeader
            title="Extraocular Relaxation Scan"
            desc="Keep face slack. Move eyes slowly to each direction, then let them float center with soft blinking."
          />
          <ol className="muted" style={{marginTop:6}}>
            <li>Gently look left → pause 2–3s → return to center (no strain).</li>
            <li>Gently look right → pause → center.</li>
            <li>Gently look up → pause → center. Then look down → pause → center.</li>
            <li>Let eyes ‘float’ slightly below the horizon; blink softly 5–10 times.</li>
            <li>Notice any spread of warmth or weight through face, jaw, shoulders.</li>
          </ol>
        </div>
      )}

      {/* STEP 3 */}
      {step === 2 && (
        <div style={{marginTop:12}}>
          <StepHeader
            title="Convergence Drill (near / far)"
            desc="Use your fingertip or a card: alternate gently between a near point (~6–10 in) and a far point (across the room)."
          />
          <div className="form-grid" style={{marginTop:6}}>
            <label>
              Duration target (seconds)
              <input type="range" min="30" max="180" value={convergenceSecs} onChange={e=>setConvergenceSecs(e.target.value)} />
              <div className="muted">Target: {convergenceSecs}s</div>
            </label>
          </div>
          <div className="list-row" style={{justifyContent:'space-between', alignItems:'center', marginTop:6}}>
            <div>
              <div><strong>Now: {nearFar === "near" ? "Near focus" : "Far focus"}</strong></div>
              <div className="muted">It will toggle automatically about every 5 seconds.</div>
            </div>
            <div className="muted">Cycle: {cycleSec}s</div>
          </div>
          <ol className="muted" style={{marginTop:6}}>
            <li>Hold a fingertip/card at a comfortable near distance (no eye strain).</li>
            <li>Shift focus to the far point (e.g., wall picture) when prompted.</li>
            <li>Keep face, jaw, and breath relaxed. Exhale longer than inhale.</li>
          </ol>
          <div className="note" style={{marginTop:8}}>
            Stop if you get eye strain or dizziness. Small amounts, often, are best.
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 3 && (
        <div style={{marginTop:12}}>
          <StepHeader
            title="Gaze Spotting"
            desc="Pick a neutral or pleasant point in the room. Hold a soft gaze with relaxed breathing."
          />
          <div className="form-grid">
            <label>
              Duration (seconds)
              <input type="range" min="20" max="120" value={spotSecs} onChange={e=>{ setSpotSecs(e.target.value); setSpotElapsed(0); }} />
              <div className="muted">Target: {spotSecs}s • Elapsed: {spotElapsed}s</div>
            </label>
          </div>
          <div className="list-row" style={{flexDirection:'column', alignItems:'flex-start', marginTop:6}}>
            <div>Let the gaze be soft; breathe slowly; let jaw and tongue stay heavy.</div>
            <div className="muted">If attention drifts, name one thing you see/hear and return.</div>
          </div>
        </div>
      )}

      {/* STEP 5 */}
      {step === 4 && (
        <div style={{marginTop:12}}>
          <StepHeader
            title="Resource Spotting"
            desc="List a few items, places, or images that feel steadying. Glance at one when you need it."
          />
          <div className="list" style={{marginTop:6}}>
            <div className="list-row" style={{gap:8, flexWrap:'wrap'}}>
              <input
                placeholder="e.g., warm mug, favorite tree, a calm photo"
                value={newRes}
                onChange={e=>setNewRes(e.target.value)}
                style={{flex:'1 1 280px'}}
              />
              <button className="secondary" onClick={()=>{
                const t = (newRes||"").trim();
                if (!t) return;
                setResources(prev => [t, ...prev].slice(0,50));
                setNewRes("");
              }}>Add</button>
            </div>

            {resources.length > 0 && (
              <div className="list" style={{marginTop:6}}>
                {resources.map((r,i)=>(
                  <div key={i} className="list-row" style={{justifyContent:'space-between', gap:10}}>
                    <div className="muted" style={{maxWidth:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={r}>
                      {r}
                    </div>
                    <div style={{display:'flex', gap:8}}>
                      <button onClick={()=>{ /* no-op; glance cue */ }}>Glance</button>
                      <button className="secondary danger" onClick={()=>{
                        setResources(prev => prev.filter((_,idx)=>idx!==i));
                      }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="note" style={{marginTop:8}}>
            Keep 2–3 “go-to” resources near your workspace or photos on your phone.
          </div>
        </div>
      )}
    </section>
  );
}