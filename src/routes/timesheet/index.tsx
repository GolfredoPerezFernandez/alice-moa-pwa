import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { routeLoader$, Form, routeAction$, Link } from '@builder.io/qwik-city';
import { getUserId } from '~/utils/auth';
import { timesheetOperations } from '~/utils/db-operations';
import { LuClock, LuPlay, LuSquare, LuCalendarCheck, LuMapPin, LuClock3, LuAlertTriangle, LuLoader } from '@qwikest/icons/lucide';
import { TimesheetLocationMap } from '~/components/leaflet-map';

// Cargar los fichajes del usuario
export const useTimesheetLoader = routeLoader$(async (requestEvent) => {
  // Obtener el userId de la cookie
  const userId = getUserId(requestEvent);
  if (!userId) {
    return { timesheet: [], isCheckedIn: false, currentEntry: null };
  }

  try {
    // Usar la función de db-operations para obtener los datos del timesheet
    const timesheetData = await timesheetOperations.getTimesheetData(requestEvent, userId);
    return timesheetData;
  } catch (error) {
    console.error('[Timesheet Loader] Error:', error);
    return { timesheet: [], isCheckedIn: false, currentEntry: null };
  }
});

// Acción para fichar entrada
export const useCheckInAction = routeAction$(async (data, requestEvent) => {
  const userId = getUserId(requestEvent);
  if (!userId) {
    return { success: false, message: 'Usuario no identificado. Por favor inicia sesión nuevamente.' };
  }

  const { latitude, longitude } = data as any;
  const location = latitude && longitude ?
    JSON.stringify({ latitude, longitude }) : null;

  try {
    // Usar la función de db-operations para hacer check-in
    const result = await timesheetOperations.checkIn(requestEvent, userId, location);
    return result;
  } catch (error) {
    console.error('[Check-In Action] Error:', error);
    return { success: false, message: 'Error al fichar entrada' };
  }
});

// Acción para fichar salida
export const useCheckOutAction = routeAction$(async (data, requestEvent) => {
  const userId = getUserId(requestEvent);
  if (!userId) {
    return { success: false, message: 'Usuario no identificado' };
  }

  const { latitude, longitude } = data as any;
  const location = latitude && longitude ?
    JSON.stringify({ latitude, longitude }) : null;

  try {
    // Usar la función de db-operations para hacer check-out
    const result = await timesheetOperations.checkOut(requestEvent, userId, location);
    return result;
  } catch (error) {
    console.error('[Check-Out Action] Error:', error);
    return { success: false, message: 'Error al fichar salida' };
  }
});

