import { createServerClient } from './pocketbase-server';
import { Sprint, Class, Link, Assignment, User, Delivery, Team, Review, Week, CohortEnrollment } from '@/types';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { getLegacyCohort } from './cohorts/access';
import { cohortCacheScope } from './cohorts/cache';

// Helper to create client with token for cached functions
const createClientWithToken = (token: string | undefined) => {
    const url = process.env['NEXT_PUBLIC_POCKETBASE_URL'];
    if (!url) {
        console.error("CRITICAL ERROR: NEXT_PUBLIC_POCKETBASE_URL is not set");
    }
    const pb = new PocketBase(url);
    // Disable autoCancellation to avoid issues in cached context
    pb.autoCancellation(false);
    if (token) {
        pb.authStore.loadFromCookie(`pb_auth=${token}`);
    }
    return pb;
};

// Cached fetchers using unstable_cache (Data Cache)
// Caches results per user (token) for a short duration to prevent 429 errors
const getSprintsCached = unstable_cache(
    async (token: string | undefined, cohortId?: string) => {
        const pb = createClientWithToken(token);
        const result = await pb.collection('sprints').getList<Sprint>(1, 50, {
            filter: cohortId ? pb.filter('cohort = {:cohort}', { cohort: cohortId }) : '',
            sort: 'created',
        });
        return result.items;
    },
    ['sprints-list'],
    { revalidate: 30, tags: ['sprints'] }
);

const getUsersCached = unstable_cache(
    async (token: string | undefined) => {
        const pb = createClientWithToken(token);
        return await pb.collection('users').getFullList<User>({
            sort: 'created',
        });
    },
    ['users-list'],
    { revalidate: 60, tags: ['users'] }
);

const getStudentsCached = unstable_cache(
    async (token: string | undefined, cohortId: string) => {
        const pb = createClientWithToken(token);
        const enrollments = await pb.collection('cohort_enrollments').getFullList<CohortEnrollment>({
            filter: pb.filter('cohort = {:cohort} && status = "active"', { cohort: cohortId }),
            expand: 'user',
            sort: 'user.name',
        });
        return enrollments.map(item => item.expand?.user).filter((user): user is User => Boolean(user));
    },
    ['students-list'],
    { revalidate: 60, tags: ['users'] }
);

const getTeamsCached = unstable_cache(
    async (token: string | undefined, cohortId?: string) => {
        const pb = createClientWithToken(token);
        return await pb.collection('teams').getFullList<Team>({
            filter: cohortId ? pb.filter('cohort = {:cohort}', { cohort: cohortId }) : '',
            sort: 'created',
            expand: 'members',
        });
    },
    ['teams-list'],
    { revalidate: 60, tags: ['teams'] }
);

// Exported functions with request memoization (React.cache)

export const getReviews = cache(async (sprintId: string) => {
  const pb = await createServerClient();
  try {
    const records = await pb.collection('reviews').getFullList<Review>({
      filter: `sprint = "${sprintId}"`,
      sort: 'startTime',
      expand: 'teacher,student',
    });
    return records;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
});

export const getUserReview = cache(async (sprintId: string, userId: string) => {
  const pb = await createServerClient();
  try {
    const record = await pb.collection('reviews').getFirstListItem<Review>(
      `sprint = "${sprintId}" && student = "${userId}"`,
      { expand: 'teacher,student' }
    );
    return record;
  } catch (error) {
    return null;
  }
});

export const getSprints = cache(async (cohortId?: string) => {
    const resolvedCohortId = cohortId || (await getLegacyCohort()).id;
    const cookieStore = await cookies();
    const token = cookieStore.get('pb_auth')?.value;
    try {
        return await getSprintsCached(...cohortCacheScope(token, resolvedCohortId));
    } catch (error) {
        console.error('Error fetching sprints:', error);
        throw error;
    }
});

export const getUsers = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('pb_auth')?.value;
    return getUsersCached(token);
});

export const getStudents = cache(async (cohortId?: string) => {
    const resolvedCohortId = cohortId || (await getLegacyCohort()).id;
    const cookieStore = await cookies();
    const token = cookieStore.get('pb_auth')?.value;
    return getStudentsCached(...cohortCacheScope(token, resolvedCohortId));
});

export const getCohortStudents = cache(async (cohortId: string) => {
  const pb = await createServerClient();
  const enrollments = await pb.collection('cohort_enrollments').getFullList<CohortEnrollment>({
    filter: pb.filter('cohort = {:cohort}', { cohort: cohortId }),
    expand: 'user',
    sort: 'user.name',
  });
  return enrollments.map(item => item.expand?.user).filter((user): user is User => Boolean(user));
});

export const getTeams = cache(async (cohortId?: string) => {
    const resolvedCohortId = cohortId || (await getLegacyCohort()).id;
    const cookieStore = await cookies();
    const token = cookieStore.get('pb_auth')?.value;
    try {
        return await getTeamsCached(...cohortCacheScope(token, resolvedCohortId));
    } catch (error) {
        console.error('Error fetching teams:', error);
        return [];
    }
});

