export async function speakWithEleven(
  text: string,
  opts?: { voiceId?: string; endpoint?: string; model?: 'eleven_turbo_v2' | 'eleven_v3' | 'eleven_ttv_v3' }
) {
  const voiceId = opts?.voiceId;
  const endpoint = opts?.endpoint || "/api/tts/eleven";
  const model = opts?.model || 'eleven_turbo_v2';
  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId, model }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      throw new Error(`TTS ${resp.status}: ${body || "server error"}`);
    }
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    try {
      await audio.play();
    } catch (e: any) {
      URL.revokeObjectURL(url);
      throw new Error(e?.message || 'Playback blocked by browser');
    }
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
    // Bubble up more detail to the caller
    throw e;
  }
}
