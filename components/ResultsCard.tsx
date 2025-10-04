export default function ResultsCard({ recommendations, narrative }: any) {
    return (
      <div className="card space-y-6">
        <h2 className="text-2xl font-semibold">Your Matches</h2>
  
        <div className="grid gap-4">
          {recommendations?.majors?.length && (
            <div>
              <h3 className="text-lg font-semibold">Suggested Majors</h3>
              <ul className="list-disc pl-6">
                {recommendations.majors.map((m: any) => (
                  <li key={m.code}>
                    <span className="font-medium">{m.name}</span> — {m.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recommendations?.careers?.length && (
            <div>
              <h3 className="text-lg font-semibold">Suggested Careers</h3>
              <ul className="list-disc pl-6">
                {recommendations.careers.map((c: any) => (
                  <li key={c.code}>
                    <span className="font-medium">{c.title}</span> — {c.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
  
        {narrative && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Why This Fit?</h3>
            <p className="whitespace-pre-wrap leading-relaxed">{narrative}</p>
          </div>
        )}
      </div>
    );
  }
  