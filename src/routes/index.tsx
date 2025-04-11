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
      <section class="relative py-16 lg:py-20 px-4 sm:px-6 overflow-hidden">
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Updated Gradient */}
          <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-100/60 to-green-50/30 dark:from-teal-900/30 dark:to-green-900/10"></div>
        </div>

        <div class="max-w-7xl mx-auto relative px-2 sm:px-4">
          {/* Fully responsive layout that works on all screen sizes */}
          <div class="flex flex-col sm:flex-row items-center gap-6 w-full">
            {/* Alice Avatar Idle Video - Responsive container */}
            <div class="w-full sm:w-auto max-w-xs mx-auto sm:mx-0 order-2 sm:order-1">
              <div class="rounded-lg overflow-hidden shadow-lg border-2 border-teal-200 dark:border-teal-800 aspect-[3/4] sm:aspect-auto bg-gray-100 dark:bg-gray-800">
                <video
                  autoplay
                  loop
                  muted
                  playsInline
                  class="w-full h-full object-cover object-center"
                  style={{ maxHeight: '280px' }}
                >
                  <source src="/prs_alice.idle.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            
            {/* Text content - Consistent center alignment */}
            <div class="w-full sm:flex-1 text-center order-1 sm:order-2">
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                <span class="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-400 dark:to-green-400">Move On Academy</span>
                <span class="block mt-1">Unlock Your Language Potential</span>
              </h1>
              <p class="mt-3 mt-4 mb-4 sm:mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed mx-auto max-w-lg">
                Join our vibrant community and embark on a journey to fluency. Interactive courses, expert instructors, and real-world practice.
              </p>
              <div class="mt-5 sm:mt-8 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/courses"
                  class="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors shadow-md hover:shadow-lg flex items-center text-sm sm:text-base"
                >
                  Explore Courses
                  <LuArrowRight class="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href="/chat"
                  class="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-gray-700 font-medium transition-colors shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  Chat with Alice
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section class="py-12 px-4 sm:px-6 lg:py-16">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Why Choose Move On Academy?</h2>
            <p class="mt-4 text-xl text-gray-600 dark:text-gray-300">A modern approach to language learning designed for success.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Interactive Courses */}
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 mb-4">
                <LuBookOpen class="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Interactive Courses</h3>
              <p class="text-gray-600 dark:text-gray-300">Engaging lessons designed for all levels, from beginner to advanced.</p>
            </div>
            {/* Feature 2: Expert Instructors */}
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <LuGraduationCap class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Expert Instructors</h3>
              <p class="text-gray-600 dark:text-gray-300">Learn from experienced teachers passionate about language education.</p>
            </div>
            {/* Feature 3: AI Practice Partner */}
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900 mb-4">
                <LuMessageSquare class="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI Practice Partner</h3>
              <p class="text-gray-600 dark:text-gray-300">Practice conversation anytime with Alice, our intelligent AI tutor.</p>
            </div>
            {/* Feature 4: Supportive Community */}
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-lime-100 dark:bg-lime-900 mb-4">
                <LuUsers class="w-6 h-6 text-lime-600 dark:text-lime-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Supportive Community</h3>
              <p class="text-gray-600 dark:text-gray-300">Connect with fellow learners, practice together, and share your progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section class="py-12 px-4 sm:px-6 lg:py-16 bg-gradient-to-r from-teal-500 to-green-600 dark:from-teal-800 dark:to-green-900">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-white">Ready to Start Your Language Journey?</h2>
          <p class="mt-4 text-xl text-teal-100 dark:text-teal-200">
            Sign up today and take the first step towards mastering a new language.
          </p>
          <div class="mt-8">
            <Link
              href="/auth" // Link to auth/signup page
              class="px-8 py-3 rounded-lg bg-white text-teal-600 font-medium transition-colors shadow-lg hover:bg-teal-50"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="py-8 px-4 sm:px-6 bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div class="max-w-7xl mx-auto text-center text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Move On Academy. All rights reserved. |
          <Link href="/terms" class="hover:text-teal-600 dark:hover:text-teal-400 ml-2">Terms</Link> |
          <Link href="/privacy" class="hover:text-teal-600 dark:hover:text-teal-400 ml-2">Privacy</Link>
        </div>
      </footer>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Move On Academy - Learn Languages Effectively", // Updated Title
  meta: [
    {
      name: "description",
      content: "Join Move On Academy to learn new languages with interactive courses, expert instructors, and an AI practice partner. Start your journey to fluency today!", // Updated Description
    },
  ],
};
