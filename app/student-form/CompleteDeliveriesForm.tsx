"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitStudentSurvey } from "./actions";

export default function CompleteDeliveriesForm({ userId, sprintId }: { userId: string, sprintId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("sprint", sprintId);
    formData.append("status", "completed");

    try {
        const result = await submitStudentSurvey(formData);
        if (result.success) {
            setSuccess(true);
        } else {
            console.error("Error saving survey:", result.error);
            alert("Hubo un error al guardar tu respuesta. Por favor intenta nuevamente.");
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("Ocurrió un error inesperado.");
    } finally {
        setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center dark:bg-green-900/20 dark:border-green-800">
        <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">¡Gracias por tu feedback!</h3>
        <p className="text-green-700 dark:text-green-400">Tus respuestas nos ayudan a mejorar el curso.</p>
        <button 
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
            Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 dark:bg-blue-900/20 dark:border-blue-800 mb-8">
        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-2">¡Felicitaciones! 🎉</h3>
        <p className="text-blue-700 dark:text-blue-400">
          Has completado todas las entregas del Sprint 1. Nos gustaría conocer tu opinión sobre este primer tramo del curso.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ¿Cómo te sentiste con el cursado durante este Sprint?
        </label>
        <textarea
          name="feelings"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          placeholder="Cuéntanos tu experiencia general..."
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Feedback sobre el contenido y los trabajos prácticos
        </label>
        <textarea
          name="feedback"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          placeholder="¿Qué te pareció el nivel de dificultad? ¿Los temas fueron claros?"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sugerencias de mejora
        </label>
        <textarea
          name="suggestions"
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          placeholder="¿Qué podríamos hacer mejor en los próximos sprints?"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Enviando..." : "Enviar Respuestas"}
      </button>
    </form>
  );
}
