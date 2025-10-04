'use client';
import QuizForm from '@/components/QuizForm';

export default function HomePage() {
  return (
    <div className="card space-y-4">
      <h2 className="text-2xl font-semibold">Find Your Major & Career Fit</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Answer a few quick questions to get personalized recommendations for majors and careers.
      </p>
      <QuizForm />
    </div>
  );
}
