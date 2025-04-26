import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$, type RequestHandler } from '@builder.io/qwik-city';
import { getUserType } from '~/utils/auth';

// Redirect handler para verificar que solo usuarios trabajadores (normal) puedan acceder a esta ruta
export const onRequest: RequestHandler = async (requestEvent) => {
  const userType = getUserType(requestEvent);
  
  // Solo permitir acceso a usuarios de tipo "normal" (trabajadores)
  if (userType !== 'normal') {
    console.log('[Absences] Access denied - redirecting to home. User type:', userType);
    throw requestEvent.redirect(302, '/');
  }
};

// Loader para obtener información del usuario necesaria para esta sección
export const useAbsencesUserInfo = routeLoader$(async (requestEvent) => {
  const userType = getUserType(requestEvent);
  return {
    userType
  };
});

export default component$(() => {
  const userInfo = useAbsencesUserInfo();

  return (
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Registro de Ausencias
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Registra tus días de baja laboral, vacaciones y otras ausencias.
        </p>
      </header>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <Slot />
      </div>
    </div>
  );
});