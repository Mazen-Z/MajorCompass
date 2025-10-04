import { NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/recommend';
import { summarizeRecommendation } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { answers, persona }
    const rec = await getRecommendations(body);
    const narrative = await summarizeRecommendation(rec, body?.persona);
    return NextResponse.json({ recommendations: rec, narrative });
  } catch (err: any) {
    console.error('quiz API error', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
