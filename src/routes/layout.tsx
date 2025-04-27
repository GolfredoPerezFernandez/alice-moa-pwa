import { component$, Slot, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { routeLoader$, useLocation, Link } from '@builder.io/qwik-city';
import { verifyAuth, getUserType } from '~/utils/auth';

// Importar iconos
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
  LuMoon,          // Dark mode
  LuUser,          // For user icon/logo
  LuCalendar,      // For absences calendar
  LuClock,         // For timesheet/fichaje
  LuSchool,        // Para sección de capacitación
  LuFileText       // Para documentos legales
} from '@qwikest/icons/lucide';

// Autenticación y verificación de usuario
export const useAuthCheck = routeLoader$(async (requestEvent) => {
  const isAuthenticated = await verifyAuth(requestEvent);
  const userType = isAuthenticated ? getUserType(requestEvent) : null;
  
  // Determine user type flags based on the userType from the cookie
  const isTrabajador = userType === 'trabajador';
  const isUserSindicado = userType === 'sindicato';
  const isUserDespacho = userType === 'despacho';
  
  if (isAuthenticated) {
    console.log('[LAYOUT] User roles determined from cookie:', {
      userType,
      isTrabajador,
      isSindicado: isUserSindicado,
      isDespacho: isUserDespacho
    });
  }
  
  return {
    isAuthenticated,
    userType,
    userId: requestEvent.cookie.get('userId')?.value || null,
    username: requestEvent.cookie.get('username')?.value || null,
    isTrabajador,
    isSindicado: isUserSindicado,
    isDespacho: isUserDespacho
  };
});

