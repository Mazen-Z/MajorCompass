export type StudentYear = 'freshman' | 'transfer' | 'grad' | string;

export type Persona = {
  year: StudentYear;
  interests?: string[];       // chips, up to 3
  strengths?: string[];       // chips, up to 3
  values?: string[];          // chips, pick 2
  constraints?: string[];     // deal-breakers
  studyPref?: string | null;  // one of STUDY_PREFS
  favorites?: string[];       // subjects liked (freshman/transfer)
  dislikes?: string[];        // subjects disliked (freshman/transfer)
  ugMajor?: string;           // for grad students
  yearsExp?: number;          // for grad students (optional)
};

export type QuizInput = {
  answers: Record<string, number>;
  persona?: Persona;
};

export type Major = { code: string; name: string; tags?: string[] };
export type Career = { code: string; title: string; tags?: string[] };

export type Recommendation = {
  majors: Array<Major & { reason: string; score?: number }>;
  careers: Array<Career & { reason: string; score?: number }>;
  raw?: any;
};
