import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import {
  LuBookOpen,      // For courses/learning
  LuGraduationCap, // For achievement/academy
  LuLanguages,     // For language focus
  LuUsers,         // For community
  LuArrowRight,
  LuMessageSquare, // For communication/chat
  LuSparkles,      // For features/benefits
  LuCalendarDays   // For events/schedule
} from '@qwikest/icons/lucide';

export default component$(() => {
  return (
    <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section class="relative py-16 lg:py-20 px-4 sm:px-6 overflow-hidden hero-section" style={{viewTransitionName: 'hero-section'}}>
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Updated Gradient */}
          <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-100/60 to-red-50/30 dark:from-red-900/30 dark:to-red-900/10"></div>
        </div>

        <div class="max-w-7xl mx-auto relative px-2 sm:px-4">
          {/* Fully responsive layout that works on all screen sizes */}
          <div class="flex flex-col sm:flex-row items-center gap-6 w-full">
            {/* DAI Off Avatar Idle Video - Responsive container */}
            <div class="w-full sm:w-auto max-w-xs mx-auto sm:mx-0 order-2 sm:order-1">
              <div class="rounded-lg overflow-hidden shadow-lg border-2 border-red-200 dark:border-red-800 aspect-[3/4] sm:aspect-auto bg-gray-100 dark:bg-gray-800" style={{viewTransitionName: 'avatar-video'}}>
                <video
                  autoplay
                  loop
                  muted
                  playsInline
                  class="w-full h-full object-cover object-center"
                  style={{ maxHeight: '280px' }}
                >
                  <source src="/prs_daioff.idle.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            
            {/* Text content - Consistent center alignment */}
            <div class="w-full sm:flex-1 text-center order-1 sm:order-2">
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                <span class="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300" style={{viewTransitionName: 'hero-title'}}>DAI Off</span>
                <span class="block mt-1">Tu Defensor Laboral Digital</span>
              </h1>
              <p class="mt-3 mt-4 mb-4 sm:mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed mx-auto max-w-lg">
                En Dai Off entendemos los retos del entorno laboral moderno. Nuestra plataforma brinda asesoramiento legal laboral personalizado y en tiempo real, proporcionando a los trabajadores la información necesaria para tomar decisiones estratégicas.
              </p>
              <div class="mt-5 sm:mt-8 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/about"
                  class="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-md hover:shadow-lg flex items-center text-sm sm:text-base"
                >
                  Quienes Somos
                  <LuArrowRight class="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href="/chat"
                  class="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-gray-700 font-medium transition-colors shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  Chat con DAI Off
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section class="py-12 px-4 sm:px-6 lg:py-16" style={{viewTransitionName: 'features-section'}}>
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Descubre Herramientas que Empoderan</h2>
            <p class="mt-4 text-xl text-gray-600 dark:text-gray-300">Protege tus derechos laborales con nuestra tecnología avanzada</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item" style={{viewTransitionName: 'feature-1'}}>
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <LuBookOpen class="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Asesoría Rápida</h3>
              <p class="text-gray-600 dark:text-gray-300">Obtén respuestas inmediatas a tus consultas laborales con nuestra plataforma de IA.</p>
            </div>
            {/* Feature 2 */}
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item" style={{viewTransitionName: 'feature-2'}}>
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <LuMessageSquare class="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Asesoría Personalizada</h3>
              <p class="text-gray-600 dark:text-gray-300">Soluciones adaptadas a tus necesidades específicas y situación laboral única.</p>
            </div>
            {/* Feature 3 */}
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item" style={{viewTransitionName: 'feature-3'}}>
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <LuSparkles class="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Asesoría Legal</h3>
              <p class="text-gray-600 dark:text-gray-300">Consulta sin límites sobre normativa laboral, estatutos y convenios colectivos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section class="py-12 px-4 sm:px-6 lg:py-16 bg-gray-100 dark:bg-gray-950" style={{viewTransitionName: 'why-section'}}>
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">¿Por qué deberías elegirnos?</h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item" style={{viewTransitionName: 'reason-1'}}>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Experiencia Confirmada</h3>
              <p class="text-gray-600 dark:text-gray-300">Contamos con inteligencia artificial especializada en legislación laboral, estatuto de trabajadores, ley de seguridad social, ley tributaria y convenios colectivos por sector.</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item" style={{viewTransitionName: 'reason-2'}}>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Compromiso con la Claridad</h3>
              <p class="text-gray-600 dark:text-gray-300">Garantizamos transparencia total en cada paso del proceso para asegurar que recibas orientación sin ninguna sorpresa.</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 card-item" style={{viewTransitionName: 'reason-3'}}>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Asesoría Personalizada</h3>
              <p class="text-gray-600 dark:text-gray-300">Nuestras respuestas se adaptan a las necesidades específicas de tu empresa, tomando en cuenta las regulaciones locales y sectoriales.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section class="py-12 px-4 sm:px-6 lg:py-16 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-800 dark:to-red-900" style={{viewTransitionName: 'cta-section'}}>
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-white">¿Listo para proteger tus derechos laborales?</h2>
          <p class="mt-4 text-xl text-red-100 dark:text-red-200">
            Regístrate hoy y da el primer paso hacia una asesoría laboral personalizada.
          </p>
          <div class="mt-8">
            <Link
              href="/auth" // Link to auth/signup page
              class="px-8 py-3 rounded-lg bg-white text-red-600 font-medium transition-colors shadow-lg hover:bg-red-50"
            >
              Registrarse Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="py-8 px-4 sm:px-6 bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div class="max-w-7xl mx-auto text-center text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Reclamaciones Tech Ai Solution SL. Todos los derechos reservados. |
          <Link href="/terms" class="hover:text-red-600 dark:hover:text-red-400 ml-2">Términos</Link> |
          <Link href="/privacy" class="hover:text-red-600 dark:hover:text-red-400 ml-2">Privacidad</Link>
        </div>
      </footer>
    </div>
  );
});

export const head: DocumentHead = {
  title: "DAI Off - Tu Defensor Laboral Digital", // Updated Title
  meta: [
    {
      name: "description",
      content: "DAI Off brinda asesoramiento legal laboral personalizado y en tiempo real, proporcionando a los trabajadores la información necesaria para tomar decisiones estratégicas.", // Updated Description
    },
  ],
};
