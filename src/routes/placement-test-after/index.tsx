import { component$, useSignal, useStore, useVisibleTask$, $ } from '@builder.io/qwik';
import { Form, routeAction$, routeLoader$, server$, type DocumentHead } from '@builder.io/qwik-city';
import {
  placementSections,
  type PlacementQuestion,
  type PlacementAnswerMap,
  computePlacementScore,
} from '~/data/placement-test';
import { getUserId } from '~/utils/auth';
import { tursoClient } from '~/utils/turso';
import type { Client } from '@libsql/client';
import { Resend } from 'resend';
import {
  LuUser,
  LuPhone,
  LuCakeSlice,
  LuUsers,
  LuChevronDown,
  LuGraduationCap,
  LuSchool,
  LuArrowRight,
} from '@qwikest/icons/lucide';

const EXTRA_FIELDS = [
  'rep_name',
  'rep_phone',
  'institution',
  'student_grade',
  'student_age',
  'student_sex',
  'student_name',
];

interface PlacementAttemptSummary {
  id?: string | number;
  auto_score: number;
  max_auto_score: number;
  level: string;
  status: string;
  created_at: string;
}

interface PlacementLoaderData {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  latestAttempt: PlacementAttemptSummary | null;
  existingAnswers: Record<string, string>;
}

export const usePlacementLoader = routeLoader$<PlacementLoaderData>(async (requestEvent) => {
  const userId = getUserId(requestEvent);
  if (!userId) {
    throw requestEvent.redirect(302, '/auth');
  }

  const client = tursoClient(requestEvent);
  await ensurePlacementFeedbackColumn(client);
  await ensureSourceColumn(client);

  const userResult = await client.execute({
    sql: 'SELECT id, email, name FROM users WHERE id = ? LIMIT 1',
    args: [userId],
  });

  if (userResult.rows.length === 0) {
    throw requestEvent.redirect(302, '/auth');
  }

  const userRow = userResult.rows[0] as any;

  const attemptsResult = await client.execute({
    sql: `SELECT id, auto_score, max_auto_score, level, status, created_at, answers_json
          FROM placement_test_attempts
          WHERE user_id = ? AND source = 'placement_after'
          ORDER BY created_at DESC
          LIMIT 1`,
    args: [userId],
  });

  let latestAttempt: PlacementAttemptSummary | null = null;
  let existingAnswers: Record<string, string> = {};

  if (attemptsResult.rows.length > 0) {
    const attemptRow = attemptsResult.rows[0] as any;
    latestAttempt = {
      id: attemptRow.id,
      auto_score: Number(attemptRow.auto_score ?? 0),
      max_auto_score: Number(attemptRow.max_auto_score ?? 0),
      level: attemptRow.level ?? 'Pending review',
      status: attemptRow.status ?? 'submitted',
      created_at: attemptRow.created_at ?? new Date().toISOString(),
    };
    try {
      const parsed = JSON.parse(attemptRow.answers_json ?? '{}');
      if (parsed && typeof parsed === 'object') {
        existingAnswers = parsed;
      }
    } catch (error) {
      console.warn('[PLACEMENT] Could not parse stored answers', error);
    }
  }

  return {
    user: {
      id: String(userRow.id),
      email: userRow.email as string,
      name: (userRow.name as string) ?? null,
    },
    latestAttempt,
    existingAnswers,
  };
});

