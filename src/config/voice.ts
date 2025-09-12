// Central voice configuration for ElevenLabs (TTS)
// Default voice: Laila
export const ELEVEN_VOICE_ID = '0FZiOcKjnEowx6MA1W5v';
export type ElevenModel = 'eleven_v3' | 'eleven_ttv_v3';
export const ELEVEN_MODEL_DEFAULT: ElevenModel = 'eleven_v3';
// Use browser Web Speech API TTS in addition to Eleven? Default false to avoid double audio.
export const USE_BROWSER_TTS = false;
