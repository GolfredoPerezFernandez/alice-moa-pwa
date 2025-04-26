import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from '@builder.io/qwik-city';
import { verifyAuth, canManageCapacitacion } from "~/utils/auth";

export const useAuthCheck = routeLoader$(async (requestEvent) => {
  const isAuthenticated = await verifyAuth(requestEvent);
  if (!isAuthenticated) {
    // Redirige a la página de login si no está autenticado
    throw requestEvent.redirect(302, '/auth');
  }

  // Verifica si el usuario puede acceder a la ruta de capacitación
  const canAccess = await canManageCapacitacion(requestEvent);
  if (!canAccess) {
    // Redirige al inicio si no tiene permisos
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