export const useSubmitPlacementTest = routeAction$(async (data, requestEvent) => {
  try {
    const userId = getUserId(requestEvent);
    if (!userId) {
      throw requestEvent.redirect(302, '/auth');
    }

    const storedAnswers: Record<string, string> = {};
    const scoringAnswers: PlacementAnswerMap = {};
    const missingRequired: string[] = [];

    for (const section of placementSections) {
      for (const question of section.questions) {
        const rawValue = (data as Record<string, string | undefined>)[question.id];
        const normalizedValue = typeof rawValue === 'string' ? rawValue.trim() : '';

        storedAnswers[question.id] = normalizedValue;
        if (normalizedValue) {
          scoringAnswers[question.id] = normalizedValue;
        }

        if (question.required && !normalizedValue) {
          missingRequired.push(question.prompt);
        }
      }
    }

    // Capture extra fields from the form data
    for (const field of EXTRA_FIELDS) {
      const val = (data as Record<string, string | undefined>)[field];
      if (typeof val === 'string' && val.trim()) {
        storedAnswers[field] = val.trim();
      }
    }

    if (missingRequired.length > 0) {
      const missingPreview = missingRequired.slice(0, 3).join(', ');
      return {
        success: false,
        error: `Faltan respuestas obligatorias (${missingPreview}${missingRequired.length > 3 ? ', ...' : ''}).`,
      };
    }

    const { total, max, level } = computePlacementScore(scoringAnswers);
    const feedback = await serverGeneratePlacementFeedback({
      answers: storedAnswers,
      autoScore: total,
      maxScore: max,
      autoLevel: level,
    });

    const client = tursoClient(requestEvent);
    try {
      await ensurePlacementFeedbackColumn(client);
      await ensureSourceColumn(client);
      await client.execute({
        sql: `INSERT INTO placement_test_attempts 
              (user_id, full_name, email, phone, country, date_of_birth, address, answers_json, auto_score, max_auto_score, level, status, feedback_summary, source)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          userId,
          storedAnswers.q1_name || null,
          storedAnswers.q1_email || null,
          storedAnswers.q1_phone || null,
          storedAnswers.q2_country || null,
          storedAnswers.q3_birthdate || null,
          storedAnswers.q4_address || null,
          JSON.stringify(storedAnswers),
          total,
          max,
          level,
          'submitted',
          feedback,
          'placement_after',
        ],
      });
      try {
        await sendPlacementResultNotification({
          userId,
          userName: storedAnswers.q1_name ?? 'Sin nombre',
          userEmail: storedAnswers.q1_email ?? 'Sin correo',
          autoScore: total,
          maxScore: max,
          level,
          feedback,
        });
      } catch (notifyError) {
        console.error('[PLACEMENT] Notification error', notifyError);
      }
    } catch (error) {
      return {
        success: false,
        error: formatPlacementError(
          error,
          'No pudimos guardar tu intento. Intenta nuevamente en unos segundos.'
        ),
      };
    }

    return {
      success: true,
      autoScore: total,
      maxAutoScore: max,
      level,
      feedback,
    };
  } catch (error) {
    return {
      success: false,
      error: formatPlacementError(
        error,
        'Tuvimos un problema al enviar tu prueba. Intenta nuevamente o contáctanos para ayudarte.'
      ),
    };
  }
});

export default component$(() => {
  const loader = usePlacementLoader();
  const submitAction = useSubmitPlacementTest();
  const latestAttempt = useSignal<PlacementAttemptSummary | null>(loader.value.latestAttempt);

  const initialAnswers: Record<string, string> = {};
  const existingAnswers = loader.value.existingAnswers;

  for (const section of placementSections) {
    for (const question of section.questions) {
      const stored = existingAnswers?.[question.id];
      if (typeof stored === 'string' && stored.length > 0) {
        initialAnswers[question.id] = stored;
      } else if (question.id === 'q1_email') {
        initialAnswers[question.id] = loader.value.user.email ?? '';
      } else if (question.id === 'q1_name' && loader.value.user.name) {
        initialAnswers[question.id] = loader.value.user.name;
      } else {
        initialAnswers[question.id] = '';
      }
    }
  }

  const answers = useStore<Record<string, string>>(initialAnswers);
  const actionResult = submitAction.value;

  useVisibleTask$(({ track }) => {
    track(() => submitAction.value);
    const result = submitAction.value;
    if (result?.success) {
      latestAttempt.value = {
        auto_score: result.autoScore ?? 0,
        max_auto_score: result.maxAutoScore ?? 0,
        level: result.level ?? 'Pending review',
        status: 'submitted',
        created_at: new Date().toISOString(),
      };
    }
  });

  // --- Start of New Logic for Student Info Form ---
  const step = useSignal<'info' | 'test'>('info');
  const studentInfo = useStore({
    rep_name: '',
    rep_phone: '',
    institution: '',
    student_grade: '',
    student_age: '',
    student_sex: '',
    student_name: loader.value.user.name || '',
  });

  const handleInfoSubmit = $(() => {
    // Basic validation
    if (
      !studentInfo.rep_name ||
      !studentInfo.rep_phone ||
      !studentInfo.institution ||
      !studentInfo.student_grade ||
      !studentInfo.student_age ||
      !studentInfo.student_sex ||
      !studentInfo.student_name
    ) {
      alert('Por favor completa todos los campos para continuar.');
      return;
    }

    // Pre-fill existing logic answers
    answers['q1_name'] = studentInfo.student_name;
    // We map age to birthdate field just as a string representation or leave it for them to refine
    // The requirement said "Age", but q3 is birthdate. We'll pre-fill what we can or just store 'Age: X' if they don't change it.
    // Actually, let's just leave q3_birthdate empty or pre-fill if we had an exact date. 
    // Since we only ask for Age, we can't perfectly fill Date of Birth. 
    // We will just let the user fill q3_birthdate in the test, or we can put the age there.
    answers['q3_birthdate'] = `Edad: ${studentInfo.student_age}`;

    step.value = 'test';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- End of New Logic ---

  return (
    <div class="bg-gray-50 dark:bg-gray-900 py-10">
      <div class="container mx-auto px-4 max-w-6xl">
        <header class="mb-8">
          <p class="text-sm text-teal-600 uppercase tracking-widest font-semibold">
            English Assessment
          </p>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            EMOA Students&apos; Placement Test
          </h1>
          {step.value === 'info' && (
            <p class="text-gray-600 dark:text-gray-300 max-w-3xl">
              Por favor completa la siguiente información antes de iniciar la prueba.
            </p>
          )}
          {step.value === 'test' && (
            <p class="text-gray-600 dark:text-gray-300 max-w-3xl">
              Completa la prueba técnica para que podamos recomendarte el plan de estudios ideal.
              Guarda suficiente tiempo (30-40 minutos) y responde sin traductores.
            </p>
          )}
        </header>

        {/* STEP 1: Student Information Form */}
        {step.value === 'info' && (
          <section class="max-w-3xl mx-auto">
            <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <div class="bg-gradient-to-r from-teal-500 to-emerald-600 p-8 text-white">
                <h2 class="text-2xl font-bold mb-2">
                  Registro de Estudiante
                </h2>
                <p class="text-teal-50 opacity-90">
                  Completa los datos para iniciar tu evaluación de inglés.
                </p>
              </div>

              <div class="p-8">
                <form
                  preventdefault:submit
                  onSubmit$={handleInfoSubmit}
                  class="space-y-8"
                >
                  {/* Representative Info Section */}
                  <div class="space-y-4">
                    <h3 class="text-sm uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                      Información del Representante
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="group">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-teal-600">
                          Nombre Completo del Representante
                        </label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors">
                            <LuUser class="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={studentInfo.rep_name}
                            onInput$={(e) =>
                              (studentInfo.rep_name = (e.target as HTMLInputElement).value)
                            }
                            class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                            placeholder="Ej. María Pérez"
                            required
                          />
                        </div>
                      </div>

                      <div class="group">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-teal-600">
                          Teléfono de Contacto
                        </label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors">
                            <LuPhone class="w-5 h-5" />
                          </div>
                          <input
                            type="tel"
                            value={studentInfo.rep_phone}
                            onInput$={(e) =>
                              (studentInfo.rep_phone = (e.target as HTMLInputElement).value)
                            }
                            class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                            placeholder="Ej. +58 412 1234567"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student Info Section */}
                  <div class="space-y-4 mt-8">
                    <h3 class="text-sm  uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                      Datos del Alumno
                    </h3>

                    <div class="group">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-teal-600">
                        Nombre del Alumno
                      </label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors">
                          <LuUser class="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={studentInfo.student_name}
                          onInput$={(e) =>
                            (studentInfo.student_name = (e.target as HTMLInputElement).value)
                          }
                          class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                          placeholder="Nombre completo del estudiante"
                          required
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div class="group">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-teal-600">
                          Edad
                        </label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors">
                            <LuCakeSlice class="w-5 h-5" />
                          </div>
                          <input
                            type="number"
                            value={studentInfo.student_age}
                            onInput$={(e) =>
                              (studentInfo.student_age = (e.target as HTMLInputElement).value)
                            }
                            class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                            placeholder="Años"
                            required
                          />
                        </div>
                      </div>

                      <div class="group">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-teal-600">
                          Sexo
                        </label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors">
                            <LuUsers class="w-5 h-5" />
                          </div>
                          <select
                            value={studentInfo.student_sex}
                            onChange$={(e) =>
                              (studentInfo.student_sex = (e.target as HTMLSelectElement).value)
                            }
                            class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none appearance-none"
                            required
                          >
                            <option value="">Seleccionar</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                          </select>
                          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            <LuChevronDown class="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <div class="group">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-teal-600">
                          Grado
                        </label>
                        <div class="relative">
                          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors">
                            <LuGraduationCap class="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={studentInfo.student_grade}
                            onInput$={(e) =>
                              (studentInfo.student_grade = (e.target as HTMLInputElement).value)
                            }
                            class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                            placeholder="Ej. 4to Grado"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div class="group">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-teal-600">
                        Institución Educativa
                      </label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors">
                          <LuSchool class="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={studentInfo.institution}
                          onInput$={(e) =>
                            (studentInfo.institution = (e.target as HTMLInputElement).value)
                          }
                          class="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                          placeholder="Nombre del colegio o escuela"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div class="pt-4">
                    <button
                      type="submit"
                      class="w-full md:w-auto ml-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <span>Continuar a la Prueba</span>
                      <LuArrowRight class="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}

        {latestAttempt.value && (
          <section class="mb-8 rounded-2xl border border-teal-200 bg-white/80 dark:bg-gray-800/80 p-6 shadow-sm">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p class="text-sm text-gray-500 uppercase tracking-widest">
                  Último resultado
                </p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                  {latestAttempt.value.auto_score}/{latestAttempt.value.max_auto_score} puntos ―{' '}
                  <span class="text-teal-600">{latestAttempt.value.level}</span>
                </p>
                <p class="text-sm text-gray-500">
                  Estado: {latestAttempt.value.status} ·{' '}
                  {new Date(latestAttempt.value.created_at).toLocaleString()}
                </p>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                Puedes volver a intentar la prueba si sientes que tu puntaje no refleja tu nivel
                actual.
              </div>
            </div>
          </section>
        )}

        {actionResult?.error && (
          <div class="mb-6 rounded-xl border border-red-200 bg-red-50/80 text-red-700 p-4">
            {actionResult.error}
          </div>
        )}

        {actionResult?.success && (
          <div class="mb-6 space-y-4">
            <div class="rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:text-emerald-100 p-4">
              <p class="font-semibold">¡Gracias! Guardamos tu intento.</p>
              <p class="text-sm mt-1">
                Nivel automático estimado:{' '}
                <span class="font-bold">{actionResult.level ?? 'Pendiente'}</span> (
                {actionResult.autoScore ?? 0}/{actionResult.maxAutoScore ?? 0} puntos). Nuestro
                equipo revisará tus respuestas abiertas para darte retroalimentación adicional.
              </p>
            </div>
            {actionResult.feedback && (
              <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Resultado personalizado
                </h3>
                <p class="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">
                  {actionResult.feedback}
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Main Placement Test (only shown if step == 'test' or if latestAttempt exists to show review) */}
        {/* We hide the form if an attempt was just submitted successfully (actionResult.success) */}
        {!actionResult?.success && step.value === 'test' && (
          <Form action={submitAction} class="space-y-10">
            {/* Hidden inputs to carry over the student info */}
            {EXTRA_FIELDS.map((field) => (
              <input
                key={field}
                type="hidden"
                name={field}
                value={(studentInfo as any)[field]}
              />
            ))}

            {placementSections.map((section) => (
              <section
                key={section.id}
                class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 shadow-sm"
              >
                <div class="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p class="text-gray-500 dark:text-gray-400 mt-1">
                      {section.description}
                    </p>
                  )}
                </div>
                <div class="px-6 py-6 space-y-6">
                  {section.questions.map((question) => (
                    <QuestionField key={question.id} question={question} answers={answers} />
                  ))}
                </div>
              </section>
            ))}
            <div class="flex justify-end gap-4">
              <button
                type="button"
                onClick$={() => {
                  step.value = 'info';
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                class="px-6 py-3 rounded-xl text-gray-600 bg-gray-200 hover:bg-gray-300 font-semibold"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={submitAction.isRunning}
                class={`inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition ${submitAction.isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 focus:ring-4 focus:ring-teal-300'
                  }`}
              >
                {submitAction.isRunning ? 'Enviando...' : 'Enviar prueba'}
              </button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
});

/**
 * Mapa de preguntas → imágenes online
 * Usa solo algunas claves que “piden” apoyo visual.
 */
const questionIllustrations: Record<
  string,
  { src: string; alt: string; caption?: string }
> = {
  // Professions & Spelling
  q5_profession: {
    src: 'https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Farmer working in a field with crops and animals.',
  },
  q6_profession: {
    src: 'https://images.pexels.com/photos/5668773/pexels-photo-5668773.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Lawyer or judge in a courtroom with law books and a gavel.',
  },
  q7_spelling: {
    src: 'https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Beach with palm trees and blue sea at sunset.',
  },

  // Vacation Writing
  q20_vacation: {
    src: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Happy travelers with suitcases at an airport.',
  },

  // Climate Change Reading
  q21_climate: {
    src: 'https://images.pexels.com/photos/2990650/pexels-photo-2990650.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Planet Earth in a person’s hands with trees and pollution concept.',
  },

  // Prepositions (movement & location)
  q31_preposition: {
    src: '/31.png',
    alt: 'City skyline with birds flying above the buildings at sunset.',
  },
  q32_preposition: {
    src: '/32.png',
    alt: 'Rabbit near the entrance of a small cave in a forest.',
  },
  q33_preposition: {
    src: '/33.png',
    alt: 'Person running along a path through a dense forest.',
  },
  q34_preposition: {
    src: 'https://images.pexels.com/photos/1004584/pexels-photo-1004584.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Tourists boarding an airplane using a stairway on the runway.',
  },

  // Languages Around the World (reading)
  q41_language_article: {
    src: 'https://images.pexels.com/photos/1079033/pexels-photo-1079033.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'World map with flags and people speaking different languages.',
  },

  // Perfect City Essay
  q50_perfect_city: {
    src: 'https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Modern city skyline with park, trees and skyscrapers at sunset.',
  },
};

interface QuestionFieldProps {
  question: PlacementQuestion;
  answers: Record<string, string>;
}

const QuestionField = component$(({ question, answers }: QuestionFieldProps) => {
  const illustration = questionIllustrations[question.id];

  return (
    <div>
      <label
        class="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2"
        for={question.id}
      >
        {question.prompt}{' '}
        {question.required && <span class="text-red-500">*</span>}
      </label>

      {illustration && (
        <figure class="mb-3 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <img
            src={illustration.src}
            alt={illustration.alt}
            class="w-full max-h-64 object-contain md:object-cover"
            loading="lazy"
          />
        </figure>
      )}

      {renderInput(question, answers)}

      {question.helperText && (
        <p class="text-xs text-gray-500 mt-2">{question.helperText}</p>
      )}
    </div>
  );
});

function renderInput(question: PlacementQuestion, answers: Record<string, string>) {
  switch (question.type) {
    case 'textarea': {
      const longTextIds = [
        'q20_vacation',
        'q45_language_article',
        'q46_language_article',
        'q50_perfect_city',
      ];
      const rows = longTextIds.includes(question.id) ? 8 : 4;
      return (
        <>
          {question.audioSrc && (
            <audio controls src={question.audioSrc} class="mb-2 w-full" preload="auto" />
          )}
          <textarea
            id={question.id}
            name={question.id}
            required={question.required}
            rows={rows}
            class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={answers[question.id] ?? ''}
            onInput$={(event) => {
              answers[question.id] = (event.target as HTMLTextAreaElement).value;
            }}
            placeholder={question.placeholder}
            preventdefault:paste
          />
        </>
      );
    }
    case 'audio':
      return <AudioRecorder questionId={question.id} answers={answers} />;
    case 'radio':
      return (
        <div class="space-y-2">
          {question.options?.map((option, idx) => (
            <label
              key={option.value}
              class="flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <input
                type="radio"
                class="text-teal-600 focus:ring-teal-500"
                name={question.id}
                value={option.value}
                checked={answers[question.id] === option.value}
                required={question.required && idx === 0}
                onChange$={(event) => {
                  answers[question.id] = (event.target as HTMLInputElement).value;
                }}
              />
              <span class="text-sm text-gray-800 dark:text-gray-200">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      );
    case 'select':
      return (
        <select
          id={question.id}
          name={question.id}
          required={question.required}
          value={answers[question.id] ?? ''}
          onChange$={(event) => {
            answers[question.id] = (event.target as HTMLSelectElement).value;
          }}
          class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">{question.placeholder ?? 'Select an option'}</option>
          {question.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    default:
      return (
        <input
          id={question.id}
          type="text"
          name={question.id}
          required={question.required}
          value={answers[question.id] ?? ''}
          onInput$={(event) => {
            answers[question.id] = (event.target as HTMLInputElement).value;
          }}
          placeholder={question.placeholder}
          class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          preventdefault:paste
        />
      );
  }
}

// Componente para grabar audio y guardar la URL/base64 en answers[questionId]

const AudioRecorder = component$(({ questionId, answers }: { questionId: string; answers: Record<string, string> }) => {
  const recording = useSignal(false);
  const audioUrl = useSignal<string | null>(null);
  const mediaRecorderRef = useStore<{ current: MediaRecorder | null }>({ current: null });
  const chunksRef = useStore<{ current: Blob[] }>({ current: [] });

  const startRecording = $(async () => {
    recording.value = true;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      audioUrl.value = url;
      answers[questionId] = url;
    };
    mediaRecorder.start();
  });

  const stopRecording = $(() => {
    recording.value = false;
    mediaRecorderRef.current?.stop();
  });

  return (
    <div class="mb-2">
      {!recording.value ? (
        <button type="button" class="px-4 py-2 rounded bg-teal-600 text-white flex items-center gap-2" onClick$={startRecording}>
          <span class="material-icons" aria-label="Grabar respuesta">mic</span>
          Grabar respuesta
        </button>
      ) : (
        <button type="button" class="px-4 py-2 rounded bg-red-600 text-white" onClick$={stopRecording}>
          Detener grabación
        </button>
      )}
      {audioUrl.value && (
        <audio controls src={audioUrl.value} class="mt-2" />
      )}
    </div>
  );
});

const serverGeneratePlacementFeedback = server$(async function (this: any, {
  answers,
  autoScore,
  maxScore,
  autoLevel,
}: {
  answers: Record<string, string>;
  autoScore: number;
  maxScore: number;
  autoLevel: string;
}): Promise<string> {
  const fallback = `Tu nivel automático estimado es ${autoLevel} (${autoScore}/${maxScore}). Nuestro equipo revisará tus respuestas abiertas para confirmar y asignarte el curso adecuado.`;
  const openAIApiKey = this.env.get('OPENAI_API_KEY') || import.meta.env.OPENAI_API_KEY;
  const sonixAuthKey = this.env.get('SONIX_AUTH_KEY');

  // Procesar preguntas de audio
  async function transcribeAudio(audioUrl: string, openaiApiKey: string): Promise<string> {
    if (!openaiApiKey || !audioUrl) return '';
    try {
      // Descargar el audio
      const audioRes = await fetch(audioUrl);
      const audioBlob = await audioRes.blob();
      const audioBuffer = await audioBlob.arrayBuffer();
      // Enviar a OpenAI Whisper API
      const formData = new FormData();
      formData.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });
      const result = await resp.json();
      return result.text || '';
    } catch (err) {
      console.error('Whisper transcription error', err);
      return '';
    }
  }

  // Reemplazar respuestas de audio por su transcripción
  for (const key of Object.keys(answers)) {
    if (key.startsWith('q_audio_')) {
      const audioUrl = answers[key];
      if (audioUrl) {
        answers[key] = await transcribeAudio(audioUrl, openAIApiKey);
      } else {
        answers[key] = '';
      }
    }
  }

  if (!openAIApiKey) {
    console.warn('[PLACEMENT] Missing OPENAI_API_KEY, skipping AI feedback.');
    return fallback;
  }

  try {
    const [{ ChatOpenAI }, { SystemMessage, HumanMessage }] = await Promise.all([
      import('@langchain/openai'),
      import('@langchain/core/messages'),
    ]);

    const llm = new ChatOpenAI({
      openAIApiKey,
      model: 'gpt-4o-mini',
      temperature: 0.2,
    });

    const digest = buildAnswerDigest(answers);
    const studentName = answers.q1_name?.trim() || 'el/la estudiante';
    const userPrompt = `
Datos del estudiante:
- Nombre: ${studentName}
- Puntaje automático: ${autoScore}/${maxScore}
- Nivel automático sugerido: ${autoLevel}

Respuestas (resumidas):
${digest}

Tarea:
1. Determina el nivel CEFR final (elige entre A1, A2, B1, B2, C1, C2) considerando tanto el puntaje como la calidad de las respuestas abiertas y las transcripciones de audio.
2. Explica en 2-3 oraciones por qué llegaste a ese nivel, en español.
3. Da dos recomendaciones claras para mejorar el siguiente nivel.
4. Cierra con un mensaje motivador breve.
`;

    const response = await llm.invoke([
      new SystemMessage(
        'Eres un evaluador académico de MOA Academy. Sé claro, empático y específico. Evita tecnicismos innecesarios.'
      ),
      new HumanMessage(userPrompt),
    ]);

    const content = Array.isArray(response.content)
      ? response.content.map((part: any) => part.text ?? '').join('\n')
      : (response.content as string);

    return (content?.trim() || fallback).slice(0, 1500);
  } catch (error) {
    console.error('[PLACEMENT] AI feedback error:', error);
    return fallback;
  }
});

const sendPlacementResultNotification = server$(async function (this: any, {
  userId,
  userName,
  userEmail,
  autoScore,
  maxScore,
  level,
  feedback,
}: {
  userId: string;
  userName: string;
  userEmail: string;
  autoScore: number;
  maxScore: number;
  level: string;
  feedback: string;
}) {
  const resendApiKey = this.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.warn('[PLACEMENT] Missing RESEND_API_KEY, skipping notification.');
    return;
  }

  const senderEmail = this.env.get('SENDER_EMAIL') || 'onboarding@resend.dev';
  const recipient = 'emoa.recepcion@gmail.com';
  const resend = new Resend(resendApiKey);

  const subject = `Placement Test completado · ${userName || userEmail}`;
  const html = `
    <h2>Nuevo resultado del Placement Test</h2>
    <p><strong>ID de usuario:</strong> ${userId}</p>
    <p><strong>Nombre:</strong> ${userName}</p>
    <p><strong>Email:</strong> ${userEmail}</p>
    <p><strong>Resultado automático:</strong> ${autoScore}/${maxScore}</p>
    <p><strong>Nivel sugerido:</strong> ${level}</p>
    <p><strong>Retroalimentación AI:</strong></p>
    <p>${(feedback || 'No se generó retroalimentación adicional.').replace(/\n/g, '<br/>')}</p>
  `;
  const text = `Nuevo resultado del Placement Test\nID de usuario: ${userId}\nNombre: ${userName}\nEmail: ${userEmail}\nResultado automático: ${autoScore}/${maxScore}\nNivel sugerido: ${level}\nRetroalimentación AI: ${feedback || 'No disponible'}`;

  const { error } = await resend.emails.send({
    from: senderEmail,
    to: recipient,
    subject,
    html,
    text,
  });

  if (error) {
    console.error('[PLACEMENT] Failed to send notification:', error);
  }
});

function buildAnswerDigest(answers: Record<string, string>): string {
  const sections = placementSections.map((section) => {
    const questionLines = section.questions
      .slice(0, 6)
      .map((question) => {
        const promptSnippet =
          question.prompt.length > 90 ? `${question.prompt.slice(0, 90).trim()}…` : question.prompt.trim();
        const rawAnswer = answers[question.id] ?? '';
        const formattedAnswer = truncateAnswer(rawAnswer);
        return `- ${promptSnippet}: ${formattedAnswer || 'Sin respuesta'}`;
      })
      .join('\n');

    return `${section.title}:\n${questionLines}`;
  });

  return sections.join('\n\n');
}

function truncateAnswer(value?: string, maxLength = 180): string {
  if (!value) return '';
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
}

async function ensurePlacementFeedbackColumn(client: Client) {
  try {
    const info = await client.execute('PRAGMA table_info(placement_test_attempts)');
    const hasColumn = info.rows?.some((row: any) => row.name === 'feedback_summary');
    if (!hasColumn) {
      await client.execute('ALTER TABLE placement_test_attempts ADD COLUMN feedback_summary TEXT');
      console.log('[PLACEMENT] Added feedback_summary column to placement_test_attempts');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/duplicate column/i.test(message)) {
      console.warn('[PLACEMENT] Could not ensure feedback_summary column exists', error);
    }
  }
}

async function ensureSourceColumn(client: Client) {
  try {
    const info = await client.execute('PRAGMA table_info(placement_test_attempts)');
    const hasColumn = info.rows?.some((row: any) => row.name === 'source');
    if (!hasColumn) {
      await client.execute('ALTER TABLE placement_test_attempts ADD COLUMN source TEXT');
      console.log('[PLACEMENT] Added source column to placement_test_attempts');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/duplicate column/i.test(message)) {
      console.warn('[PLACEMENT] Could not check/add source column', error);
    }
  }
}

function formatPlacementError(error: unknown, fallbackMessage: string): string {
  const reference =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Error desconocido';

  console.error(`[PLACEMENT][${reference}]`, errorMessage, error);
  return `${fallbackMessage} (Código de referencia: ${reference})`;
}

export const head: DocumentHead = {
  title: 'Placement Test | MOA Academy',
  meta: [
    {
      name: 'description',
      content:
        'Complete the EMOA placement test to evaluate your English skills across grammar, vocabulary, reading, and writing.',
    },
  ],
};