export default component$(() => {
  const auth = useAuthCheck();
  const location = useLocation();
  
  // Señales para controlar estado de la UI
  const isMobileMenuOpen = useSignal(false);
  const isDarkMode = useSignal(false);
  const isLoggingOut = useSignal(false);
  
  // Asegurar que isLoggingOut se reinicie cuando cambia el estado de autenticación
  useVisibleTask$(({ track }) => {
    track(() => auth.value?.isAuthenticated);
    // Si el usuario está autenticado, asegurarse de que isLoggingOut esté en false
    if (auth.value?.isAuthenticated) {
      isLoggingOut.value = false;
    }
  });
  
  // Detectar preferencia de tema oscuro
  useVisibleTask$(({ track }) => {
    // Detectar si el usuario prefiere modo oscuro
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && darkModePreference.matches)) {
      document.documentElement.classList.add('dark');
      isDarkMode.value = true;
    } else {
      document.documentElement.classList.remove('dark');
      isDarkMode.value = false;
    }
    
    // Función para manejar cambios en la preferencia del sistema
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
          isDarkMode.value = true;
        } else {
          document.documentElement.classList.remove('dark');
          isDarkMode.value = false;
        }
      }
    };
    
    // Agregar listener
    darkModePreference.addEventListener('change', handleChange);
    
    // Limpieza
    return () => {
      darkModePreference.removeEventListener('change', handleChange);
    };
  });
  
  // Función para cambiar tema
  const toggleDarkMode = $(() => {
    if (isDarkMode.value) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    
    isDarkMode.value = !isDarkMode.value;
  });
  
  // Función para determinar si una ruta está activa
  const isActive = (path: string) => {
    if (path === '/' && location.url.pathname === '/') {
      return true;
    }
    
    if (path !== '/' && location.url.pathname.startsWith(path)) {
      return true;
    }
    
    return false;
  };
  
  return (
    <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            {/* Logo & Desktop Navigation */}
            <div class="flex">
              {/* Logo */}
              <div class="flex-shrink-0 flex items-center">
                <Link href="/" aria-label="Home">
                  <LuGraduationCap class="w-9 h-9 text-red-600 dark:text-red-500" />
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-3">
                {/* Home Link */}
                <Link
                  href="/"
                  class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/')
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div class="flex items-center">
                    <LuHome class="w-5 h-5 mr-1.5" />
                    <span>Inicio</span>
                  </div>
                </Link>
                
                {/* Courses Link */}
                <Link
                  href="/docs"
                  class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/docs')
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div class="flex items-center">
                    <LuBookOpen class="w-5 h-5 mr-1.5" />
                    <span>Documentos</span>
                  </div>
                </Link>
                
                {/* About Link */}
                <Link
                  href="/about"
                  class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/about')
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div class="flex items-center">
                    <LuUsers class="w-5 h-5 mr-1.5" />
                    <span>Acerca de</span>
                  </div>
                </Link>
                
                {/* Chat Link - Only for sindicato/despacho users */}
                {auth.value?.isAuthenticated && (
                  <Link
                    href="/chat"
                    class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/chat')
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div class="flex items-center">
                      <LuMessageSquare class="w-5 h-5 mr-1.5" />
                      <span>Chat</span>
                    </div>
                  </Link>
                )}
                
                {/* Link to Absences - Only for trabajadores */}
                {auth.value?.isTrabajador && (
                  <Link
                    href="/absences"
                    class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/absences')
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div class="flex items-center">
                      <LuCalendar class="w-5 h-5 mr-1.5" />
                      <span>Ausencias</span>
                    </div>
                  </Link>
                )}
                
                {/* Link to Timesheet - Only for trabajadores */}
                {auth.value?.isTrabajador && (
                  <Link
                    href="/timesheet"
                    class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/timesheet')
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div class="flex items-center">
                      <LuClock class="w-5 h-5 mr-1.5" />
                      <span>Fichaje</span>
                    </div>
                  </Link>
                )}
                
                {/* Link to Capacitación - Only for sindicato/despacho users */}
                {(auth.value?.isSindicado || auth.value?.isDespacho) && (
                  <Link
                    href="/capacitacion"
                    class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/capacitacion')
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div class="flex items-center">
                      <LuGraduationCap class="w-5 h-5 mr-1.5" />
                      <span>Capacitación</span>
                    </div>
                  </Link>
                )}
                
                {/* Link to Documentos Legales - Only for sindicato/despacho users */}
                {(auth.value?.isSindicado || auth.value?.isDespacho) && (
                  <Link
                    href="/documentos-legales"
                    class={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/documentos-legales')
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div class="flex items-center">
                      <LuFileText class="w-5 h-5 mr-1.5" />
                      <span>Documentos Legales</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
            
            {/* Right Side Menu: Dark Mode, User/Auth Controls, Mobile Menu Button */}
            <div class="flex items-center gap-1">
              {/* Dark Mode Toggle */}
              <button
                onClick$={toggleDarkMode}
                class="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 p-2 rounded-md"
                aria-label={isDarkMode.value ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode.value ? <LuSun class="w-5 h-5" /> : <LuMoon class="w-5 h-5" />}
              </button>
              
              {/* Auth Controls */}
              {auth.value?.isAuthenticated ? (
                <div class="flex items-center space-x-2">
                  {/* User Type Badge */}
                  {auth.value?.userType && (
                    <div class="hidden sm:flex">
                      <span class={`px-2 py-1 text-xs rounded-full font-medium ${
                        auth.value.userType === 'trabajador'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : auth.value.userType === 'despacho'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : auth.value.userType === 'sindicato'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {auth.value.userType === 'trabajador'
                          ? 'Trabajador'
                          : auth.value.userType === 'despacho'
                            ? 'Despacho'
                            : auth.value.userType === 'sindicato'
                                ? 'Sindicato'
                                : 'Usuario'}
                      </span>
                    </div>
                  )}
                  
                  {/* Profile/User Info */}
                  <Link
                    href="/profile"
                    class={`hidden sm:flex px-3 py-2 rounded-md text-sm font-medium items-center transition-colors ${
                      isActive('/profile')
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div class="flex items-center">
                      <LuUser class="w-5 h-5 mr-1.5" />
                      <span>{auth.value.username || 'Perfil'}</span>
                    </div>
                  </Link>
                  
                  {/* Logout Button */}
                  <Link
                    href="/auth/logout"
                    class="hidden sm:flex px-3 py-2 rounded-md text-sm font-medium items-center text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
                    onClick$={() => {
                      isLoggingOut.value = true;
                    }}
                  >
                    <div class="flex items-center">
                      {isLoggingOut.value ? (
                        <>
                          <div class="flex items-center justify-center">
                            <div class="w-4 h-4 mr-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 animate-pulse"></div>
                            <span>Cerrando sesión...</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <LuLogOut class="w-5 h-5 mr-1.5" />
                          <span>Cerrar sesión</span>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
              ) : (
                /* Login Link */
                <Link
                  href="/auth"
                  class="hidden sm:flex px-3 py-2 rounded-md text-sm font-medium items-center text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div class="flex items-center">
                    <LuLogIn class="w-5 h-5 mr-1.5" />
                    <span>Iniciar sesión</span>
                  </div>
                </Link>
              )}
              
              {/* Mobile menu button */}
              <button
                onClick$={() => (isMobileMenuOpen.value = !isMobileMenuOpen.value)}
                class="sm:hidden p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 rounded-md"
                aria-expanded={isMobileMenuOpen.value}
                aria-controls="mobile-menu"
                aria-label="Main menu"
              >
                {isMobileMenuOpen.value ? (
                  <LuX class="w-6 h-6" />
                ) : (
                  <LuMenu class="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div
          class={`sm:hidden ${isMobileMenuOpen.value ? 'block' : 'hidden'}`}
          id="mobile-menu"
        >
          <div class="px-2 pt-2 pb-3 space-y-1">
            {/* Home Link */}
            <Link
              href="/"
              class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/')
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
              onClick$={() => (isMobileMenuOpen.value = false)}
            >
              <div class="flex items-center">
                <LuHome class="w-5 h-5 mr-3" />
                <span>Inicio</span>
              </div>
            </Link>
            
            {/* Courses Link */}
            <Link
              href="/docs"
              class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/docs')
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
              onClick$={() => (isMobileMenuOpen.value = false)}
            >
              <div class="flex items-center">
                <LuBookOpen class="w-5 h-5 mr-3" />
                <span>Documentos</span>
              </div>
            </Link>
            
            {/* About Link */}
            <Link
              href="/about"
              class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/about')
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
              onClick$={() => (isMobileMenuOpen.value = false)}
            >
              <div class="flex items-center">
                <LuUsers class="w-5 h-5 mr-3" />
                <span>Acerca de</span>
              </div>
            </Link>
            
            {/* Chat Link - For all authenticated users */}
            {auth.value?.isAuthenticated && (
              <Link
                href="/chat"
                class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/chat')
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
                onClick$={() => (isMobileMenuOpen.value = false)}
              >
                <div class="flex items-center">
                  <LuMessageSquare class="w-5 h-5 mr-3" />
                  <span>Chat</span>
                </div>
              </Link>
            )}
            
            {/* Link to Absences - Only for trabajadores */}
            {auth.value?.isTrabajador && (
              <Link
                href="/absences"
                class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/absences')
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
                onClick$={() => (isMobileMenuOpen.value = false)}
              >
                <div class="flex items-center">
                  <LuCalendar class="w-5 h-5 mr-3" />
                  <span>Ausencias</span>
                </div>
              </Link>
            )}
            
            {/* Link to Timesheet - Only for trabajadores */}
            {auth.value?.isTrabajador && (
              <Link
                href="/timesheet"
                class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/timesheet')
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
                onClick$={() => (isMobileMenuOpen.value = false)}
              >
                <div class="flex items-center">
                  <LuClock class="w-5 h-5 mr-3" />
                  <span>Fichaje</span>
                </div>
              </Link>
            )}
            
            {/* Link to Capacitación - Only for sindicato/despacho users */}
            {(auth.value?.isSindicado || auth.value?.isDespacho) && (
              <Link
                href="/capacitacion"
                class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/capacitacion')
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
                onClick$={() => (isMobileMenuOpen.value = false)}
              >
                <div class="flex items-center">
                  <LuGraduationCap class="w-5 h-5 mr-3" />
                  <span>Capacitación</span>
                </div>
              </Link>
            )}
            
            {/* Link to Documentos Legales - Only for sindicato/despacho users */}
            {(auth.value?.isSindicado || auth.value?.isDespacho) && (
              <Link
                href="/documentos-legales"
                class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/documentos-legales')
                    ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
                onClick$={() => (isMobileMenuOpen.value = false)}
              >
                <div class="flex items-center">
                  <LuFileText class="w-5 h-5 mr-3" />
                  <span>Documentos Legales</span>
                </div>
              </Link>
            )}
            
            {/* User Management */}
            {auth.value?.isAuthenticated ? (
              <>
                {/* Profile Link */}
                {/* User Type Badge for Mobile */}
                {auth.value?.userType && (
                  <div class="mb-2 px-3 py-2">
                    <span class={`px-2 py-1 text-xs rounded-full font-medium ${
                      auth.value.userType === 'trabajador'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : auth.value.userType === 'despacho'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                          : auth.value.userType === 'sindicato'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {auth.value.userType === 'trabajador'
                        ? 'Trabajador'
                        : auth.value.userType === 'despacho'
                          ? 'Despacho'
                          : auth.value.userType === 'sindicato'
                            ? 'Sindicato'
                            : 'Usuario'}
                    </span>
                  </div>
                )}

                <Link
                  href="/profile"
                  class={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/profile')
                      ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`}
                  onClick$={() => (isMobileMenuOpen.value = false)}
                >
                  <div class="flex items-center">
                    <LuUser class="w-5 h-5 mr-3" />
                    <span>{auth.value.username || 'Perfil'}</span>
                  </div>
                </Link>
                
                {/* Logout Link */}
                <Link
                  href="/auth/logout"
                  class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
                  onClick$={() => {
                    isMobileMenuOpen.value = false;
                    isLoggingOut.value = true;
                  }}
                >
                  <div class="flex items-center">
                    {isLoggingOut.value ? (
                      <>
                        <div class="flex items-center justify-center">
                          <div class="w-4 h-4 mr-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 animate-pulse"></div>
                          <span>Cerrando sesión...</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <LuLogOut class="w-5 h-5 mr-3" />
                        <span>Cerrar sesión</span>
                      </>
                    )}
                  </div>
                </Link>
              </>
            ) : (
              /* Login Link */
              <Link
                href="/auth"
                class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
                onClick$={() => (isMobileMenuOpen.value = false)}
              >
                <div class="flex items-center">
                  <LuLogIn class="w-5 h-5 mr-3" />
                  <span>Iniciar sesión</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Main Content Area */}
      <main class="container mx-auto py-4 px-4 md:px-6">
        <div style={{viewTransitionName: 'main-content'}}>
          <Slot />
        </div>
      </main>
      
      {/* Footer */}
      <footer class="mt-auto py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="container mx-auto px-4 md:px-6">
          <div class="text-center text-gray-600 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} DAI-OFF. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
});