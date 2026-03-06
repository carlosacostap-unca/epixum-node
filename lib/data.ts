import { createServerClient } from './pocketbase-server';
import { Sprint, Class, Link, Assignment, User, Delivery, Team, Review } from '@/types';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

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
    async (token: string | undefined) => {
        const pb = createClientWithToken(token);
        const result = await pb.collection('sprints').getList<Sprint>(1, 50, {
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
    async (token: string | undefined) => {
        const pb = createClientWithToken(token);
        return await pb.collection('users').getFullList<User>({
            filter: 'role = "estudiante"',
            sort: 'name',
        });
    },
    ['students-list'],
    { revalidate: 60, tags: ['users'] }
);

const getTeamsCached = unstable_cache(
    async (token: string | undefined) => {
        const pb = createClientWithToken(token);
        return await pb.collection('teams').getFullList<Team>({
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

export const getSprints = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('pb_auth')?.value;
    try {
        return await getSprintsCached(token);
    } catch (error) {
        console.error('Error fetching sprints:', error);
        // Fallback to direct fetch if cache fails? No, just throw or return empty
        throw error;
    }
});

export const getUsers = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('pb_auth')?.value;
    return getUsersCached(token);
});

export const getStudents = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('pb_auth')?.value;
    return getStudentsCached(token);
});

export const getTeams = cache(async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('pb_auth')?.value;
    try {
        return await getTeamsCached(token);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return [];
    }
});

export const getTeam = cache(async (id: string) => {
  const pb = await createServerClient();
  try {
    const record = await pb.collection('teams').getOne<Team>(id, {
      expand: 'members',
    });
    return record;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
});

export const getStudentTeam = cache(async (studentId: string) => {
  const pb = await createServerClient();
  try {
    const record = await pb.collection('teams').getFirstListItem<Team>(
      `members ~ "${studentId}"`, 
      { expand: 'members' }
    );
    return record;
  } catch (error) {
    return null;
  }
});

export const getSprint = cache(async (id: string) => {
  const pb = await createServerClient();
  try {
    const record = await pb.collection('sprints').getOne<Sprint>(id);
    return record;
  } catch (error) {
    console.error('Error fetching sprint:', error);
    return null;
  }
});
