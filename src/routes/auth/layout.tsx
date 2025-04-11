import { component$, Slot, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { verifyAuth } from '~/utils/auth';

export const useAuthCheck = routeLoader$(async (requestEvent) => {
  // Check if user is already authenticated
  const isAuthenticated = await verifyAuth(requestEvent);

  // If user is authenticated and trying to access the auth page (not logout)
  if (isAuthenticated && !requestEvent.pathname.includes('/auth/logout')) {
    // Redirect to a relevant page, e.g., chat or home
    // Changed from '/marketplace' to '/' as marketplace might not exist
    throw requestEvent.redirect(302, '/');
  }

  return { isAuthenticated };
});

export default component$(() => {
  const isDarkMode = useSignal(false);

  useVisibleTask$(() => {
    const prefersDark = document.documentElement.classList.contains('dark');
    isDarkMode.value = prefersDark;
  });

  return (
    // Moved comment inside the div
    <div class={`min-h-screen font-sans ${
      isDarkMode.value
        ? 'dark bg-gradient-to-br from-teal-900 via-green-900 to-gray-900 text-gray-100' // Dark mode gradient
        : 'bg-gradient-to-br from-teal-50 via-green-50 to-gray-50 text-gray-900' // Light mode gradient
    }`}
    style={{
      paddingTop: "calc(env(safe-area-inset-top))"
    }}>
      {/* Updated background gradient and text colors */}

      {/* Floating shapes animation */}
      <div class="fixed inset-0 pointer-events-none overflow-hidden opacity-40 z-0"> {/* Added z-0 */}
        {/* Updated floating shape colors */}
        <div class="w-20 h-20 bg-teal-500/10 dark:bg-teal-400/10 rounded-full absolute top-[15%] left-[55%] animate-[float_15s_infinite]"></div>
        <div class="w-32 h-32 bg-green-500/10 dark:bg-green-400/10 rounded-full absolute top-[40%] left-[75%] animate-[float_18s_infinite]" style="animation-delay: 0.5s;"></div>
        <div class="w-16 h-16 bg-teal-600/10 dark:bg-teal-500/10 rounded-full absolute top-[70%] left-[65%] animate-[float_12s_infinite]" style="animation-delay: 1s;"></div>
        <div class="w-24 h-24 bg-green-600/10 dark:bg-green-500/10 rounded-full absolute top-[30%] left-[40%] animate-[float_20s_infinite]" style="animation-delay: 1.5s;"></div>
      </div>

      {/* Added relative positioning and z-index to ensure Slot content is above shapes */}
      <div class="relative z-10 pt-safe">
        <Slot />
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(5px, -15px); }
          50% { transform: translate(10px, 0); }
          75% { transform: translate(5px, 15px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
});
