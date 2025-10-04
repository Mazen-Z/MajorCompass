'use client';
import { useEffect, useState } from 'react';
import ResultsCard from '@/components/ResultsCard';

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('majorcompass_results');
    if (raw) setData(JSON.parse(raw));
  }, []);

  if (!data) return <p>Missing results. Please retake the quiz.</p>;

  return <ResultsCard {...data} />;
}
