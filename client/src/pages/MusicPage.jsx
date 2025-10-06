// client/src/pages/MusicPage.jsx
import React from "react";
import { useMusic, TRACKS } from "../contexts/MusicContext";

export default function MusicPage() {
  const { currentTrack, isPlaying, unavailable, playTrack } = useMusic();

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="hero-gradient" style={{ marginBottom: "2rem" }}>
        <h1 className="hero-title">Music & Sound</h1>
        <p className="hero-subtitle">
          Calming audio to support grounding, breathing exercises, or quiet reflection.
          Choose what feels right for you in this moment.
        </p>
      </div>

      {/* Track List */}
      <section>
        <h2 className="section-heading">
          <span>Available Tracks</span>
        </h2>
        <p className="section-intro">
          Select a track to begin playing. Music will continue as you navigate through the app.
        </p>

        <div style={{ display: "grid", gap: "12px", marginTop: "1.5rem" }}>
          {TRACKS.map((track) => {
            const isActive = currentTrack?.id === track.id;
            const isUnavailable = !!unavailable[track.id];

            return (
              <div
                key={track.id}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  opacity: isUnavailable ? 0.5 : 1,
                  border: isActive ? "2px solid var(--accent)" : "1px solid var(--border)",
                  background: isActive ? "var(--accent-muted)" : "var(--surface)",
                }}
              >
                {/* Track Icon/Type */}
                <div
                  style={{
                    fontSize: "2rem",
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--surface-muted)",
                    borderRadius: "10px",
                  }}
                >
                  {track.type === "Ocean Sounds" && "🌊"}
                  {track.type === "Ambient" && "🌙"}
                  {track.type === "Meditation" && "🧘"}
                  {track.type === "Nature Sounds" && "🌲"}
                </div>

                {/* Track Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: "500",
                      color: "var(--text)",
                      fontSize: "1rem",
                      marginBottom: "4px",
                    }}
                  >
                    {track.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {track.artist} • {track.type}
                  </div>
                  {isUnavailable && (
                    <div className="note" style={{ marginTop: "4px", color: "#e53e3e" }}>
                      Track unavailable
                    </div>
                  )}
                  {isActive && isPlaying && (
                    <div style={{ marginTop: "4px", fontSize: "0.85rem", color: "var(--accent)" }}>
                      ▶ Now playing
                    </div>
                  )}
                </div>

                {/* Play Button */}
                {!isActive && (
                  <button
                    className="btn btn-primary"
                    onClick={() => !isUnavailable && playTrack(track)}
                    disabled={isUnavailable}
                    aria-label={`Play ${track.title}`}
                    style={{ minWidth: "80px" }}
                  >
                    Play
                  </button>
                )}
                {isActive && (
                  <div
                    style={{
                      padding: "8px 16px",
                      background: "var(--accent)",
                      color: "white",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    Playing
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Music Attribution */}
      <section style={{ marginTop: "3rem" }}>
        <div
          className="panel"
          style={{
            background: "var(--surface-muted)",
            padding: "1.5rem",
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "var(--text)",
              marginBottom: "1rem",
            }}
          >
            Music Credits
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
            All music provided by{" "}
            <a
              href="https://www.epidemicsound.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              Epidemic Sound
            </a>
          </p>
          <div style={{ display: "grid", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {TRACKS.map((track) => (
              <div key={track.id}>
                <strong style={{ color: "var(--text)" }}>{track.title}</strong> by {track.artist}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div
        className="panel"
        style={{
          marginTop: "2rem",
          fontSize: "0.875rem",
          color: "var(--text-muted)",
          background: "var(--surface-muted)",
        }}
      >
        <p style={{ margin: "4px 0" }}>
          This feature supports grounding and self-regulation. It isn't medical advice or therapy. If
          you're in crisis, call <strong>911</strong> (U.S.), dial or text <strong>988</strong>, or use
          your local emergency number.
        </p>
      </div>
    </div>
  );
}