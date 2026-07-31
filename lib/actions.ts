"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";
import { assertExclusiveAcademicParent, assertModeCapability } from "@/lib/cohorts/domain";
import type { Assignment, Class, Sprint, Week } from "@/types";
import { getLegacyCohort } from "@/lib/cohorts/access";
import { validateRepositoryUrl } from "@/lib/deliveries/validation";

async function requireLegacySprint(pb: Awaited<ReturnType<typeof createServerClient>>, sprintId: string) {
  const [sprint, cohort] = await Promise.all([pb.collection('sprints').getOne<Sprint>(sprintId), getLegacyCohort()]);
  if (sprint.cohort !== cohort.id) throw new Error('El sprint no pertenece a la cohorte histórica.');
  return sprint;
}

async function resolveAcademicParent(pb: Awaited<ReturnType<typeof createServerClient>>, sprintId?: string, weekId?: string) {
  const parent = assertExclusiveAcademicParent({ sprint: sprintId, week: weekId });
  if (parent.sprint) {
    const sprint = await pb.collection("sprints").getOne<Sprint>(parent.sprint);
    if (!sprint.cohort) throw new Error("El sprint todavía no tiene cohorte asignada.");
    const cohort = await pb.collection("cohorts").getOne(sprint.cohort);
    assertModeCapability(cohort.mode, "sprints");
    return { ...parent, cohortId: sprint.cohort, path: `/cohorts/${sprint.cohort}/sprints/${sprint.id}` };
  }
  const week = await pb.collection("weeks").getOne<Week>(parent.week!);
  const cohort = await pb.collection("cohorts").getOne(week.cohort);
  assertModeCapability(cohort.mode, "weeks");
  return { ...parent, cohortId: week.cohort, path: `/cohorts/${week.cohort}/weeks/${week.id}` };
}

async function requireActiveAssignmentEnrollment(pb: Awaited<ReturnType<typeof createServerClient>>, assignmentId: string, userId: string) {
  const assignment = await pb.collection("assignments").getOne<Assignment>(assignmentId);
  const parent = await resolveAcademicParent(pb, assignment.sprint, assignment.week);
  if (assignment.week) {
    const week = await pb.collection("weeks").getOne<Week>(assignment.week);
    if (week.publicationStatus !== "published") throw new Error("No se puede entregar sobre una semana en borrador.");
  }
  const enrollment = await pb.collection("cohort_enrollments").getFirstListItem(
    pb.filter("user = {:user} && cohort = {:cohort} && status = 'active'", { user: userId, cohort: parent.cohortId }),
  ).catch(() => null);
  if (!enrollment) throw new Error("Tu matrícula no está activa para realizar o actualizar entregas.");
  return { assignment, parent };
}

export async function updateUserRole(userId: string, role: string) {
  const pb = await createServerClient();
  
  // Verify current user is admin
  if (!pb.authStore.isValid || pb.authStore.model?.role !== 'admin') {
    throw new Error("Unauthorized");
  }

  try {
    await pb.collection('users').update(userId, { role });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to update role:', error);
    return { success: false, error: 'Failed to update role' };
  }
}

export async function createSprint(formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  const title = formData.get('title') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;

  if (!title) {
     return { success: false, error: 'Title is required' };
  }

  try {
    const cohort = await getLegacyCohort();
    const data = {
      title,
      cohort: cohort.id,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
    };
    
    await pb.collection('sprints').create(data);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to create sprint:', error);
    return { success: false, error: 'Failed to create sprint' };
  }
}

