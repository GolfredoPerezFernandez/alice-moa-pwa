import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { routeLoader$, Form, routeAction$ } from '@builder.io/qwik-city';
import { executeQuery } from '~/utils/turso';
import { getUserId } from '~/utils/auth';
import { LuCalendar, LuCheck, LuPlus, LuTrash2 } from '@qwikest/icons/lucide';

import { absencesOperations } from '~/utils/db-operations';

// Cargar las ausencias del usuario actual
export const useUserAbsences = routeLoader$(async (requestEvent) => {
  const user_id = getUserId(requestEvent);
  if (!user_id) {
    return { absences: [] };
  }

  const absences = await absencesOperations.getUserAbsences(requestEvent, user_id);

  return {
    absences: absences
  };
});

// Acción para registrar una nueva ausencia
export const useRegisterAbsence = routeAction$(async (data, requestEvent) => {
  const user_id = getUserId(requestEvent);
  if (!user_id) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  try {
    const result = await absencesOperations.registerAbsence(
      requestEvent,
      user_id,
      data.start_date,
      data.end_date,
      data.absence_type,
      data.description || ''
    );

    return result;
  } catch (error) {
    console.error('Error al registrar ausencia:', error);
    return {
      success: false,
      error: 'Error al registrar la ausencia. Inténtalo de nuevo.'
    };
  }
});

// Acción para eliminar una ausencia
export const useDeleteAbsence = routeAction$(async (data, requestEvent) => {
  const user_id = getUserId(requestEvent);
  if (!user_id) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  try {
    const result = await absencesOperations.deleteAbsence(
      requestEvent,
      data.absence_id,
      user_id
    );

    return result;
  } catch (error) {
    console.error('Error al eliminar ausencia:', error);
    return {
      success: false,
      error: 'Error al eliminar la ausencia. Inténtalo de nuevo.'
    };
  }
});

