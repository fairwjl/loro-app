import { useEffect, useRef, useState } from 'react'
import Effectiveness from './Effectiveness'

export default function Breathe(){
  const [mode, setMode] = useState('six') // 'six' | 'sigh'
  const [phase, setPhase] = useState('Inhale')
  const circleRef = useRef(null)

  useEffect(()=>{
    let t
    if(mode==='six'){
      // Inhale 4s, Exhale 6s (≈6 bpm)
      const run = () => {
        setPhase('Inhale')
        t = setTimeout(()=>{
          setPhase('Exhale')
          t = setTimeout(run, 6000)
        }, 4000)
      }
      run()
    } else {
      // Cyclic sigh: short inhale, sip inhale, long exhale
      const run = () => {
        setPhase('Inhale')
        t = setTimeout(()=>{
          setPhase('Sip')
          t = setTimeout(()=>{
            setPhase('Exhale')
            t = setTimeout(run, 6000)
          }, 500)
        }, 1500)
      }
      run()
    }
    return ()=> clearTimeout(t)
  }, [mode])

  return (
    <section className="card">
      <h2>Breath Coach</h2>

      {/* BEFORE rating */}
      <Effectiveness id="breathe" phase="before" />

      <div className="mode-toggle">
        <button className={mode==='six'?'active':''} onClick={()=>setMode('six')}>6 bpm</button>
        <button className={mode==='sigh'?'active':''} onClick={()=>setMode('sigh')}>Cyclic Sigh</button>
      </div>

      <div className={`breath-circle ${phase.toLowerCase()}`} ref={circleRef}>
        <span>{phase}</span>
      </div>

      <ul className="micro-cues">
        <li>Unclench jaw; teeth part; tongue rests on palate.</li>
        <li>Soften forehead/eyelids; sense the <strong>back of the throat</strong> dropping.</li>
        <li>Soft gaze; one gentle near–far focus, then rest eyes.</li>
      </ul>

      {/* AFTER rating */}
      <Effectiveness id="breathe" phase="after" />
    </section>
  )
}