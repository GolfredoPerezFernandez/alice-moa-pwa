import { component$, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, routeAction$, Form, zod$, z, Link } from '@builder.io/qwik-city';
import { 
  LuArrowLeft, LuSave, LuPlus, LuTrash, LuChevronUp, 
  LuChevronDown, LuFileText, LuVideo, LuBrain, LuMousePointer
} from '@qwikest/icons/lucide';
import { tursoClient } from "~/utils/turso";
import { canManageCapacitacion } from "~/utils/auth";

// Interfaces
interface ModuloCurso {
  id: number;
  curso_id: number;
  titulo: string;
  tipo: 'video' | 'document' | 'quiz' | 'interactive';
  orden: number;
  url_contenido?: string;
}

// Cargador para obtener los datos del curso y sus módulos
export const useCursoModulosLoader = routeLoader$(async (requestEvent) => {
  const cursoId = requestEvent.params.id;
  
  // Verificar que el usuario tenga permisos para gestionar capacitaciones
  const puedeGestionar = await canManageCapacitacion(requestEvent);
  if (!puedeGestionar) {
    throw requestEvent.error(403, 'No tiene permisos para gestionar módulos');
  }
  
  try {
    const client = tursoClient(requestEvent);
    
    // Obtener información básica del curso
    const cursoResult = await client.execute(
      `SELECT id, titulo FROM cursos_capacitacion WHERE id = ?`,
      [cursoId]
    );
    
    if (cursoResult.rows.length === 0) {
      throw requestEvent.error(404, 'Curso no encontrado');
    }
    
    const curso = {
      id: Number(cursoResult.rows[0].id),
      titulo: String(cursoResult.rows[0].titulo)
    };
    
    // Obtener módulos del curso ordenados por orden
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
    
    // Calcular el último orden para la creación de nuevos módulos
    const ultimoOrden = modulos.length > 0 ? Math.max(...modulos.map(m => m.orden)) : 0;
    
    return {
      curso,
      modulos,
      ultimoOrden
    };
  } catch (error) {
    console.error('[CAPACITACION] Error al cargar curso y módulos:', error);
    throw requestEvent.error(500, 'Error al cargar el curso y sus módulos');
  }
});

