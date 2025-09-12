export type ListenCallbacks = {
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  lang?: string;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export function startWebSpeechListening(cbs: ListenCallbacks = {}) {
  const SR = (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!SR) {
    console.warn("Web Speech API not supported in this browser.");
    return { stop: () => {} } as const;
  }
  const rec = new SR();
  rec.lang = cbs.lang || "en-US";
  rec.interimResults = true;
  rec.continuous = false;
  rec.onresult = (e: any) => {
    let interim = "";
    let final = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (interim && cbs.onPartial) cbs.onPartial(interim.trim());
    if (final && cbs.onFinal) cbs.onFinal(final.trim());
  };
  rec.onerror = (e: any) => console.warn("SpeechRecognition error", e);
  rec.start();
  return {
    stop: () => { try { rec.stop(); } catch {} },
  } as const;
}

