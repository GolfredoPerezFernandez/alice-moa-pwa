import { component$, Slot, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { Link, routeLoader$, useLocation } from '@builder.io/qwik-city';
// Directly import the loader from its source file
import { useAuthCheck } from './auth-check';
// Remove the re-export line below
import {
  LuHome,          // Keep for Home link
  LuBookOpen,      // For Courses
  LuUsers,         // For Community/About
  LuMessageSquare, // For Chat
  LuGraduationCap, // Maybe for logo or About
  LuLanguages,     // General language icon
  LuLogIn,         // For Login
  LuLogOut,        // For Logout
  LuMenu,          // Mobile menu
  LuX,             // Mobile menu close
  LuSun,           // Light mode
  LuMoon           // Dark mode
} from '@qwikest/icons/lucide';
import { verifyAuth } from '~/utils/auth';

// Define the auth loader directly within the layout
export const useLayoutAuthLoader = routeLoader$(async (requestEvent) => {
  // No need to check for public paths here, as this layout doesn't run for /auth
  // It runs for /, /about, /courses, /chat etc.
  console.log('[Layout Loader] Starting auth check');
  try {
    // We only need the boolean status for the layout's conditional rendering
    const isAuthenticated = await verifyAuth(requestEvent); // Verify using the cookie
    console.log(`[Layout Loader] Is Authenticated: ${isAuthenticated}`);
    // Return only the necessary boolean value
    return { isAuthenticated };
  } catch (error) {
    // Handle potential errors during verification, though verifyAuth might handle redirects
    console.error('[Layout Loader] Error checking auth:', error);
    // Return unauthenticated state on error, but don't redirect from here
    // Redirects for protected routes should happen in their specific loaders if needed
    return { user_id: null, isAuthenticated: false };
  }
});

export default component$(() => {
  // Use the loader defined within this layout file
  const auth = useLayoutAuthLoader();
  const location = useLocation();
  const isDarkMode = useSignal(false);
  const isMobileMenuOpen = useSignal(false);
  const isMarketplacePage = useSignal(false);

  // Check if path matches the active route
  const isActive = (path: string) => {
    return location.url.pathname.startsWith(path);
  };

  // Toggle dark mode
  useVisibleTask$(() => {
    const prefersDark = document.documentElement.classList.contains('dark');
    isDarkMode.value = prefersDark;
    
    // Check if we're on marketplace pages
    isMarketplacePage.value = location.url.pathname.startsWith('/marketplace');
  });

  const toggleDarkMode = $(() => {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });
  // Special case for auth routes - they need a totally different layout
  if (location.url.pathname.startsWith('/auth')) {
    return <Slot />;
  }

  // All pages including marketplace should use the same navigation for consistency

  // Update marketplace page status when URL changes (Moved here)
  useVisibleTask$(({ track }) => {
    track(() => location.url.pathname);
    isMarketplacePage.value = location.url.pathname.startsWith('/marketplace');
  });

  // Client-side log to check auth state
  useVisibleTask$(({ track }) => {
    track(() => auth.value); // Track changes to auth value
    console.log('[Layout Client] Auth State:', auth.value);
    console.log('[Layout Client] isAuthenticated:', auth.value?.isAuthenticated);
  });
  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header class="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="container mx-auto px-4 flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div class="flex items-center">
            <Link href="/" class="flex items-center group">
              {/* Updated Logo Gradient and Icon */}
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white shadow group-hover:scale-105 transition-transform">
                <LuGraduationCap class="w-5 h-5" /> {/* Graduation Cap Icon */}
              </div>
              {/* Updated Brand Name and Gradient */}
              <span class="ml-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-400 dark:to-green-400">
                Move On Academy
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav class="hidden md:flex items-center space-x-1">
            {/* Links for unauthenticated users */}
            {/* Common Links (visible to all) */}
            <Link
              href="/"
              class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.url.pathname === '/' // Exact match for home
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              <div class="flex items-center">
                <LuHome class="w-5 h-5 mr-1.5" />
                <span>Home</span>
              </div>
            </Link>
            <Link
              href="/courses" // Example courses link
              class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/courses')
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              <div class="flex items-center">
                <LuBookOpen class="w-5 h-5 mr-1.5" />
                <span>Courses</span>
              </div>
            </Link>
            <Link
              href="/about" // Keep About link
              class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              <div class="flex items-center">
                <LuUsers class="w-5 h-5 mr-1.5" />
                <span>About</span>
              </div>
            </Link>
            
            {/* Authenticated-only links */}
            {auth.value?.isAuthenticated && (
              <>
                {/* Link to the Chat */}
                <Link
                  href="/chat" // Keep Chat link
                  class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/chat')
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' // Updated active colors
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div class="flex items-center">
                    <LuMessageSquare class="w-5 h-5 mr-1.5" /> {/* Keep chat icon */}
                    <span>Chat</span>
                  </div>
                </Link>
                
                {/* Link to Text-only Chat */}
                <Link
                  href="/text-chat"
                  class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/text-chat')
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div class="flex items-center">
                    <LuMessageSquare class="w-5 h-5 mr-1.5" />
                    <span>Text Chat</span>
                  </div>
                </Link>
                
                {/* Add other relevant links if needed, e.g., Admin panel for admin users */}
                <Link
                  href="/auth/logout"
                  class="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                >
                  <div class="flex items-center">
                    <LuLogOut class="w-5 h-5 mr-1.5" />
                    <span>Logout</span>
                  </div>
                </Link>
              </>
            )}
            
            {/* Login link for unauthenticated users */}
            {!auth.value?.isAuthenticated && (
              <Link
                href="/auth" // Login link
                class="px-3 py-2 rounded-md text-sm font-medium text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/30 transition-colors" // Updated colors
              >
                <div class="flex items-center">
                  <LuLogIn class="w-5 h-5 mr-1.5" /> {/* Use Login icon */}
                  <span>Login / Sign Up</span>
                </div>
              </Link>
            )}
            
            {/* Dark mode toggle (visible to all) */}
            <button
              onClick$={toggleDarkMode}
              class="ml-2 p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode.value ? <LuSun class="w-5 h-5" /> : <LuMoon class="w-5 h-5" />}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div class="flex items-center md:hidden">
            <button
              onClick$={() => (isMobileMenuOpen.value = !isMobileMenuOpen.value)}
              class="p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen.value ? (
                <LuX class="w-6 h-6" />
              ) : (
                <LuMenu class="w-6 h-6" />
              )}
            </button>
            
            {/* Dark mode toggle on mobile */}
            <button
              onClick$={toggleDarkMode}
              class="ml-2 p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode.value ? <LuSun class="w-5 h-5" /> : <LuMoon class="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen.value && (
        <div class="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md animate-slideDown">
          <div class="px-2 pt-2 pb-3 space-y-1">
            {/* Common Links (visible to all) - Mobile */}
            <Link
              href="/"
              class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.url.pathname === '/'
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
              onClick$={() => (isMobileMenuOpen.value = false)}
            >
              <div class="flex items-center">
                <LuHome class="w-5 h-5 mr-3" />
                <span>Home</span>
              </div>
            </Link>
            <Link
              href="/courses"
              class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/courses')
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
              onClick$={() => (isMobileMenuOpen.value = false)}
            >
              <div class="flex items-center">
                <LuBookOpen class="w-5 h-5 mr-3" />
                <span>Courses</span>
              </div>
            </Link>
            <Link
              href="/about"
              class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/about')
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
              onClick$={() => (isMobileMenuOpen.value = false)}
            >
              <div class="flex items-center">
                <LuUsers class="w-5 h-5 mr-3" />
                <span>About</span>
              </div>
            </Link>
            
            {/* Authenticated-only links */}
            {auth.value?.isAuthenticated && (
              <>
                {/* Link to the Chat */}
                <Link
                  href="/chat"
                  class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/chat')
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' // Updated active colors
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                  onClick$={() => (isMobileMenuOpen.value = false)}
                >
                  <div class="flex items-center">
                    <LuMessageSquare class="w-5 h-5 mr-3" />
                    <span>Chat</span>
                  </div>
                </Link>
                
                {/* Link to Text-only Chat (Mobile) */}
                <Link
                  href="/text-chat"
                  class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/text-chat')
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                  onClick$={() => (isMobileMenuOpen.value = false)}
                >
                  <div class="flex items-center">
                    <LuMessageSquare class="w-5 h-5 mr-3" />
                    <span>Text Chat</span>
                  </div>
                </Link>
                
                {/* Add other relevant links if needed */}
                <Link
                  href="/auth/logout"
                  class="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                  onClick$={() => (isMobileMenuOpen.value = false)}
                >
                  <div class="flex items-center">
                    <LuLogOut class="w-5 h-5 mr-3" />
                    <span>Logout</span>
                  </div>
                </Link>
              </>
            )}
            {/* Login link for unauthenticated users */}
            {!auth.value?.isAuthenticated && (
              <Link
                href="/auth" // Login link
                class="block px-3 py-2 rounded-md text-base font-medium text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/30 transition-colors" // Updated colors
                onClick$={() => (isMobileMenuOpen.value = false)}
              >
                <div class="flex items-center">
                  <LuLogIn class="w-5 h-5 mr-3" /> {/* Use Login icon */}
                  <span>Login / Sign Up</span>
                </div>
              </Link>
            )}
            {/* End of conditional blocks */}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main class="container mx-auto py-4 px-4 md:px-6">
        <Slot />
      </main>

      {/* Footer - Not displayed on chat or text-chat pages */}
      {!location.url.pathname.startsWith('/chat') && !location.url.pathname.startsWith('/text-chat') && (
        <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
          <div class="container mx-auto px-4">
            <div class="flex flex-col md:flex-row justify-between items-center">
              <div class="flex items-center mb-4 md:mb-0">
                {/* Updated Footer Logo */}
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white shadow">
                   <LuGraduationCap class="w-5 h-5" />
                </div>
                {/* Updated Footer Brand Name */}
                <span class="ml-2 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-400 dark:to-green-400">
                  Move On Academy
                </span>
              </div>
              <div class="text-center md:text-right text-sm text-gray-600 dark:text-gray-400">
                <p>© {new Date().getFullYear()} Move On Academy. All rights reserved.</p>
                <div class="mt-2 space-x-4">
                  {/* Updated Footer Link Colors */}
                  <Link href="/terms" class="hover:text-teal-600 dark:hover:text-teal-400">Terms</Link>
                  <Link href="/privacy" class="hover:text-teal-600 dark:hover:text-teal-400">Privacy</Link>
                  <Link href="/contact" class="hover:text-teal-600 dark:hover:text-teal-400">Contact</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Custom animations and styles */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        /* Hide scrollbars but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
        
        html, body {
          overscroll-behavior: none;
        }
      `}</style>
    </div>
  );
  
}); // End of component$