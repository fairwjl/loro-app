// client/src/components/MusicPlayerBar.jsx
import React from "react";
import { useMusic } from "../contexts/MusicContext";

export default function MusicPlayerBar() {
 const { currentTrack, isPlaying, currentTime, duration, volume, loop, togglePlayPause, stop, seek, setVolume, setLoop } = useMusic();

  if (!currentTrack) return null;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        padding: "12px 24px",
        zIndex: 100,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Track Info */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: "500",
              color: "var(--text)",
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentTrack.title}
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentTrack.artist}
          </div>
        </div>

        {/* Controls & Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "300px" }}>
          {/* Buttons */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <button
              onClick={togglePlayPause}
              className="btn btn-primary"
              style={{ minWidth: "80px", padding: "6px 12px" }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button onClick={stop} className="btn" style={{ padding: "6px 12px" }} aria-label="Stop">
              Stop
            </button>
            <button 
  onClick={() => setLoop(!loop)} 
  className="btn" 
  style={{ 
    padding: "6px 12px",
    background: loop ? "var(--accent)" : "var(--surface-muted)",
    color: loop ? "white" : "var(--text)",
    border: loop ? "1px solid var(--accent)" : "1px solid var(--border)"
  }} 
  aria-label="Toggle loop"
  title={loop ? "Loop is on" : "Loop is off"}
>
  🔁 {loop ? "On" : "Off"}
</button>
          </div>

          {/* Progress Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", minWidth: "36px" }}>
              {formatTime(currentTime)}
            </span>
            <div
              style={{
                flex: 1,
                height: "6px",
                background: "var(--surface-muted)",
                borderRadius: "3px",
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percent = x / rect.width;
                seek(percent * duration);
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "var(--accent)",
                  transition: "width 0.1s linear",
                }}
              />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", minWidth: "36px" }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "120px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ flex: 1 }}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}