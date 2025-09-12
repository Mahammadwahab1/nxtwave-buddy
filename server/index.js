/* Minimal ElevenLabs TTS proxy server
   Usage:
   - set ELEVEN_API_KEY in your env
   - run: npm run server
   - POST /api/tts/eleven { text, voiceId? }
*/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { fetch } = require('undici');

const ELEVEN_ENDPOINT = (voiceId) => `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=2`;
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (public example voice)

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/api/tts/eleven', async (req, res) => {
  try {
    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ELEVEN_API_KEY is not set' });
    }
    const { text, voiceId } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing text' });
    }
    const vid = (voiceId && String(voiceId)) || DEFAULT_VOICE_ID;
    const resp = await fetch(ELEVEN_ENDPOINT(vid), {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: { stability: 0.4, similarity_boost: 0.7 },
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return res.status(resp.status).send(errText || 'TTS request failed');
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    const buf = Buffer.from(await resp.arrayBuffer());
    res.end(buf);
  } catch (e) {
    console.error('TTS error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`[server] ElevenLabs TTS proxy listening on :${port}`));
