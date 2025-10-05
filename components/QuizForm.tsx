'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';
import {
  INTEREST_TAGS, STRENGTH_TAGS, VALUE_TAGS, DEAL_BREAKERS,
  SUBJECT_TAGS, STUDY_PREFS
} from '@/lib/constants';

type StrArr = string[];

function useToggleArray(initial: StrArr = [], limit?: number) {
  const [arr, setArr] = useState<StrArr>(initial);
  const toggle = (v: string) => setArr(prev => {
    const has = prev.includes(v);
    if (has) return prev.filter(x => x !== v);
    if (limit && prev.length >= limit) return prev; // enforce cap
    return [...prev, v];
  });
  const set = (xs: StrArr) => setArr(xs);
  return { arr, toggle, set };
}

export default function QuizForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // persona
  const [year, setYear] = useState<'freshman' | 'transfer' | 'grad' | string>('freshman');
  const interests = useToggleArray([], 3);
  const strengths = useToggleArray([], 3);
  const values = useToggleArray([], 2);
  const constraints = useToggleArray();
  const favorites = useToggleArray([]);
  const dislikes = useToggleArray([]);
  const [ugMajor, setUgMajor] = useState('');
  const [yearsExp, setYearsExp] = useState<number | ''>('');
  const [studyPref, setStudyPref] = useState<string | null>(null);

  // sliders
  const [answers, setAnswers] = useState<Record<string, number>>({
    analytical: 3, creative: 3, people: 3, handsOn: 3, data: 3
  });
  const setLikert = (k: string, v: number) => setAnswers(prev => ({ ...prev, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      const persona = {
        year,
        interests: interests.arr,
        strengths: strengths.arr,
        values: values.arr,
        constraints: constraints.arr,
        favorites: (year === 'freshman' || year === 'transfer') ? favorites.arr : undefined,
        dislikes:  (year === 'freshman' || year === 'transfer') ? dislikes.arr  : undefined,
        ugMajor: year === 'grad' ? ugMajor : undefined,
        yearsExp: year === 'grad' && yearsExp !== '' ? Number(yearsExp) : undefined,
        studyPref
      };

      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, persona })
      });
      const data = await res.json();
      sessionStorage.setItem('majorcompass_results', JSON.stringify(data));
      router.push('/results');
    } finally {
      setLoading(false);
    }
  };

  const Chip = ({ v, active, onClick }: { v: string; active: boolean; onClick: () => void }) => (
    <span className={`chip ${active ? 'active' : ''}`} onClick={onClick}>{v}</span>
  );

  return (
    <div className="space-y-8">
      {/* Student type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="label">Student Type</span>
          <select className="input" value={year} onChange={e => setYear(e.target.value)}>
            <option value="freshman">Incoming Freshman</option>
            <option value="transfer">Transfer</option>
            <option value="grad">Graduate Student</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="label">Study Preference</span>
          <select className="input" value={studyPref ?? ''} onChange={e => setStudyPref(e.target.value || null)}>
            <option value="">Select one</option>
            {STUDY_PREFS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </label>
      </div>

      {/* Interests */}
      <div className="space-y-2">
        <div className="label">Top Interests (pick up to 3)</div>
        <div className="chips">
          {INTEREST_TAGS.map(tag => (
            <Chip key={tag} v={tag} active={interests.arr.includes(tag)} onClick={() => interests.toggle(tag)} />
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="space-y-2">
        <div className="label">Your Strengths (pick up to 3)</div>
        <div className="chips">
          {STRENGTH_TAGS.map(tag => (
            <Chip key={tag} v={tag} active={strengths.arr.includes(tag)} onClick={() => strengths.toggle(tag)} />
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="space-y-2">
        <div className="label">Values (pick 2)</div>
        <div className="chips">
          {VALUE_TAGS.map(tag => (
            <Chip key={tag} v={tag} active={values.arr.includes(tag)} onClick={() => values.toggle(tag)} />
          ))}
        </div>
      </div>

      {/* Deal-breakers */}
      <div className="space-y-2">
        <div className="label">Deal-breakers (optional)</div>
        <div className="chips">
          {DEAL_BREAKERS.map(tag => (
            <Chip key={tag} v={tag} active={constraints.arr.includes(tag)} onClick={() => constraints.toggle(tag)} />
          ))}
        </div>
      </div>

      {/* Branching */}
      {(year === 'freshman' || year === 'transfer') && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="label">Favorite subjects</div>
            <div className="chips mt-2">
              {SUBJECT_TAGS.map(tag => (
                <Chip key={tag} v={tag} active={favorites.arr.includes(tag)} onClick={() => favorites.toggle(tag)} />
              ))}
            </div>
          </div>
          <div>
            <div className="label">Least favorite subjects</div>
            <div className="chips mt-2">
              {SUBJECT_TAGS.map(tag => (
                <Chip key={tag} v={tag} active={dislikes.arr.includes(tag)} onClick={() => dislikes.toggle(tag)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {year === 'grad' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="label">Undergrad Major</span>
            <input className="input" value={ugMajor} onChange={e => setUgMajor(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="label">Years of Experience</span>
            <input className="input" type="number" min={0} value={yearsExp} onChange={e => setYearsExp(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>
        </div>
      )}

      {/* Sliders with labels */}
      <div className="space-y-4">
        {[
          { key: 'analytical', label: 'I enjoy logic & quantitative problems' },
          { key: 'creative', label: 'I enjoy designing/creating from scratch' },
          { key: 'people', label: 'I enjoy teamwork & client interaction' },
          { key: 'handsOn', label: 'I enjoy hands-on building/lab/tech' },
          { key: 'data', label: 'I’m comfortable with data, statistics, spreadsheets' },
        ].map(q => (
          <div key={q.key}>
            <div className="slider-row">
              <span>{q.label}</span>
              <input
                type="range" min={1} max={5} step={1} className="w-48"
                value={answers[q.key] ?? 3}
                onChange={e => setLikert(q.key, Number(e.target.value))}
              />
            </div>
          </div>
        ))}
      </div>

      <button className="btn" onClick={submit} disabled={loading}>
        {loading ? <LoadingSpinner /> : 'Get My Recommendations'}
      </button>
    </div>
  );
}
