import { component$, useVisibleTask$, useSignal, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import {
  LuBookOpen,
  LuGraduationCap,
  LuClipboardList,
  LuUsers,
  LuArrowRight,
  LuMessageSquare,
  LuSparkles,
  LuCalendarDays,
  LuClock,
  LuFileText,
  LuShield,
  LuScale,
  LuUserCheck,
  LuBriefcase,
  LuHeartPulse,
  LuFileSignature,
  LuCheckSquare,
  LuBell,
  LuChevronDown,
  LuChevronRight,
  LuBuilding,
  LuUserPlus
} from '@qwikest/icons/lucide';

export default component$(() => {
  const isIntersecting = useSignal<Record<string, boolean>>({});
  const activeTab = useSignal<string>("trabajador");
  const isExpanded = useSignal<Record<string, boolean>>({});

  const toggleFaq = $((id: string) => {
    isExpanded.value = {
      ...isExpanded.value,
      [id]: !isExpanded.value[id]
    };
  });

  useVisibleTask$(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting.value = {
            ...isIntersecting.value,
            [entry.target.id]: entry.isIntersecting
          };
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  });

  return (
    <div class="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section class="relative py-20 overflow-hidden bg-gradient-to-br from-red-50 to-gray-50 dark:from-gray-900 dark:to-gray-800" style={{viewTransitionName: 'hero-section'}}>
        <div class="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
        <div class="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-red-500/10 to-transparent"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full filter blur-3xl"></div>
        
        <div class="container mx-auto px-4 sm:px-6 relative">
          <div class="flex flex-col lg:flex-row items-center gap-12">
            {/* Hero Content */}
            <div class="w-full lg:w-1/2 text-center lg:text-left animate-on-scroll"
                 id="hero-content"
                 style={{
                   opacity: isIntersecting.value["hero-content"] ? 1 : 0,
                   transform: isIntersecting.value["hero-content"] ? "translateY(0)" : "translateY(50px)",
                   transition: "all 0.9s ease-out"
                 }}>
              <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
                <span class="inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300" 
                     style={{viewTransitionName: 'hero-title'}}>
                  DAI Off
                </span>
                <span class="block mt-2">Tu Defensor Laboral Digital</span>
              </h1>
              <p class="mt-6 text-xl leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
                Plataforma integral para la gestión laboral que conecta a <span class="text-red-600 dark:text-red-400 font-medium">trabajadores</span>, 
                <span class="text-red-600 dark:text-red-400 font-medium"> sindicatos</span> y <span class="text-red-600 dark:text-red-400 font-medium">despachos legales</span> 
                con herramientas digitales especializadas.
              </p>
              <div class="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth"
                  class="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all shadow-md hover:shadow-lg hover:translate-y-[-2px] flex items-center"
                >
                  Comenzar Ahora
                  <LuArrowRight class="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/about"
                  class="px-6 py-3 rounded-lg bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-gray-700 font-medium transition-all shadow-sm hover:shadow-md hover:translate-y-[-2px]"
                >
                  Conocer Más
                </Link>
              </div>
            </div>
            
            {/* Hero Animation */}
            <div class="w-full lg:w-1/2 animate-on-scroll"
                id="hero-animation"
                style={{
                  opacity: isIntersecting.value["hero-animation"] ? 1 : 0,
                  transform: isIntersecting.value["hero-animation"] ? "translateY(0)" : "translateY(50px)",
                  transition: "all 0.9s ease-out 0.3s"
                }}>
              <div class="relative mb-12 mx-auto max-w-md">
                <div class="absolute -inset-1 bg-gradient-to-r from-red-500 to-red-600 rounded-xl blur-md opacity-50 animate-pulse"></div>
                <div class="relative rounded-lg overflow-hidden shadow-2xl border-2 border-red-200 dark:border-red-800 bg-gray-100 dark:bg-gray-800 aspect-[4/3]"
                     style={{viewTransitionName: 'avatar-video'}}>
                  <video
                    autoplay
                    loop
                    muted
                    playsInline
                    class="w-full h-full object-cover object-center"
                  >
                    <source src="/prs_daioff.idle.mp4" type="video/mp4" />
                    Tu navegador no soporta videos.
                  </video>
                  
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div class="p-6 text-white">
                      <p class="font-bold text-xl mb-2">Asistente IA DAI Off</p>
                      <p class="text-sm opacity-90">Tu asesor laboral personalizado, disponible 24/7</p>
                    </div>
                  </div>
                </div>
            
              </div>
            </div>
          </div>
          
          {/* Floating Stats */}
          <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-on-scroll"
               id="stats-section"
               style={{
                 opacity: isIntersecting.value["stats-section"] ? 1 : 0,
                 transform: isIntersecting.value["stats-section"] ? "translateY(0)" : "translateY(50px)",
                 transition: "all 0.9s ease-out 0.6s"
               }}>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform">
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <LuUserCheck class="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">+10,000</h3>
              <p class="text-gray-600 dark:text-gray-300">Trabajadores protegidos</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform">
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <LuBuilding class="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">50+</h3>
              <p class="text-gray-600 dark:text-gray-300">Despachos legales</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform">
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <LuUserPlus class="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">25+</h3>
              <p class="text-gray-600 dark:text-gray-300">Sindicatos asociados</p>
            </div>
          </div>
        </div>
        
      </section>

      {/* User Types Tabs Section */}
      <section class="py-20 px-4 sm:px-6 relative animate-on-scroll" id="user-types"
               style={{
                 opacity: isIntersecting.value["user-types"] ? 1 : 0,
                 transform: isIntersecting.value["user-types"] ? "translateY(0)" : "translateY(50px)",
                 transition: "all 0.9s ease-out"
               }}>
        <div class="container mx-auto">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Soluciones Específicas para Cada <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300">Tipo de Usuario</span>
            </h2>
            <p class="text-xl text-gray-600 dark:text-gray-300">
              DAI Off ofrece herramientas y funciones diseñadas específicamente para cada rol en el entorno laboral.
            </p>
          </div>
          
          {/* Tabs Navigation */}
          <div class="flex flex-wrap justify-center gap-4 mb-12">
            <button 
              onClick$={() => activeTab.value = "trabajador"}
              class={`px-6 py-3 rounded-lg font-medium text-lg transition-all ${
                activeTab.value === "trabajador" 
                  ? "bg-red-600 text-white shadow-lg" 
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700"
              }`}
            >
              <div class="flex items-center">
                <LuUserCheck class="w-5 h-5 mr-2" />
                <span>Trabajadores</span>
              </div>
            </button>
            <button 
              onClick$={() => activeTab.value = "sindicato"}
              class={`px-6 py-3 rounded-lg font-medium text-lg transition-all ${
                activeTab.value === "sindicato" 
                  ? "bg-red-600 text-white shadow-lg" 
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700"
              }`}
            >
              <div class="flex items-center">
                <LuUsers class="w-5 h-5 mr-2" />
                <span>Sindicatos</span>
              </div>
            </button>
            <button 
              onClick$={() => activeTab.value = "despacho"}
              class={`px-6 py-3 rounded-lg font-medium text-lg transition-all ${
                activeTab.value === "despacho" 
                  ? "bg-red-600 text-white shadow-lg" 
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700"
              }`}
            >
              <div class="flex items-center">
                <LuBriefcase class="w-5 h-5 mr-2" />
                <span>Despachos</span>
              </div>
            </button>
          </div>
          
          {/* Tabs Content */}
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-500">
            {/* Trabajadores Tab */}
            <div class={`${activeTab.value === "trabajador" ? "block" : "hidden"}`}>
              <div class="grid md:grid-cols-2 gap-0">
                <div class="p-8 md:p-12 flex flex-col justify-center">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                    <LuUserCheck class="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Para Trabajadores</h3>
                  <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Herramientas intuitivas para gestionar tu vida laboral, proteger tus derechos y facilitar tu día a día.
                  </p>
                  <div class="grid gap-4">
                    <div class="flex items-start">
                      <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4">
                        <LuCalendarDays class="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Gestión de Ausencias</h4>
                        <p class="text-gray-600 dark:text-gray-300">Registra y administra tus ausencias laborales por enfermedad, vacaciones o asuntos personales.</p>
                      </div>
                    </div>
                    <div class="flex items-start">
                      <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4">
                        <LuClock class="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Sistema de Fichaje</h4>
                        <p class="text-gray-600 dark:text-gray-300">Controla tus horas de trabajo con geolocalización integrada y reportes detallados.</p>
                      </div>
                    </div>
                    <div class="flex items-start">
                      <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4">
                        <LuMessageSquare class="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Asistente IA</h4>
                        <p class="text-gray-600 dark:text-gray-300">Consulta sobre tus derechos laborales y obtén asesoramiento personalizado.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-red-50 dark:bg-gray-900/50 p-8 md:p-0 flex items-center justify-center">
                  <div class="relative max-w-md mx-auto">
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-tr from-red-500/20 to-red-600/20 blur-xl transform -rotate-6 scale-105"></div>
                    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                      <div class="p-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                      <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                          <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                              <LuCalendarDays class="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h4 class="text-lg font-bold text-gray-900 dark:text-white">Sistema de Ausencias</h4>
                          </div>
                          <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300">Activo</span>
                        </div>
                        
                        <div class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
                          <div class="p-3 bg-gray-50 dark:bg-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            <div class="flex items-center justify-between">
                              <span>Mayo 2025</span>
                              <div class="flex space-x-1">
                                <button class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>
                                <button class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div class="grid grid-cols-7 text-center text-xs">
                            <div class="py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">L</div>
                            <div class="py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">M</div>
                            <div class="py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">X</div>
                            <div class="py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">J</div>
                            <div class="py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">V</div>
                            <div class="py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">S</div>
                            <div class="py-2 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">D</div>
                            
                            {/* Días del calendario - Ejemplo simplificado */}
                            {[...Array(31)].map((_, i) => (
                              <div key={i} class={`py-2 text-sm ${
                                i === 3 || i === 4 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 
                                i === 15 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 
                                'text-gray-700 dark:text-gray-300'
                              }`}>
                                {i + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div class="flex justify-between mt-4">
                          <div class="flex items-center text-xs font-medium">
                            <span class="w-3 h-3 rounded-full bg-blue-200 dark:bg-blue-900/70 mr-1"></span>
                            <span class="text-gray-600 dark:text-gray-400">Vacaciones</span>
                          </div>
                          <div class="flex items-center text-xs font-medium">
                            <span class="w-3 h-3 rounded-full bg-red-200 dark:bg-red-900/70 mr-1"></span>
                            <span class="text-gray-600 dark:text-gray-400">Enfermedad</span>
                          </div>
                          <div class="flex items-center text-xs font-medium">
                            <span class="w-3 h-3 rounded-full bg-purple-200 dark:bg-purple-900/70 mr-1"></span>
                            <span class="text-gray-600 dark:text-gray-400">Personal</span>
                          </div>
                        </div>
                        
                        <button class="mt-6 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          <span>Registrar ausencia</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sindicatos Tab */}
            <div class={`${activeTab.value === "sindicato" ? "block" : "hidden"}`}>
              <div class="grid md:grid-cols-2 gap-0">
                <div class="p-8 md:p-12 flex flex-col justify-center">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                    <LuUsers class="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Para Sindicatos</h3>
                  <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Herramientas especializadas para sindicatos que facilitan la gestión, educación y defensa de los derechos de los trabajadores.
                  </p>
                  <div class="grid gap-4">
                    <div class="flex items-start">
                      <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4">
                        <LuGraduationCap class="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Gestión de Capacitaciones</h4>
                        <p class="text-gray-600 dark:text-gray-300">Crea y administra programas de formación en derechos laborales para tus afiliados.</p>
                      </div>
                    </div>
                    <div class="flex items-start">
                      <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4">
                        <LuFileText class="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Documentos Legales</h4>
                        <p class="text-gray-600 dark:text-gray-300">Genera documentos sindicales, convenios colectivos y gestiona conflictos laborales con tecnología blockchain para garantizar su autenticidad.</p>
                      </div>
                    </div>
                    <div class="flex items-start">
                      <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4">
                        <LuClipboardList class="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Auditoría y Seguimiento</h4>
                        <p class="text-gray-600 dark:text-gray-300">Supervisa el cumplimiento de acuerdos, mantén registros detallados de casos y genera informes automáticos de seguimiento con alertas personalizables.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-red-50 dark:bg-gray-900/50 p-8 md:p-0 flex items-center justify-center">
                  <div class="relative max-w-md mx-auto">
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-tr from-red-500/20 to-red-600/20 blur-xl transform -rotate-6 scale-105"></div>
                    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                      <div class="p-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                      <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                          <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                              <LuGraduationCap class="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h4 class="text-lg font-bold text-gray-900 dark:text-white">Plataforma de Capacitación</h4>
                          </div>
                          <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300">3 Nuevos</span>
                        </div>
                        
                        <div class="space-y-4">
                          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div class="p-4">
                              <div class="flex items-start">
                                <div class="w-14 h-14 min-w-[3.5rem] flex-shrink-0 mr-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <span class="text-2xl">⚖️</span>
                                </div>
                                <div class="flex-1">
                                  <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-1">Derechos Laborales Básicos</h4>
                                  <p class="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                                    Fundamentos legales para todos los trabajadores.
                                  </p>
                                  <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <span class="flex items-center mr-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 mr-1">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                      </svg>
                                      3 horas
                                    </span>
                                    <span class="flex items-center">
                                      <LuUserCheck class="w-3 h-3 mr-1" />
                                      120 inscritos
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div class="p-4">
                              <div class="flex items-start">
                                <div class="w-14 h-14 min-w-[3.5rem] flex-shrink-0 mr-4 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                  <span class="text-2xl">🚫</span>
                                </div>
                                <div class="flex-1">
                                  <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-1">Prevención de Acoso Laboral</h4>
                                  <p class="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                                    Protocolo y actuación frente al acoso.
                                  </p>
                                  <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <span class="flex items-center mr-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 mr-1">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                      </svg>
                                      2 horas
                                    </span>
                                    <span class="flex items-center">
                                      <LuUserCheck class="w-3 h-3 mr-1" />
                                      85 inscritos
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <button class="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>Crear nuevo curso</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Despachos Tab */}
            <div class={`${activeTab.value === "despacho" ? "block" : "hidden"}`}>
              <div class="grid md:grid-cols-2 gap-0">
                <div class="p-8 md:p-12 flex flex-col justify-center">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                    <LuBriefcase class="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Para Despachos Legales</h3>
                  <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Herramientas especializadas para abogados laboralistas que facilitan la gestión de casos y la creación de documentos legales.
                  </p>
                  <div class="grid gap-4">
                    <div class="flex items-start">
                      <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4">
                        <LuFileSignature class="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Documentos Legales</h4>
                        <p class="text-gray-600 dark:text-gray-300">Genera contratos, cartas de despido, demandas y reclamaciones con asistencia de IA. Almacenamiento seguro con validación blockchain y firma digital incorporada.</p>
                      </div>
                    </div>
                    <div class="flex items-start">
                      <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4">
                        <LuGraduationCap class="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Capacitación Legal</h4>
                        <p class="text-gray-600 dark:text-gray-300">Crea cursos y recursos legales multimedia para clientes y empresas con herramientas interactivas, evaluaciones automáticas y certificaciones descargables.</p>
                      </div>
                    </div>
                    <div class="flex items-start">
                      <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4">
                        <LuClipboardList class="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Auditoría y Seguimiento</h4>
                        <p class="text-gray-600 dark:text-gray-300">Gestiona casos, documentos y seguimiento de expedientes legales con cronogramas automáticos, recordatorios de plazos y sincronización con calendarios externos.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-red-50 dark:bg-gray-900/50 p-8 md:p-0 flex items-center justify-center">
                  <div class="relative max-w-md mx-auto">
                    <div class="absolute inset-0 rounded-xl bg-gradient-to-tr from-red-500/20 to-red-600/20 blur-xl transform -rotate-6 scale-105"></div>
                    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                      <div class="p-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                      <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                          <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                              <LuFileText class="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h4 class="text-lg font-bold text-gray-900 dark:text-white">Generador de Documentos</h4>
                          </div>
                        </div>
                        
                        <div class="space-y-4">
                          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h5 class="font-medium text-gray-900 dark:text-white mb-3">Seleccione tipo de documento:</h5>
                            <div class="grid grid-cols-2 gap-2">
                              <div class="border border-gray-200 dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                                <div class="flex items-center">
                                  <LuFileSignature class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                                  <span class="text-sm font-medium">Contratos</span>
                                </div>
                              </div>
                              <div class="border border-gray-200 dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                                <div class="flex items-center">
                                  <LuFileText class="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                                  <span class="text-sm font-medium">Despidos</span>
                                </div>
                              </div>
                              <div class="border border-gray-200 dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                                <div class="flex items-center">
                                  <LuScale class="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                                  <span class="text-sm font-medium">Demandas</span>
                                </div>
                              </div>
                              <div class="border border-gray-200 dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                                <div class="flex items-center">
                                  <LuFileText class="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                                  <span class="text-sm font-medium">Reclamaciones</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                            <h5 class="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                              <LuMessageSquare class="w-4 h-4 mr-1" />
                              Asistente IA
                            </h5>
                            <p class="text-sm text-blue-700 dark:text-blue-300/80">
                              ¿Necesita ayuda? El asistente IA puede guiarle en la creación de documentos personalizados.
                            </p>
                            <button class="mt-3 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors">
                              Iniciar asistente
                            </button>
                          </div>
                          
                          <div class="flex space-x-2">
                            <button class="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center font-medium">
                              <LuFileText class="w-4 h-4 mr-2" />
                              <span>Crear documento</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades Específicas Section */}
      <section class="py-20 px-4 sm:px-6 bg-white dark:bg-gray-800">
        <div class="container mx-auto animate-on-scroll" id="specific-features-section"
             style={{
               opacity: isIntersecting.value["specific-features-section"] ? 1 : 0,
               transform: isIntersecting.value["specific-features-section"] ? "translateY(0)" : "translateY(50px)",
               transition: "all 0.9s ease-out"
             }}>
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Funcionalidades <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300">Específicas</span>
            </h2>
            <p class="text-xl text-gray-600 dark:text-gray-300">
              Herramientas avanzadas para cada tipo de usuario que optimizan la gestión laboral
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Documentos Legales */}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden
              transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
              <div class="h-3 bg-blue-500"></div>
              <div class="p-8">
                <div class="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
                  <LuFileSignature class="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Documentos Legales</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-6">
                  Genera, gestiona y almacena documentos legales con asistencia de IA adaptados a tu situación específica.
                </p>
                <div class="space-y-3">
                  <div class="flex items-start">
                    <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Generación automatizada con IA</p>
                  </div>
                  <div class="flex items-start">
                    <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Plantillas personalizables</p>
                  </div>
                  <div class="flex items-start">
                    <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Almacenamiento seguro en blockchain</p>
                  </div>
                </div>
                <div class="mt-8">
                  <Link href="/documentos-legales" class="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                    Ver más detalles
                    <LuChevronRight class="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Capacitación */}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden
              transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
              <div class="h-3 bg-green-500"></div>
              <div class="p-8">
                <div class="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                  <LuGraduationCap class="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Capacitación</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-6">
                  Plataforma completa para crear y gestionar programas de formación sobre derechos laborales y normativas.
                </p>
                <div class="space-y-3">
                  <div class="flex items-start">
                    <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Creación de cursos modulares</p>
                  </div>
                  <div class="flex items-start">
                    <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Seguimiento de progreso</p>
                  </div>
                  <div class="flex items-start">
                    <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Certificaciones digitales</p>
                  </div>
                </div>
                <div class="mt-8">
                  <Link href="/capacitacion" class="flex items-center text-green-600 dark:text-green-400 font-medium">
                    Ver más detalles
                    <LuChevronRight class="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Auditoría */}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden
              transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
              <div class="h-3 bg-purple-500"></div>
              <div class="p-8">
                <div class="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6">
                  <LuClipboardList class="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Auditoría y Seguimiento</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-6">
                  Sistema completo para supervisar el cumplimiento normativo y mantener registros detallados de casos.
                </p>
                <div class="space-y-3">
                  <div class="flex items-start">
                    <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Análisis de cumplimiento</p>
                  </div>
                  <div class="flex items-start">
                    <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Informes detallados automáticos</p>
                  </div>
                  <div class="flex items-start">
                    <div class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">Historial de casos y alertas</p>
                  </div>
                </div>
                <div class="mt-8">
                  <Link href="/auditoria" class="flex items-center text-purple-600 dark:text-purple-400 font-medium">
                    Ver más detalles
                    <LuChevronRight class="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section class="py-20 bg-gray-50 dark:bg-gray-900" style={{viewTransitionName: 'features-section'}}>
        <div class="container mx-auto px-4 sm:px-6">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Características <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300">Principales</span>
            </h2>
            <p class="text-xl text-gray-600 dark:text-gray-300">
              Nuestra plataforma integra tecnología avanzada para simplificar la gestión laboral
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-on-scroll"
               id="features-grid"
               style={{
                 opacity: isIntersecting.value["features-grid"] ? 1 : 0,
                 transform: isIntersecting.value["features-grid"] ? "translateY(0)" : "translateY(50px)",
                 transition: "all 0.9s ease-out"
               }}>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 card-item" style={{viewTransitionName: 'feature-1'}}>
              <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/30 mb-6">
                <LuShield class="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Protección Laboral</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Herramientas especializadas diseñadas para proteger los derechos laborales y garantizar el cumplimiento normativo.
              </p>
              <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
                <ul class="space-y-2">
                  <li class="flex items-center text-gray-700 dark:text-gray-300">
                    <LuCheckSquare class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Asesoramiento personalizado</span>
                  </li>
                  <li class="flex items-center text-gray-700 dark:text-gray-300">
                    <LuCheckSquare class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Generación de documentos legales</span>
                  </li>
                  <li class="flex items-center text-gray-700 dark:text-gray-300">
                    <LuCheckSquare class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Seguimiento de incidencias</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 card-item animate-on-scroll"
                 style={{
                   viewTransitionName: 'feature-2',
                   opacity: isIntersecting.value["feature-2"] ? 1 : 0,
                   transform: isIntersecting.value["feature-2"] ? "translateY(0)" : "translateY(50px)",
                   transition: "all 0.9s ease-out 0.2s"
                 }}
                 id="feature-2">
              <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/30 mb-6">
                <LuMessageSquare class="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Asistente IA Especializado</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Asistente virtual con IA especializada en derecho laboral, disponible 24/7 para responder consultas y generar documentos.
              </p>
              <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
                <ul class="space-y-2">
                  <li class="flex items-center text-gray-700 dark:text-gray-300">
                    <LuCheckSquare class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Respuestas precisas en segundos</span>
                  </li>
                  <li class="flex items-center text-gray-700 dark:text-gray-300">
                    <LuCheckSquare class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Adaptado a normativa actual</span>
                  </li>
                  <li class="flex items-center text-gray-700 dark:text-gray-300">
                    <LuCheckSquare class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Asistencia en varios idiomas</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 card-item animate-on-scroll"
                 style={{
                   viewTransitionName: 'feature-3',
                   opacity: isIntersecting.value["feature-3"] ? 1 : 0,
                   transform: isIntersecting.value["feature-3"] ? "translateY(0)" : "translateY(50px)",
                   transition: "all 0.9s ease-out 0.4s"
                 }}
                 id="feature-3">
              <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-red-100 dark:bg-red-900/30 mb-6">
                <LuGraduationCap class="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Plataforma de Aprendizaje</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Cursos y recursos formativos sobre derechos laborales, prevención de riesgos y normativa actualizada.
              </p>
              <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
                <ul class="space-y-2">
                  <li class="flex items-center text-gray-700 dark:text-gray-300">
                    <LuCheckSquare class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Contenido interactivo multimedia</span>
                  </li>
                  <li class="flex items-center text-gray-700 dark:text-gray-300">
                    <LuCheckSquare class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Certificaciones reconocidas</span>
                  </li>
                  <li class="flex items-center text-gray-700 dark:text-gray-300">
                    <LuCheckSquare class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Actualización constante</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section class="py-20 px-4 sm:px-6 animate-on-scroll" id="faq-section"
               style={{
                 opacity: isIntersecting.value["faq-section"] ? 1 : 0,
                 transform: isIntersecting.value["faq-section"] ? "translateY(0)" : "translateY(50px)",
                 transition: "all 0.9s ease-out"
               }}>
        <div class="container mx-auto max-w-4xl">
          <div class="text-center mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Preguntas Frecuentes
            </h2>
            <p class="text-xl text-gray-600 dark:text-gray-300">
              Respuestas a las dudas más comunes sobre DAI Off
            </p>
          </div>
          
          <div class="space-y-4">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button 
                class="w-full flex items-center justify-between p-5 text-left font-medium text-gray-900 dark:text-white"
                onClick$={() => toggleFaq('faq1')}
              >
                <span>¿Qué es DAI Off y cómo puede ayudarme?</span>
                {isExpanded.value?.faq1 ? (
                  <LuChevronDown class="w-5 h-5 text-gray-500 dark:text-gray-400 transform rotate-180 transition-transform" />
                ) : (
                  <LuChevronDown class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform" />
                )}
              </button>
              <div class={`px-5 pb-5 ${isExpanded.value?.faq1 ? 'block' : 'hidden'}`}>
                <p class="text-gray-600 dark:text-gray-300">
                  DAI Off es una plataforma digital integral para la gestión laboral que conecta a trabajadores, sindicatos y despachos legales. 
                  Ofrece herramientas especializadas como gestión de ausencias, fichaje laboral, capacitación, generación de documentos legales 
                  y asesoramiento con IA, adaptadas a las necesidades específicas de cada tipo de usuario.
                </p>
              </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button 
                class="w-full flex items-center justify-between p-5 text-left font-medium text-gray-900 dark:text-white"
                onClick$={() => toggleFaq('faq2')}
              >
                <span>¿Cómo funciona el asistente de IA?</span>
                {isExpanded.value?.faq2 ? (
                  <LuChevronDown class="w-5 h-5 text-gray-500 dark:text-gray-400 transform rotate-180 transition-transform" />
                ) : (
                  <LuChevronDown class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform" />
                )}
              </button>
              <div class={`px-5 pb-5 ${isExpanded.value?.faq2 ? 'block' : 'hidden'}`}>
                <p class="text-gray-600 dark:text-gray-300">
                  Nuestro asistente de IA está especializado en derecho laboral y normativas actualizadas. Puedes consultarle dudas 
                  específicas, solicitar asesoramiento sobre tus derechos o generar documentos legales personalizados. El asistente 
                  analiza tu situación y proporciona respuestas precisas basadas en la legislación vigente, disponible 24/7.
                </p>
              </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button 
                class="w-full flex items-center justify-between p-5 text-left font-medium text-gray-900 dark:text-white"
                onClick$={() => toggleFaq('faq3')}
              >
                <span>¿Qué tipos de documentos legales puedo generar?</span>
                {isExpanded.value?.faq3 ? (
                  <LuChevronDown class="w-5 h-5 text-gray-500 dark:text-gray-400 transform rotate-180 transition-transform" />
                ) : (
                  <LuChevronDown class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform" />
                )}
              </button>
              <div class={`px-5 pb-5 ${isExpanded.value?.faq3 ? 'block' : 'hidden'}`}>
                <p class="text-gray-600 dark:text-gray-300">
                  Dependiendo de tu rol, puedes generar diferentes documentos. Para despachos: contratos laborales, cartas de despido, 
                  demandas y reclamaciones. Para sindicatos: documentos de afiliación, convenios colectivos, gestión de conflictos y 
                  recursos sobre derechos laborales. Todos los documentos cumplen con la normativa legal vigente y son personalizables.
                </p>
              </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button 
                class="w-full flex items-center justify-between p-5 text-left font-medium text-gray-900 dark:text-white"
                onClick$={() => toggleFaq('faq4')}
              >
                <span>¿Es segura mi información en la plataforma?</span>
                {isExpanded.value?.faq4 ? (
                  <LuChevronDown class="w-5 h-5 text-gray-500 dark:text-gray-400 transform rotate-180 transition-transform" />
                ) : (
                  <LuChevronDown class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform" />
                )}
              </button>
              <div class={`px-5 pb-5 ${isExpanded.value?.faq4 ? 'block' : 'hidden'}`}>
                <p class="text-gray-600 dark:text-gray-300">
                  Absolutamente. La seguridad y privacidad son prioritarias. Utilizamos cifrado de extremo a extremo, 
                  cumplimos con las normativas de protección de datos (RGPD), y nunca compartimos tu información con terceros 
                  sin tu consentimiento. Todos los datos sensibles están protegidos con los más altos estándares de seguridad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section class="py-20 bg-gray-50 dark:bg-gray-900 animate-on-scroll" id="testimonials"
               style={{
                 opacity: isIntersecting.value["testimonials"] ? 1 : 0,
                 transform: isIntersecting.value["testimonials"] ? "translateY(0)" : "translateY(50px)",
                 transition: "all 0.9s ease-out"
               }}>
        <div class="container mx-auto px-4 sm:px-6">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Lo que Dicen Nuestros <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300">Usuarios</span>
            </h2>
            <p class="text-xl text-gray-600 dark:text-gray-300">
              Descubre cómo DAI Off ha transformado la gestión laboral para diferentes profesionales
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl">
                  👨‍💼
                </div>
                <div class="ml-4">
                  <h4 class="font-bold text-gray-900 dark:text-white">Carlos Rodríguez</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Trabajador, Sector Tecnológico</p>
                </div>
              </div>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                "La aplicación de fichaje me ha facilitado enormemente el control de mis horas laborales. 
                El sistema de registro de ausencias es intuitivo y el asistente virtual me ha ayudado a resolver 
                dudas sobre mis derechos sin necesidad de consultar a un abogado."
              </p>
              {/* Eliminado iconos de me gusta */}
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl">
                  👩‍⚖️
                </div>
                <div class="ml-4">
                  <h4 class="font-bold text-gray-900 dark:text-white">Ana Martínez</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Abogada Laboralista</p>
                </div>
              </div>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                "Como abogada, DAI Off ha revolucionado mi trabajo diario. El generador de documentos 
                me ahorra horas de trabajo y la plataforma de capacitación me permite crear recursos 
                educativos para mis clientes. Una herramienta indispensable para cualquier despacho laboral."
              </p>
              {/* Eliminado iconos de me gusta */}
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-2xl">
                  👨‍🏭
                </div>
                <div class="ml-4">
                  <h4 class="font-bold text-gray-900 dark:text-white">Miguel Sánchez</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Representante Sindical</p>
                </div>
              </div>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                "DAI Off ha transformado nuestra gestión sindical. La plataforma nos permite 
                crear programas de formación para nuestros afiliados y generar documentación 
                especializada. El módulo de auditoría nos ayuda a hacer seguimiento de casos 
                y cumplimientos de convenios."
              </p>
              {/* Eliminado iconos de me gusta */}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section class="py-20 px-4 sm:px-6 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 text-white animate-on-scroll"
               id="cta-section"
               style={{
                 viewTransitionName: 'cta-section',
                 opacity: isIntersecting.value["cta-section"] ? 1 : 0,
                 transform: isIntersecting.value["cta-section"] ? "translateY(0)" : "translateY(50px)",
                 transition: "all 0.9s ease-out"
               }}>
        <div class="container mx-auto max-w-4xl text-center">
          <h2 class="text-3xl sm:text-4xl font-bold mb-6">Comienza a gestionar tus derechos laborales</h2>
          <p class="text-xl text-red-100 dark:text-red-200 mb-10 max-w-2xl mx-auto">
            Únete a miles de profesionales que ya transformaron su gestión laboral con nuestra plataforma.
          </p>
          <div class="flex flex-wrap gap-4 justify-center">
            <Link
              href="/auth"
              class="px-8 py-4 bg-white text-red-600 font-bold rounded-xl shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all"
            >
              Comenzar Ahora
            </Link>
            <Link
              href="/docs"
              class="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transform hover:scale-105 transition-all"
            >
              Ver Documentación
            </Link>
          </div>
        </div>
      </section>

      {/* Add custom styles */}
      <style>
        {`
          .animate-bounce-slow {
            animation: bounce 3s infinite;
          }
          
          @keyframes bounce {
            0%, 100% {
              transform: translateY(-5%);
              animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }
            50% {
              transform: translateY(0);
              animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
          }
          
          .bg-grid-pattern {
            background-size: 20px 20px;
            background-image: 
              linear-gradient(to right, rgba(128, 128, 128, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.1) 1px, transparent 1px);
          }
          
          /* Para animaciones de aparición */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          .delay-100 {
            animation-delay: 0.1s;
          }
          
          .delay-200 {
            animation-delay: 0.2s;
          }
          
          .delay-300 {
            animation-delay: 0.3s;
          }
        `}
      </style>
    </div>
  );
});

export const head: DocumentHead = {
  title: "DAI Off - Tu Defensor Laboral Digital",
  meta: [
    {
      name: "description",
      content: "DAI Off es una plataforma integral para la gestión laboral que conecta a trabajadores, sindicatos y despachos legales con herramientas digitales especializadas en derechos laborales.",
    },
    {
      name: "keywords",
      content: "derechos laborales, asesoría legal, trabajadores, sindicatos, despachos, gestión de ausencias, fichaje, documentos legales, capacitación"
    }
  ],
};

// Componentes adicionales
const LuClockIcon = component$(() => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
});

const LuPlus = component$(() => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
});
