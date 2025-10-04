import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Persona, Recommendation } from './types';

const apiKey = process.env.GEMINI_API_KEY;
const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function summarizeRecommendation(rec: Recommendation, persona?: Persona) {
  if (!client) return '';
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `You are advising a student on majors & careers. Student: ${JSON.stringify(persona)}
Recommendations: ${JSON.stringify(rec)}
Write a concise, encouraging explanation (120-180 words) of why these majors/careers fit.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
