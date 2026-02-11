import { component$, useSignal, useVisibleTask$, useStyles$ } from '@builder.io/qwik';
import { server$, routeLoader$, routeAction$, Form } from '@builder.io/qwik-city';
import { Resend } from 'resend';
import { hashPassword, verifyPassword, setCookies, clearAuthCookies, getUserId } from '~/utils/auth';
import { tursoClient } from '~/utils/turso';
import { initAuthDatabase, checkDatabaseConnection } from '~/utils/init-db';
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

const generateResetToken = () => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

const hashToken = async (token: string) => {
  const data = new TextEncoder().encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer), (b) =>
    b.toString(16).padStart(2, '0')
  ).join('')
}

export const sendPasswordResetEmail = server$(async function (email: string) {
  const resendApiKey = this.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    throw new Error('Resend API key not configured')
  }

  const client = tursoClient(this)

  const userResult = await client.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [email]
  })
  const user = userResult.rows[0]
  if (!user?.id) {
    console.log('[RESET] Email not found, returning success to avoid enumeration')
    return { success: true }
  }

  const resend = new Resend(resendApiKey)
  // Normalize origin to avoid double slashes in the link
  const origin = (this.env.get('PUBLIC_APP_URL') || this.url.origin).replace(/\/+$/, '')
  const senderEmail = this.env.get('SENDER_EMAIL') || 'onboarding@resend.dev'

  const resetToken = generateResetToken()
  const tokenHash = await hashToken(resetToken)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  await client.execute({
    sql: 'DELETE FROM password_reset_tokens WHERE user_id = ?',
    args: [user.id]
  })

  await client.execute({
    sql: 'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    args: [user.id, tokenHash, expiresAt]
  })

  const resetUrl = `${origin}/auth/reset-password?token=${resetToken}`

  const { data, error } = await resend.emails.send({
    from: senderEmail,
    to: email,
    subject: 'Recupera tu contrasena',
    html: `<p>Haz clic en el siguiente enlace para restablecer tu contrasena (valido por 1 hora):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  })

  if (error) {
    console.error('Resend error:', error)
    throw new Error(error.message)
  }

  return { success: true, id: data?.id }
})

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
  const client = tursoClient(requestEvent);
  const { email } = data as { email: string };

  try {
    const result = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email]
    });

    return {
      success: true,
      isRegistered: result.rows.length > 0
    };
  } catch (error) { // Keep only one catch block
    console.error('Email check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to check email';
    return {
      success: false,
      error: errorMessage
    };
  } // End of try...catch for useCheckEmail
});

// Removed useSchoolsList and useGradesList as they are no longer needed for TokenEstate

export const useRegister = routeAction$(async (data, requestEvent) => {
  const client = tursoClient(requestEvent);
  const {
    email,
    password,
    fullName // Changed from studentName
    // Removed schoolId, gradeId
  } = data as {
    email: string;
    password: string;
    fullName?: string; // Added fullName for general user registration
  };

  try {
    const passwordHash = await hashPassword(password);
    // First registration is admin, others are normal users
    const firstUserCheck = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM users',
      args: []
    });

    const isFirstUser = firstUserCheck.rows.length > 0 && firstUserCheck.rows[0].count === 0;
    // Assign userType here, inside the try block after checking isFirstUser
    // Declare variables at the start of the try block
    let userId: number | bigint | undefined;
    let userType: 'admin' | 'normal';

    userType = isFirstUser ? 'admin' : 'normal'; // Assign userType here

    // Use executeQuery directly for transaction operations to handle them properly
    // We'll store user ID from the result
    // Removed duplicate declarations

    // First create the user without a transaction for the first part
    // Insert user with name if provided
    const sql = fullName
      ? 'INSERT INTO users (email, password_hash, type, name) VALUES (?, ?, ?, ?)'
      : 'INSERT INTO users (email, password_hash, type) VALUES (?, ?, ?)';
    const args = fullName ? [email, passwordHash, userType, fullName.trim()] : [email, passwordHash, userType];

    const result = await client.execute({ sql, args });
    // Removed extra closing parenthesis

    // Convert the ID to string safely
    userId = result.lastInsertRowid; // Assign userId after client.execute
    if (!userId) {
      throw new Error("Registration failed: userId is undefined");
    }

    // Removed student record creation logic

    // Use the utility function to set cookies
    // Ensure userId is treated as string/number compatible with setCookies if needed
    const userIdString = String(userId);
    setCookies(requestEvent, userIdString, userType); // Use userIdString

    // Redirect logic - Admin might go to an admin panel, others to marketplace or profile
    // Redirect logic - Admin might go to an admin panel, others to marketplace or profile
    if (userType === 'admin') {
      // TODO: Create an admin route if needed, for now redirect to home
      requestEvent.redirect(302, '/');
    } else {
      requestEvent.redirect(302, '/chat'); // Redirect normal users to the chat
    }
    return { success: true };
  } catch (error) { // Correct catch block for useRegister
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    return {
      success: false,
      error: errorMessage
    };
  }
}); // End of routeAction

export const useLogin = routeAction$(async (data, requestEvent) => {
  const client = tursoClient(requestEvent);
  const { email, password } = data as { email: string; password: string };

  try {
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });

    const user = result.rows[0];
    if (!user || typeof user.password_hash !== 'string' || !user.id) {
      return { success: false, error: 'Invalid user data' };
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return { success: false, error: 'Invalid password' };
    }

    // Convert user.id to string to avoid type issues
    const userIdString = String(user.id);

    await client.execute({
      sql: 'UPDATE users SET session_expires = ? WHERE id = ?',
      args: [new Date(Date.now() + 60 * 60 * 1000), userIdString]
    });

    // Get user type with proper type casting
    const userType = (user.type === 'admin')
      ? 'admin'
      : (user.type === 'coordinator')
        ? 'coordinator'
        : 'normal';

    // Use the utility function to set cookies
    setCookies(requestEvent, userIdString, userType);

    // Redirect after login - Admin to home (or future admin panel), others to marketplace
    if (userType === 'admin') {
      requestEvent.redirect(302, '/'); // Or '/admin' if created
    } else {
      requestEvent.redirect(302, '/chat'); // Redirect normal users to the chat
    }
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
  // Recuperación de contraseña
  const recoveryStep = useSignal(false);
  const recoveryEmail = useSignal('');
  const recoveryStatus = useSignal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const recoveryError = useSignal('');
  // ...existing code...
  const step = useSignal<'email' | 'password' | 'register'>('email');
  const email = useSignal('');
  const password = useSignal('');
  const errorMessage = useSignal('');
  const setupMessage = useSignal<string | null>(null);

  // Handle Email Check
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const result = track(() => checkEmailAction.value);
    if (result?.success) {
      step.value = result.isRegistered ? 'password' : 'register';
      errorMessage.value = '';
    } else if (result?.success === false) {
      errorMessage.value = result.error || 'Failed to check email';
    }
  });

  // Handle Login Error
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const result = track(() => loginAction.value);
    if (result?.success === false) {
      errorMessage.value = result.error || 'Login failed';
    }
  });

  // Handle Register Error
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const result = track(() => registerAction.value);
    if (result?.success === false) {
      errorMessage.value = result.error || 'Registration failed';
    }
  });

  // Handle Database Setup Messages
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const result = track(() => tableSetup.value);
    if (result?.success) {
      console.log('Tables initialized successfully');
      setupMessage.value = 'Database ready';
    } else if (result?.error) {
      console.error('Database setup error:', result.error);
      setupMessage.value = `Database Error: ${result.error}`;
      errorMessage.value = result.error;
    }
  });

  useStyles$(`
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
  `);

  return (
    // Use layout's background, this div is mainly for centering content
    <div class="min-h-screen w-full flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative elements - Inherited from layout, but can add more specific ones if needed */}
      {/* Example: Add small theme-colored dots */}
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Keep pulsing dots, update colors */}
        <div class="w-3 h-3 bg-teal-400/50 dark:bg-teal-300/40 rounded-full absolute top-[20%] left-[35%] animate-[pulse_4s_infinite]"></div>
        <div class="w-2 h-2 bg-green-400/50 dark:bg-green-300/40 rounded-full absolute top-[60%] left-[70%] animate-[pulse_5s_infinite]" style="animation-delay: 0.7s;"></div>
        {/* Removed redundant floating shapes defined in layout */}

        {/* Show setup message if any */}
        {setupMessage.value && (
          <div class="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 text-blue-800 rounded-md px-4 py-2 text-sm max-w-xs text-center z-50">
            {setupMessage.value}
          </div>
        )}
      </div>
      {/* End of decorative elements */}

      {/* Logo/Branding */}
      <div class="absolute top-6 left-1/2 transform -translate-x-1/2">
        <div class="flex items-center">
          <div class="relative">
            {/* Updated Logo Icon - Teal/Green */}
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center text-white shadow-lg">
              {/* Using LuGraduationCap consistent with layout */}
              <LuGraduationCap class="w-6 h-6" />
            </div>
          </div>
          <div class="ml-2 flex flex-col">
            {/* Updated App Name and Tagline - Teal/Green */}
            <h1 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-400 dark:to-green-400">
              Move On Academy
            </h1>
            <span class="text-xs text-teal-700 dark:text-teal-400">Language Learning Platform</span>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div class="max-w-md w-full z-10">
        <div class="bg-white dark:bg-gray-800/80 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm p-8 animate-[fade-in_0.5s_ease-out]">
          <div class="text-center mb-8">
            {/* Updated Header Gradient - Teal/Green */}
            <h2 class="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-400 dark:to-green-400">
              {step.value === 'email' ? 'Welcome Back!' :
                step.value === 'password' ? 'Sign In' :
                  'Join Move On Academy'}
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
                    value={email.value}
                    onInput$={(e) => email.value = (e.target as HTMLInputElement).value}
                    class="pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500 bg-white dark:bg-gray-700"
                    placeholder="you@example.com"
                  />
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We'll check if you already have an account
                </p>
              </div>

              <button
                type="submit"
                disabled={checkEmailAction.isRunning}
                class="w-full flex justify-center items-center py-3 px-4 rounded-lg text-white bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed" // Updated button gradient
              >
                {checkEmailAction.isRunning ? (
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
          {step.value === 'password' && !recoveryStep.value && (
            <Form
              action={loginAction}
              class="space-y-6"
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
                    class="pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500 bg-white dark:bg-gray-700"
                    placeholder="••••••••"
                  />
                </div>
                <div class="flex justify-end">
                  <button type="button" class="text-sm text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 underline" onClick$={() => { recoveryStep.value = true; }}>
                    Forgot password?
                  </button>
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
                  disabled={loginAction.isRunning}
                  class="flex justify-center items-center py-2 px-6 rounded-lg text-white bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed" // Updated button gradient
                >
                  {loginAction.isRunning ? (
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

          {/* Password Recovery Step */}
          {recoveryStep.value && (
            <form class="space-y-6" preventdefault:submit onSubmit$={async (e) => {
              e.preventDefault();
              recoveryStatus.value = 'sending';
              recoveryError.value = '';
              try {
                const email = recoveryEmail.value.trim();
                if (!email) {
                  recoveryError.value = 'Ingresa tu email.';
                  recoveryStatus.value = 'idle';
                  return;
                }
                // Llama a la función server$
                const { sendPasswordResetEmail } = await import('./index');
                await sendPasswordResetEmail(email);
                recoveryStatus.value = 'sent';
              } catch (err: any) {
                recoveryError.value = err?.message || 'No se pudo enviar el email.';
                recoveryStatus.value = 'error';
              }
            }}>
              <div class="space-y-2">
                <label htmlFor="recoveryEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ingresa tu email para recuperar tu contraseña
                </label>
                <input
                  id="recoveryEmail"
                  type="email"
                  required
                  value={recoveryEmail.value}
                  onInput$={(e) => recoveryEmail.value = (e.target as HTMLInputElement).value}
                  class="block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500 bg-white dark:bg-gray-700"
                  placeholder="you@example.com"
                />
              </div>
              <div class="flex justify-between items-center">
                <button type="button" onClick$={() => { recoveryStep.value = false; recoveryStatus.value = 'idle'; recoveryError.value = ''; }} class="flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-sm">
                  <LuArrowLeft class="mr-2 h-4 w-4" /> Volver
                </button>
                <button type="submit" disabled={recoveryStatus.value === 'sending'} class="flex justify-center items-center py-2 px-6 rounded-lg text-white bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
                  {recoveryStatus.value === 'sending' ? (
                    <span class="flex items-center">
                      <LuLoader class="animate-spin mr-2 h-5 w-5 text-white" />
                      Enviando...
                    </span>
                  ) : (
                    'Enviar recuperación'
                  )}
                </button>
              </div>
              {recoveryError.value && (
                <div class="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {recoveryError.value}
                </div>
              )}
              {recoveryStatus.value === 'sent' && (
                <div class="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                  ¡Email enviado! Revisa tu bandeja de entrada.
                </div>
              )}
            </form>
          )}

          {/* Register Step */}
          {step.value === 'register' && (
            <Form
              action={registerAction}
              class="space-y-6"
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
                    class="pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500 bg-white dark:bg-gray-700"
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
                    class="pl-10 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-teal-600 dark:focus:ring-teal-500 bg-white dark:bg-gray-700"
                    placeholder="Your Name"
                  />
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
                  disabled={registerAction.isRunning}
                  class="flex justify-center items-center py-2 px-6 rounded-lg text-white bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed" // Updated button gradient
                >
                  {registerAction.isRunning ? (
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
          By continuing, you agree to the Move On Academy
          <a href="/terms" class="text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 ml-1">Terms of Service</a>
          <span class="mx-1">and</span>
          <a href="/privacy" class="text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">Privacy Policy</a>
        </div>
      </div>

      {/* Animations and styling */}
    </div>
  );
});