export async function updateSprint(sprintId: string, formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  const title = formData.get('title') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;

  try {
    await requireLegacySprint(pb, sprintId);
     const data: any = {
      title,
    };
    if (startDate) data.startDate = new Date(startDate).toISOString();
    if (endDate) data.endDate = new Date(endDate).toISOString();

    await pb.collection('sprints').update(sprintId, data);
    revalidatePath('/');
    revalidatePath(`/sprints/${sprintId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update sprint:', error);
    return { success: false, error: 'Failed to update sprint' };
  }
}

export async function deleteSprint(sprintId: string) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  try {
    await requireLegacySprint(pb, sprintId);
    await pb.collection('sprints').delete(sprintId);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete sprint:', error);
    return { success: false, error: 'Failed to delete sprint' };
  }
}

// Classes

export async function createClass(formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const sprintId = formData.get('sprintId') as string;
  const weekId = formData.get('weekId') as string;
  const date = formData.get('date') as string;

  if (!title) {
     return { success: false, error: 'El título es obligatorio' };
  }

  try {
    const parent = await resolveAcademicParent(pb, sprintId, weekId);
    const data = {
      title,
      description,
      sprint: parent.sprint,
      week: parent.week,
      date: date ? new Date(date).toISOString() : null,
    };
    
    await pb.collection('classes').create(data);
    revalidatePath(parent.path);
    return { success: true };
  } catch (error) {
    console.error('Failed to create class:', error);
    return { success: false, error: 'Failed to create class' };
  }
}

export async function updateClass(classId: string, formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const sprintId = formData.get('sprintId') as string;
  const weekId = formData.get('weekId') as string;

  try {
    const current = await pb.collection('classes').getOne<Class>(classId);
    const parent = await resolveAcademicParent(pb, sprintId || current.sprint, weekId || current.week);
    const data: any = {
      title,
      description,
      sprint: parent.sprint,
      week: parent.week,
    };
    if (date) data.date = new Date(date).toISOString();

    await pb.collection('classes').update(classId, data);
    
    revalidatePath(parent.path);
    revalidatePath(`/classes/${classId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update class:', error);
    return { success: false, error: 'Failed to update class' };
  }
}

export async function deleteClass(classId: string, sprintId?: string) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  try {
    await pb.collection('classes').delete(classId);
    if (sprintId) revalidatePath(`/sprints/${sprintId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete class:', error);
    return { success: false, error: 'Failed to delete class' };
  }
}

// Assignments

export async function createAssignment(formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const sprintId = formData.get('sprintId') as string;
  const weekId = formData.get('weekId') as string;

  if (!title) {
     return { success: false, error: 'El título es obligatorio' };
  }

  try {
    const parent = await resolveAcademicParent(pb, sprintId, weekId);
    const data = {
      title,
      description,
      sprint: parent.sprint,
      week: parent.week,
    };
    
    await pb.collection('assignments').create(data);
    revalidatePath(parent.path);
    return { success: true };
  } catch (error) {
    console.error('Failed to create assignment:', error);
    return { success: false, error: 'Failed to create assignment' };
  }
}

export async function updateAssignment(assignmentId: string, formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const sprintId = formData.get('sprintId') as string;
  const weekId = formData.get('weekId') as string;

  try {
    const current = await pb.collection('assignments').getOne<Assignment>(assignmentId);
    const parent = await resolveAcademicParent(pb, sprintId || current.sprint, weekId || current.week);
    const data = {
      title,
      description,
      sprint: parent.sprint,
      week: parent.week,
    };

    await pb.collection('assignments').update(assignmentId, data);
    
    revalidatePath(parent.path);
    revalidatePath(`/assignments/${assignmentId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update assignment:', error);
    return { success: false, error: 'Failed to update assignment' };
  }
}

export async function deleteAssignment(assignmentId: string, sprintId?: string) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  try {
    await pb.collection('assignments').delete(assignmentId);
    if (sprintId) revalidatePath(`/sprints/${sprintId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete assignment:', error);
    return { success: false, error: 'Failed to delete assignment' };
  }
}

// Links

export async function createLink(formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const classId = formData.get('classId') as string;
  const assignmentId = formData.get('assignmentId') as string;

  if (!title || !url || (!classId && !assignmentId)) {
     return { success: false, error: 'Title, URL and Parent ID are required' };
  }

  try {
    const data: any = {
      title,
      url,
    };
    if (classId) data.class = classId;
    if (assignmentId) data.assignment = assignmentId;
    
    await pb.collection('links').create(data);
    
    if (classId) revalidatePath(`/classes/${classId}`);
    if (assignmentId) revalidatePath(`/assignments/${assignmentId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to create link:', error);
    return { success: false, error: 'Failed to create link' };
  }
}

export async function updateLink(linkId: string, formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const classId = formData.get('classId') as string;
  const assignmentId = formData.get('assignmentId') as string;

  try {
    const data = {
      title,
      url,
    };

    await pb.collection('links').update(linkId, data);
    
    if (classId) revalidatePath(`/classes/${classId}`);
    if (assignmentId) revalidatePath(`/assignments/${assignmentId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update link:', error);
    return { success: false, error: 'Failed to update link' };
  }
}

export async function deleteLink(linkId: string, parentId?: string, parentType?: 'class' | 'assignment') {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
    throw new Error("Unauthorized");
  }

  try {
    await pb.collection('links').delete(linkId);
    
    if (parentId && parentType) {
        if (parentType === 'class') revalidatePath(`/classes/${parentId}`);
        if (parentType === 'assignment') revalidatePath(`/assignments/${parentId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete link:', error);
    return { success: false, error: 'Failed to delete link' };
  }
}

// Deliveries

export async function createDelivery(formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user || user.role !== 'estudiante') {
    return { success: false as const, error: 'Sólo los estudiantes pueden realizar entregas.' };
  }

  const assignmentId = (formData.get('assignmentId') as string)?.trim();
  const repositoryUrl = (formData.get('repositoryUrl') as string)?.trim();

  if (!assignmentId) return { success: false as const, error: 'No pudimos identificar el trabajo práctico.' };
  const validation = validateRepositoryUrl(repositoryUrl || "");
  if (!validation.success) return { success: false as const, error: 'Revisá la URL del repositorio.', fieldErrors: { repositoryUrl: validation.error } };

  try {
    const context = await requireActiveAssignmentEnrollment(pb, assignmentId, user.id);
    const data = {
      assignment: assignmentId,
      student: user.id,
      repositoryUrl: validation.value,
    };
    
    await pb.collection('deliveries').create(data);
    
    revalidatePath(`/assignments/${assignmentId}`);
    revalidatePath(`/cohorts/${context.parent.cohortId}/assignments/${assignmentId}`);
    revalidatePath(context.parent.path);
    return { success: true as const, message: 'Entrega enviada correctamente.' };
  } catch (error) {
    console.error('Failed to create delivery:', error);
    if (String(error).includes('unique')) {
        return { success: false as const, error: 'Ya realizaste una entrega para este trabajo. Actualizá la entrega existente.' };
    }
    return { success: false as const, error: deliveryActionError(error, 'No pudimos enviar la entrega. Intentá nuevamente.') };
  }
}

export async function updateDelivery(deliveryId: string, formData: FormData) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  if (!user) {
    return { success: false as const, error: 'Tu sesión no es válida. Volvé a ingresar.' };
  }

  // We need to fetch the delivery to check ownership, 
  // although PocketBase API rules should handle this, it's good to be explicit or just try/catch
  
  const repositoryUrl = (formData.get('repositoryUrl') as string)?.trim();
  const assignmentId = (formData.get('assignmentId') as string)?.trim(); // Needed for revalidation

  const validation = validateRepositoryUrl(repositoryUrl || "");
  if (!validation.success) return { success: false as const, error: 'Revisá la URL del repositorio.', fieldErrors: { repositoryUrl: validation.error } };

  try {
    const delivery = await pb.collection('deliveries').getOne(deliveryId);
    if (user.role === 'estudiante' && delivery.student !== user.id) {
      return { success: false as const, error: 'No podés modificar una entrega ajena.' };
    }
    const context = await requireActiveAssignmentEnrollment(pb, assignmentId || delivery.assignment, user.id);
    const data = {
      repositoryUrl: validation.value,
    };

    await pb.collection('deliveries').update(deliveryId, data);
    
    if (assignmentId) revalidatePath(`/assignments/${assignmentId}`);
    if (assignmentId) revalidatePath(`/cohorts/${context.parent.cohortId}/assignments/${assignmentId}`);
    revalidatePath(context.parent.path);
    return { success: true as const, message: 'Entrega actualizada correctamente.' };
  } catch (error) {
    console.error('Failed to update delivery:', error);
    return { success: false as const, error: deliveryActionError(error, 'No pudimos actualizar la entrega. Intentá nuevamente.') };
  }
}

function deliveryActionError(error: unknown, fallback: string) {
  if (error instanceof Error && (
    error.message.startsWith("No se puede entregar")
    || error.message.startsWith("Tu matrícula no está activa")
  )) return error.message;
  return fallback;
}
