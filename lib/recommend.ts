import { exec } from './snowflake';
import {
  DEFAULT_MAJORS,
  DEFAULT_CAREERS,
  VALUE_BOOSTS,
  CONSTRAINT_MAP,
} from './constants';
import type { QuizInput, Recommendation, Persona } from './types';

/* -------------------------- helpers (typed & local) -------------------------- */

function parseTags(input?: unknown): string[] {
  if (input == null) return [];
  if (Array.isArray(input)) return (input as unknown[]).map(String);
  if (typeof input === 'string') {
    const s = input.trim();
    if (s.startsWith('[')) {
      try {
        const arr = JSON.parse(s);
        return Array.isArray(arr) ? arr.map(String) : [];
      } catch {
        // fall through to comma split
      }
    }
    return s.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
}

function intersect(a: string[] = [], b: string[] = []) {
  const set = new Set(b);
  return a.filter(x => set.has(x));
}

const hasAny = (xs: string[] = [], ys: string[] = []) => xs.some(x => ys.includes(x));

function reasonFromCluster(cluster: string) {
  const map: Record<string, string> = {
    analytical: 'Strong analytical & quantitative preference detected.',
    creative: 'High creative drive suggests design/arts-aligned paths.',
    people: 'People orientation indicates collaborative, user-facing work.',
    handsOn: 'Hands-on tendency fits build/experiment/operate domains.',
  };
  return map[cluster] || 'Good alignment with your self-reported strengths.';
}

/* ----------------------------- main recommendation ----------------------------- */

type MajorRow = { code: string; name: string; reason?: string; tags?: string[]; score?: number };
type CareerRow = { code: string; title: string; reason?: string; tags?: string[]; score?: number };

export async function getRecommendations(input: QuizInput): Promise<Recommendation> {
  const a = input.answers ?? {};

  // Strongly-typed persona with safe defaults
  const persona: Persona = {
    year: input.persona?.year ?? 'freshman',
    interests: input.persona?.interests ?? [],
    strengths: input.persona?.strengths ?? [],
    values: input.persona?.values ?? [],
    constraints: input.persona?.constraints ?? [],
    studyPref: input.persona?.studyPref ?? null,
    favorites: input.persona?.favorites ?? [],
    dislikes: input.persona?.dislikes ?? [],
    ugMajor: input.persona?.ugMajor,
    yearsExp: input.persona?.yearsExp,
  };

  // 1) cluster scores from sliders
  const clusters = {
    analytical: (a.analytical ?? 3) + (a.data ?? 3),
    creative: (a.creative ?? 3),
    people: (a.people ?? 3),
    handsOn: (a.handsOn ?? 3),
  };
  const top = (Object.entries(clusters) as Array<[keyof typeof clusters, number]>)
    .sort((x, y) => y[1] - x[1])
    .map(([k]) => k as string);

  // 2) fetch from Snowflake (optional) — fall back to defaults on error/empty
  let majors: MajorRow[] = [...DEFAULT_MAJORS];
  let careers: CareerRow[] = [...DEFAULT_CAREERS];

  try {
    const mq = await exec<{ CODE: string; NAME: string; REASON: string; TAGS?: unknown }>(
      `select code, name, reason, tags from majors where cluster in (?, ?, ?) limit 20`,
      [top[0], top[1], top[2]]
    );
    if (mq?.length) {
      majors = mq.map(r => ({
        code: r.CODE,
        name: r.NAME,
        reason: r.REASON,
        tags: parseTags(r.TAGS),
      }));
    }

    const cq = await exec<{ CODE: string; TITLE: string; REASON: string; TAGS?: unknown }>(
      `select code, title, reason, tags from careers where cluster in (?, ?, ?) limit 20`,
      [top[0], top[1], top[2]]
    );
    if (cq?.length) {
      careers = cq.map(r => ({
        code: r.CODE,
        title: r.TITLE,
        reason: r.REASON,
        tags: parseTags(r.TAGS),
      }));
    }
  } catch {
    // keep defaults
  }

  // 3) scoring: clusters + values + interests/strengths
  const interests: string[] = persona.interests ?? [];
  const strengths: string[] = persona.strengths ?? [];
  const values: string[] = persona.values ?? [];
  const constraints: string[] = persona.constraints ?? [];

  const valueBoostTags: string[] = values.flatMap((v: string) => VALUE_BOOSTS[v] ?? []);

  const scoreItem = (tags: string[] = []) => {
    const tagScore =
      (intersect(tags, interests).length * 0.6) +
      (intersect(tags, strengths).length * 0.4) +
      (intersect(tags, valueBoostTags).length * 0.5);

    // crude mapping from clusters to tags
    const clusterScore =
      (hasAny(tags, ['Software', 'AI/ML', 'Math/Stats', 'Data/Analytics']) ? clusters.analytical : 0) +
      (hasAny(tags, ['Design/UX', 'Creativity', 'Media/Comms']) ? clusters.creative : 0) +
      (hasAny(tags, ['Client interaction', 'Leadership', 'Teaching', 'Education', 'Psychology']) ? clusters.people : 0) +
      (hasAny(tags, ['Hardware/Robotics', 'Hands-on/Mechanical', 'Labs/fieldwork', 'Bio/Lab']) ? clusters.handsOn : 0);

    return 0.5 * clusterScore + 0.5 * tagScore;
  };

  const violatesConstraints = (tags: string[] = []) =>
    constraints.some((c: string) => hasAny(tags, CONSTRAINT_MAP[c] ?? []));

  const rankedMajors = majors
    .filter(m => !violatesConstraints(m.tags ?? []))
    .map(m => ({ ...m, score: scoreItem(m.tags ?? []) }))
    .sort((x, y) => (y.score ?? 0) - (x.score ?? 0))
    .slice(0, 6)
    .map(m => ({ ...m, reason: m.reason || reasonFromCluster(top[0]) }));

  const rankedCareers = careers
    .filter(c => !violatesConstraints(c.tags ?? []))
    .map(c => ({ ...c, score: scoreItem(c.tags ?? []) }))
    .sort((x, y) => (y.score ?? 0) - (x.score ?? 0))
    .slice(0, 6)
    .map(c => ({ ...c, reason: c.reason || reasonFromCluster(top[0]) }));

  return {
    majors: rankedMajors as any,
    careers: rankedCareers as any,
    raw: { clusters, top, persona },
  };
}
