import { routeLoader$ } from '@builder.io/qwik-city';
import { verifyAuth, getUserId, getUserType } from '~/utils/auth';

export const useAuthCheck = routeLoader$(async (requestEvent) => {
  console.log('[AUTH-CHECK] Starting auth check');
  
  // Public routes that don't require authentication
  if (
    requestEvent.url.pathname.startsWith("/auth") ||
    requestEvent.url.pathname === "/" ||
    requestEvent.url.pathname.startsWith("/about") ||
    requestEvent.url.pathname.startsWith("/docs")
  ) {
    console.log('[AUTH-CHECK] On public path, no auth required');
    return { user_id: null, isAuthenticated: false };
  }
  
  try {
    // Get user ID from cookie
    const user_id = getUserId(requestEvent);
    console.log(`[AUTH-CHECK] User ID from cookie: ${user_id}`);
    
    // Check if user is authenticated
    const isAuthenticated = await verifyAuth(requestEvent);
    console.log(`[AUTH-CHECK] Authentication result: ${isAuthenticated}`);
    
    if (!isAuthenticated || !user_id) {
      console.log('[AUTH-CHECK] Not authenticated, redirecting to auth');
      throw requestEvent.redirect(302, "/auth");
    }
    
    // User is authenticated, now check role-based restrictions
    const currentPath = requestEvent.url.pathname;
    
    // Get user type directly from cookie
    const userType = getUserType(requestEvent);
    console.log('[AUTH-CHECK] User type from cookie:', userType);
    const userIsSindicado = userType === 'sindicato';
    const userIsDespacho = userType === 'despacho';
    const userIsTrabajador = userType === 'trabajador';
    
    console.log('[AUTH-CHECK] User role flags:', { userIsTrabajador, userIsSindicado, userIsDespacho });

    // Route protection for worker-specific routes
    if ((currentPath.startsWith('/absences') || currentPath.startsWith('/timesheet')) &&
        !userIsTrabajador) {
      console.log('[AUTH-CHECK] User is not a worker, cannot access worker-specific routes');
      throw requestEvent.redirect(302, "/");
    }
    
    // Route protection for despacho/sindicato-specific routes
    if ((currentPath.startsWith('/capacitacion') || currentPath.startsWith('/documentos-legales')) &&
        !(userIsSindicado || userIsDespacho)) {
      console.log('[AUTH-CHECK] User is not despacho or sindicato, cannot access these routes');
      throw requestEvent.redirect(302, "/");
    }
    
    // User is authenticated and authorized
    return {
      user_id,
      isAuthenticated: true,
      isTrabajador: userIsTrabajador,
      isSindicado: userIsSindicado,
      isDespacho: userIsDespacho
    };
  } catch (error) {
    // If the error is not a redirect, it's an unexpected error
    if (!(error instanceof Response)) {
      console.error('[AUTH-CHECK] Authentication error:', error);
    }
    throw error;
  }
});