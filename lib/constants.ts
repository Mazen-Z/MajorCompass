// Taxonomies for chips
export const INTEREST_TAGS = [
    'AI/ML','Software','Data/Analytics','Design/UX','Media/Comms','Business',
    'Finance','Health','Bio/Lab','Environment','Education','Law/Policy','Hardware/Robotics','Not sure yet'
  ];
  
  export const STRENGTH_TAGS = [
    'Problem solving','Math/Stats','Coding','Writing','Communication','Leadership',
    'Creativity','Research','Organization','Empathy','Hands-on/Mechanical','Teaching','Not sure yet'
  ];
  
  export const VALUE_TAGS = [
    'High pay','Stability','Social impact','Creative freedom',
    'Research depth','Work–life balance','Remote-friendly','Client interaction'
  ];
  
  export const DEAL_BREAKERS = [
    'Avoid heavy coding','Avoid heavy writing','Avoid wet labs',
    'Avoid public speaking','Prefer to avoid Calculus','Prefer not to work in healthcare'
  ];
  
  export const SUBJECT_TAGS = [
    'Calculus','Statistics','Biology','Chemistry','Physics','CS','Economics','Psychology','Design/Art','History','English'
  ];
  
  export const STUDY_PREFS = ['Project-based','Lectures & exams','Labs/fieldwork','Reading/writing heavy'] as const;
  
  // Default fallbacks
  export const DEFAULT_MAJORS = [
    { code: 'CS', name: 'Computer Science', tags: ['Software','AI/ML','Coding','Math/Stats'] },
    { code: 'DS', name: 'Data Science', tags: ['Data/Analytics','Math/Stats','Research'] },
    { code: 'BUS', name: 'Business Administration', tags: ['Business','Leadership','Client interaction'] },
    { code: 'PSY', name: 'Psychology', tags: ['Psychology','Research','Empathy'] },
    { code: 'BIO', name: 'Biology', tags: ['Bio/Lab','Health','Labs/fieldwork'] },
    { code: 'ENG', name: 'Mechanical Engineering', tags: ['Hardware/Robotics','Hands-on/Mechanical','Math/Stats'] }
  ];
  
  export const DEFAULT_CAREERS = [
    { code: 'SWE', title: 'Software Engineer', tags: ['Software','Coding','High pay'] },
    { code: 'DA', title: 'Data Analyst', tags: ['Data/Analytics','Math/Stats'] },
    { code: 'PM', title: 'Product Manager', tags: ['Business','Leadership','Client interaction'] },
    { code: 'UX', title: 'UX Designer', tags: ['Design/UX','Creativity'] },
    { code: 'RA', title: 'Research Assistant', tags: ['Research','Education'] }
  ];
  
  // Value-to-tag boosts (lightweight)
  export const VALUE_BOOSTS: Record<string, string[]> = {
    'High pay': ['Software','AI/ML','Finance','Engineering','Data/Analytics'],
    'Stability': ['Education','Healthcare','Government','Data/Analytics'],
    'Social impact': ['Education','Environment','Health','Policy','Psychology'],
    'Creative freedom': ['Design/UX','Media/Comms','Art','Entrepreneurship'],
    'Research depth': ['Research','Bio/Lab','AI/ML','Physics','Psychology'],
    'Work–life balance': ['Data/Analytics','Education','UX','Government'],
    'Remote-friendly': ['Software','Data/Analytics','UX'],
    'Client interaction': ['Business','PM','Consulting','Sales','Healthcare']
  };
  
  // Constraint filters (drop if any tag matches)
  export const CONSTRAINT_MAP: Record<string, string[]> = {
    'Avoid heavy coding': ['Coding','Software','AI/ML'],
    'Avoid heavy writing': ['Writing','Reading/writing heavy'],
    'Avoid wet labs': ['Bio/Lab','Labs/fieldwork','Wet lab'],
    'Avoid public speaking': ['Client interaction','Teaching','Leadership'],
    'Prefer to avoid Calculus': ['Calculus','Math/Stats'],
    'Prefer not to work in healthcare': ['Health','Healthcare']
  };
  