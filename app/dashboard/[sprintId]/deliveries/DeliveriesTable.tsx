
'use client';

import { useState } from 'react';
import { Assignment, Delivery, User } from '@/types';

interface DeliveriesTableProps {
    students: User[];
    assignments: Assignment[];
    deliveries: Delivery[];
}

export default function DeliveriesTable({ students, assignments, deliveries }: DeliveriesTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sprintStatusFilter, setSprintStatusFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
    const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
    const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<'all' | 'delivered' | 'pending'>('all');

    // Filter students
    const filteredStudents = students.filter(student => {
        // 1. Search by name/surname
        // The User type has 'name', 'firstName', 'lastName'. 'surname' is not a property.
        // We use 'name' which is likely the full name, or combine firstName and lastName if needed.
        // If 'name' is empty, we fallback to firstName + lastName
        const displayName = student.name || `${student.firstName || ''} ${student.lastName || ''}`;
        const fullName = displayName.toLowerCase();
        const email = student.email ? student.email.toLowerCase() : '';
        const searchMatch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
        if (!searchMatch) return false;

        // Get student deliveries
        const studentDeliveries = deliveries.filter(d => d.student === student.id);
        const hasAllDeliveries = assignments.every(a => studentDeliveries.some(d => d.assignment === a.id));

        // 2. Filter by Sprint Status (Overall)
        if (sprintStatusFilter === 'complete' && !hasAllDeliveries) return false;
        if (sprintStatusFilter === 'incomplete' && hasAllDeliveries) return false;

        // 3. Filter by Specific Assignment Status
        if (assignmentFilter !== 'all') {
            const hasAssignmentDelivery = studentDeliveries.some(d => d.assignment === assignmentFilter);
            if (assignmentStatusFilter === 'delivered' && !hasAssignmentDelivery) return false;
            if (assignmentStatusFilter === 'pending' && hasAssignmentDelivery) return false;
        }

        return true;
    });

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Buscar Estudiante</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Nombre, apellido o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                        <svg className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                <div className="w-full md:w-auto">
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Estado del Sprint</label>
                    <select
                        value={sprintStatusFilter}
                        onChange={(e) => setSprintStatusFilter(e.target.value as any)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    >
                        <option value="all">Todos</option>
                        <option value="complete">Completo</option>
                        <option value="incomplete">Incompleto</option>
                    </select>
                </div>

                <div className="w-full md:w-auto">
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Filtrar por TP</label>
                    <select
                        value={assignmentFilter}
                        onChange={(e) => {
                            setAssignmentFilter(e.target.value);
                            // Reset status filter if "all" is selected to avoid confusion
                            if (e.target.value === 'all') setAssignmentStatusFilter('all');
                        }}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    >
                        <option value="all">Todos los trabajos</option>
                        {assignments.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                    </select>
                </div>

                {assignmentFilter !== 'all' && (
                    <div className="w-full md:w-auto animate-in fade-in slide-in-from-left-4 duration-200">
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Estado del TP</label>
                        <select
                            value={assignmentStatusFilter}
                            onChange={(e) => setAssignmentStatusFilter(e.target.value as any)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        >
                            <option value="all">Cualquiera</option>
                            <option value="delivered">Entregado</option>
                            <option value="pending">Pendiente</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Results Summary */}
            <div className="text-sm text-zinc-500 dark:text-zinc-400 px-1">
                Mostrando <span className="font-semibold text-zinc-900 dark:text-white">{filteredStudents.length}</span> estudiantes
                {sprintStatusFilter !== 'all' && <span> • Sprint <span className="font-medium">{sprintStatusFilter === 'complete' ? 'Completo' : 'Incompleto'}</span></span>}
                {assignmentFilter !== 'all' && <span> • TP Seleccionado</span>}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                <th className="p-4 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[200px]">Estudiante</th>
                                {assignments.map(a => (
                                    <th 
                                        key={a.id} 
                                        className={`p-4 font-semibold text-zinc-700 dark:text-zinc-300 text-center text-xs uppercase tracking-wider ${assignmentFilter === a.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' : ''}`}
                                    >
                                        {a.title}
                                    </th>
                                ))}
                                <th className="p-4 font-semibold text-zinc-700 dark:text-zinc-300 text-center min-w-[100px]">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={assignments.length + 2} className="p-8 text-center text-zinc-500">
                                        No se encontraron estudiantes con los filtros seleccionados.
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map(student => {
                                    const studentDeliveries = deliveries.filter(d => d.student === student.id);
                                    const allDelivered = assignments.every(a => studentDeliveries.some(d => d.assignment === a.id));

                                    return (
                                        <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="p-4 font-medium text-zinc-900 dark:text-zinc-100">
                                                <div>{student.name || `${student.firstName || ''} ${student.lastName || ''}`}</div>
                                                <div className="text-xs text-zinc-500 font-normal">{student.email}</div>
                                            </td>
                                            {assignments.map(a => {
                                                const isDelivered = studentDeliveries.some(d => d.assignment === a.id);
                                                const isTargetAssignment = assignmentFilter === a.id;
                                                
                                                return (
                                                    <td key={a.id} className={`p-4 text-center ${isTargetAssignment ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                                        {isDelivered ? (
                                                            <div className="flex justify-center group relative">
                                                                <span className={`inline-block w-3 h-3 rounded-full transition-transform ${isTargetAssignment ? 'bg-blue-500 scale-125' : 'bg-green-500'}`}></span>
                                                                <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-zinc-800 text-white text-xs rounded whitespace-nowrap z-10">Entregado</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-center group relative">
                                                                <span className={`inline-block w-3 h-3 rounded-full transition-transform ${isTargetAssignment ? 'bg-red-600 scale-125' : 'bg-red-400'}`}></span>
                                                                <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-zinc-800 text-white text-xs rounded whitespace-nowrap z-10">Pendiente</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="p-4 text-center">
                                                {allDelivered ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Completo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        Incompleto
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
