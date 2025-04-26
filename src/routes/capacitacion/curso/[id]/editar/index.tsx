import { component$, useSignal, $, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, routeAction$, Form, zod$, z, useNavigate, Link } from '@builder.io/qwik-city';
import { LuSave, LuArrowLeft } from '@qwikest/icons/lucide';
import { tursoClient } from "~/utils/turso";
import { getUserId, canManageCapacitacion } from "~/utils/auth";

// Cargador para obtener datos del curso existente
export const useCursoLoader = routeLoader$(async (requestEvent) => {
  const cursoId = requestEvent.params.id;
  
  // Verificar si el usuario puede gestionar capacitaciones
  const puedeGestionar = await canManageCapacitacion(requestEvent);
  if (!puedeGestionar) {
    throw requestEvent.error(403, 'No tiene permisos para editar cursos');
  }
  
  try {
    const client = tursoClient(requestEvent);
    
    // Obtener detalles del curso
    const cursoResult = await client.execute(
      `SELECT * FROM cursos_capacitacion WHERE id = ?`,
      [cursoId]
    );
    
    if (cursoResult.rows.length === 0) {
      throw requestEvent.error(404, 'Curso no encontrado');
    }
    
    return {
      id: Number(cursoResult.rows[0].id),
      titulo: String(cursoResult.rows[0].titulo),
      descripcion: String(cursoResult.rows[0].descripcion),
      descripcionCompleta: String(cursoResult.rows[0].descripcion_completa || ''),
      categoria: String(cursoResult.rows[0].categoria),
      instructor: cursoResult.rows[0].instructor ? String(cursoResult.rows[0].instructor) : '',
      duracion: cursoResult.rows[0].duracion ? String(cursoResult.rows[0].duracion) : '',
      imagenColor: String(cursoResult.rows[0].imagen_color || 'bg-red-100 dark:bg-red-900/20')
    };
  } catch (error) {
    console.error('[CAPACITACION] Error al cargar curso para editar:', error);
    throw requestEvent.error(500, 'Error al cargar el curso');
  }
});

