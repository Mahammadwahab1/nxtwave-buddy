export async function speakWithEleven(
  text: string,
  opts?: { voiceId?: string; endpoint?: string; model?: 'eleven_v3' | 'eleven_ttv_v3' }
) {
  const voiceId = opts?.voiceId;
  const endpoint = opts?.endpoint || "/api/tts/eleven";
  const model = opts?.model || 'eleven_v3';
  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId, model }),
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
