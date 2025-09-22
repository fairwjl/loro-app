import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 8787;

app.use(cors({ origin: [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]}));
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_INSTRUCTIONS = `
You are a trauma-informed, validating assistant for a self-help app.
- You are NOT a clinician and do not diagnose, treat, or provide crisis counseling.
- Keep responses concise, warm, and practical (<= 170 words unless user requests more).
- Use gentle language: normalize, validate, and offer 1–3 concrete, evidence-informed next steps (e.g., paced breathing, 5-4-3-2-1 grounding, jaw/face/forehead softening, soft gaze, near–far focus).
- Avoid referencing branded therapies. Avoid triggering detail. Encourage professional help when appropriate.
- If user mentions imminent harm or crisis, show a brief crisis message.
`;

function crisisLine(text = '') {
  const t = text.toLowerCase();
  const flags = ['suicide', 'kill myself', 'overdose', 'hurt myself', 'harm myself', 'kill him', 'kill her'];
  return flags.some(f => t.includes(f))
    ? 'If you are in immediate danger or considering harming yourself or others, call your local emergency number now. In the U.S., dial 988.'
    : null;
}

// POST /api/reflect  { text: string }
app.post('/api/reflect', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return res.status(400).json({ error: 'Please provide a short sentence about what you are feeling or noticing.' });
    }

    const crisis = crisisLine(text);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      instructions: SYSTEM_INSTRUCTIONS,
      input: `User entry: ${text}\n\nRespond briefly (<=170 words). Include one grounding or regulation step.`
    });

    const output = response.output_text || 'Try a slow exhale, soften your jaw and forehead, and notice three things you can see.';

    res.json({ ok: true, reflection: output, crisis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong generating the reflection.' });
  }
});

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`Loro server listening on http://localhost:${port}`);
});