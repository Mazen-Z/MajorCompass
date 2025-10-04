import { exec } from './snowflake';
import { DEFAULT_MAJORS, DEFAULT_CAREERS } from './constants';
import type { QuizInput, Recommendation } from './types';

/**
 * Simple rule-based mapping + Snowflake augmentation.
 * Uses answers (1-5 Likert) to score clusters,
 * then queries Snowflake for top majors/careers tagged with those clusters.
 * Falls back to defaults with generated reasons if Snowflake is unavailable.
 */
export async function getRecommendations(input: QuizInput): Promise<Recommendation> {
  const a = input.answers || {};
  const clusters = {
    analytical: (a.analytical ?? 3) + (a.data ?? 3),
    creative: (a.creative ?? 3),
    people: (a.people ?? 3),
    handsOn: (a.handsOn ?? 3)
  };

  const top = Object.entries(clusters).sort((x, y) => y[1] - x[1]).map(([k]) => k);

  let majors = DEFAULT_MAJORS;
  let careers = DEFAULT_CAREERS;

  try {
    const mq = await exec<{ CODE: string; NAME: string; REASON: string }>(
      `select code, name, reason from majors where cluster in (?, ?, ?) limit 5`,
      [top[0], top[1], top[2]]
    );
    if (mq?.length) {
      majors = mq.map(r => ({ code: r.CODE, name: r.NAME, reason: r.REASON } as any));
    } else {
      majors = majors.map(m => ({ ...m, reason: reasonFromCluster(top[0]) } as any));
    }

    const cq = await exec<{ CODE: string; TITLE: string; REASON: string }>(
      `select code, title, reason from careers where cluster in (?, ?, ?) limit 5`,
      [top[0], top[1], top[2]]
    );
    if (cq?.length) {
      careers = cq.map(r => ({ code: r.CODE, title: r.TITLE, reason: r.REASON } as any));
    } else {
      careers = careers.map(c => ({ ...c, reason: reasonFromCluster(top[0]) } as any));
    }
  } catch (_e) {
    majors = majors.map(m => ({ ...m, reason: reasonFromCluster(top[0]) } as any));
    careers = careers.map(c => ({ ...c, reason: reasonFromCluster(top[0]) } as any));
  }

  return { majors: majors as any, careers: careers as any, raw: { clusters, top } };
}

function reasonFromCluster(cluster: string) {
  const map: Record<string, string> = {
    analytical: 'Strong analytical & quantitative preference detected.',
    creative: 'High creative drive suggests design/arts-aligned paths.',
    people: 'People orientation indicates collaborative, user-facing work.',
    handsOn: 'Hands-on tendency fits build/experiment/operate domains.'
  };
  return map[cluster] || 'Good alignment with your self-reported strengths.';
}
