// client/src/contexts/MusicContext.jsx
import React, { createContext, useContext, useRef, useState, useEffect } from "react";

export const TRACKS = [
  {
    id: "stone-beach-waves",
    title: "ASMR Stone Beach Waves",
    artist: "Joseph Beg",
    type: "Ocean Sounds",
    srcs: ["/audio/ES_ASMR Stone Beach Waves - Joseph Beg (Version 8a7e01fe) - fullmix_high_quality.mp3"],
  },
  {
    id: "ever-so-blue",
    title: "Ever So Blue",
    artist: "Calme",
    type: "Ambient",
    srcs: ["/audio/ES_Calme - Ever So Blue.mp3", "/audio/ES_Calme - Ever So Blue.wav"],
  },
  {
    id: "calming-crystals",
    title: "Calming Crystals",
    artist: "Rocket Noise",
    type: "Ambient",
    srcs: ["/audio/ES_Calming Crystals - Rocket Noise.mp3", "/audio/ES_Calming Crystals - Rocket Noise.wav"],
  },
  {
    id: "calming-horizons",
    title: "Calming Horizons",
    artist: "Staffan Carlen",
    type: "Ambient",
    srcs: ["/audio/ES_Calming Horizons - Staffan Carlen.mp3", "/audio/ES_Calming Horizons - Staffan Carlen.wav"],
  },
  {
    id: "raga-for-stillness",
    title: "Raga for Stillness",
    artist: "Aks & Lakshmi",
    type: "Meditation",
    srcs: ["/audio/ES_Raga for Stillness - Aks & Lakshmi.mp3", "/audio/ES_Raga for Stillness - Aks & Lakshmi.wav"],
  },
  {
    id: "walk-in-the-forest",
    title: "Walk in the Forest",
    artist: "Center of Attention",
    type: "Nature Sounds",
    srcs: ["/audio/ES_Walk in the Forest - Center of Attention.mp3", "/audio/ES_Walk in the Forest - Center of Attention.wav"],
  },
];

const MusicContext = createContext();

function pickPlayableSrc(audioEl, srcs) {
  const mimeByExt = (src) => {
    if (src.endsWith(".mp3")) return "audio/mpeg";
    if (src.endsWith(".ogg")) return "audio/ogg";
    if (src.endsWith(".wav")) return "audio/wav";
    return "";
  };
  for (const src of srcs || []) {
    const mime = mimeByExt(src);
    if (mime && audioEl.canPlayType(mime) !== "") return src;
  }
  return null;
}

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [loop, setLoop] = useState(false);
  const [unavailable, setUnavailable] = useState({});

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      if (currentTrack) {
        setUnavailable((prev) => ({ ...prev, [currentTrack.id]: true }));
      }
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loop;
    }
  }, [loop]);

  const playTrack = (track) => {
    const audio = audioRef.current;
    if (!audio) return;

    const src = pickPlayableSrc(audio, track.srcs);
    if (!src) {
      setUnavailable((prev) => ({ ...prev, [track.id]: true }));
      return;
    }

    setCurrentTrack(track);
    console.log("Attempting to play:", src);
    audio.src = src;
    audio.load();
    audio.play().catch(() => {
      setUnavailable((prev) => ({ ...prev, [track.id]: true }));
    });
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const seek = (time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
  };

  const value = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    loop,
    unavailable,
    playTrack,
    togglePlayPause,
    stop,
    seek,
    setVolume,
    setLoop,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within MusicProvider");
  }
  return context;
}
console.log("TRACKS exported:", TRACKS);