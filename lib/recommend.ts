import { exec, withTimeout } from './snowflake';
import {
  DEFAULT_MAJORS,
  DEFAULT_CAREERS,
  VALUE_BOOSTS,
  CONSTRAINT_MAP,
} from './constants';
import type { QuizInput, Recommendation, Persona } from './types';

/* -------------------------- helpers -------------------------- */

function parseTags(input?: unknown): string[] {
  if (input == null) return [];
  if (Array.isArray(input)) return (input as unknown[]).map(String);
  if (typeof input === 'string') {
    const s = input.trim();
    if (s.startsWith('[')) {
      try {
        const arr = JSON.parse(s);
        return Array.isArray(arr) ? arr.map(String) : [];
      } catch {}
    }
    return s.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
}

const intersect = (a: string[] = [], b: string[] = []) => a.filter(x => b.includes(x));
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

/* ----------------------------- main ----------------------------- */

type MajorRowRaw = { code: string; name: string; reason: string; tags?: unknown };
type CareerRowRaw = { code: string; title: string; reason: string; tags?: unknown };

export async function getRecommendations(input: QuizInput): Promise<Recommendation> {
  const a = input.answers ?? {};
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

  const clusters = {
    analytical: (a.analytical ?? 3) + (a.data ?? 3),
    creative: (a.creative ?? 3),
    people: (a.people ?? 3),
    handsOn: (a.handsOn ?? 3),
  };
  const top = (Object.entries(clusters) as Array<[keyof typeof clusters, number]>)
    .sort((x, y) => y[1] - x[1])
    .map(([k]) => k as string);

  let majors = DEFAULT_MAJORS.map(m => ({ ...m }));
  let careers = DEFAULT_CAREERS.map(c => ({ ...c }));

  const USE_SF = process.env.MC_USE_SNOWFLAKE !== '0';
  const SF_TIMEOUT = Number(process.env.MC_SNOWFLAKE_TIMEOUT_MS ?? 10000);

  if (USE_SF) {
    try {
      const clustersToUse = top.slice(0, 3);
      const placeholders = clustersToUse.map(() => '?').join(', ');

      // ✅ Fixed to lowercase identifiers to match Snowflake schema
      const mq = await withTimeout(
        exec<MajorRowRaw>(
          `SELECT code, name, reason, tags
             FROM majors
            WHERE cluster IN (${placeholders})
            LIMIT 20`,
          clustersToUse
        ),
        SF_TIMEOUT,
        'majors'
      );

      if (mq?.length) {
        majors = mq.map(r => ({
          code: r.code,
          name: r.name,
          reason: r.reason,
          tags: Array.isArray(r.tags) ? r.tags.map(String) : parseTags(r.tags),
        }));
      }

      const cq = await withTimeout(
        exec<CareerRowRaw>(
          `SELECT code, title, reason, tags
             FROM careers
            WHERE cluster IN (${placeholders})
            LIMIT 20`,
          clustersToUse
        ),
        SF_TIMEOUT,
        'careers'
      );

      if (cq?.length) {
        careers = cq.map(r => ({
          code: r.code,
          title: r.title,
          reason: r.reason,
          tags: Array.isArray(r.tags) ? r.tags.map(String) : parseTags(r.tags),
        }));
      }
    } catch (e) {
      console.warn('[SF] Falling back to local defaults:', (e as Error).message);
    }
  }

  const { interests = [], strengths = [], values = [], constraints = [] } = persona;
  const valueBoostTags = values.flatMap(v => VALUE_BOOSTS[v] ?? []);

  const scoreItem = (tags: string[] = []) => {
    const tagScore =
      (intersect(tags, interests).length * 0.6) +
      (intersect(tags, strengths).length * 0.4) +
      (intersect(tags, valueBoostTags).length * 0.5);

    const clusterScore =
      (hasAny(tags, ['Software', 'AI/ML', 'Math/Stats', 'Data/Analytics']) ? clusters.analytical : 0) +
      (hasAny(tags, ['Design/UX', 'Creativity', 'Media/Comms']) ? clusters.creative : 0) +
      (hasAny(tags, ['Client interaction', 'Leadership', 'Teaching', 'Education', 'Psychology']) ? clusters.people : 0) +
      (hasAny(tags, ['Hardware/Robotics', 'Hands-on/Mechanical', 'Labs/fieldwork', 'Bio/Lab']) ? clusters.handsOn : 0);

    return 0.5 * clusterScore + 0.5 * tagScore;
  };

  const violatesConstraints = (tags: string[] = []) =>
    constraints.some(c => hasAny(tags, CONSTRAINT_MAP[c] ?? []));

  const rankedMajors = majors
    .filter(m => !violatesConstraints(m.tags ?? []))
    .map((m: any) => ({ ...m, score: scoreItem(m.tags ?? []) }))
    .sort((x, y) => (y.score ?? 0) - (x.score ?? 0))
    .slice(0, 6)
    .map((m: any) => ({ ...m, reason: m.reason || reasonFromCluster(top[0]) }));

  const rankedCareers = careers
    .filter(c => !violatesConstraints(c.tags ?? []))
    .map((c: any) => ({ ...c, score: scoreItem(c.tags ?? []) }))
    .sort((x, y) => (y.score ?? 0) - (x.score ?? 0))
    .slice(0, 6)
    .map((c: any) => ({ ...c, reason: c.reason || reasonFromCluster(top[0]) }));

  return {
    majors: rankedMajors,
    careers: rankedCareers,
    raw: { clusters, top, persona },
  };
}
