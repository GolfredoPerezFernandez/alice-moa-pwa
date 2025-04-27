import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$, type RequestHandler } from '@builder.io/qwik-city';
import { getUserType } from '~/utils/auth';

// Redirect handler to verify that only despacho or sindicato users can access this route
export const onRequest: RequestHandler = async (requestEvent) => {
  const userType = await getUserType(requestEvent);
  
  // Only allow access to users of type "sindicato" or "despacho"
  if (userType !== 'sindicato' && userType !== 'despacho') {
    console.log('[Auditoria] Access denied - redirecting to home. User type:', userType);
    throw requestEvent.redirect(302, '/');
  }
};

// Loader to get user information needed for this section
export const useAuditoriaUserInfo = routeLoader$(async (requestEvent) => {
  const userType = await getUserType(requestEvent);
  return {
    userType
  };
});

export default component$(() => {
  const userInfo = useAuditoriaUserInfo();

  return (
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Auditoría de Documentos Legales
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Carga y analiza documentos PDF para verificar su validez y obtener información relevante.
        </p>
      </header>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <Slot />
      </div>
    </div>
  );
});