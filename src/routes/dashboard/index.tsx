import { component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { getUserId } from '~/utils/auth';
import { tursoClient } from '~/utils/turso';
import { placementSections, type PlacementQuestion } from '~/data/placement-test';
import { isDashboardAdmin } from '~/constants/dashboard';

const orderedPlacementQuestions = placementSections.flatMap((section) => section.questions);
const placementQuestionDetails: Record<string, PlacementQuestion> = orderedPlacementQuestions.reduce(
  (acc, question) => {
    acc[question.id] = question;
    return acc;
  },
  {} as Record<string, PlacementQuestion>
);

interface PlacementAttemptRow {
  id: number | string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  date_of_birth: string | null;
  auto_score: number;
  max_auto_score: number;
  level: string | null;
  status: string | null;
  created_at: string;
  account_email: string | null;
  feedback_summary: string | null;
  answers: Record<string, string>;
}

interface DashboardData {
  attempts: PlacementAttemptRow[];
  stats: {
    total: number;
    averagePercent: number;
    byLevel: Record<string, number>;
  };
}

export const useDashboardData = routeLoader$<DashboardData>(async (requestEvent) => {
  const userId = getUserId(requestEvent);
  if (!userId) {
    throw requestEvent.redirect(302, '/auth');
  }

  const client = tursoClient(requestEvent);
  const userResult = await client.execute({
    sql: 'SELECT email FROM users WHERE id = ? LIMIT 1',
    args: [userId],
  });

  if (userResult.rows.length === 0) {
    throw requestEvent.redirect(302, '/auth');
  }

  const accountEmail = (userResult.rows[0].email as string | null) ?? null;
  if (!isDashboardAdmin(accountEmail)) {
    throw requestEvent.redirect(302, '/');
  }

  const attemptsResult = await client.execute(`
    SELECT
      p.id,
      p.full_name,
      p.email,
      p.phone,
      p.country,
      p.date_of_birth,
      p.auto_score,
      p.max_auto_score,
      p.level,
      p.status,
      p.created_at,
      p.answers_json,
      p.feedback_summary,
      u.email AS account_email
    FROM placement_test_attempts p
    LEFT JOIN users u ON u.id = p.user_id
    ORDER BY p.created_at DESC
  `);

  const attempts: PlacementAttemptRow[] = attemptsResult.rows.map((row: any) => {
    let answers: Record<string, string> = {};
    try {
      answers = row.answers_json ? JSON.parse(row.answers_json) : {};
    } catch (error) {
      console.warn('[Dashboard] Failed to parse answers_json for attempt', row.id, error);
    }

    return {
      id: row.id,
      full_name: row.full_name ?? null,
      email: row.email ?? null,
      phone: row.phone ?? null,
      country: row.country ?? null,
      date_of_birth: row.date_of_birth ?? null,
      auto_score: Number(row.auto_score ?? 0),
      max_auto_score: Number(row.max_auto_score ?? 0),
      level: row.level ?? 'Pendiente',
      status: row.status ?? 'submitted',
      created_at: row.created_at ?? new Date().toISOString(),
      account_email: row.account_email ?? null,
      feedback_summary: row.feedback_summary ?? null,
      answers,
    };
  });

  const total = attempts.length;
  const totalPercent = attempts.reduce((sum, attempt) => {
    if (!attempt.max_auto_score) return sum;
    return sum + attempt.auto_score / attempt.max_auto_score;
  }, 0);
  const byLevel = attempts.reduce<Record<string, number>>((acc, attempt) => {
    const level = attempt.level ?? 'Pendiente';
    acc[level] = (acc[level] ?? 0) + 1;
    return acc;
  }, {});

  return {
    attempts,
    stats: {
      total,
      averagePercent: total > 0 ? Math.round(((totalPercent / total) * 100) * 10) / 10 : 0,
      byLevel,
    },
  };
});

export default component$(() => {
  const data = useDashboardData();
  const { attempts, stats } = data.value;
  const availableLevels = Array.from(new Set(attempts.map((attempt) => attempt.level ?? 'Pendiente'))).sort();
  const controls = useStore({
    level: 'all',
    search: '',
    page: 1,
    pageSize: 10,
  });
  const expandedRows = useStore<Record<string, boolean>>({});
  const filteredAttemptsSignal = useSignal<PlacementAttemptRow[]>(attempts);

  useVisibleTask$(({ track }) => {
    track(() => [controls.level, controls.search, controls.pageSize, attempts.length]);
    const normalizedQuery = controls.search.trim().toLowerCase();
    const results = attempts.filter((attempt) => {
      const levelMatch = controls.level === 'all' || (attempt.level ?? 'Pendiente') === controls.level;
      const queryMatch =
        !normalizedQuery ||
        [
          attempt.full_name ?? '',
          attempt.email ?? '',
          attempt.account_email ?? '',
          attempt.country ?? '',
          attempt.level ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      return levelMatch && queryMatch;
    });
    filteredAttemptsSignal.value = results;
    const maxPage = Math.max(1, Math.ceil(results.length / controls.pageSize));
    if (controls.page > maxPage) {
      controls.page = maxPage;
    }
  });

  const levelEntries = Object.entries(stats.byLevel).sort((a, b) => b[1] - a[1]);
  const totalPages = Math.max(1, Math.ceil(filteredAttemptsSignal.value.length / controls.pageSize));
  const currentPage = Math.min(controls.page, totalPages);
  const startIndex = (currentPage - 1) * controls.pageSize;
  const paginatedAttempts = filteredAttemptsSignal.value.slice(startIndex, startIndex + controls.pageSize);

  return (
    <div class="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div class="container mx-auto px-4">
        <header class="mb-8">
          <p class="text-sm text-teal-600 uppercase tracking-widest font-semibold">Internal</p>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Placement Dashboard</h1>
          <p class="text-gray-600 dark:text-gray-300 max-w-3xl">
            Revisa los intentos de prueba técnica, analiza niveles y da seguimiento a cada estudiante.
          </p>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
            <p class="text-sm text-gray-500">Intentos totales</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
            <p class="text-sm text-gray-500">Promedio (porcentaje)</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.averagePercent}%
            </p>
          </div>
          <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
            <p class="text-sm text-gray-500">Distribución por nivel</p>
            <div class="mt-2 flex flex-wrap gap-2">
              {levelEntries.map(([level, count]) => (
                <span
                  key={level}
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200"
                >
                  {level}: {count}
                </span>
              ))}
              {levelEntries.length === 0 && <span class="text-sm text-gray-500">Sin datos</span>}
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Intentos recientes</h2>
              <span class="text-sm text-gray-500">Actualizado automáticamente</span>
            </div>
            <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div class="flex gap-3 flex-1">
                <div class="flex-1">
                  <label class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Buscar</label>
                  <input
                    type="text"
                    class="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    placeholder="Nombre, correo, país..."
                    value={controls.search}
                    onInput$={(event, element) => {
                      controls.search = (event.target as HTMLInputElement).value;
                      controls.page = 1;
                    }}
                  />
                </div>
                <div>
                  <label class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Nivel</label>
                  <select
                    class="mt-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    value={controls.level}
                    onChange$={(event) => {
                      controls.level = (event.target as HTMLSelectElement).value;
                      controls.page = 1;
                    }}
                  >
                    <option value="all">Todos</option>
                    {availableLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div>
                  <label class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Por página</label>
                  <select
                    class="mt-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                    value={controls.pageSize.toString()}
                    onChange$={(event) => {
                      controls.pageSize = Number((event.target as HTMLSelectElement).value);
                      controls.page = 1;
                    }}
                  >
                    {[10, 25, 50].map((size) => (
                      <option key={size} value={String(size)}>
                        {size.toString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    class="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50"
                    onClick$={() => {
                      if (currentPage > 1) controls.page = currentPage - 1;
                    }}
                    disabled={currentPage <= 1}
                  >
                    Anterior
                  </button>
                  <button
                    class="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-50"
                    onClick$={() => {
                      if (currentPage < totalPages) controls.page = currentPage + 1;
                    }}
                    disabled={currentPage >= totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500">
              Mostrando{' '}
              {filteredAttemptsSignal.value.length === 0
                ? '0'
                : `${startIndex + 1}-${Math.min(startIndex + paginatedAttempts.length, filteredAttemptsSignal.value.length)}`}{' '}
              de {filteredAttemptsSignal.value.length} resultados
            </p>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead class="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Estudiante</th>
                  <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Contacto</th>
                  <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Score</th>
                  <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Nivel</th>
                  <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Estado</th>
                  <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Feedback IA</th>
                  <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Cuenta</th>
                  <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Fecha</th>
                    <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Respuestas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedAttempts.map((attempt) => {
                  const attemptKey = String(attempt.id);
                  const isExpanded = !!expandedRows[attemptKey];
                  return (
                    <>
                      <tr key={attempt.id} class="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <td class="px-6 py-4">
                          <p class="font-semibold text-gray-900 dark:text-white">
                            {attempt.full_name || 'Sin nombre'}
                          </p>
                          <p class="text-xs text-gray-500">ID #{attempt.id}</p>
                        </td>
                        <td class="px-6 py-4 text-gray-700 dark:text-gray-200">
                          <p>{attempt.email || '—'}</p>
                          <p class="text-xs text-gray-500">{attempt.phone || attempt.country || '—'}</p>
                        </td>
                        <td class="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold">
                          {attempt.auto_score}/{attempt.max_auto_score}
                        </td>
                        <td class="px-6 py-4">
                          <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                            {attempt.level}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-gray-700 dark:text-gray-200">{attempt.status}</td>
                        <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                          <p class="text-xs max-w-xs break-words" title={attempt.feedback_summary ?? 'Sin feedback'}>
                            {attempt.feedback_summary || '—'}
                          </p>
                        </td>
                        <td class="px-6 py-4 text-gray-700 dark:text-gray-200">
                          {attempt.account_email || 'Cuenta eliminada'}
                        </td>
                        <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                          {new Date(attempt.created_at).toLocaleString()}
                        </td>
                        <td class="px-6 py-4 text-gray-700 dark:text-gray-200">
                          <button
                            class="text-xs font-semibold text-teal-600 hover:text-teal-800 dark:text-teal-300"
                            onClick$={() => {
                              expandedRows[attemptKey] = !expandedRows[attemptKey];
                            }}
                          >
                            {isExpanded ? 'Ocultar respuestas' : 'Ver respuestas'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${attempt.id}-answers`} class="bg-gray-50 dark:bg-gray-900/50">
                          <td colSpan={9} class="px-6 py-4">
                            <div class="grid gap-3">
                              {orderedPlacementQuestions.map((question) => {
                                const questionMeta = placementQuestionDetails[question.id];
                                const answer = attempt.answers[question.id] ?? '';
                                const isAudio = questionMeta?.type === 'audio';
                                // Show audio player for any non-empty answer in audio questions
                                return (
                                  <div
                                    key={`${attempt.id}-${question.id}`}
                                    class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 p-4"
                                  >
                                    <div class="flex items-center justify-between text-xs text-gray-500">
                                      <span>{questionMeta?.section ?? 'General'}</span>
                                      <span class="font-mono">{question.id}</span>
                                    </div>
                                    <p class="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                      {questionMeta?.prompt}
                                    </p>
                                    <div class="text-sm text-gray-700 dark:text-gray-200 mt-2 whitespace-pre-line">
                                      {isAudio ? (
                                        answer && typeof answer === 'string' ? (
                                          <audio controls src={answer} class="mt-2" />
                                        ) : (
                                          <span class="italic text-red-500">Sin audio grabado</span>
                                        )
                                      ) : (
                                        <span>{answer || 'Sin respuesta'}</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {paginatedAttempts.length === 0 && (
                  <tr>
                    <td colSpan={9} class="px-6 py-10 text-center text-gray-500">
                      Aún no hay intentos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Placement Dashboard | MOA Academy',
  meta: [
    {
      name: 'robots',
      content: 'noindex',
    },
  ],
};
