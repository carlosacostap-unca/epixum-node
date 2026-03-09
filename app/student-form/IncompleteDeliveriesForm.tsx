"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitStudentSurvey } from "./actions";

export default function IncompleteDeliveriesForm({ userId, sprintId }: { userId: string, sprintId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [futurePlan, setFuturePlan] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("sprint", sprintId);
    formData.append("status", "incomplete_deliveries");

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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center dark:bg-blue-900/20 dark:border-blue-800">
        <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-2">¡Gracias por completar la encuesta!</h3>
        <p className="text-blue-700 dark:text-blue-400">
            Hemos registrado tu respuesta. {futurePlan === "continue" ? "El equipo docente evaluará tu solicitud de prórroga." : "Estaremos en contacto para los próximos pasos."}
        </p>
        <button 
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
            Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 dark:bg-purple-900/20 dark:border-purple-800 mb-8">
        <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-2">Informacion necesaria</h3>
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Necesitas que se te provea de una excepcion en el plazo de entrega del Sprint 1 y que se te provea una prorroga para completar el trabajo practico? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
                <div className={`p-3 rounded-lg border cursor-pointer transition-all ${futurePlan === 'continue' ? 'bg-purple-100 border-purple-500 ring-1 ring-purple-500 dark:bg-purple-900/40' : 'border-gray-200 hover:border-purple-300 dark:border-zinc-700'}`}
                     onClick={() => setFuturePlan('continue')}>
                    <div className="flex items-center">
                        <input 
                            type="radio" 
                            name="futurePlan" 
                            value="continue" 
                            required
                            checked={futurePlan === 'continue'}
                            onChange={() => setFuturePlan('continue')}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                        <label className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                            Si, necesito mas tiempo para entregar
                        </label>
                    </div>
                </div>

                <div className={`p-3 rounded-lg border cursor-pointer transition-all ${futurePlan === 'retake' ? 'bg-purple-100 border-purple-500 ring-1 ring-purple-500 dark:bg-purple-900/40' : 'border-gray-200 hover:border-purple-300 dark:border-zinc-700'}`}
                     onClick={() => setFuturePlan('retake')}>
                    <div className="flex items-center">
                        <input 
                            type="radio" 
                            name="futurePlan" 
                            value="retake" 
                            checked={futurePlan === 'retake'}
                            onChange={() => setFuturePlan('retake')}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                        <label className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                            No, deseo recursar este modulo
                        </label>
                    </div>
                </div>

                <div className={`p-3 rounded-lg border cursor-pointer transition-all ${futurePlan === 'contact_teacher' ? 'bg-purple-100 border-purple-500 ring-1 ring-purple-500 dark:bg-purple-900/40' : 'border-gray-200 hover:border-purple-300 dark:border-zinc-700'}`}
                     onClick={() => setFuturePlan('contact_teacher')}>
                    <div className="flex items-center">
                        <input 
                            type="radio" 
                            name="futurePlan" 
                            value="contact_teacher" 
                            checked={futurePlan === 'contact_teacher'}
                            onChange={() => setFuturePlan('contact_teacher')}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                        <label className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                            No, deseo comunicarme con el equipo Docente
                        </label>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-t-lg -mx-6 -mt-6 border-b border-purple-100 dark:border-purple-800">Motivos del Retraso</h3>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ¿Qué factores o circunstancias contribuyeron a que no entregaste TP a tiempo? (Ejemplo: problemas personales, dificultades en la organización, falta de claridad en el trabajo, etc.) <span className="text-red-500">*</span>
        </label>
        <textarea
          name="delayFactors"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          placeholder="Tu respuesta"
        ></textarea>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-t-lg -mx-6 -mt-6 border-b border-purple-100 dark:border-purple-800">Reflexión sobre la Actitud</h3>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ¿Cómo evaluarías tu nivel de compromiso y responsabilidad en relación al trabajo? ¿Qué aspectos de tu actitud consideras que podrían mejorarse? <span className="text-red-500">*</span>
        </label>
        <textarea
          name="attitudeReflection"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          placeholder="Tu respuesta"
        ></textarea>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-t-lg -mx-6 -mt-6 border-b border-purple-100 dark:border-purple-800">Aprendizajes de la Situación</h3>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ¿Qué lecciones has aprendido de esta experiencia? ¿Cómo crees que este retraso te puede ayudar a crecer académicamente y en la gestión de tus responsabilidades? <span className="text-red-500">*</span>
        </label>
        <textarea
          name="learningExperience"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          placeholder="Tu respuesta"
        ></textarea>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-t-lg -mx-6 -mt-6 border-b border-purple-100 dark:border-purple-800">Estrategias para el Futuro</h3>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ¿Qué cambios o nuevas estrategias implementarás para organizar mejor tu tiempo y cumplir con los plazos en los próximos Sprints? (Ejemplo: crear un cronograma, buscar ayuda cuando sea necesario, dedicar tiempos específicos de estudio, etc.) <span className="text-red-500">*</span>
        </label>
        <textarea
          name="futureStrategies"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          placeholder="Tu respuesta"
        ></textarea>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-t-lg -mx-6 -mt-6 border-b border-purple-100 dark:border-purple-800">Plan de Acción</h3>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Si se te concede la prórroga, describe brevemente el plan de acción que seguirás para finalizar y entregar los TP pendientes de manera satisfactoria y dentro del nuevo plazo. (Incluye fechas, metas parciales y recursos que utilizarás.) <span className="text-red-500">*</span>
        </label>
        <textarea
          name="actionPlan"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          placeholder="Tu respuesta"
        ></textarea>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-t-lg -mx-6 -mt-6 border-b border-purple-100 dark:border-purple-800">Compromiso Personal</h3>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ¿Qué compromiso personal asumes para evitar que esta situación se repita en el futuro? (Ejemplo: “Me comprometo a revisar mis avances semanalmente y solicitar ayuda si tengo dificultades”, “Voy a priorizar mis tareas y gestionar mejor mi tiempo”, etc.) <span className="text-red-500">*</span>
        </label>
        <textarea
          name="personalCommitment"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          placeholder="Tu respuesta"
        ></textarea>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-t-lg -mx-6 -mt-6 border-b border-purple-100 dark:border-purple-800">Quieres agregar mas informacion?</h3>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Deseas agregar un comentario, un mensaje, o mas informacion que nos permite comprender mejor tu situacion? <span className="text-red-500">*</span>
        </label>
        <textarea
          name="additionalComments"
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
          placeholder="Tu respuesta"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading || !futurePlan}
        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {loading ? "Enviando..." : "Enviar Respuestas"}
      </button>
    </form>
  );
}