// Acción para actualizar el curso
export const useEditarCursoAction = routeAction$(
  async (data, requestEvent) => {
    const cursoId = requestEvent.params.id;
    
    // Verificar si el usuario puede gestionar capacitaciones
    const puedeGestionar = await canManageCapacitacion(requestEvent);
    if (!puedeGestionar) {
      return {
        success: false,
        message: "No tiene permisos para editar cursos"
      };
    }

    try {
      const client = tursoClient(requestEvent);
      
      // Actualizar el curso con SQL parametrizado
      const sql = `
        UPDATE cursos_capacitacion
        SET titulo = ?, 
            descripcion = ?, 
            descripcion_completa = ?, 
            categoria = ?, 
            instructor = ?, 
            duracion = ?, 
            imagen_color = ?
        WHERE id = ?
      `;
      
      const args = [
        data.titulo,
        data.descripcion,
        data.descripcionCompleta,
        data.categoria,
        data.instructor || null,
        data.duracion || null,
        data.imagenColor,
        cursoId
      ];
      
      await client.execute(sql, args);
      
      return {
        success: true,
        cursoId: Number(cursoId),
        message: "Curso actualizado exitosamente"
      };
    } catch (error) {
      console.error('[CAPACITACION] Error al actualizar curso:', error);
      return {
        success: false,
        message: `Error al actualizar el curso: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },
  zod$({
    titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
    descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
    descripcionCompleta: z.string().min(20, "La descripción completa debe ser más detallada"),
    categoria: z.enum(["seguridad", "derechos", "prevencion", "igualdad", "salud"]),
    instructor: z.string().optional(),
    duracion: z.string().optional(),
    imagenColor: z.string().default("bg-red-100 dark:bg-red-900/20")
  })
);

export default component$(() => {
  const cursoData = useCursoLoader();
  const editarCursoAction = useEditarCursoAction();
  const navigate = useNavigate();
  
  // Estado del formulario inicializado con los datos del curso
  const formState = useStore({
    titulo: cursoData.value.titulo,
    descripcion: cursoData.value.descripcion,
    descripcionCompleta: cursoData.value.descripcionCompleta,
    categoria: cursoData.value.categoria,
    instructor: cursoData.value.instructor,
    duracion: cursoData.value.duracion,
    imagenColor: cursoData.value.imagenColor
  });
  
  // Colores disponibles para el ícono del curso
  const coloresDisponibles = [
    { id: 'bg-red-100 dark:bg-red-900/20', nombre: 'Rojo' },
    { id: 'bg-blue-100 dark:bg-blue-900/20', nombre: 'Azul' },
    { id: 'bg-green-100 dark:bg-green-900/20', nombre: 'Verde' },
    { id: 'bg-yellow-100 dark:bg-yellow-900/20', nombre: 'Amarillo' },
    { id: 'bg-purple-100 dark:bg-purple-900/20', nombre: 'Morado' },
    { id: 'bg-indigo-100 dark:bg-indigo-900/20', nombre: 'Índigo' },
    { id: 'bg-pink-100 dark:bg-pink-900/20', nombre: 'Rosa' },
  ];
  
  // Categorías disponibles
  const categorias = [
    { id: 'seguridad', nombre: 'Seguridad y Salud en el Trabajo' },
    { id: 'derechos', nombre: 'Derechos Laborales Básicos' },
    { id: 'prevencion', nombre: 'Prevención del Acoso Laboral' },
    { id: 'igualdad', nombre: 'Igualdad Salarial y No Discriminación' },
    { id: 'salud', nombre: 'Gestión del Estrés y Salud Mental' },
  ];
  
  // Estado para indicar cuando se está enviando el formulario
  const isSubmitting = useSignal(false);
  
  // Navegar a la página del curso después de editarlo
  useVisibleTask$(({ track }) => {
    // Rastrear cambios en el resultado de la acción
    track(() => editarCursoAction.value);
    
    // Si se ha completado con éxito, redirigir
    if (editarCursoAction.value?.success && editarCursoAction.value.cursoId) {
      navigate(`/capacitacion/curso/${editarCursoAction.value.cursoId}`);
    }
    
    // Si hay algún resultado (éxito o error), ya no estamos enviando
    if (editarCursoAction.value) {
      isSubmitting.value = false;
    }
  });
  
  return (
    <div class="editar-curso-container">
      <header class="mb-8">
        <div class="flex items-center mb-4">
          <Link href={`/capacitacion/curso/${cursoData.value.id}`} class="text-blue-600 hover:text-blue-800 flex items-center">
            <LuArrowLeft class="w-5 h-5 mr-1" />
            Volver al curso
          </Link>
        </div>
        <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">
          Editar curso de capacitación
        </h1>
        <p class="text-slate-600 dark:text-slate-300 mb-6">
          Actualiza la información del curso "{cursoData.value.titulo}"
        </p>
      </header>
      
      {editarCursoAction.value?.success && (
        <div class="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md mb-6">
          <p>{editarCursoAction.value.message}</p>
          <p class="text-sm mt-1">Redirigiendo al curso actualizado...</p>
        </div>
      )}
      
      {editarCursoAction.value?.success === false && (
        <div class="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6">
          <p>{editarCursoAction.value.message}</p>
        </div>
      )}
      
      <Form
        action={editarCursoAction}
        class="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 border border-slate-200 dark:border-slate-700"
        onSubmit$={() => {
          isSubmitting.value = true;
        }}
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="col-span-1 md:col-span-2">
            <label for="titulo" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Título del curso *
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              value={formState.titulo}
              onInput$={(event) => formState.titulo = (event.target as HTMLInputElement).value}
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="Ej. Seguridad y Salud en el Trabajo"
            />
            {editarCursoAction.value?.fieldErrors?.titulo && (
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                {editarCursoAction.value.fieldErrors.titulo}
              </p>
            )}
          </div>
          
          <div class="col-span-1 md:col-span-2">
            <label for="descripcion" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descripción breve *
            </label>
            <input
              id="descripcion"
              name="descripcion"
              type="text"
              required
              value={formState.descripcion}
              onInput$={(event) => formState.descripcion = (event.target as HTMLInputElement).value}
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="Breve descripción que aparecerá en la lista de cursos"
            />
            {editarCursoAction.value?.fieldErrors?.descripcion && (
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                {editarCursoAction.value.fieldErrors.descripcion}
              </p>
            )}
          </div>
          
          <div class="col-span-1 md:col-span-2">
            <label for="descripcionCompleta" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descripción completa *
            </label>
            <textarea
              id="descripcionCompleta"
              name="descripcionCompleta"
              required
              value={formState.descripcionCompleta}
              onInput$={(event) => formState.descripcionCompleta = (event.target as HTMLTextAreaElement).value}
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-32"
              placeholder="Descripción detallada del curso, objetivos, a quién va dirigido, etc."
            ></textarea>
            {editarCursoAction.value?.fieldErrors?.descripcionCompleta && (
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                {editarCursoAction.value.fieldErrors.descripcionCompleta}
              </p>
            )}
          </div>
          
          <div>
            <label for="categoria" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Categoría *
            </label>
            <select
              id="categoria"
              name="categoria"
              required
              value={formState.categoria}
              onChange$={(event) => formState.categoria = (event.target as HTMLSelectElement).value}
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {editarCursoAction.value?.fieldErrors?.categoria && (
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                {editarCursoAction.value.fieldErrors.categoria}
              </p>
            )}
          </div>
          
          <div>
            <label for="imagenColor" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Color de fondo
            </label>
            <select
              id="imagenColor"
              name="imagenColor"
              value={formState.imagenColor}
              onChange$={(event) => formState.imagenColor = (event.target as HTMLSelectElement).value}
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {coloresDisponibles.map(color => (
                <option key={color.id} value={color.id}>
                  {color.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label for="instructor" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Instructor (opcional)
            </label>
            <input
              id="instructor"
              name="instructor"
              type="text"
              value={formState.instructor}
              onInput$={(event) => formState.instructor = (event.target as HTMLInputElement).value}
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="Nombre del instructor"
            />
          </div>
          
          <div>
            <label for="duracion" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Duración (opcional)
            </label>
            <input
              id="duracion"
              name="duracion"
              type="text"
              value={formState.duracion}
              onInput$={(event) => formState.duracion = (event.target as HTMLInputElement).value}
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="Ej. 2 horas, 3 semanas, etc."
            />
          </div>
          
          <div class="col-span-1 md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting.value}
              class="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting.value ? (
                <>
                  <div class="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <LuSave class="w-5 h-5 mr-2" />
                  <span>Actualizar curso</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
});