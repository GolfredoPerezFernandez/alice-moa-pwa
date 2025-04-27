import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$, useLocation } from '@builder.io/qwik-city';
import { verifyAuth, getUserType, getUserId } from '~/utils/auth';

// Verificar autenticación y tipo de usuario
export const useAuthCheck = routeLoader$(async (requestEvent) => {
  const isAuthenticated = await verifyAuth(requestEvent);
  
  if (!isAuthenticated) {
    // Redireccionar a la página de login si no está autenticado
    throw requestEvent.redirect(302, '/auth');
  }
  
  // Obtener el tipo de usuario
  const userType = await getUserType(requestEvent);
  
  // Permitir acceso a usuarios trabajador o sindicato
  if (userType !== 'trabajador' && userType !== 'sindicato') {
    // Redireccionar a la página principal si no tiene permisos
    console.log(`[Timesheet] Access denied: User type ${userType} is not allowed.`);
    throw requestEvent.redirect(302, '/');
  }
  
  return {
    userType,
    userId: getUserId(requestEvent) || null
  };
});

export default component$(() => {
  const auth = useAuthCheck();
  const location = useLocation();
  
  return (
    <div class="container mx-auto py-6 px-4">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Control de Fichaje
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Registra tu entrada y salida diaria y controla tus horas de trabajo.
        </p>
      </header>
      
      <main>
        <Slot />
      </main>
    </div>
  );
});