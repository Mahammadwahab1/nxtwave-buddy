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
const multer = require('multer');
const FormData = require('form-data');

const ELEVEN_ENDPOINT = (voiceId) => `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=2`;
const ELEVEN_S2S_ENDPOINT = (voiceId) => `https://api.elevenlabs.io/v1/speech-to-speech/${voiceId}`;
// Default ElevenLabs voice (Laila). Override with ELEVEN_VOICE_ID in .env
const DEFAULT_VOICE_ID = process.env.ELEVEN_VOICE_ID || '0FZiOcKjnEowx6MA1W5v';
// Supported models: include broadly-supported turbo as default
const SUPPORTED_MODELS = new Set(['eleven_turbo_v2', 'eleven_v3', 'eleven_ttv_v3', 'eleven_speech_to_speech_v1']);

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

app.post('/api/tts/eleven', async (req, res) => {
  try {
    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ELEVEN_API_KEY is not set' });
    }
    const { text, voiceId, model } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing text' });
    }
    const vid = (voiceId && String(voiceId)) || DEFAULT_VOICE_ID;
    const modelId = SUPPORTED_MODELS.has(model) ? model : 'eleven_turbo_v2';
    const resp = await fetch(ELEVEN_ENDPOINT(vid), {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
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

// Speech to Speech endpoint
app.post('/api/s2s/eleven', upload.single('audio'), async (req, res) => {
  try {
    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ELEVEN_API_KEY is not set' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Missing audio file' });
    }

    const { voiceId, model } = req.body || {};
    const vid = (voiceId && String(voiceId)) || DEFAULT_VOICE_ID;
    const modelId = SUPPORTED_MODELS.has(model) ? model : 'eleven_speech_to_speech_v1';

    const formData = new FormData();
    formData.append('audio', req.file.buffer, { filename: 'audio.webm', contentType: req.file.mimetype });
    formData.append('model_id', modelId);

    const resp = await fetch(ELEVEN_S2S_ENDPOINT(vid), {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Accept': 'audio/mpeg',
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return res.status(resp.status).send(errText || 'S2S request failed');
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    const buf = Buffer.from(await resp.arrayBuffer());
    res.end(buf);
  } catch (e) {
    console.error('S2S error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// List available voices to verify IDs
app.get('/api/tts/voices', async (req, res) => {
  try {
    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'ELEVEN_API_KEY is not set' });
    const resp = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json(data);
    // trim payload to essential fields
    const voices = (data.voices || []).map((v) => ({ id: v.voice_id, name: v.name, category: v.category }));
    res.json({ voices });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// Quick sample endpoint to test a specific voice id
app.get('/api/tts/sample', async (req, res) => {
  const voiceId = req.query.voiceId || DEFAULT_VOICE_ID;
  req.body = { text: `This is a sample using voice ${voiceId}`, voiceId, model: 'eleven_turbo_v2' };
  return app._router.handle(req, res, () => {});
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`[server] ElevenLabs TTS proxy listening on :${port}`));
