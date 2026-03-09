"use client";

import { User } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/lib/actions-users";

export default function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Controlled inputs state
  const [firstName, setFirstName] = useState(user.firstName || user.name?.split(' ')[0] || "");
  const [lastName, setLastName] = useState(user.lastName || user.name?.split(' ').slice(1).join(' ') || "");
  const [dni, setDni] = useState(user.dni || "");
  const [phone, setPhone] = useState(user.phone || "");

  // Formatting helpers
  const formatName = (value: string) => {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const val = e.target.value;
    // Allow letters, spaces, and accents (áéíóúñÁÉÍÓÚÑ)
    if (/^[a-zA-Z\s\u00C0-\u00FF]*$/.test(val)) {
      setter(val);
    }
  };

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>, setter: (val: string) => void) => {
    setter(formatName(e.target.value));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setter(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: firstName,
      lastName: lastName,
      dni: dni,
      birthDate: formData.get("birthDate") as string,
      phone: phone,
    };

    const result = await updateUserProfile(user.id, data);

    setLoading(false);
    if (result.success) {
      setSuccess("Perfil actualizado correctamente");
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      setError(result.error || "Error al actualizar perfil");
    }
  };

  // Helper to format date for input type="date"
  const formattedBirthDate = user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* Email (Read Only) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-400 cursor-not-allowed p-2 border"
          />
          <p className="mt-1 text-xs text-gray-500">El email no se puede modificar.</p>
        </div>

        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombres</label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={firstName}
            onChange={(e) => handleNameChange(e, setFirstName)}
            onBlur={(e) => handleNameBlur(e, setFirstName)}
            placeholder="Ej: Juan Pablo"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-white p-2 border"
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellidos</label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={lastName}
            onChange={(e) => handleNameChange(e, setLastName)}
            onBlur={(e) => handleNameBlur(e, setLastName)}
            placeholder="Ej: Pérez García"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-white p-2 border"
          />
        </div>

        {/* DNI */}
        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-gray-700 dark:text-gray-300">DNI</label>
          <input
            type="text"
            name="dni"
            id="dni"
            value={dni}
            onChange={(e) => handleNumberChange(e, setDni)}
            placeholder="Solo números"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-white p-2 border"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={phone}
            onChange={(e) => handleNumberChange(e, setPhone)}
            placeholder="Solo números"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-white p-2 border"
          />
        </div>

        {/* Birth Date */}
        <div className="col-span-2 md:col-span-1">
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Nacimiento</label>
          <input
            type="date"
            name="birthDate"
            id="birthDate"
            defaultValue={formattedBirthDate}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-600 dark:text-white p-2 border"
          />
        </div>

      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 p-4 text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-4 text-green-700 bg-green-100 rounded-md dark:bg-green-900 dark:text-green-200">
          {success}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
