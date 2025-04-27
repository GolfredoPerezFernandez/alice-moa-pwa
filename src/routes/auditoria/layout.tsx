import { component$, Slot } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { LuFileText, LuChevronRight } from '@qwikest/icons/lucide';

export default component$(() => {
  return (
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Link href="/" class="hover:text-red-600 dark:hover:text-red-400">
            Inicio
          </Link>
          <LuChevronRight class="w-3 h-3 mx-2" />
          <span class="text-gray-700 dark:text-gray-300">Auditoría de documentos</span>
        </div>

        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <LuFileText class="w-8 h-8 text-red-600 dark:text-red-500 mr-3" />
          Auditoría de documentos legales
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mt-2 max-w-3xl">
          Esta herramienta utiliza inteligencia artificial para analizar documentos legales, 
          identificar términos relevantes y detectar posibles problemas o inconsistencias.
        </p>
      </div>

      <Slot />
    </div>
  );
});