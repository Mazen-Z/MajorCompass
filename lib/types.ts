export type Persona = {
    year: 'freshman' | 'transfer' | 'grad' | string;
    interests?: string;
    strengths?: string;
  };
  
  export type QuizInput = {
    answers: Record<string, number>;
    persona?: Persona;
  };
  
  export type Major = { code: string; name: string };
  export type Career = { code: string; title: string };
  
  export type Recommendation = {
    majors: Array<Major & { reason: string }>;
    careers: Array<Career & { reason: string }>;
    raw?: any;
  };
  