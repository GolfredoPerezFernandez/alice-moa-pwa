import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, Link, useLocation } from '@builder.io/qwik-city';
import { LuArrowLeft, LuPlus, LuDownload, LuPlay, LuPencil, LuCheckCircle } from '@qwikest/icons/lucide';
import { tursoClient } from "~/utils/turso";
import { getUserId, canManageCapacitacion } from "~/utils/auth";

// Definición de tipos
interface CursoCapacitacion {
  id: number;
  titulo: string;
  descripcion: string;
  descripcion_completa: string;
  categoria: string;
  instructor?: string;
  duracion?: string;
  imagen_color: string;
  creado_por: number;
}

interface ModuloCurso {
  id: number;
  curso_id: number;
  titulo: string;
  tipo: 'video' | 'document' | 'quiz' | 'interactive';
  orden: number;
  url_contenido?: string;
  completado?: boolean;
}

interface RecursoCurso {
  id: number;
  curso_id: number;
  titulo: string;
  tipo: 'pdf' | 'excel' | 'image' | 'document' | 'video';
  url_recurso?: string;
}

// Cargador para obtener los datos del curso
export const useCursoLoader = routeLoader$(async (requestEvent) => {
  const cursoId = requestEvent.params.id;
  
  try {
    const client = tursoClient(requestEvent);
    
    // Obtener detalles del curso
    const cursoResult = await client.execute(
      `SELECT * FROM cursos_capacitacion WHERE id = ?`,
      [cursoId]
    );
    
    if (cursoResult.rows.length === 0) {
      // El curso no existe
      throw requestEvent.error(404, 'Curso no encontrado');
    }
    
    const curso = {
      id: Number(cursoResult.rows[0].id),
      titulo: String(cursoResult.rows[0].titulo),
      descripcion: String(cursoResult.rows[0].descripcion),
      descripcion_completa: String(cursoResult.rows[0].descripcion_completa || ''),
      categoria: String(cursoResult.rows[0].categoria),
      instructor: cursoResult.rows[0].instructor ? String(cursoResult.rows[0].instructor) : undefined,
      duracion: cursoResult.rows[0].duracion ? String(cursoResult.rows[0].duracion) : undefined,
      imagen_color: String(cursoResult.rows[0].imagen_color || 'bg-red-100 dark:bg-red-900/20'),
      creado_por: Number(cursoResult.rows[0].creado_por)
    };
    
    // Obtener módulos del curso
    const modulosResult = await client.execute(
      `SELECT * FROM modulos_curso WHERE curso_id = ? ORDER BY orden ASC`,
      [cursoId]
    );
    
    const modulos = modulosResult.rows.map(row => ({
      id: Number(row.id),
      curso_id: Number(row.curso_id),
      titulo: String(row.titulo),
      tipo: String(row.tipo) as 'video' | 'document' | 'quiz' | 'interactive',
      orden: Number(row.orden),
      url_contenido: row.url_contenido ? String(row.url_contenido) : undefined
    }));
    
    // Obtener recursos del curso
    const recursosResult = await client.execute(
      `SELECT * FROM recursos_curso WHERE curso_id = ?`,
      [cursoId]
    );
    
    const recursos = recursosResult.rows.map(row => ({
      id: Number(row.id),
      curso_id: Number(row.curso_id),
      titulo: String(row.titulo),
      tipo: String(row.tipo) as 'pdf' | 'excel' | 'image' | 'document' | 'video',
      url_recurso: row.url_recurso ? String(row.url_recurso) : undefined
    }));
    
    // Verificar si el usuario puede gestionar el curso
    const puedeGestionar = await canManageCapacitacion(requestEvent);
    
    // Obtener progreso del usuario si está autenticado
    const userId = getUserId(requestEvent);
    let modulosCompletados: number[] = [];
    
    if (userId) {
      const progresoResult = await client.execute(
        `SELECT modulo_id FROM progreso_curso WHERE usuario_id = ? AND completado = 1`,
        [userId]
      );
      
      modulosCompletados = progresoResult.rows.map(row => Number(row.modulo_id));
    }
    
    return {
      curso,
      modulos,
      recursos,
      puedeGestionar,
      modulosCompletados
    };
  } catch (error) {
    console.error('[CAPACITACION] Error al cargar curso:', error);
    throw requestEvent.error(500, 'Error al cargar el curso');
  }
});

