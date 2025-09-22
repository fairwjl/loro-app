import { useEffect, useRef, useState } from 'react'

// Simple breathing coach with two modes: 6 bpm and cyclic sigh
export default function Breathe(){
  const [mode, setMode] = useState('six') // 'six' | 'sigh'
  const [phase, setPhase] = useState('Inhale')
  const circleRef = useRef(null)

  useEffect(()=>{
    let t
    if(mode==='six'){
      // Inhale 4s, Exhale 6s (≈6 breaths/min)
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
      <div className="mode-toggle">
        <button className={mode==='six'?'active':''} onClick={()=>setMode('six')}>6 bpm</button>
        <button className={mode==='sigh'?'active':''} onClick={()=>setMode('sigh')}>Cyclic Sigh</button>
      </div>

      <div className={`breath-circle ${phase.toLowerCase()}`} ref={circleRef}>
        <span>{phase}</span>
      </div>

      <ul className="micro-cues">
        <li>Unclench jaw; let teeth part; tongue rests gently on palate.</li>
        <li>Soften forehead and eyelids; let the <strong>back of the throat</strong> feel like it drops.</li>
        <li>Use a <strong>soft gaze</strong>; try a near–far focus once or twice, then rest your eyes.</li>
      </ul>
    </section>
  )
}