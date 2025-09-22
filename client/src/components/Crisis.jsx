// client/src/components/Crisis.jsx
import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "../lib/storage.js";

/**
 * Crisis screen:
 * - Prominent 988 / 911 info (U.S. baseline)
 * - User-configurable quick contacts (name + phone)
 * - 5-4-3-2-1 grounding walkthrough
 * - 4-6-8 breath box
 */

const CONTACTS_KEY = "crisis:contacts";

function ContactRow({ idx, contact, onChange, onRemove }) {
  return (
    <div className="list-row" style={{flexWrap:'wrap'}}>
      <input
        placeholder="Name"
        value={contact.name}
        onChange={e => onChange(idx, { ...contact, name: e.target.value })}
        style={{maxWidth:180}}
      />
      <input
        placeholder="Phone (e.g., 555-123-4567)"
        value={contact.phone}
        onChange={e => onChange(idx, { ...contact, phone: e.target.value })}
        style={{maxWidth:220}}
      />
      <a
        className="secondary"
        style={{padding:'8px 12px', borderRadius:12, textDecoration:'none'}}
        href={contact.phone ? `tel:${contact.phone}` : '#'}
        onClick={e => !contact.phone && e.preventDefault()}
      >
        Call
      </a>
      <a
        className="secondary"
        style={{padding:'8px 12px', borderRadius:12, textDecoration:'none'}}
        href={contact.phone ? `sms:${contact.phone}` : '#'}
        onClick={e => !contact.phone && e.preventDefault()}
      >
        Text
      </a>
      <button className="secondary danger" onClick={() => onRemove(idx)}>Remove</button>
    </div>
  );
}

export default function Crisis() {
  const [contacts, setContacts] = useState(() => loadJSON(CONTACTS_KEY, [
    { name: "", phone: "" },
  ]));
  const [step, setStep] = useState(0); // grounding step

  useEffect(() => {
    saveJSON(CONTACTS_KEY, contacts);
  }, [contacts]);

  const addContact = () => setContacts(prev => [...prev, { name: "", phone: "" }]);
  const removeContact = (i) => setContacts(prev => prev.filter((_, idx) => idx !== i));
  const updateContact = (i, c) => setContacts(prev => prev.map((p, idx) => idx === i ? c : p));

  return (
    <div className="card">
      <div className="list" style={{marginBottom: 12}}>
        <div className="list-row" style={{justifyContent:'space-between'}}>
          <div>
            <strong>Immediate help (U.S.)</strong>
            <div className="muted">In danger? Call <strong>911</strong>.</div>
          </div>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <a className="secondary" href="tel:988" style={{padding:'10px 14px', borderRadius:12, textDecoration:'none'}}>Call 988</a>
            <a className="secondary" href="sms:988" style={{padding:'10px 14px', borderRadius:12, textDecoration:'none'}}>Text 988</a>
            <a className="secondary" href="https://988lifeline.org/chat/" target="_blank" rel="noreferrer" style={{padding:'10px 14px', borderRadius:12, textDecoration:'none'}}>Chat 988</a>
          </div>
        </div>
        <div className="muted" style={{marginTop:4}}>
          If outside the U.S., search local crisis lines or contact local emergency services.
        </div>
      </div>

      <h3>My quick contacts</h3>
      <div className="list">
        {contacts.map((c, i) => (
          <ContactRow
            key={i}
            idx={i}
            contact={c}
            onChange={updateContact}
            onRemove={removeContact}
          />
        ))}
        <button className="secondary" onClick={addContact}>Add contact</button>
      </div>

      <h3 style={{marginTop:16}}>Grounding: 5–4–3–2–1</h3>
      <div className="list">
        {[
          "Name 5 things you can see.",
          "Name 4 things you can touch.",
          "Name 3 things you can hear.",
          "Name 2 things you can smell.",
          "Name 1 thing you can taste.",
        ].map((text, i) => (
          <div key={i} className="list-row" style={{justifyContent:'space-between'}}>
            <div>{text}</div>
            <button
              className={step === i ? "" : "secondary"}
              onClick={() => setStep(i)}
              aria-pressed={step === i}
            >
              {step === i ? "Current" : "Go"}
            </button>
          </div>
        ))}
      </div>

      <h3 style={{marginTop:16}}>Breathing: 4–6–8</h3>
      <div className="list-row" style={{flexDirection:'column', alignItems:'stretch'}}>
        <div className="muted">Inhale 4 • Hold 6 • Exhale 8 (repeat 4–6 cycles)</div>
        <div
          aria-label="breath box"
          style={{
            marginTop:8,
            height: 18,
            background:'linear-gradient(90deg, rgba(34,211,238,.6), transparent)',
            borderRadius: 10,
            position:'relative',
            overflow:'hidden',
            border:'1px solid var(--border)'
          }}
        >
          {/* simple animated bar */}
          <div
            style={{
              position:'absolute',
              top:0, left:0, bottom:0,
              width:'35%',
              background:'var(--accent)',
              filter:'brightness(1.2)',
              borderRadius: 10,
              animation: 'breath-cycle 9s infinite ease-in-out'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes breath-cycle {
          0%   { width: 35%; }   /* inhale (expand 0-4s) */
          44%  { width: 100%; }
          66%  { width: 100%; }  /* hold (4-10s) */
          100% { width: 35%; }   /* exhale (10-18s mapped to 9s loop visually) */
        }
      `}</style>
    </div>
  );
}