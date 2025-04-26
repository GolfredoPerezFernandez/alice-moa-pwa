import { component$, useSignal, useStylesScoped$, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import {
  LuGraduationCap, // Mission/Education
  LuHeart,         // Values
  LuLightbulb,     // Approach/Innovation
  LuUsers,         // Community
  LuTarget,        // Goals
  LuSparkles,      // Benefits
  LuBookOpen,      // Learning
  LuMessageSquare, // Added for Approach section
  LuArrowRight     // Added for CTA button
} from '@qwikest/icons/lucide';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  useStylesScoped$(/* css */`
    .hero {
      /* Updated gradient for DAI Off */
      background-image: linear-gradient(to right, rgba(220, 38, 38, 0.9), rgba(185, 28, 28, 0.8)), url('/images/legal-bg.jpg'); /* Replace with a relevant background image */
      background-size: cover;
      background-position: center;
      color: white;
    }

    .section {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    .visible {
      opacity: 1;
      transform: translateY(0);
    }

    .feature-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); /* Enhanced hover shadow */
    }

    .icon-gradient {
      /* Updated icon background gradient */
      @apply bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-lg text-white inline-flex shadow-md;
    }

    /* Timeline styling (Optional - can be adapted or removed if not needed for About page) */
    .timeline-container {
      @apply relative;
    }

    .timeline-item {
      @apply relative pl-10 pb-10;
    }

    .timeline-item:before {
      content: '';
      /* Updated timeline color */
      @apply absolute left-3 top-2 h-full w-0.5 bg-red-200 dark:bg-red-900;
    }

    .timeline-item:last-child:before {
      @apply h-6;
    }

    .timeline-circle {
      /* Updated timeline circle color */
      @apply absolute left-0 top-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow;
    }
  `);

  // Animation with intersection observer (keep if desired)
  const sectionRefs = [useSignal<Element>(), useSignal<Element>(), useSignal<Element>()];

  useVisibleTask$(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.15, // Adjust threshold as needed
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.section').forEach(section => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect(); // Clean up
    };
  });

  return (
    <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 page-content">
      {/* Hero Section */}
      <div class="hero py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center hero-section" style={{viewTransitionName: 'about-hero'}}>
        <div class="max-w-4xl text-center">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
            Quienes Somos
          </h1>
          <p class="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto">
            En DAI Off entendemos los retos del entorno laboral moderno y brindamos asesoramiento legal laboral personalizado con tecnología avanzada.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat" class="px-8 py-3 bg-white text-red-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center shadow-md">
              Consulta Ahora
            </Link>
            <Link href="/contact" class="px-8 py-3 bg-red-700 border border-white text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-center shadow-md">
              Contáctanos
            </Link>
          </div>
        </div>
      </div>

      {/* Our Mission Section */}
      <section class="py-16 px-4 bg-white dark:bg-gray-800 section" ref={sectionRefs[0]} style={{viewTransitionName: 'about-mission'}}>
        <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span class="inline-block px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-full mb-3">
              Nuestro Propósito
            </span>
            <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Nuestra Misión y Visión
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-6">
              DAI Off está dedicado a hacer el asesoramiento legal laboral accesible, claro y efectivo para todos. Creemos que entender tus derechos laborales abre puertas a nuevas oportunidades y crecimiento profesional.
            </p>
            <p class="text-lg text-gray-600 dark:text-gray-300">
              Nuestra visión es crear una comunidad de trabajadores informados, eliminando barreras y fomentando relaciones laborales justas a través del poder del conocimiento legal.
            </p>
          </div>
          <div class="flex justify-center">
            {/* Replace with an appropriate image or illustration */}
            <LuTarget class="w-48 h-48 text-red-500 dark:text-red-400 opacity-80" />
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section class="py-16 px-4 bg-gray-50 dark:bg-gray-900 section" ref={sectionRefs[1]} style={{viewTransitionName: 'about-values'}}>
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Nuestros Valores
          </h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value Card 1 */}
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-red-500 dark:border-red-400 card-item" style={{viewTransitionName: 'value-card-1'}}>
              <div class="icon-gradient mb-4">
                <LuGraduationCap class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Experiencia Confirmada</h3>
              <p class="text-gray-600 dark:text-gray-300">
                Contamos con tecnología especializada en legislación laboral, estatuto de trabajadores y convenios colectivos por sector.
              </p>
            </div>
            {/* Value Card 2 */}
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-red-500 dark:border-red-400 card-item" style={{viewTransitionName: 'value-card-2'}}>
              <div class="icon-gradient mb-4">
                <LuUsers class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Transparencia Total</h3>
              <p class="text-gray-600 dark:text-gray-300">
                Garantizamos claridad en cada paso del proceso para asegurar que recibas orientación sin ninguna sorpresa.
              </p>
            </div>
            {/* Value Card 3 */}
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-red-500 dark:border-red-400 card-item" style={{viewTransitionName: 'value-card-3'}}>
              <div class="icon-gradient mb-4">
                <LuHeart class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Compromiso con el Cliente</h3>
              <p class="text-gray-600 dark:text-gray-300">
                Impulsados por nuestra pasión por la justicia laboral y el respeto por las necesidades individuales de cada trabajador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section class="py-16 px-4 bg-white dark:bg-gray-800 section" ref={sectionRefs[2]} style={{viewTransitionName: 'about-approach'}}>
        <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
           <div class="flex justify-center md:order-last">
             {/* Replace with an appropriate image or illustration */}
            <LuLightbulb class="w-48 h-48 text-red-500 dark:text-red-400 opacity-80" />
          </div>
          <div class="md:order-first">
            <span class="inline-block px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-full mb-3">
              Cómo Trabajamos
            </span>
            <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Nuestro Enfoque de Asesoría
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-4">
              Combinamos conocimiento legal, casos reales y herramientas de IA avanzadas como nuestro asistente DAI Off, para crear una experiencia de asesoramiento personalizada y efectiva.
            </p>
            <ul class="space-y-3 text-gray-600 dark:text-gray-300">
              <li class="flex items-start">
                <LuSparkles class="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span>Enfoque en soluciones prácticas y aplicables desde el primer momento.</span>
              </li>
              <li class="flex items-start">
                <LuBookOpen class="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span>Información actualizada con las últimas normativas laborales y convenios.</span>
              </li>
              <li class="flex items-start">
                <LuMessageSquare class="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span>Integración de IA para un asesoramiento personalizado y preciso.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div class="py-16 px-4 text-center bg-gray-50 dark:bg-gray-900" style={{viewTransitionName: 'about-cta'}}>
        <div class="max-w-3xl mx-auto">
          <h2 class="text-3xl font-bold mb-6 text-red-700 dark:text-red-300">
            ¿Listo para proteger tus derechos laborales?
          </h2>
          <p class="text-lg mb-8 text-gray-600 dark:text-gray-300">
            Únete a la comunidad DAI Off hoy y descubre el poder de contar con asesoría legal laboral personalizada.
          </p>
          <Link href="/auth" class="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300" style={{viewTransitionName: 'cta-button'}}>
            Registrarse Ahora
            <LuArrowRight class="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Quienes Somos | DAI Off",
  meta: [
    {
      name: "description",
      content: "Conoce más sobre DAI Off, nuestra misión, valores y enfoque innovador en asesoría legal laboral con tecnología avanzada. Protege tus derechos laborales.",
    },
  ],
};