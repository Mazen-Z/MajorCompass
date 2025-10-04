'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

const QUESTIONS = [
  { key: 'analytical', label: 'I enjoy solving analytical problems' },
  { key: 'creative', label: 'I enjoy creative expression' },
  { key: 'people', label: 'I like collaborating with people' },
  { key: 'handsOn', label: 'I like building or tinkering' },
  { key: 'data', label: 'I’m comfortable with data & numbers' }
];

export default function QuizForm() {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState({ year: 'freshman', interests: '', strengths: '' });

  const setLikert = (k: string, v: number) => setValues(prev => ({ ...prev, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: values, persona })
      });
      const data = await res.json();
      sessionStorage.setItem('majorcompass_results', JSON.stringify(data));
      router.push('/results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="label">Student Type</span>
          <select className="input" value={persona.year} onChange={e => setPersona(p => ({ ...p, year: e.target.value }))}>
            <option value="freshman">Incoming Freshman</option>
            <option value="transfer">Transfer</option>
            <option value="grad">Graduate Student</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="label">Top Interests</span>
          <input className="input" value={persona.interests} onChange={e => setPersona(p => ({ ...p, interests: e.target.value }))} />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="label">Your Strengths</span>
          <input className="input" value={persona.strengths} onChange={e => setPersona(p => ({ ...p, strengths: e.target.value }))} />
        </label>
      </div>

      <div className="space-y-4">
        {QUESTIONS.map(q => (
          <div key={q.key} className="flex items-center justify-between gap-4">
            <span>{q.label}</span>
            <input type="range" min={1} max={5} step={1} className="w-48"
              value={values[q.key] ?? 3}
              onChange={e => setLikert(q.key, Number(e.target.value))} />
          </div>
        ))}
      </div>

      <button className="btn" onClick={submit} disabled={loading}>
        {loading ? <LoadingSpinner /> : 'Get My Recommendations'}
      </button>
    </div>
  );
}
