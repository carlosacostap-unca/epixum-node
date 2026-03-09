
import { createServerClient } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import { Sprint, Assignment, Delivery, User } from "@/types";
import Link from "next/link";
import DeliveriesTable from "./DeliveriesTable";

export const dynamic = 'force-dynamic';

export default async function DeliveriesPage({ params }: { params: Promise<{ sprintId: string }> }) {
    const { sprintId } = await params;
    const pb = await createServerClient();
    const user = pb.authStore.model;

    if (!user || (user.role !== 'docente' && user.role !== 'admin')) {
        redirect("/");
    }

    // Fetch sprint
    let sprint: Sprint | null = null;
    try {
        sprint = await pb.collection('sprints').getOne<Sprint>(sprintId);
    } catch (e) {
        console.error("Error fetching sprint:", e);
        return <div>Sprint no encontrado</div>;
    }

    // Fetch assignments
    let assignments: Assignment[] = [];
    try {
        assignments = await pb.collection('assignments').getFullList<Assignment>({
            filter: `sprint = "${sprintId}"`,
            sort: 'created',
        });
    } catch (e) {
        console.error("Error fetching assignments:", e);
    }

    // Fetch students
    let students: User[] = [];
    try {
        students = await pb.collection('users').getFullList<User>({
            filter: 'role = "estudiante"',
            sort: 'name',
        });
    } catch (e) {
        console.error("Error fetching students:", e);
    }

    // Fetch deliveries
    let deliveries: Delivery[] = [];
    if (assignments.length > 0) {
        try {
            const filter = assignments.map(id => `assignment = "${id.id}"`).join(" || ");
            deliveries = await pb.collection('deliveries').getFullList<Delivery>({
                filter: filter,
            });
        } catch (e) {
            console.error("Error fetching deliveries:", e);
        }
    }

    return (
        <div className="container mx-auto p-8 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Progreso de Entregas</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">{sprint.title}</p>
                </div>
                <Link href="/dashboard" className="text-blue-600 hover:underline dark:text-blue-400">
                    &larr; Volver al Dashboard
                </Link>
            </div>

            <DeliveriesTable 
                students={students}
                assignments={assignments}
                deliveries={deliveries}
            />
        </div>
    );
}
