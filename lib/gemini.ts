import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Persona, Recommendation } from './types';

const apiKey = process.env.GEMINI_API_KEY;
const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function summarizeRecommendation(rec: Recommendation, persona?: Persona) {
  if (!client) return '';
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are a career+major advisor. Consider the student's profile and the recommended majors/careers.
Student:
- Year: ${persona?.year ?? 'unknown'}
- Interests: ${(persona?.interests ?? []).join(', ') || 'n/a'}
- Strengths: ${(persona?.strengths ?? []).join(', ') || 'n/a'}
- Values: ${(persona?.values ?? []).join(', ') || 'n/a'}
- Deal-breakers: ${(persona?.constraints ?? []).join(', ') || 'n/a'}
- Study preference: ${persona?.studyPref ?? 'n/a'}
- Favorites: ${(persona?.favorites ?? []).join(', ') || 'n/a'}
- Dislikes: ${(persona?.dislikes ?? []).join(', ') || 'n/a'}

Recommendations (scored):
${JSON.stringify(rec, null, 2)}

Write a concise (120–180 words), encouraging explanation of why these options fit.
Acknowledge any deal-breakers avoided. Suggest 2 starter courses and 1 student org for the top major.
End with 2 actionable next steps.
`.trim();

  const result = await model.generateContent(prompt);
  return result.response.text();
}
