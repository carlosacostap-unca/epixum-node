"use client";

import { useMemo, useState } from "react";

export type SprintStatus = "approved" | "pending" | "empty";
export type StudentCategory = "approved" | "active" | "atRisk" | "out";

type SprintColumn = {
  id: string;
  title: string;
};

type StudentSprintStatus = {
  sprintId: string;
  status: SprintStatus;
  deliveredCount: number;
  totalAssignments: number;
};

type StudentRow = {
  student: {
    id: string;
    name: string;
    email: string;
  };
  sprintStatuses: StudentSprintStatus[];
  approvedSprints: number;
  approvableSprints: number;
  category: StudentCategory;
};

type DashboardCursadaTableProps = {
  sprints: SprintColumn[];
  rows: StudentRow[];
};

const categories: Array<{
  key: StudentCategory;
  title: string;
  description: string;
  badgeClassName: string;
}> = [
  {
    key: "approved",
    title: "Aprobado",
    description: "Aprobo los 5 sprints",
    badgeClassName: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  {
    key: "active",
    title: "En carrera",
    description: "Aprobo 3 o 4 sprints",
    badgeClassName: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  {
    key: "atRisk",
    title: "Complicado",
    description: "Aprobo 1 o 2 sprints",
    badgeClassName: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  {
    key: "out",
    title: "Fuera de carrera",
    description: "No aprobo ningun sprint",
    badgeClassName: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
];

function statusBadge(item: StudentSprintStatus) {
  if (item.status === "approved") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
        Aprobado
      </span>
    );
  }

  if (item.status === "pending") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
        No aprobado
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      Sin TPs
    </span>
  );
}

function StudentTable({
  sprints,
  rows,
  emptyText,
}: DashboardCursadaTableProps & { emptyText: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
              <th className="sticky left-0 z-10 min-w-[240px] bg-zinc-50 p-4 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Alumno
              </th>
              {sprints.map((sprint) => (
                <th
                  key={sprint.id}
                  className="min-w-[150px] p-4 text-center text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300"
                >
                  {sprint.title}
                </th>
              ))}
              <th className="min-w-[140px] p-4 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                Resumen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={sprints.length + 2} className="p-8 text-center text-zinc-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="sticky left-0 z-10 bg-white p-4 dark:bg-zinc-900">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {row.student.name}
                    </div>
                    <div className="text-xs text-zinc-500">{row.student.email}</div>
                  </td>
                  {row.sprintStatuses.map((item) => (
                    <td key={item.sprintId} className="p-4 text-center">
                      {statusBadge(item)}
                      {item.totalAssignments > 0 && (
                        <div className="mt-1 text-xs text-zinc-500">
                          {item.deliveredCount}/{item.totalAssignments} entregas
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="p-4 text-center">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {row.approvedSprints}/{row.approvableSprints}
                    </span>
                    <div className="text-xs text-zinc-500">sprints aprobados</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardCursadaTable({ sprints, rows }: DashboardCursadaTableProps) {
  const [viewMode, setViewMode] = useState<"all" | "grouped">("all");

  const rowsByCategory = useMemo(() => {
    return categories.reduce<Record<StudentCategory, StudentRow[]>>(
      (acc, category) => {
        acc[category.key] = rows.filter((row) => row.category === category.key);
        return acc;
      },
      {
        approved: [],
        active: [],
        atRisk: [],
        out: [],
      }
    );
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Vista del listado</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Alterna entre el listado completo y la agrupacion por estado de cursada.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setViewMode("all")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "all"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grouped")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "grouped"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            }`}
          >
            Por estado
          </button>
        </div>
      </div>

      {viewMode === "all" ? (
        <StudentTable
          sprints={sprints}
          rows={rows}
          emptyText="No hay alumnos cargados para mostrar."
        />
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryRows = rowsByCategory[category.key];

            return (
              <section key={category.key} className="space-y-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                        {category.title}
                      </h2>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${category.badgeClassName}`}
                      >
                        {categoryRows.length}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {category.description}
                    </p>
                  </div>
                </div>
                <StudentTable
                  sprints={sprints}
                  rows={categoryRows}
                  emptyText="No hay alumnos en esta seccion."
                />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
