import { routeLoader$ } from '@builder.io/qwik-city';
import { verifyAuth, getUserId } from '~/utils/auth';

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
    
    // User is authenticated
    return { user_id, isAuthenticated: true };
  } catch (error) {
    // If the error is not a redirect, it's an unexpected error
    if (!(error instanceof Response)) {
      console.error('[AUTH-CHECK] Authentication error:', error);
    }
    throw error;
  }
});