export default component$(() => {
  const userAbsences = useUserAbsences();
  const registerAbsence = useRegisterAbsence();
  const deleteAbsence = useDeleteAbsence();
  const showForm = useSignal(false);
  const currentMonth = useSignal(new Date().getMonth());
  const currentYear = useSignal(new Date().getFullYear());
  const calendarDays = useSignal<Date[]>([]);
  const successMessage = useSignal<string | null>(null);
  const errorMessage = useSignal<string | null>(null);

  // Generar los días del calendario para el mes actual
  const generateCalendarDays = $(() => {
    const firstDay = new Date(currentYear.value, currentMonth.value, 1);
    const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
    const days: Date[] = [];

    // Añadir días del mes anterior para completar la primera semana
    const firstDayOfWeek = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i);
      days.push(day);
    }

    // Añadir todos los días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(currentYear.value, currentMonth.value, i);
      days.push(day);
    }

    // Añadir días del mes siguiente para completar la última semana
    const lastDayOfWeek = lastDay.getDay();
    const daysToAdd = 6 - lastDayOfWeek;
    
    for (let i = 1; i <= daysToAdd; i++) {
      const day = new Date(currentYear.value, currentMonth.value + 1, i);
      days.push(day);
    }

    calendarDays.value = days;
  });

  // Mes anterior
  const prevMonth = $(() => {
    if (currentMonth.value === 0) {
      currentMonth.value = 11;
      currentYear.value--;
    } else {
      currentMonth.value--;
    }
    generateCalendarDays();
  });

  // Mes siguiente
  const nextMonth = $(() => {
    if (currentMonth.value === 11) {
      currentMonth.value = 0;
      currentYear.value++;
    } else {
      currentMonth.value++;
    }
    generateCalendarDays();
  });

  // Funciones síncronas para verificación de ausencias
  const checkHasAbsence = (date: Date): boolean => {
    if (!userAbsences.value.absences || !Array.isArray(userAbsences.value.absences)) {
      return false;
    }
    
    return userAbsences.value.absences.some((absence: any) => {
      const startDate = new Date(absence.start_date);
      const endDate = new Date(absence.end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return date >= startDate && date <= endDate;
    });
  };

  // Obtener el tipo de ausencia para un día específico
  const checkAbsenceType = (date: Date): string | null => {
    if (!userAbsences.value.absences || !Array.isArray(userAbsences.value.absences)) {
      return null;
    }
    
    const absence = userAbsences.value.absences.find((absence: any) => {
      const startDate = new Date(absence.start_date);
      const endDate = new Date(absence.end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return date >= startDate && date <= endDate;
    });

    // Asegurarse de que absence_type sea una cadena de texto
    return absence && absence.absence_type ? String(absence.absence_type) : null;
  };

  // Obtener el color según el tipo de ausencia
  const getAbsenceColor = (type: string): string => {
    switch(type) {
      case 'illness':
        return 'bg-red-200 text-red-800';
      case 'vacation':
        return 'bg-blue-200 text-blue-800';
      case 'personal':
        return 'bg-orange-200 text-orange-800';
      case 'other':
        return 'bg-purple-200 text-purple-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Formatear nombre del mes
  const formatMonthName = $((month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
  });

  // Limpiar mensajes después de un tiempo
  const clearMessages = $(() => {
    setTimeout(() => {
      successMessage.value = null;
      errorMessage.value = null;
    }, 5000);
  });

  // Inicializar el calendario cuando el componente se monta
  useVisibleTask$(() => {
    generateCalendarDays();
  });

  // Actualizar mensajes cuando se registra o elimina una ausencia
  useVisibleTask$(({ track }) => {
    const registerValue = track(() => registerAbsence.value);
    
    if (registerValue && 'success' in registerValue) {
      if (registerValue.success) {
        successMessage.value = registerValue.message as string;
        showForm.value = false;
        clearMessages();
      } else if (registerValue.error) {
        errorMessage.value = registerValue.error as string;
        clearMessages();
      }
    }
  });
  
  useVisibleTask$(({ track }) => {
    const deleteValue = track(() => deleteAbsence.value);
    
    if (deleteValue && 'success' in deleteValue) {
      if (deleteValue.success) {
        successMessage.value = deleteValue.message as string;
        clearMessages();
      } else if (deleteValue.error) {
        errorMessage.value = deleteValue.error as string;
        clearMessages();
      }
    }
  });

  return (
    <div class="space-y-6">
      {/* Mensajes de éxito y error */}
      {successMessage.value && (
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{successMessage.value}</span>
        </div>
      )}
      
      {errorMessage.value && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{errorMessage.value}</span>
        </div>
      )}

      {/* Controles del calendario */}
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold flex items-center">
          <LuCalendar class="w-6 h-6 mr-2" />
          {formatMonthName(currentMonth.value)} {currentYear.value}
        </h2>
        
        <div class="flex space-x-2">
          <button 
            onClick$={prevMonth}
            class="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
            aria-label="Mes anterior"
          >
            &lt;
          </button>
          
          <button 
            onClick$={nextMonth}
            class="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
            aria-label="Mes siguiente"
          >
            &gt;
          </button>
          
          <button 
            onClick$={() => showForm.value = !showForm.value}
            class="flex items-center px-3 py-1 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600"
          >
            {showForm.value ? 'Cancelar' : (
              <>
                <LuPlus class="w-4 h-4 mr-1" />
                <span>Registrar ausencia</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Formulario de registro de ausencia */}
      {showForm.value && (
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow mb-6">
          <h3 class="text-lg font-medium mb-4">Registrar nueva ausencia</h3>
          
          <Form action={registerAbsence} class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="start_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de inicio
                </label>
                <input 
                  id="start_date" 
                  name="start_date" 
                  type="date" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"
                />
              </div>
              
              <div>
                <label for="end_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de fin
                </label>
                <input 
                  id="end_date" 
                  name="end_date" 
                  type="date" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"
                />
              </div>
            </div>
            
            <div>
              <label for="absence_type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de ausencia
              </label>
              <select 
                id="absence_type" 
                name="absence_type" 
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"
              >
                <option value="">Selecciona un tipo</option>
                <option value="illness">Baja por enfermedad</option>
                <option value="vacation">Vacaciones</option>
                <option value="personal">Asuntos personales</option>
                <option value="other">Otros</option>
              </select>
            </div>
            
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción (opcional)
              </label>
              <textarea 
                id="description" 
                name="description" 
                rows={3}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-800"
              ></textarea>
            </div>
            
            <div class="flex justify-end">
              <button 
                type="submit" 
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LuCheck class="w-4 h-4 mr-2" />
                Guardar
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Calendario */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="grid grid-cols-7 gap-px border-b dark:border-gray-700">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} class="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>
        
        <div class="grid grid-cols-7 gap-px">
          {calendarDays.value.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentMonth.value;
            const isToday = day.toDateString() === new Date().toDateString();
            const dayHasAbsence = checkHasAbsence(day);
            const absenceType = checkAbsenceType(day);
            
            return (
              <div
                key={index}
                class={`
                  h-20 p-2 relative
                  ${isCurrentMonth
                    ? 'bg-white dark:bg-gray-800'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}
                  ${isToday ? 'border-2 border-red-500' : ''}
                `}
              >
                <span class={`
                  inline-flex w-6 h-6 items-center justify-center rounded-full text-sm
                  ${isToday ? 'bg-red-500 text-white' : ''}
                `}>
                  {day.getDate()}
                </span>
                
                {checkHasAbsence(day) && (
                  <div key={`absence-${index}`} class="mt-1">
                    {(() => {
                      const type = checkAbsenceType(day);
                      return (
                        <div
                          class={`text-xs p-1 rounded-sm truncate ${getAbsenceColor(type || '')}`}
                          title={type || ''}
                        >
                          {type === 'illness' && 'Enfermedad'}
                          {type === 'vacation' && 'Vacaciones'}
                          {type === 'personal' && 'Personal'}
                          {type === 'other' && 'Otros'}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de ausencias registradas */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-6">
        <h3 class="text-lg font-medium mb-4">Ausencias registradas</h3>
        
        {userAbsences.value.absences.length === 0 ? (
          <p class="text-gray-500 dark:text-gray-400 text-center py-4">
            No hay ausencias registradas.
          </p>
        ) : (
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha inicio
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha fin
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {userAbsences.value.absences.map((absence: any) => (
                  <tr key={absence.id}>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class={`px-2 py-1 text-xs rounded-full ${getAbsenceColor(absence.absence_type)}`}>
                        {absence.absence_type === 'illness' && 'Enfermedad'}
                        {absence.absence_type === 'vacation' && 'Vacaciones'}
                        {absence.absence_type === 'personal' && 'Personal'}
                        {absence.absence_type === 'other' && 'Otros'}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(absence.start_date).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(absence.end_date).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {absence.description || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <Form action={deleteAbsence}>
                        <input type="hidden" name="absence_id" value={absence.id} />
                        <button 
                          type="submit"
                          class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          aria-label="Eliminar ausencia"
                        >
                          <LuTrash2 class="w-5 h-5" />
                        </button>
                      </Form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});