// Acción para crear un nuevo módulo
export const useCrearModuloAction = routeAction$(
  async (data, requestEvent) => {
    const cursoId = requestEvent.params.id;
    
    // Verificar permisos
    const puedeGestionar = await canManageCapacitacion(requestEvent);
    if (!puedeGestionar) {
      return {
        success: false,
        message: "No tiene permisos para crear módulos"
      };
    }
    
    try {
      const client = tursoClient(requestEvent);
      
      // Obtener el orden más alto actual para añadir el nuevo módulo al final
      const ordenResult = await client.execute(
        `SELECT MAX(orden) as max_orden FROM modulos_curso WHERE curso_id = ?`,
        [cursoId]
      );
      
      const nuevoOrden = ordenResult.rows[0].max_orden 
        ? Number(ordenResult.rows[0].max_orden) + 1 
        : 1;
      
      // Insertar el nuevo módulo
      const insertSql = `
        INSERT INTO modulos_curso
        (curso_id, titulo, tipo, orden, url_contenido)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const result = await client.execute(insertSql, [
        cursoId,
        data.titulo,
        data.tipo,
        nuevoOrden,
        data.urlContenido || null
      ]);
      
      return {
        success: true,
        moduloId: Number(result.lastInsertRowid),
        message: "Módulo creado exitosamente",
        nuevoOrden: nuevoOrden,
        data: {
          titulo: data.titulo,
          tipo: data.tipo,
          urlContenido: data.urlContenido || undefined
        }
      };
    } catch (error) {
      console.error('[CAPACITACION] Error al crear módulo:', error);
      return {
        success: false,
        message: `Error al crear el módulo: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },
  zod$({
    titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    tipo: z.enum(["video", "document", "quiz", "interactive"]),
    urlContenido: z.string().optional()
  })
);

// Acción para eliminar un módulo
export const useEliminarModuloAction = routeAction$(
  async (data, requestEvent) => {
    const cursoId = requestEvent.params.id;
    
    // Verificar permisos
    const puedeGestionar = await canManageCapacitacion(requestEvent);
    if (!puedeGestionar) {
      return {
        success: false,
        message: "No tiene permisos para eliminar módulos"
      };
    }
    
    try {
      const client = tursoClient(requestEvent);
      
      // Verificar que el módulo pertenezca al curso actual
      const verificarSql = `
        SELECT id FROM modulos_curso 
        WHERE id = ? AND curso_id = ?
      `;
      
      const verificarResult = await client.execute(verificarSql, [
        data.moduloId,
        cursoId
      ]);
      
      if (verificarResult.rows.length === 0) {
        return {
          success: false,
          message: "El módulo no pertenece a este curso"
        };
      }
      
      // Obtener el orden del módulo a eliminar
      const ordenSql = `
        SELECT orden FROM modulos_curso WHERE id = ?
      `;
      
      const ordenResult = await client.execute(ordenSql, [data.moduloId]);
      const ordenEliminado = Number(ordenResult.rows[0].orden);
      
      // Eliminar el módulo
      const eliminarSql = `
        DELETE FROM modulos_curso WHERE id = ?
      `;
      
      await client.execute(eliminarSql, [data.moduloId]);
      
      // Reordenar los módulos restantes para mantener secuencia
      const reordenarSql = `
        UPDATE modulos_curso 
        SET orden = orden - 1 
        WHERE curso_id = ? AND orden > ?
      `;
      
      await client.execute(reordenarSql, [cursoId, ordenEliminado]);
      
      return {
        success: true,
        message: "Módulo eliminado exitosamente",
        moduloId: data.moduloId,
        ordenEliminado
      };
    } catch (error) {
      console.error('[CAPACITACION] Error al eliminar módulo:', error);
      return {
        success: false,
        message: `Error al eliminar el módulo: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },
  zod$({
    moduloId: z.number()
  })
);

// Acción para cambiar el orden de un módulo
export const useCambiarOrdenAction = routeAction$(
  async (data, requestEvent) => {
    const cursoId = requestEvent.params.id;
    
    // Verificar permisos
    const puedeGestionar = await canManageCapacitacion(requestEvent);
    if (!puedeGestionar) {
      return {
        success: false,
        message: "No tiene permisos para modificar módulos"
      };
    }
    
    try {
      const client = tursoClient(requestEvent);
      
      // Verificar que el módulo exista y pertenezca al curso
      const verificarSql = `
        SELECT id, orden FROM modulos_curso 
        WHERE id = ? AND curso_id = ?
      `;
      
      const verificarResult = await client.execute(verificarSql, [
        data.moduloId,
        cursoId
      ]);
      
      if (verificarResult.rows.length === 0) {
        return {
          success: false,
          message: "El módulo no pertenece a este curso"
        };
      }
      
      const ordenActual = Number(verificarResult.rows[0].orden);
      let nuevoOrden;
      
      // Obtener el total de módulos para validar límites
      const totalModulosSql = `
        SELECT COUNT(*) as total FROM modulos_curso WHERE curso_id = ?
      `;
      
      const totalResult = await client.execute(totalModulosSql, [cursoId]);
      const totalModulos = Number(totalResult.rows[0].total);
      
      // Calcular nuevo orden según dirección
      if (data.direccion === 'arriba') {
        nuevoOrden = Math.max(1, ordenActual - 1);
      } else {
        nuevoOrden = Math.min(totalModulos, ordenActual + 1);
      }
      
      // Si no hay cambio, salir
      if (nuevoOrden === ordenActual) {
        return {
          success: true,
          message: "No se requirió cambio de orden"
        };
      }
      
      // Mover temporalmente el módulo a un orden negativo para evitar conflictos
      await client.execute(
        `UPDATE modulos_curso SET orden = -1 WHERE id = ?`,
        [data.moduloId]
      );
      
      // Desplazar los otros módulos
      if (data.direccion === 'arriba') {
        // Mover hacia arriba: incrementar el orden del módulo que está arriba
        await client.execute(
          `UPDATE modulos_curso SET orden = orden + 1 WHERE curso_id = ? AND orden = ?`,
          [cursoId, nuevoOrden]
        );
      } else {
        // Mover hacia abajo: decrementar el orden del módulo que está abajo
        await client.execute(
          `UPDATE modulos_curso SET orden = orden - 1 WHERE curso_id = ? AND orden = ?`,
          [cursoId, nuevoOrden]
        );
      }
      
      // Restaurar el módulo movido con su nuevo orden
      await client.execute(
        `UPDATE modulos_curso SET orden = ? WHERE id = ?`,
        [nuevoOrden, data.moduloId]
      );
      
      return {
        success: true,
        message: "Orden del módulo actualizado",
        moduloId: data.moduloId,
        ordenAnterior: ordenActual,
        ordenNuevo: nuevoOrden,
        direccion: data.direccion
      };
    } catch (error) {
      console.error('[CAPACITACION] Error al cambiar orden del módulo:', error);
      return {
        success: false,
        message: `Error al cambiar orden: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },
  zod$({
    moduloId: z.number(),
    direccion: z.enum(['arriba', 'abajo'])
  })
);

export default component$(() => {
  const loaderData = useCursoModulosLoader();
  const crearModuloAction = useCrearModuloAction();
  const eliminarModuloAction = useEliminarModuloAction();
  const cambiarOrdenAction = useCambiarOrdenAction();
  
  // Estado local para gestionar los módulos con actualizaciones optimistas
  const modulosState = useStore<{
    curso: {id: number, titulo: string},
    modulos: ModuloCurso[],
    ultimoOrden: number
  }>({
    curso: loaderData.value.curso,
    modulos: [...loaderData.value.modulos],
    ultimoOrden: loaderData.value.ultimoOrden
  });
  
  // Estado local para formulario de nuevo módulo
  const nuevoModulo = useStore({
    titulo: '',
    tipo: 'video' as 'video' | 'document' | 'quiz' | 'interactive',
    urlContenido: ''
  });
  
  // Señal para indicar cuando el formulario se está enviando
  const isSubmitting = useSignal(false);
  
  // Actualización optimista después de crear un módulo
  useVisibleTask$(({ track }) => {
    track(() => crearModuloAction.value);
    
    if (crearModuloAction.value?.success) {
      const { moduloId, nuevoOrden, data } = crearModuloAction.value;
      
      if (moduloId) {
        // Agregar el nuevo módulo a la lista local
        const nuevoModuloItem: ModuloCurso = {
          id: moduloId,
          curso_id: modulosState.curso.id,
          titulo: data.titulo,
          tipo: data.tipo as 'video' | 'document' | 'quiz' | 'interactive',
          orden: nuevoOrden,
          url_contenido: data.urlContenido
        };
        
        modulosState.modulos = [...modulosState.modulos, nuevoModuloItem];
        modulosState.ultimoOrden = nuevoOrden;
      }
      
      // Limpiar formulario después de éxito
      nuevoModulo.titulo = '';
      nuevoModulo.tipo = 'video';
      nuevoModulo.urlContenido = '';
    }
    
    if (crearModuloAction.value) {
      isSubmitting.value = false;
    }
  });
  
  // Actualización optimista después de eliminar un módulo
  useVisibleTask$(({ track }) => {
    track(() => eliminarModuloAction.value);
    
    if (eliminarModuloAction.value?.success) {
      const { moduloId, ordenEliminado } = eliminarModuloAction.value;
      
      if (moduloId) {
        // Filtrar el módulo eliminado
        modulosState.modulos = modulosState.modulos.filter(m => m.id !== moduloId);
        
        // Actualizar órdenes
        modulosState.modulos = modulosState.modulos.map(m => {
          if (m.orden > ordenEliminado) {
            return { ...m, orden: m.orden - 1 };
          }
          return m;
        });
        
        // Actualizar último orden
        modulosState.ultimoOrden = modulosState.modulos.length > 0 
          ? Math.max(...modulosState.modulos.map(m => m.orden)) 
          : 0;
      }
    }
    
    // Desactivar el estado de envío
    isSubmitting.value = false;
  });
  
  // Actualización optimista después de cambiar el orden
  useVisibleTask$(({ track }) => {
    track(() => cambiarOrdenAction.value);
    
    if (cambiarOrdenAction.value?.success) {
      const { moduloId, ordenAnterior, ordenNuevo, direccion } = cambiarOrdenAction.value;
      
      if (moduloId && ordenNuevo && ordenNuevo !== ordenAnterior) {
        // Encontrar los módulos involucrados
        const moduloAMover = modulosState.modulos.find(m => m.id === moduloId);
        const moduloDesplazado = modulosState.modulos.find(m => m.orden === ordenNuevo);
        
        // Actualizar órdenes
        modulosState.modulos = modulosState.modulos.map(m => {
          if (m.id === moduloId) {
            return { ...m, orden: ordenNuevo };
          } else if (moduloDesplazado && m.id === moduloDesplazado.id) {
            return { ...m, orden: ordenAnterior };
          }
          return m;
        });
        
        // Reordenar array por orden
        modulosState.modulos.sort((a, b) => a.orden - b.orden);
      }
    }
    
    // Desactivar el estado de envío
    isSubmitting.value = false;
  });
  
  // Obtener el ícono para el tipo de módulo
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return <LuVideo class="w-5 h-5" />;
      case 'document':
        return <LuFileText class="w-5 h-5" />;
      case 'quiz':
        return <LuBrain class="w-5 h-5" />;
      case 'interactive':
        return <LuMousePointer class="w-5 h-5" />;
      default:
        return <LuFileText class="w-5 h-5" />;
    }
  };
  
  // Obtener texto legible para el tipo de módulo
  const getTipoText = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return 'Video';
      case 'document':
        return 'Documento';
      case 'quiz':
        return 'Cuestionario';
      case 'interactive':
        return 'Interactivo';
      default:
        return tipo;
    }
  };
  
  return (
    <div class="gestionar-modulos-container">
      <header class="mb-8">
        <div class="flex items-center mb-4">
          <Link href={`/capacitacion/curso/${modulosState.curso.id}`} class="text-blue-600 hover:text-blue-800 flex items-center">
            <LuArrowLeft class="w-5 h-5 mr-1" />
            Volver al curso
          </Link>
        </div>
        <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">
          Gestionar módulos
        </h1>
        <p class="text-slate-600 dark:text-slate-300 mb-2">
          Curso: <span class="font-semibold">{modulosState.curso.titulo}</span>
        </p>
      </header>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Listado de módulos existentes */}
        <div>
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-4">Módulos del curso</h2>
            
            {modulosState.modulos.length > 0 ? (
              <div class="space-y-4">
                {modulosState.modulos.map((modulo) => (
                  <div 
                    key={modulo.id}
                    class="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                          {modulo.orden}
                        </div>
                        <div class="flex flex-col">
                          <h3 class="font-medium text-slate-800 dark:text-white">
                            {modulo.titulo}
                          </h3>
                          <div class="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                            {getTipoIcon(modulo.tipo)}
                            <span class="ml-1">{getTipoText(modulo.tipo)}</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-1">
                        <Form action={cambiarOrdenAction}>
                          <input type="hidden" name="moduloId" value={modulo.id} />
                          <input type="hidden" name="direccion" value="arriba" />
                          <button
                            type="submit"
                            class="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 rounded disabled:opacity-50"
                            disabled={modulo.orden === 1 || isSubmitting.value}
                            title="Mover hacia arriba"
                            onClick$={() => isSubmitting.value = true}
                          >
                            <LuChevronUp class="w-5 h-5" />
                          </button>
                        </Form>
                        
                        <Form action={cambiarOrdenAction}>
                          <input type="hidden" name="moduloId" value={modulo.id} />
                          <input type="hidden" name="direccion" value="abajo" />
                          <button
                            type="submit"
                            class="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 rounded disabled:opacity-50"
                            disabled={modulo.orden === modulosState.modulos.length || isSubmitting.value}
                            title="Mover hacia abajo"
                            onClick$={() => isSubmitting.value = true}
                          >
                            <LuChevronDown class="w-5 h-5" />
                          </button>
                        </Form>
                        
                        <Form action={eliminarModuloAction}>
                          <input type="hidden" name="moduloId" value={modulo.id} />
                          <button
                            type="submit"
                            class="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded"
                            title="Eliminar módulo"
                            disabled={isSubmitting.value}
                            onClick$={() => isSubmitting.value = true}
                          >
                            <LuTrash class="w-5 h-5" />
                          </button>
                        </Form>
                      </div>
                    </div>
                    
                    {modulo.url_contenido && (
                      <div class="mt-2 text-sm text-slate-600 dark:text-slate-400 break-all">
                        <span class="font-medium">URL:</span> {modulo.url_contenido}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p class="text-slate-600 dark:text-slate-400 text-center py-4 italic">
                Este curso no tiene módulos. Añade el primer módulo usando el formulario.
              </p>
            )}
            
            {eliminarModuloAction.value?.success && (
              <div class="mt-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-3 py-2 rounded-md text-sm">
                {eliminarModuloAction.value.message}
              </div>
            )}
            
            {eliminarModuloAction.value?.success === false && (
              <div class="mt-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-sm">
                {eliminarModuloAction.value.message}
              </div>
            )}
            
            {cambiarOrdenAction.value?.success === false && (
              <div class="mt-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-sm">
                {cambiarOrdenAction.value.message}
              </div>
            )}
          </div>
        </div>
        
        {/* Formulario para añadir nuevo módulo */}
        <div>
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div class="flex items-center mb-4">
              <h2 class="text-xl font-bold text-slate-800 dark:text-white">Añadir nuevo módulo</h2>
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center ml-2">
                <LuPlus class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            {crearModuloAction.value?.success && (
              <div class="mb-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-3 py-2 rounded-md text-sm">
                {crearModuloAction.value.message}
              </div>
            )}
            
            {crearModuloAction.value?.success === false && (
              <div class="mb-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-md text-sm">
                {crearModuloAction.value.message}
              </div>
            )}
            
            <Form 
              action={crearModuloAction}
              class="space-y-4"
              onSubmit$={() => {
                isSubmitting.value = true;
              }}
            >
              <div>
                <label for="titulo" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Título del módulo *
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  required
                  value={nuevoModulo.titulo}
                  onInput$={(event) => nuevoModulo.titulo = (event.target as HTMLInputElement).value}
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Ej. Introducción al curso"
                />
                {crearModuloAction.value?.fieldErrors?.titulo && (
                  <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {crearModuloAction.value.fieldErrors.titulo}
                  </p>
                )}
              </div>
              
              <div>
                <label for="tipo" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de módulo *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  required
                  value={nuevoModulo.tipo}
                  onChange$={(event) => nuevoModulo.tipo = (event.target as HTMLSelectElement).value as any}
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="video">Video</option>
                  <option value="document">Documento</option>
                  <option value="quiz">Cuestionario</option>
                  <option value="interactive">Interactivo</option>
                </select>
                {crearModuloAction.value?.fieldErrors?.tipo && (
                  <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {crearModuloAction.value.fieldErrors.tipo}
                  </p>
                )}
              </div>
              
              <div>
                <label for="urlContenido" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  URL del contenido (opcional)
                </label>
                <input
                  id="urlContenido"
                  name="urlContenido"
                  type="text"
                  value={nuevoModulo.urlContenido}
                  onInput$={(event) => nuevoModulo.urlContenido = (event.target as HTMLInputElement).value}
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="https://ejemplo.com/contenido"
                />
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  URL al video, documento o contenido interactivo según el tipo seleccionado
                </p>
              </div>
              
              <div class="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting.value}
                  class="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting.value ? (
                    <>
                      <div class="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <LuSave class="w-5 h-5 mr-2" />
                      <span>Guardar módulo</span>
                    </>
                  )}
                </button>
              </div>
            </Form>
          </div>
          
          <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
            <h3 class="font-medium text-blue-800 dark:text-blue-300 mb-1">Información sobre módulos</h3>
            <ul class="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>Los módulos se ordenan automáticamente según su secuencia</li>
              <li>Puedes cambiar el orden usando las flechas arriba/abajo</li>
              <li>Al eliminar un módulo, los siguientes se reordenan automáticamente</li>
              <li>El progreso de los usuarios es registrado por cada módulo completado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});