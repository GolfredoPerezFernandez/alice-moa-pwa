import { component$, useSignal, useVisibleTask$, $, useStore } from "@builder.io/qwik";
import { routeLoader$, Form, Link } from '@builder.io/qwik-city';
import { LuFilePlus, LuSearch, LuTag } from '@qwikest/icons/lucide';
import { getUserId } from "~/utils/auth";
import { capacitacionOperations } from "~/utils/db-operations";

// Definición de tipos para los cursos de capacitación
interface CursoCapacitacion {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: 'seguridad' | 'derechos' | 'prevencion' | 'igualdad' | 'salud';
  imagen_color: string;
  instructor?: string;
  duracion?: string;
}

// Cargador de datos para obtener todos los cursos de capacitación
export const useCursosLoader = routeLoader$(async (requestEvent) => {
  try {
    // Usar la función de db-operations para obtener todos los cursos
    return await capacitacionOperations.getAllCourses(requestEvent);
  } catch (error) {
    console.error('[CAPACITACION] Error al cargar cursos:', error);
    return [] as CursoCapacitacion[];
  }
});

export default component$(() => {
  // Obtener los cursos del loader
  const cursosData = useCursosLoader();
  const cursos = useSignal<CursoCapacitacion[]>(cursosData.value);
  
  // Estado para filtros y búsqueda
  const filtroCategoria = useSignal<string>('todas');
  const terminoBusqueda = useSignal<string>('');
  
  // Categorías disponibles
  const categorias = [
    { id: 'todas', nombre: 'Todas las categorías' },
    { id: 'seguridad', nombre: 'Seguridad y Salud' },
    { id: 'derechos', nombre: 'Derechos Laborales' },
    { id: 'prevencion', nombre: 'Prevención de Acoso' },
    { id: 'igualdad', nombre: 'Igualdad y No Discriminación' },
    { id: 'salud', nombre: 'Salud Mental' },
  ];
  
  // Función para filtrar cursos
  const filtrarCursos = $(() => {
    let cursosFiltrados = cursosData.value;
    
    // Filtrar por categoría si no es "todas"
    if (filtroCategoria.value !== 'todas') {
      cursosFiltrados = cursosFiltrados.filter(curso => 
        curso.categoria === filtroCategoria.value
      );
    }
    
    // Filtrar por término de búsqueda
    if (terminoBusqueda.value.trim() !== '') {
      const termino = terminoBusqueda.value.toLowerCase();
      cursosFiltrados = cursosFiltrados.filter(curso => 
        curso.titulo.toLowerCase().includes(termino) || 
        curso.descripcion.toLowerCase().includes(termino)
      );
    }
    
    cursos.value = cursosFiltrados;
  });
  
  // Aplicar filtros cuando cambian los valores
  useVisibleTask$(({ track }) => {
    track(() => filtroCategoria.value);
    track(() => terminoBusqueda.value);
    filtrarCursos();
  });

  return (
    <div class="capacitacion-container">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">
          Capacitaciones laborales
        </h1>
        <p class="text-slate-600 dark:text-slate-300 mb-6">
          Aquí es donde puedes mantenerte al tanto de leyes laborales y defender tus derechos como trabajador
        </p>
        
        {/* Botón para crear nuevo curso */}
        <div class="flex justify-end mb-4">
          <Link href="/capacitacion/crear" class="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            <LuFilePlus class="w-5 h-5 mr-2" />
            Crear nuevo curso
          </Link>
        </div>
        
        {/* Filtros y búsqueda */}
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="w-full md:w-1/3">
            <div class="relative">
              <LuSearch class="absolute top-2 left-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                bind:value={terminoBusqueda}
              />
            </div>
          </div>
          
          <div class="w-full md:w-1/3">
            <div class="relative">
              <LuTag class="absolute top-2 left-3 w-5 h-5 text-slate-400" />
              <select
                class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none"
                bind:value={filtroCategoria}
              >
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>
      
      {/* Lista de cursos */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cursos.value.length > 0 ? (
          cursos.value.map(curso => (
            <div key={curso.id} class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div class="p-6">
                <div class="flex items-start">
                  <div class={`w-24 h-24 min-w-[6rem] flex-shrink-0 mr-5 rounded-lg ${curso.imagen_color} flex items-center justify-center relative`}>
                    <span class="text-4xl  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      {curso.categoria === 'seguridad' && '🛡️'}
                      {curso.categoria === 'derechos' && '⚖️'}
                      {curso.categoria === 'prevencion' && '🚫'}
                      {curso.categoria === 'igualdad' && '🤝'}
                      {curso.categoria === 'salud' && '❤️'}
                    </span>
                  </div>
                  <div class="flex-1 pl-4">
                    <h2 class="text-xl  ml-2 font-bold text-slate-900 dark:text-white mb-2">
                      {curso.titulo}
                    </h2>
                    <p class="text-slate-600  ml-2  dark:text-slate-300 text-sm mb-4">
                      {curso.descripcion}
                    </p>
                    <div class="flex ml-2  items-center mt-4">
                      <Link
                        href={`/capacitacion/curso/${curso.id}`}
                        class="inline-block bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md transition-colors text-sm font-medium shadow-sm"
                      >
                        Iniciar
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div class="col-span-full text-center py-8">
            <p class="text-slate-600 dark:text-slate-400">No se encontraron cursos. ¡Crea uno nuevo!</p>
          </div>
        )}
      </div>
    </div>
  );
});