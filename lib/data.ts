import { createServerClient } from './pocketbase-server';
import { Sprint, Class, Link, Assignment, User, Delivery, Team, Review } from '@/types';

export async function getReviews(sprintId: string) {
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
}

export async function getUserReview(sprintId: string, userId: string) {
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
}

export async function getSprints() {
  const pb = await createServerClient();
  const records = await pb.collection('sprints').getFullList<Sprint>({
    sort: 'created',
  });
  return records;
}

export async function getUsers() {
  const pb = await createServerClient();
  const records = await pb.collection('users').getFullList<User>({
      sort: 'created',
  });
  return records;
}

export async function getStudents() {
  const pb = await createServerClient();
  const records = await pb.collection('users').getFullList<User>({
      filter: 'role = "estudiante"',
      sort: 'name',
  });
  return records;
}

export async function getTeams() {
  const pb = await createServerClient();
  try {
    const records = await pb.collection('teams').getFullList<Team>({
      sort: 'created',
      expand: 'members',
    });
    return records;
  } catch (error) {
    // Return empty array if collection doesn't exist yet or other error
    console.error('Error fetching teams:', error);
    return [];
  }
}

export async function getTeam(id: string) {
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
}

export async function getStudentTeam(studentId: string) {
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
}

export async function getSprint(id: string) {
  const pb = await createServerClient();
  const record = await pb.collection('sprints').getOne<Sprint>(id, {
    expand: 'classes',
  });
  return record;
}

export async function getAllClasses() {
    const pb = await createServerClient();
    const records = await pb.collection('classes').getFullList<Class>({
        sort: 'created',
        expand: 'sprint',
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

export async function getAllAssignments() {
  const pb = await createServerClient();
  const records = await pb.collection('assignments').getFullList<Assignment>({
      sort: 'created',
      expand: 'sprint',
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
