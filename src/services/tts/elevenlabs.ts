export async function speakWithEleven(text: string, opts?: { voiceId?: string; endpoint?: string }) {
  const voiceId = opts?.voiceId;
  const endpoint = opts?.endpoint || "/api/tts/eleven";
  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId }),
    });
    if (!resp.ok) throw new Error(`TTS failed: ${resp.status}`);
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
    return {
      stop: () => {
        audio.pause();
        audio.currentTime = 0;
        URL.revokeObjectURL(url);
      },
      element: audio,
    } as const;
  } catch (e) {
    console.error("speakWithEleven error", e);
    return null;
  }
}

