import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from '@builder.io/qwik-city';
import { verifyAuth, getUserType } from "~/utils/auth";

export const useAuthCheck = routeLoader$(async (requestEvent) => {
  const isAuthenticated = await verifyAuth(requestEvent);
  if (!isAuthenticated) {
    // Redirige a la página de login si no está autenticado
    throw requestEvent.redirect(302, '/auth');
  }

  // Get user type from cookie
  const userType = getUserType(requestEvent);
  console.log('[CAPACITACION] User type from cookie:', userType);

  // Verifica si el usuario es de tipo despacho o sindicato
  const canAccess = userType === 'despacho' || userType === 'sindicato';

  if (!canAccess) {
    // Redirige al inicio si no tiene permisos
    console.log('[CAPACITACION] User type not authorized for this section, redirecting to home');
    throw requestEvent.redirect(302, '/');
  }

  return {
    isAuthenticated,
    canAccess
  };
});

export default component$(() => {
  // Este layout se usa como un wrapper para todas las rutas de capacitación
  // El loader useAuthCheck ya se ejecutó y redirigió si es necesario
  return (
    <div class="capacitacion-layout">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Slot />
      </div>
    </div>
  );
});