export const getTeam = cache(async (id: string, cohortId?: string) => {
  const resolvedCohortId = cohortId || (await getLegacyCohort()).id;
  const pb = await createServerClient();
  try {
    const record = await pb.collection('teams').getOne<Team>(id, {
      expand: 'members',
    });
    return record.cohort === resolvedCohortId ? record : null;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
});

export const getStudentTeam = cache(async (studentId: string, cohortId?: string) => {
  const pb = await createServerClient();
  const resolvedCohortId = cohortId || (await getLegacyCohort()).id;
  try {
    const record = await pb.collection('teams').getFirstListItem<Team>(
      pb.filter('members ~ {:student} && cohort = {:cohort}', { student: studentId, cohort: resolvedCohortId }),
      { expand: 'members' }
    );
    return record;
  } catch (error) {
    return null;
  }
});

export const getSprint = cache(async (id: string, cohortId?: string) => {
  const resolvedCohortId = cohortId || (await getLegacyCohort()).id;
  const pb = await createServerClient();
  try {
    const record = await pb.collection('sprints').getOne<Sprint>(id, {
        expand: 'classes',
    });
    return record.cohort === resolvedCohortId ? record : null;
  } catch (error) {
    console.error('Error fetching sprint:', error);
    return null;
  }
});

export async function getSprintCohortId(id: string) {
  const pb = await createServerClient();
  const sprint = await pb.collection('sprints').getOne<Sprint>(id, { fields: 'id,cohort' });
  if (!sprint.cohort) throw new Error('El sprint no pertenece a una cohorte válida.');
  return sprint.cohort;
}

export async function getAllClasses(cohortId?: string, weekId?: string) {
    const pb = await createServerClient();
    const resolvedCohortId = cohortId || (await getLegacyCohort()).id;
    const records = await pb.collection('classes').getFullList<Class>({
        filter: weekId
          ? pb.filter('week = {:week}', { week: weekId })
          : pb.filter('(sprint.cohort = {:cohort} || week.cohort = {:cohort})', { cohort: resolvedCohortId }),
        sort: 'created',
        expand: 'sprint,week',
    });
    return records;
}

export async function getClasses(sprintId: string) {
    const pb = await createServerClient();
    const records = await pb.collection('classes').getFullList<Class>({
        filter: `sprint = "${sprintId}"`,
        sort: 'created',
    });
    return records;
}

export async function getClass(id: string) {
  const pb = await createServerClient();
  const record = await pb.collection('classes').getOne<Class>(id);
  return record;
}

export async function getClassCohortId(item: Class) {
  const pb = await createServerClient();
  if (item.week) return (await pb.collection('weeks').getOne<Week>(item.week)).cohort;
  if (item.sprint) {
    const cohortId = (await pb.collection('sprints').getOne<Sprint>(item.sprint)).cohort;
    if (cohortId) return cohortId;
  }
  throw new Error('La clase no tiene un padre académico válido.');
}

export async function getAllAssignments(cohortId?: string, weekId?: string) {
  const pb = await createServerClient();
  const resolvedCohortId = cohortId || (await getLegacyCohort()).id;
  const records = await pb.collection('assignments').getFullList<Assignment>({
      filter: weekId
        ? pb.filter('week = {:week}', { week: weekId })
        : pb.filter('(sprint.cohort = {:cohort} || week.cohort = {:cohort})', { cohort: resolvedCohortId }),
      sort: 'created',
      expand: 'sprint,week',
  });
  return records;
}

export async function getAssignments(sprintId: string) {
  const pb = await createServerClient();
  const records = await pb.collection('assignments').getFullList<Assignment>({
      filter: `sprint = "${sprintId}"`,
      sort: 'created',
  });
  return records;
}

export async function getAssignment(id: string) {
  const pb = await createServerClient();
  const record = await pb.collection('assignments').getOne<Assignment>(id);
  return record;
}

export async function getAssignmentCohortId(item: Assignment) {
  const pb = await createServerClient();
  if (item.week) return (await pb.collection('weeks').getOne<Week>(item.week)).cohort;
  if (item.sprint) {
    const cohortId = (await pb.collection('sprints').getOne<Sprint>(item.sprint)).cohort;
    if (cohortId) return cohortId;
  }
  throw new Error('El trabajo práctico no tiene un padre académico válido.');
}

export async function getLinks(parentId: string, parentType: 'class' | 'assignment' = 'class') {
  const pb = await createServerClient();
  const records = await pb.collection('links').getFullList<Link>({
      filter: `${parentType} = "${parentId}"`,
      sort: 'created',
  });
  return records;
}

export async function getDeliveries(assignmentId: string) {
  const pb = await createServerClient();
  try {
     const records = await pb.collection('deliveries').getFullList<Delivery>({
         filter: `assignment = "${assignmentId}"`,
         sort: '-created',
         expand: 'student',
     });
     
     return records;
   } catch (error) {
     console.error('Error fetching deliveries:', error);
     return [];
   }
}

export async function getUserDelivery(assignmentId: string, userId: string) {
  const pb = await createServerClient();
  try {
    const record = await pb.collection('deliveries').getFirstListItem<Delivery>(
        `assignment = "${assignmentId}" && student = "${userId}"`
    );
    return record;
  } catch (error) {
    // It's normal to not have a delivery yet
    return null;
  }
}
