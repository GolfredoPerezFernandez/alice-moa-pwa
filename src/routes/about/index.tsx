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
      /* Updated gradient for Move On Academy */
      background-image: linear-gradient(to right, rgba(13, 148, 136, 0.9), rgba(5, 150, 105, 0.8)), url('/images/language-learning-bg.jpg'); /* Replace with a relevant background image */
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
      @apply bg-gradient-to-r from-teal-500 to-green-600 p-3 rounded-lg text-white inline-flex shadow-md;
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
      @apply absolute left-3 top-2 h-full w-0.5 bg-teal-200 dark:bg-teal-900;
    }

    .timeline-item:last-child:before {
      @apply h-6;
    }

    .timeline-circle {
      /* Updated timeline circle color */
      @apply absolute left-0 top-2 h-6 w-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold shadow;
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
    <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div class="hero py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div class="max-w-4xl text-center">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white">
            About Move On Academy
          </h1>
          <p class="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto">
            Empowering individuals through language education and fostering global understanding with innovative teaching methods.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses" class="px-8 py-3 bg-white text-teal-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center shadow-md">
              Explore Our Courses
            </Link>
            <Link href="/contact" class="px-8 py-3 bg-teal-700 border border-white text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors text-center shadow-md">
              Get In Touch
            </Link>
          </div>
        </div>
      </div>

      {/* Our Mission Section */}
      <section class="py-16 px-4 bg-white dark:bg-gray-800 section" ref={sectionRefs[0]}>
        <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span class="inline-block px-3 py-1 text-sm font-semibold text-teal-800 bg-teal-100 dark:bg-teal-900 dark:text-teal-200 rounded-full mb-3">
              Our Purpose
            </span>
            <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Our Mission & Vision
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Move On Academy is dedicated to making language learning accessible, engaging, and effective for everyone. We believe that mastering a new language opens doors to new cultures, opportunities, and personal growth.
            </p>
            <p class="text-lg text-gray-600 dark:text-gray-300">
              Our vision is to build a global community of confident communicators, breaking down barriers and fostering connection through the power of language.
            </p>
          </div>
          <div class="flex justify-center">
            {/* Replace with an appropriate image or illustration */}
            <LuTarget class="w-48 h-48 text-teal-500 dark:text-teal-400 opacity-80" />
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section class="py-16 px-4 bg-gray-50 dark:bg-gray-900 section" ref={sectionRefs[1]}>
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            What We Stand For
          </h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value Card 1 */}
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-teal-500 dark:border-teal-400">
              <div class="icon-gradient mb-4">
                <LuGraduationCap class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Effective Learning</h3>
              <p class="text-gray-600 dark:text-gray-300">
                Utilizing proven teaching methodologies combined with modern technology for optimal results.
              </p>
            </div>
            {/* Value Card 2 */}
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-green-500 dark:border-green-400">
              <div class="icon-gradient mb-4">
                <LuUsers class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Supportive Community</h3>
              <p class="text-gray-600 dark:text-gray-300">
                Fostering a welcoming environment where learners can connect, practice, and grow together.
              </p>
            </div>
            {/* Value Card 3 */}
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow feature-card border-t-4 border-cyan-500 dark:border-cyan-400">
              <div class="icon-gradient mb-4">
                <LuHeart class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Passion & Respect</h3>
              <p class="text-gray-600 dark:text-gray-300">
                Driven by a love for languages and respect for diverse cultures and individual learning journeys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section class="py-16 px-4 bg-white dark:bg-gray-800 section" ref={sectionRefs[2]}>
        <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
           <div class="flex justify-center md:order-last">
             {/* Replace with an appropriate image or illustration */}
            <LuLightbulb class="w-48 h-48 text-green-500 dark:text-green-400 opacity-80" />
          </div>
          <div class="md:order-first">
            <span class="inline-block px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-full mb-3">
              How We Teach
            </span>
            <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Our Teaching Approach
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 mb-4">
              We blend interactive lessons, real-world scenarios, and cutting-edge AI tools like our chat partner, Alice, to create a dynamic and personalized learning experience.
            </p>
            <ul class="space-y-3 text-gray-600 dark:text-gray-300">
              <li class="flex items-start">
                <LuSparkles class="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                <span>Focus on practical communication skills from day one.</span>
              </li>
              <li class="flex items-start">
                <LuBookOpen class="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                <span>Curriculum designed for engagement and long-term retention.</span>
              </li>
              <li class="flex items-start">
                <LuMessageSquare class="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                <span>Integration of AI for personalized practice and feedback.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div class="py-16 px-4 text-center bg-gray-50 dark:bg-gray-900">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-3xl font-bold mb-6 text-teal-700 dark:text-teal-300">
            Ready to Begin Your Language Adventure?
          </h2>
          <p class="text-lg mb-8 text-gray-600 dark:text-gray-300">
            Join the Move On Academy community today and discover the joy of learning a new language.
          </p>
          <Link href="/auth" class="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-teal-600 to-green-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
            Sign Up Now
            <LuArrowRight class="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "About Move On Academy",
  meta: [
    {
      name: "description",
      content: "Learn about Move On Academy's mission, values, and innovative approach to language learning. Join our community and start your journey to fluency.",
    },
  ],
};