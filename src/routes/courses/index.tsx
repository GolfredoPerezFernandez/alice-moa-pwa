import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import {
  LuBookOpen,
  LuGraduationCap,
  LuCalendarDays,
  LuArrowRight,
  LuUsers,
} from '@qwikest/icons/lucide';

export default component$(() => {
  // Sample course data
  const courses = [
    {
      id: 1,
      title: "English for Beginners",
      level: "A1 - Beginner",
      duration: "8 weeks",
      description: "Start your English journey with this comprehensive beginner course. Learn essential vocabulary, basic grammar, and everyday phrases.",
      image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      instructor: "Sarah Johnson"
    },
    {
      id: 2,
      title: "Intermediate Spanish",
      level: "B1 - Intermediate",
      duration: "10 weeks",
      description: "Take your Spanish to the next level with our intermediate course focused on conversation, advanced grammar, and cultural context.",
      image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      instructor: "Carlos Mendez"
    },
    {
      id: 3,
      title: "Business French",
      level: "B2 - Upper Intermediate",
      duration: "6 weeks",
      description: "Specialized course for professionals looking to use French in business contexts. Focus on formal communication and industry vocabulary.",
      image: "https://images.unsplash.com/photo-1549737221-bef65e2604a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      instructor: "Marie Dupont"
    },
    {
      id: 4,
      title: "Conversational Italian",
      level: "A2 - Elementary",
      duration: "8 weeks",
      description: "Practice speaking Italian in everyday situations. Learn practical phrases, improve pronunciation, and gain confidence in real conversations.",
      image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      instructor: "Marco Bianchi"
    }
  ];

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section class="py-12 px-4 sm:px-6 text-center bg-gradient-to-r from-teal-500/10 to-green-500/10 dark:from-teal-900/30 dark:to-green-900/30">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Our Language Courses
          </h1>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Discover a wide range of language courses designed to help you achieve fluency through personalized learning.
          </p>
        </div>
      </section>

      {/* Course Filter (simplified) */}
      <section class="py-6 px-4 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto flex justify-center">
          <div class="inline-flex rounded-md shadow-sm" role="group">
            <button class="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-100 rounded-l-lg dark:bg-teal-900 dark:text-teal-300">
              All Courses
            </button>
            <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-r border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
              Beginner
            </button>
            <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-r border-gray-200 rounded-r-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
              Advanced
            </button>
          </div>
        </div>
      </section>

      {/* Course List */}
      <section class="py-12 px-4 sm:px-6">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <div key={course.id} class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col h-full transform transition-transform hover:scale-105 hover:shadow-lg">
                <div class="h-48 overflow-hidden">
                  <img src={course.image} alt={course.title} class="w-full h-full object-cover" />
                </div>
                <div class="p-6 flex-grow">
                  <div class="flex justify-between items-start mb-2">
                    <span class="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 text-xs font-medium rounded">
                      {course.level}
                    </span>
                    <span class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <LuCalendarDays class="h-3.5 w-3.5 mr-1" />
                      {course.duration}
                    </span>
                  </div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                  <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">{course.description}</p>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <LuGraduationCap class="h-4 w-4 mr-1" />
                    Instructor: {course.instructor}
                  </div>
                </div>
                <div class="px-6 pb-4">
                  <button class="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow transition-colors flex items-center justify-center">
                    Enroll Now
                    <LuArrowRight class="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section class="py-12 px-4 sm:px-6 bg-gray-100 dark:bg-gray-800">
        <div class="max-w-7xl mx-auto text-center">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Why Learn With Us?</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow">
              <div class="w-12 h-12 mx-auto bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4">
                <LuBookOpen class="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Expert-Designed Curriculum</h3>
              <p class="text-gray-600 dark:text-gray-300">Our courses are crafted by language experts to ensure effective learning and retention.</p>
            </div>
            
            <div class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow">
              <div class="w-12 h-12 mx-auto bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4">
                <LuUsers class="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Community Practice</h3>
              <p class="text-gray-600 dark:text-gray-300">Join conversation groups with fellow learners to practice in a supportive environment.</p>
            </div>
            
            <div class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow">
              <div class="w-12 h-12 mx-auto bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4">
                <LuGraduationCap class="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Personalized Learning</h3>
              <p class="text-gray-600 dark:text-gray-300">Adaptive lessons that adjust to your pace and learning style for maximum progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-12 px-4 sm:px-6 bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-800 dark:to-green-800">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Ready to Start Your Language Journey?</h2>
          <p class="text-teal-100 mb-8">Join thousands of students already improving their language skills.</p>
          <div class="flex flex-wrap justify-center gap-4">
            <Link 
              href="/auth" 
              class="px-6 py-3 bg-white text-teal-600 font-medium rounded-lg shadow-lg hover:bg-teal-50 transition-colors"
            >
              Sign Up Now
            </Link>
            <Link 
              href="/chat" 
              class="px-6 py-3 bg-teal-700 text-white font-medium rounded-lg shadow-lg hover:bg-teal-800 transition-colors"
            >
              Try Free Chat Practice
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Courses - Move On Academy",
  meta: [
    {
      name: "description",
      content: "Browse our wide range of language courses for all levels. From beginner to advanced, find the perfect course to enhance your language skills.",
    },
  ],
};