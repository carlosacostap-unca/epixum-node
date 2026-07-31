"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";
import { getLegacyCohort } from "@/lib/cohorts/access";
import type { Team } from "@/types";

async function requireLegacyTeam(pb: Awaited<ReturnType<typeof createServerClient>>, teamId: string) {
  const [team, cohort] = await Promise.all([pb.collection('teams').getOne<Team>(teamId), getLegacyCohort()]);
  if (team.cohort !== cohort.id) throw new Error('El equipo no pertenece a la cohorte histórica.');
  return team;
}

async function requireCohortTeam(pb: Awaited<ReturnType<typeof createServerClient>>, teamId: string, cohortId: string) {
  const team = await pb.collection('teams').getOne<Team>(teamId);
  if (team.cohort !== cohortId) throw new Error('El equipo no pertenece a esta cohorte.');
  return team;
}

export async function saveTeamOrganization(cohortId: string, assignments: Record<string, string[]>) {
  const pb = await createServerClient();
  const user = pb.authStore.model;
  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    return { success: false, error: 'No tienes permisos para organizar equipos.' };
  }

  try {
    const teams = await pb.collection('teams').getFullList<Team>({
      filter: pb.filter('cohort = {:cohort}', { cohort: cohortId }),
    });
    const validTeamIds = new Set(teams.map((team) => team.id));
    if (Object.keys(assignments).some((id) => id !== 'unassigned' && !validTeamIds.has(id))) {
      throw new Error('La organización contiene un equipo inválido.');
    }

    const seen = new Set<string>();
    for (const memberIds of Object.values(assignments)) {
      for (const memberId of memberIds) {
        if (seen.has(memberId)) throw new Error('Un estudiante no puede pertenecer a dos equipos.');
        seen.add(memberId);
      }
    }

    await Promise.all(teams.map((team) => pb.collection('teams').update(team.id, {
      members: assignments[team.id] || [],
    })));
    revalidatePath(`/cohorts/${cohortId}/teams`);
    return { success: true, message: 'Organización guardada.' };
  } catch (error) {
    console.error('Failed to save team organization:', error);
    return { success: false, error: error instanceof Error ? error.message : 'No se pudo guardar la organización.' };
  }
}

export async function createCohortTeam(cohortId: string, name: string) {
  const pb = await createServerClient();
  const user = pb.authStore.model;
  if (!user || (user.role !== 'docente' && user.role !== 'admin')) return { success: false, error: 'No autorizado.' };
  const cleanName = name.trim();
  if (!cleanName) return { success: false, error: 'El nombre es obligatorio.' };
  try {
    await pb.collection('teams').create({ name: cleanName, members: [], cohort: cohortId });
    revalidatePath(`/cohorts/${cohortId}/teams`);
    return { success: true };
  } catch (error) {
    console.error('Failed to create cohort team:', error);
    return { success: false, error: 'No se pudo crear el equipo.' };
  }
}

export async function deleteCohortTeam(cohortId: string, teamId: string) {
  const pb = await createServerClient();
  const user = pb.authStore.model;
  if (!user || (user.role !== 'docente' && user.role !== 'admin')) return { success: false, error: 'No autorizado.' };
  try {
    await requireCohortTeam(pb, teamId, cohortId);
    await pb.collection('teams').delete(teamId);
    revalidatePath(`/cohorts/${cohortId}/teams`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete cohort team:', error);
    return { success: false, error: 'No se pudo eliminar el equipo.' };
  }
}

export async function createTeam(formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user) {
    console.error('CreateTeam: User not authenticated');
    return { success: false, error: 'Usuario no autenticado' };
  }

  if (user.role !== 'docente' && user.role !== 'admin') {
    console.error(`CreateTeam: User role ${user.role} not authorized`);
    return { success: false, error: 'No tienes permisos para crear equipos' };
  }

  const name = formData.get('name') as string;
  if (!name) return { success: false, error: 'El nombre es obligatorio' };

  try {
    const cohort = await getLegacyCohort();
    await pb.collection('teams').create({ name, members: [], cohort: cohort.id });
    revalidatePath('/teams', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create team:', error);
    // Return specific PocketBase error if available
    const message = error?.data?.message || error?.message || 'Error al crear el equipo en la base de datos';
    return { success: false, error: message };
  }
}

export async function deleteTeam(teamId: string) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await requireLegacyTeam(pb, teamId);
    await pb.collection('teams').delete(teamId);
    revalidatePath('/teams', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete team:', error);
    return { success: false, error: 'Failed to delete team' };
  }
}

export async function updateTeamName(teamId: string, name: string) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await requireLegacyTeam(pb, teamId);
    await pb.collection('teams').update(teamId, { name });
    revalidatePath('/teams', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update team name:', error);
    return { success: false, error: 'Failed to update team name' };
  }
}

export async function moveStudentToTeam(studentId: string, targetTeamId: string | null) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const cohort = await getLegacyCohort();
    // 1. Find if student is currently in any team
    // We filter teams where members contain the studentId
    const currentTeams = await pb.collection('teams').getFullList({
      filter: pb.filter('members ~ {:student} && cohort = {:cohort}', { student: studentId, cohort: cohort.id }),
    });

    // 2. Remove from current team(s)
    // Even if somehow in multiple (shouldn't happen), remove from all except target
    for (const team of currentTeams) {
      if (team.id === targetTeamId) continue; // Already in target, skip removal (though if we are here, logic suggests user moved explicitly)
      
      // Use array operations to remove
      await pb.collection('teams').update(team.id, {
        'members-': studentId
      });
    }

    // 3. Add to new team if targetTeamId is provided (not null/empty)
    if (targetTeamId) {
      await requireLegacyTeam(pb, targetTeamId);
      // Check if already in target (optimization)
      const isAlreadyInTarget = currentTeams.some(t => t.id === targetTeamId);
      if (!isAlreadyInTarget) {
        await pb.collection('teams').update(targetTeamId, {
          'members+': studentId
        });
      }
    }

    revalidatePath('/teams', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to move student:', error);
    return { success: false, error: 'Failed to move student' };
  }
}
