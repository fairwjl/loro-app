import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f0f2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Hero Section */}
      <header style={{
        background: 'linear-gradient(135deg, #7ba59a 0%, #96b8ad 100%)',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center',
        borderRadius: '24px',
        margin: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '0.5rem',
            fontWeight: '300',
            letterSpacing: '0.5px'
          }}>
            Welcome to Loro
          </div>
          <p style={{
            fontSize: '1.125rem',
            lineHeight: '1.8',
            opacity: '0.95',
            fontWeight: '300',
            margin: '1rem 0 2rem 0'
          }}>
            A calm space for grounding, reflection, and self-support between sessions.
            Take what you need, when you need it.
          </p>
          
          {/* Crisis Access - Subtle but Present */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginTop: '2rem'
          }}>
            <strong>In crisis?</strong> Access your{' '}
            <Link to="/safety-plan" style={{
              color: 'white',
              textDecoration: 'underline',
              fontWeight: '500'
            }}>
              Safety Plan
            </Link>
            {' '}or call <strong>988</strong>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Section 1: Right Now I Need... */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '400',
            color: '#2d3748',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Right Now I Need...
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#718096',
            marginBottom: '2rem',
            fontSize: '0.95rem'
          }}>
            Tools for immediate calming and grounding
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            <ToolCard
              to="/breathing"
              icon="🌿"
              title="Breathing"
              description="Guided exercises to calm your nervous system and find your center."
              color="#7ba59a"
            />
            <ToolCard
              to="/bilateral"
              icon="🕊️"
              title="Bilateral Stimulation"
              description="Gentle exercises to help your brain process and settle."
              color="#8b9dc3"
            />
            <ToolCard
              to="/safety-plan"
              icon="🌟"
              title="Safety Plan"
              description="Your personalized plan for moments of crisis or overwhelm."
              color="#a8937e"
            />
          </div>
        </section>

        {/* Section 2: Track & Reflect */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '400',
            color: '#2d3748',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Track & Reflect
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#718096',
            marginBottom: '2rem',
            fontSize: '0.95rem'
          }}>
            Daily check-ins and journaling for self-awareness
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            <ToolCard
              to="/moods"
              icon="🌸"
              title="Mood Tracking"
              description="Track your daily mood, energy, and sleep patterns over time."
              color="#9c8aa5"
            />
            <ToolCard
              to="/symptoms"
              icon="🌱"
              title="Symptom Tracking"
              description="Monitor patterns in your symptoms to share with your therapist."
              color="#7ba59a"
            />
            <ToolCard
              to="/journal"
              icon="🪶"
              title="Journal & AI Reflection"
              description="Write freely and receive supportive reflections on your thoughts."
              color="#8b9dc3"
            />
          </div>
        </section>

        {/* Section 3: Process & Explore */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '400',
            color: '#2d3748',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Process & Explore
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#718096',
            marginBottom: '2rem',
            fontSize: '0.95rem'
          }}>
            Deeper work for insight and healing between sessions
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            <ToolCard
              to="/reflections"
              icon="🌊"
              title="Reflections"
              description="Guided prompts for exploring your experiences and growth."
              color="#a8937e"
            />
            <ToolCard
              to="/worksheets"
              icon="📖"
              title="Worksheets"
              description="Evidence-based exercises for working through challenges."
              color="#9c8aa5"
            />
            <ToolCard
              to="/music"
              icon="🎐"
              title="Music & Sound"
              description="Calming sounds and playlists to support regulation."
              color="#7ba59a"
            />
          </div>
        </section>

        {/* Gentle Reminder */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{
            color: '#4a5568',
            fontSize: '0.95rem',
            lineHeight: '1.7',
            margin: 0
          }}>
            <strong style={{ color: '#2d3748' }}>Reminder:</strong> These tools support your wellness,
            but they don't replace professional care. Use what feels helpful, and always reach out
            to your therapist or crisis support when you need more.
          </p>
        </div>
      </main>
    </div>
  );
}

// Reusable Tool Card Component
function ToolCard({ to, icon, title, description, color }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
        height: '100%',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }}>
        
        {/* Color Accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: color
        }} />
        
        {/* Icon */}
        <div style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          opacity: '0.9'
        }}>
          {icon}
        </div>
        
        {/* Title */}
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '500',
          color: '#2d3748',
          marginBottom: '0.75rem'
        }}>
          {title}
        </h3>
        
        {/* Description */}
        <p style={{
          color: '#718096',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          margin: 0
        }}>
          {description}
        </p>
      </div>
    </Link>
  );
}