export default component$(() => {
  const location = useLocation();
  const cursoData = useCursoLoader();
  
  // Señales para manejar el estado de la UI
  const moduloActivo = useSignal<number | null>(null);
  
  // Verificar si un módulo está completado
  const isModuloCompletado = (moduloId: number) => {
    return cursoData.value.modulosCompletados.includes(moduloId);
  };
  
  return (
    <div class="curso-container">
      <header class="mb-8">
        <div class="flex items-center mb-4">
          <Link href="/capacitacion" class="text-blue-600 hover:text-blue-800 flex items-center">
            <LuArrowLeft class="w-5 h-5 mr-1" />
            Volver a capacitaciones
          </Link>
        </div>
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2 md:mb-0">
            {cursoData.value.curso.titulo}
          </h1>
          
          {cursoData.value.puedeGestionar && (
            <div class="flex space-x-2">
              <Link
                href={`/capacitacion/curso/${cursoData.value.curso.id}/modulos/crear`}
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center"
              >
                <LuPlus class="w-4 h-4 mr-1" />
                Crear módulos
              </Link>
              <Link
                href={`/capacitacion/curso/${cursoData.value.curso.id}/editar`}
                class="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center"
              >
                <LuPencil class="w-4 h-4 mr-1" />
                Editar curso
              </Link>
            </div>
          )}
        </div>
        
        <div class="text-sm flex flex-wrap gap-x-6 gap-y-2 text-slate-600 dark:text-slate-400 mb-4">
          {cursoData.value.curso.instructor && (
            <div>Instructor: <span class="font-medium">{cursoData.value.curso.instructor}</span></div>
          )}
          {cursoData.value.curso.duracion && (
            <div>Duración: <span class="font-medium">{cursoData.value.curso.duracion}</span></div>
          )}
          <div>Categoría: <span class="font-medium capitalize">{cursoData.value.curso.categoria}</span></div>
        </div>
      </header>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-4">Descripción del curso</h2>
            <div class="prose dark:prose-invert max-w-none">
              <p class="text-slate-600 dark:text-slate-300">
                {cursoData.value.curso.descripcion_completa || cursoData.value.curso.descripcion}
              </p>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-4">Módulos del curso</h2>
            
            {cursoData.value.modulos.length > 0 ? (
              <div class="space-y-4">
                {cursoData.value.modulos.map((modulo, index) => (
                  <div 
                    key={modulo.id}
                    class={`p-4 rounded-lg border ${
                      isModuloCompletado(modulo.id) 
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                          {index + 1}
                        </div>
                        <h3 class="font-medium text-slate-800 dark:text-white">
                          {modulo.titulo}
                        </h3>
                        {isModuloCompletado(modulo.id) && (
                          <LuCheckCircle class="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      
                      <button
                        onClick$={() => moduloActivo.value = modulo.id}
                        class="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        <LuPlay class="w-4 h-4 mr-1" />
                        Iniciar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p class="text-slate-600 dark:text-slate-400 text-center py-4">
                No hay módulos disponibles en este curso.
              </p>
            )}
          </div>
        </div>
        
        <div class="space-y-6">
          {cursoData.value.recursos.length > 0 && (
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-4">Materiales descargables</h2>
              <div class="space-y-3">
                {cursoData.value.recursos.map(recurso => (
                  <div key={recurso.id} class="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div class="flex items-center">
                      <span class="truncate">{recurso.titulo}</span>
                    </div>
                    <button
                      class="flex items-center text-blue-600 hover:text-blue-800"
                      onClick$={() => {
                        if (recurso.url_recurso) {
                          window.open(recurso.url_recurso, '_blank');
                        }
                      }}
                    >
                      <LuDownload class="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-4">Tu progreso</h2>
            
            {cursoData.value.modulos.length > 0 ? (
              <div class="space-y-4">
                <div class="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-green-500" 
                    style={{
                      width: cursoData.value.modulos.length > 0 
                        ? `${(cursoData.value.modulosCompletados.length / cursoData.value.modulos.length) * 100}%` 
                        : '0%'
                    }}
                  ></div>
                </div>
                <p class="text-center text-sm text-slate-600 dark:text-slate-400">
                  {cursoData.value.modulosCompletados.length} de {cursoData.value.modulos.length} módulos completados
                </p>
              </div>
            ) : (
              <p class="text-slate-600 dark:text-slate-400 text-center py-4">
                No hay módulos disponibles en este curso.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});