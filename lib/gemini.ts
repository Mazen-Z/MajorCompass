import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Persona, Recommendation } from './types';

const apiKey = process.env.GEMINI_API_KEY!;
const modelId = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();

function buildPrompt(rec: Recommendation, persona?: Persona) {
  return `
You are a career+major advisor.
Student: ${JSON.stringify(persona ?? {})}
Recommendations: ${JSON.stringify(rec ?? {})}

Write a concise (120–180 words) explanation of why these options fit.
Mention respected deal-breakers (if any), suggest 2 starter courses and 1 student org,
and end with 2 actionable next steps.
`.trim();
}

export async function summarizeRecommendation(rec: Recommendation, persona?: Persona) {
  if (!apiKey) {
    console.warn('[Gemini] Missing GEMINI_API_KEY');
    return '';
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelId }); // ✅ 2.5 Flash
    const result = await model.generateContent(buildPrompt(rec, persona));
    const text = result?.response?.text?.() ?? '';
    if (!text) console.warn('[Gemini] Empty response from', modelId);
    return text;
  } catch (e: any) {
    // Helpful diagnostics
    console.error('[Gemini]', modelId, 'error:', e?.status || '', e?.statusText || '', e?.message || e);
    // Optional fallback if 2.5 Flash is temporarily unavailable:
    // try { return await fallbackTo('gemini-1.5-flash', rec, persona, apiKey); } catch {}
    return '';
  }
}

/* Optional local fallback helper (uncomment above to use)
async function fallbackTo(id: string, rec: Recommendation, persona: Persona | undefined, key: string) {
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: id });
  const res = await model.generateContent(buildPrompt(rec, persona));
  return res.response?.text?.() ?? '';
}
*/
