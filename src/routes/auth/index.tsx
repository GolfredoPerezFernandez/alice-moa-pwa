import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form } from '@builder.io/qwik-city';
import { hashPassword, verifyPassword, setCookies, clearAuthCookies, getUserId } from '~/utils/auth';
import { initAuthDatabase, checkDatabaseConnection } from '~/utils/init-db';
import { authOperations } from '~/utils/db-operations';
import { 
  LuArrowLeft, 
  LuUser, 
  LuLock, 
  LuMail,
  LuAlertCircle,
  LuCheckCircle,
  LuLoader,
  LuGraduationCap // Added for logo
} from '@qwikest/icons/lucide';

export const useLogout = routeAction$(async (data, requestEvent) => {
  try {
    console.log('[LOGOUT] Starting logout process');
    clearAuthCookies(requestEvent);
    requestEvent.redirect(302, '/auth');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Logout failed' };
  }
});

export const useCheckEmail = routeAction$(async (data, requestEvent) => {
  const { email } = data as { email: string };

  try {
    // Usar la función de db-operations para verificar el email
    return await authOperations.checkEmail(requestEvent, email);
  } catch (error) {
    console.error('Email check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to check email';
    return {
      success: false,
      error: errorMessage
    };
  }
});

// Removed useSchoolsList and useGradesList as they are no longer needed for TokenEstate

export const useRegister = routeAction$(async (data, requestEvent) => {
  const {
    email,
    password,
    fullName,
    userType: selectedUserType
  } = data as {
    email: string;
    password: string;
    fullName?: string;
    userType?: string;
  };

  try {
    const passwordHash = await hashPassword(password);
    const userType: 'trabajador' | 'despacho' | 'sindicato' = selectedUserType as 'trabajador' | 'despacho' | 'sindicato';

    // Usar la función de db-operations para registrar el usuario
    const result = await authOperations.registerUser(
      requestEvent,
      email,
      passwordHash,
      userType,
      fullName
    );

    if (!result.success) {
      return result;
    }

    // Si el registro fue exitoso, establecer cookies y redirigir
    const userIdString = String(result.userId);
    setCookies(requestEvent, userIdString, userType);
    requestEvent.redirect(302, '/chat');

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    return {
      success: false,
      error: errorMessage
    };
  }
});

export const useLogin = routeAction$(async (data, requestEvent) => {
  const { email, password } = data as { email: string; password: string };
  
  try {
    // Usar la función de db-operations para obtener el usuario por email
    const result = await authOperations.loginUser(requestEvent, email);
    
    if (!result.success) {
      return result;
    }
    
    const user = result.user;
    if (!user || typeof user.password_hash !== 'string' || !user.id) {
      return { success: false, error: 'Invalid user data' };
    }
    
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return { success: false, error: 'Invalid password' };
    }
    
    // Convert user.id to string to avoid type issues
    const userIdString = String(user.id);
    
    // Get user type from the database
    const userType = user.type as 'trabajador' | 'despacho' | 'sindicato';
    
    // Use the utility function to set cookies
    setCookies(requestEvent, userIdString, userType);
    
    requestEvent.redirect(302, '/chat');
  
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
});

// Initialize the database for authentication
export const useTableSetup = routeLoader$(async (requestEvent) => {
  console.log('[AUTH-SETUP] Starting database setup');
  
  try {
    // First check if we can connect to the database
    const connectionCheck = await checkDatabaseConnection(requestEvent);
    if (!connectionCheck.connected) {
      console.error('[AUTH-SETUP] Database connection failed:', connectionCheck.message);
      return {
        success: false,
        error: 'Database connection failed. Check your environment configuration.',
        details: connectionCheck.message
      };
    }
    
    // Initialize the auth tables
    const initResult = await initAuthDatabase(requestEvent);
    if (!initResult.success) {
      console.error('[AUTH-SETUP] Database initialization failed:', initResult.message);
      return {
        success: false,
        error: 'Failed to initialize authentication database.',
        details: initResult.message
      };
    }
    
    // Check if we already have a logged in user
    const user_id = getUserId(requestEvent);
    console.log(`[AUTH-SETUP] Current user ID: ${user_id || 'none'}`);
    
    console.log('[AUTH-SETUP] Database setup completed successfully');
    return {
      success: true,
      message: 'Database initialized successfully',
      user_id
    };
  } catch (error) {
    console.error('[AUTH-SETUP] Unexpected error during setup:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during setup',
      details: error instanceof Error ? error.message : String(error)
    };
  }
});

export default component$(() => {
  const tableSetup = useTableSetup();
  const checkEmailAction = useCheckEmail();
  const registerAction = useRegister();
  const loginAction = useLogin();
  // Removed schoolsData and gradesData hooks
  
  const step = useSignal<'email' | 'password' | 'register'>('email');
  const email = useSignal('');
  const password = useSignal('');
  const errorMessage = useSignal('');
  const isLoading = useSignal(false);
  const setupMessage = useSignal<string | null>(null);

  if (tableSetup.value?.success) {
    console.log('Tables initialized successfully');
    setupMessage.value = 'Database ready';
  } else if (tableSetup.value?.error) {
    console.error('Database setup error:', tableSetup.value.error);
    setupMessage.value = `Database Error: ${tableSetup.value.error}`;
    errorMessage.value = tableSetup.value.error;
  }

  return (
    // Use layout's background, this div is mainly for centering content
    <div class="min-h-screen w-full flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative elements - Inherited from layout, but can add more specific ones if needed */}
      {/* Example: Add small theme-colored dots */}
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Keep pulsing dots, update colors */}
        <div class="w-3 h-3 bg-red-400/50 dark:bg-red-300/40 rounded-full absolute top-[20%] left-[35%] animate-[pulse_4s_infinite]"></div>
        <div class="w-2 h-2 bg-red-400/50 dark:bg-red-300/40 rounded-full absolute top-[60%] left-[70%] animate-[pulse_5s_infinite]" style="animation-delay: 0.7s;"></div>
        {/* Removed redundant floating shapes defined in layout */}
        
    
      </div>
      {/* End of decorative elements */}

      {/* Logo/Branding */}
      <div class="absolute top-6 left-1/2 transform -translate-x-1/2">
        <div class="flex items-center">
          <div class="relative">
            {/* Updated Logo Icon - Teal/Green */}
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg">
               {/* Icon for DAI Off */}
               <LuUser class="w-6 h-6" />
            </div>
          </div>
          <div class="ml-2 flex flex-col">
            {/* Updated App Name and Tagline - Teal/Green */}
            <h1 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300">
              DAI Off
            </h1>
            <span class="text-xs text-red-700 dark:text-red-400">Tu Defensor Laboral Digital</span>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div class="max-w-md w-full z-10">
        <div class="bg-white dark:bg-gray-800/80 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm p-8 animate-[fade-in_0.5s_ease-out]">
          <div class="text-center mb-8">
            {/* Updated Header Gradient - Teal/Green */}
            <h2 class="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300">
              {step.value === 'email' ? 'Bienvenido de vuelta!' :
              step.value === 'password' ? 'Iniciar Sesión' :
              'Únete a DAI Off'}
            </h2>
            <p class="text-gray-600 dark:text-gray-300">
              {step.value === 'email' ? 'Enter your email to continue' :
              step.value === 'password' ? `Signing in as ${email.value}` :
              `Complete registration for ${email.value}`}
            </p>
          </div>

          {/* Email Step */}
          {step.value === 'email' && (
            <Form 
              action={checkEmailAction} 
              class="space-y-6"
              onSubmit$={() => {
                // Loading state is now set in the button's onClick handler
                // This ensures we show the loader immediately when clicked
                if (checkEmailAction.value?.success) {
                  step.value = checkEmailAction.value.isRegistered ? 'password' : 'register';
                  email.value = (document.getElementById('email') as HTMLInputElement).value;
                } else {
                  errorMessage.value = checkEmailAction.value?.error || 'Failed to check email';
                }
                isLoading.value = false;
              }}
            >
              <div class="space-y-2">
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LuMail class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    class="pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700"
                    placeholder="you@example.com"
                  />
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We'll check if you already have an account
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading.value}
                onClick$={() => {
                  // Set loading state immediately on button click
                  isLoading.value = true;
                  errorMessage.value = '';
                }}
                class="w-full flex justify-center items-center py-3 px-4 rounded-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading.value ? (
                  <span class="flex items-center">
                    <LuLoader class="animate-spin mr-2 h-5 w-5 text-white" />
                    Checking...
                  </span>
                ) : (
                  'Continue'
                )}
              </button>
            </Form>
          )}

          {/* Password Step (Login) */}
          {step.value === 'password' && (
            <Form 
              action={loginAction} 
              class="space-y-6"
              onSubmit$={() => {
                // Loading state is now set in the button's onClick handler
                // This ensures we show the loader immediately when clicked
                if (!loginAction.value?.success) {
                  errorMessage.value = loginAction.value?.error || 'Login failed';
                }
                isLoading.value = false;
              }}
            >
              <input type="hidden" name="email" value={email.value} />
              <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LuLock class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required
                    class="pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700"
                    placeholder="••••••••"
                  />
                </div>
                <div class="flex justify-end">
                  {/* TODO: Implement password reset - Updated link color */}
                  <a href="#" class="text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <button 
                  type="button"
                  onClick$={() => {
                    step.value = 'email';
                    password.value = '';
                    errorMessage.value = '';
                  }}
                  class="flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-sm"
                >
                  <LuArrowLeft class="mr-2 h-4 w-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading.value}
                  onClick$={() => {
                    // Set loading state immediately on button click
                    isLoading.value = true;
                    errorMessage.value = '';
                  }}
                  class="flex justify-center items-center py-2 px-6 rounded-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading.value ? (
                    <span class="flex items-center">
                      <LuLoader class="animate-spin mr-2 h-5 w-5 text-white" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </Form>
          )}

          {/* Register Step */}
          {step.value === 'register' && (
            <Form
              action={registerAction}
              class="space-y-6"
              onSubmit$={() => {
                // Loading state is now set in the button's onClick handler
                // This ensures we show the loader immediately when clicked
                // Check if registerAction.value exists before accessing properties
                const actionResult = registerAction.value;
                // Check if actionResult exists and has the expected properties
                if (actionResult && typeof actionResult === 'object' && 'success' in actionResult && !actionResult.success) {
                  errorMessage.value = (actionResult && 'error' in actionResult && actionResult.error) ? String(actionResult.error) : 'Registration failed';
                }
                isLoading.value = false;
              }}
            >
              <input type="hidden" name="email" value={email.value} />
              <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Create Password
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LuLock class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    class="pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700"
                    placeholder="Choose a strong password"
                    minLength={6}
                  />
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Password must be at least 6 characters
                </p>
              </div>

              {/* User Full Name */}
              <div class="space-y-2">
                <label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name (Optional)
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LuUser class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    class="pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              {/* User Type Selection */}
              <div class="space-y-2">
                <label for="userType" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de Usuario
                </label>
                <div class="relative">
                  <select
                    id="userType"
                    name="userType"
                    required
                    class="block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-red-600 dark:focus:ring-red-500 bg-white dark:bg-gray-700"
                  >
                    <option value="" disabled selected>Selecciona un tipo</option>
                    <option value="trabajador">Trabajador</option>
                    <option value="despacho">Despacho</option>
                    <option value="sindicato">Sindicato</option>
                  </select>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selecciona el tipo de usuario que mejor te describe
                </p>
              </div>

              <div class="flex justify-between items-center">
                <button 
                  type="button"
                  onClick$={() => {
                    step.value = 'email';
                    password.value = '';
                    errorMessage.value = '';
                  }}
                  class="flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-sm"
                >
                  <LuArrowLeft class="mr-2 h-4 w-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading.value}
                  onClick$={() => {
                    // Set loading state immediately on button click
                    isLoading.value = true;
                    errorMessage.value = '';
                  }}
                  class="flex justify-center items-center py-2 px-6 rounded-lg text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading.value ? (
                    <span class="flex items-center">
                      <LuLoader class="animate-spin mr-2 h-5 w-5 text-white" />
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </Form>
          )}

          {/* Error Message */}
          {errorMessage.value && (
            <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-[slide-up_0.3s_ease-out]">
              <div class="flex items-start">
                <LuAlertCircle class="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p class="text-sm text-red-600 dark:text-red-300 font-semibold">
                    {errorMessage.value}
                  </p>
                  {tableSetup.value?.details && (
                    <p class="text-xs text-red-500 dark:text-red-300 mt-1">
                      Details: {tableSetup.value.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success Message (example) */}
          {false && (
            <div class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-[slide-up_0.3s_ease-out]">
              <div class="flex items-start">
                <LuCheckCircle class="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                <p class="text-sm text-green-600 dark:text-green-300">
                  Success message would appear here
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {/* Updated Footer Links */}
          Al continuar, aceptas los
          <a href="/terms" class="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 ml-1">Términos de Servicio</a>
          <span class="mx-1">y</span>
          <a href="/privacy" class="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">Política de Privacidad</a>
          de DAI Off
        </div>
      </div>

      {/* Animations and styling */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(5px, -15px); }
          50% { transform: translate(10px, 0); }
          75% { transform: translate(5px, 15px); }
          100% { transform: translate(0, 0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px white inset !important;
          box-shadow: 0 0 0px 1000px white inset !important;
          border-color: #d1d5db !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
        
        .dark input:-webkit-autofill,
        .dark input:-webkit-autofill:hover,
        .dark input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #374151 inset !important; /* Use gray-700 */
          box-shadow: 0 0 0px 1000px #374151 inset !important; /* Use gray-700 */
          border-color: #4B5563 !important;
          -webkit-text-fill-color: #F3F4F6 !important;
        }
      `}</style>
    </div>
  );
});