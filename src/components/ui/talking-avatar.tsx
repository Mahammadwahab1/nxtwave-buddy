"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface TalkingAvatarProps {
  size?: number;
  isSpeaking?: boolean;
  text?: string;
  energy?: number; // 0..1
}

export const TalkingAvatar: React.FC<TalkingAvatarProps> = ({
  size = 120,
  isSpeaking = false,
  text,
  energy = 0.6,
}) => {
  const [isBlinking, setIsBlinking] = React.useState(false);
  const [mouthScale, setMouthScale] = React.useState(1);
  const blinkRef = React.useRef<number | null>(null);
  const mouthRef = React.useRef<number | null>(null);
  const [greetMounted, setGreetMounted] = React.useState(false);
  const [greetVisible, setGreetVisible] = React.useState(false);

  React.useEffect(() => {
    const schedule = () => {
      const delay = 800 + Math.random() * 2600;
      blinkRef.current = window.setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 140);
        schedule();
      }, delay);
    };
    schedule();
    return () => blinkRef.current && clearTimeout(blinkRef.current);
  }, []);

  React.useEffect(() => {
    if (!isSpeaking) {
      setMouthScale(1);
      if (mouthRef.current) clearTimeout(mouthRef.current);
      return;
    }
    const step = () => {
      const s = 0.8 + Math.random() * 0.4 * energy;
      setMouthScale(s);
      mouthRef.current = window.setTimeout(step, 100 + Math.random() * 120);
    };
    step();
    return () => mouthRef.current && clearTimeout(mouthRef.current);
  }, [isSpeaking, energy]);

  // One-time greeting bubble on first login
  React.useEffect(() => {
    try {
      const flagKey = "firstLoginShown";
      const shown = typeof window !== "undefined" && localStorage.getItem(flagKey) === "true";
      if (!shown) {
        setGreetMounted(true);
        setGreetVisible(true);
        // Optional: speak the greeting via Web Speech API (best-effort)
        try {
          const utterance = new SpeechSynthesisUtterance(
            "Hi, I am your voice agent, here to assist you with the next process."
          );
          window.speechSynthesis?.cancel();
          window.speechSynthesis?.speak(utterance);
        } catch {}
        const t = window.setTimeout(() => {
          setGreetVisible(false);
          window.setTimeout(() => {
            setGreetMounted(false);
            try { localStorage.setItem(flagKey, "true"); } catch {}
          }, 300);
        }, 4000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const breathe = {
    scale: [1, 1.02, 1],
    transition: { duration: 3, repeat: Infinity },
  };

  const bounce = isSpeaking
    ? { y: [0, -2, 0], transition: { duration: 0.6, repeat: Infinity } }
    : {};

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Minimal circular avatar with subtle speaking indicator */}
      <motion.div
        animate={isSpeaking ? bounce : breathe}
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Core disc */}
        <div
          className={
            isSpeaking
              ? "rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500 shadow-lg"
              : "rounded-full bg-gradient-to-br from-violet-500 to-sky-500 shadow"
          }
          style={{ width: size * 0.8, height: size * 0.8 }}
        />
        {/* Speaking pulse ring */}
        {isSpeaking && (
          <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-fuchsia-400/60 animate-ring-pulse" />
        )}
      </motion.div>

      {/* One-time first-login greeting bubble */}
      <AnimatePresence>
        {greetMounted && (
          <motion.div
            key="first-greeting"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: greetVisible ? 1 : 0, y: greetVisible ? 0 : -4 }}
            transition={{ duration: 0.25 }}
            className="absolute left-[calc(100%+8px)] bottom-8 max-w-[220px] rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow"
          >
            <span className="mr-1">👉</span>
            Hi, I am your voice agent, here to assist you with the next process.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TalkingAvatar;