export default component$(() => {
  const timesheetData = useTimesheetLoader();
  const checkInAction = useCheckInAction();
  const checkOutAction = useCheckOutAction();
  
  // Señales para el estado local
  const currentTime = useSignal(new Date().toLocaleTimeString());
  const location = useSignal<{ latitude: number; longitude: number } | null>(null);
  const locationError = useSignal<string | null>(null);
  const elapsedTime = useSignal<string>('00:00:00');
  const isCheckingIn = useSignal(false);
  const isCheckingOut = useSignal(false);
  
  // Funciones reactivas
  const formatElapsedTime = $((startTimeStr: string): string => {
    const startTime = new Date(startTimeStr);
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });
  
  const formatDuration = $((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  });
  
  const formatDateTime = $((dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  });

  
  // Tarea para actualizar la hora cada segundo
  useVisibleTask$(({ cleanup }) => {
    // Actualizar la hora actual cada segundo
    const timer = setInterval(() => {
      currentTime.value = new Date().toLocaleTimeString();
      
      // Si hay un registro activo, actualizar el tiempo transcurrido
      if (timesheetData.value.isCheckedIn && timesheetData.value.currentEntry) {
        const checkInTimeStr = String(timesheetData.value.currentEntry.check_in_time);
        formatElapsedTime(checkInTimeStr).then(formattedTime => {
          elapsedTime.value = formattedTime;
        });
      }
    }, 1000);
    
    cleanup(() => clearInterval(timer));
  });

  // Tarea para resetear estados de carga cuando las acciones se completan
  useVisibleTask$(({ track }) => {
    const checkInValue = track(() => checkInAction.value);
    const checkOutValue = track(() => checkOutAction.value);
    
    if (checkInValue !== undefined) {
      isCheckingIn.value = false;
    }
    
    if (checkOutValue !== undefined) {
      isCheckingOut.value = false;
    }
  });
  
  // Tarea para obtener la ubicación
  useVisibleTask$(() => {
    // Intentar obtener la geolocalización
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          location.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          locationError.value = null;
        },
        (error) => {
          console.error('Error getting location:', error);
          locationError.value = 'No se pudo obtener tu ubicación. Por favor, permite el acceso a tu ubicación.';
        },
        { enableHighAccuracy: true }
      );
    } else {
      locationError.value = 'Tu navegador no soporta geolocalización.';
    }
  });
  
  return (
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Sección principal de fichaje */}
      <div class="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <LuClock class="w-8 h-8 text-red-500 mr-3" />
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Fichaje actual</h2>
          </div>
          <div class="text-3xl font-mono font-bold text-gray-800 dark:text-white">
            {currentTime.value}
          </div>
        </div>
        
        {/* Estado de geolocalización */}
        <div class="mb-6">
          <div class="flex items-center mb-2">
            <LuMapPin class="w-5 h-5 text-gray-500 mr-2" />
            <span class="text-gray-700 dark:text-gray-300">Estado de la ubicación:</span>
          </div>
          
          {locationError.value ? (
            <div class="flex items-center text-red-500">
              <LuAlertTriangle class="w-5 h-5 mr-2" />
              <span>{locationError.value}</span>
            </div>
          ) : location.value ? (
            <div class="text-green-500 dark:text-green-400">
              Ubicación capturada correctamente
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Lat: {location.value.latitude.toFixed(6)}, Lng: {location.value.longitude.toFixed(6)}
              </div>
            </div>
          ) : (
            <div class="text-yellow-500 dark:text-yellow-400">
              Obteniendo ubicación...
            </div>
          )}
        </div>
        
        {/* Tarjeta de estado actual */}
        <div class={`border rounded-lg p-6 mb-6 ${timesheetData.value.isCheckedIn 
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
          : 'border-gray-200 dark:border-gray-700'}`}>
          
          {timesheetData.value.isCheckedIn ? (
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-green-700 dark:text-green-400">
                  ¡Estás trabajando ahora!
                </h3>
                <span class="text-3xl font-mono font-bold text-green-700 dark:text-green-400">
                  {elapsedTime.value}
                </span>
              </div>
              
              <div class="mb-4">
                <span class="block text-sm text-gray-600 dark:text-gray-400">Inicio de jornada:</span>
                <span class="font-medium text-gray-800 dark:text-white">
                  {timesheetData.value.currentEntry ? 
                    <span>{formatDateTime(String(timesheetData.value.currentEntry.check_in_time))}</span> : 
                    ''}
                </span>
              </div>
              
              <Form action={checkOutAction}
                    onSubmit$={() => {
                      isCheckingOut.value = true;
                    }}
                    onClick$={(e, form) => {
                      if (e.target && (e.target as HTMLElement).tagName === 'BUTTON') {
                        isCheckingOut.value = true;
                      }
                    }}>
                <input type="hidden" name="latitude" value={location.value?.latitude} />
                <input type="hidden" name="longitude" value={location.value?.longitude} />
                
                <button
                  type="submit"
                  class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-6 rounded-xl transition-colors flex items-center justify-center text-2xl shadow-lg border-4 border-red-500"
                  disabled={!location.value || isCheckingOut.value}
                  onClick$={() => {
                    if (location.value && !isCheckingOut.value) {
                      isCheckingOut.value = true;
                    }
                  }}
                >
                  {isCheckingOut.value ? (
                    <>
                      <LuLoader class="w-8 h-8 mr-3 animate-spin" />
                      <span class="inline-block tracking-wide font-extrabold">PROCESANDO...</span>
                    </>
                  ) : (
                    <>
                      <LuSquare class="w-8 h-8 mr-3" />
                      <span class="inline-block tracking-wide font-extrabold">DETENER JORNADA</span>
                    </>
                  )}
                </button>
                
                {checkOutAction.value?.success === false && (
                  <div class="mt-3 text-red-500 text-sm">
                    {checkOutAction.value.message}
                  </div>
                )}
              </Form>
            </div>
          ) : (
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-green-700 dark:text-green-400">
                  Listo para comenzar
                </h3>
              </div>

              {/* BOTÓN DE FICHAJE GRANDE Y DESTACADO */}
              <div class="text-center py-4">
                <div class="mb-4 text-gray-700 dark:text-gray-300 font-medium text-center">
                  Pulsa el botón verde para comenzar tu jornada laboral
                </div>
                    
                    <Form action={checkInAction}
                          onSubmit$={() => {
                            isCheckingIn.value = true;
                          }}
                          onClick$={(e, form) => {
                            if (e.target && (e.target as HTMLElement).tagName === 'BUTTON') {
                              isCheckingIn.value = true;
                            }
                          }}>
                      <input type="hidden" name="latitude" value={location.value?.latitude} />
                      <input type="hidden" name="longitude" value={location.value?.longitude} />
                      
                      <button
                        type="submit"
                        class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-6 px-6 rounded-xl transition-colors flex items-center justify-center text-2xl shadow-lg border-4 border-green-500"
                        disabled={!location.value || isCheckingIn.value}
                        onClick$={() => {
                          if (location.value && !isCheckingIn.value) {
                            isCheckingIn.value = true;
                          }
                        }}
                      >
                        {isCheckingIn.value ? (
                          <>
                            <LuLoader class="w-8 h-8 mr-3 animate-spin" />
                            <span class="inline-block tracking-wide font-extrabold">PROCESANDO...</span>
                          </>
                        ) : (
                          <>
                            <LuPlay class="w-8 h-8 mr-3" />
                            <span class="inline-block tracking-wide font-extrabold">INICIAR JORNADA</span>
                          </>
                        )}
                      </button>
                    </Form>

                    {/* Mapa LeafletJS para visualizar la ubicación */}
                    {location.value && (
                      <div class="mt-6 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
                        <div class="bg-gray-100 p-2 text-sm text-gray-700 font-medium">
                          <LuMapPin class="w-4 h-4 inline mr-1" />
                          Tu ubicación actual
                        </div>
                        <div class="h-[250px] w-full">
                          <TimesheetLocationMap
                            latitude={location.value.latitude}
                            longitude={location.value.longitude}
                          />
                        </div>
                      </div>
                    )}

                    {!location.value ? (
                      <div class="mt-6 text-yellow-600 text-center py-3 border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-md">
                        <LuAlertTriangle class="w-6 h-6 inline mr-1" />
                        <span class="font-medium">Esperando ubicación para habilitar el fichaje...</span>
                        <div class="text-sm mt-1">Por favor, permite el acceso a tu ubicación en el navegador</div>
                      </div>
                    ) : (
                      <div class="mt-5 text-center animate-pulse">
                        <span class="text-base text-green-600 font-semibold">👆 ¡Pulsa el botón VERDE para comenzar!</span>
                      </div>
                    )}
                    
                    {checkInAction.value?.success === false && (
                      <div class="mt-4 text-red-500 text-base p-3 bg-red-50 border border-red-200 rounded-lg">
                        <LuAlertTriangle class="w-5 h-5 inline mr-1" />
                        {checkInAction.value.message}
                      </div>
                    )}
                  </div>
            </div>
          )}
        </div>
        
        {checkInAction.value?.success && (
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
            {checkInAction.value.message}
          </div>
        )}
        
        {checkOutAction.value?.success && (
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
            <p>{checkOutAction.value.message}</p>
            {checkOutAction.value.totalMinutes !== undefined && (
              <p class="text-sm mt-1">
                Tiempo trabajado: <span>{formatDuration(checkOutAction.value.totalMinutes)}</span> horas
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Panel lateral con historial */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center mb-4">
          <LuCalendarCheck class="w-6 h-6 text-red-500 mr-2" />
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">
            Historial reciente
          </h2>
        </div>
        
        {timesheetData.value.timesheet.length === 0 ? (
          <div class="text-gray-500 dark:text-gray-400 text-center py-10">
            No hay registros de fichaje.
          </div>
        ) : (
          <div class="space-y-4">
            {timesheetData.value.timesheet.map((entry: any) => (
              <div key={entry.id} class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                <div class="font-medium text-gray-800 dark:text-white">
                  {new Date(String(entry.check_in_time)).toLocaleDateString()}
                </div>
                <div class="grid grid-cols-2 text-sm mt-1">
                  <div class="text-gray-600 dark:text-gray-400">
                    <LuPlay class="w-4 h-4 inline mr-1 text-green-500" />
                    {new Date(String(entry.check_in_time)).toLocaleTimeString()}
                  </div>
                  <div class="text-gray-600 dark:text-gray-400">
                    {entry.check_out_time ? (
                      <>
                        <LuSquare class="w-4 h-4 inline mr-1 text-red-500" />
                        {new Date(String(entry.check_out_time)).toLocaleTimeString()}
                      </>
                    ) : (
                      <span class="text-green-500">En curso</span>
                    )}
                  </div>
                </div>
                
                {entry.total_minutes !== null && (
                  <div class="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <LuClock3 class="w-4 h-4 mr-1" />
                    <span>Total: <span>{formatDuration(entry.total_minutes)}</span></span>
                  </div>
                )}
                
                {entry.check_in_location && (
                  <button
                    class="mt-2 text-xs text-blue-600 hover:underline flex items-center"
                    onClick$={() => {
                      const locationData = JSON.parse(entry.check_in_location);
                      location.value = {
                        latitude: locationData.latitude,
                        longitude: locationData.longitude
                      };
                    }}
                  >
                    <LuMapPin class="w-3 h-3 mr-1" />
                    Ver ubicación de entrada
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});