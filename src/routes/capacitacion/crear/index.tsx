import { component$, useSignal, $, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { routeAction$, Form, zod$, z, useNavigate } from '@builder.io/qwik-city';
import { LuSave, LuArrowLeft } from '@qwikest/icons/lucide';
import { tursoClient } from "~/utils/turso";
import { getUserId } from "~/utils/auth";

// Definición del formulario con validación
export const useCrearCursoAction = routeAction$(
  async (data, requestEvent) => {
    const userId = getUserId(requestEvent);
    if (!userId) {
      return {
        success: false,
        message: "Debe iniciar sesión para crear un curso"
      };
    }

    try {
      const client = tursoClient(requestEvent);
      
      // Insertar el nuevo curso con SQL parametrizado
      const sql = `
        INSERT INTO cursos_capacitacion
        (titulo, descripcion, descripcion_completa, categoria, instructor, duracion, imagen_color, creado_por)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const args = [
        data.titulo,
        data.descripcion,
        data.descripcionCompleta,
        data.categoria,
        data.instructor || null,
        data.duracion || null,
        data.imagenColor,
        userId
      ];
      
      const result = await client.execute(sql, args);
      
      // Obtener el ID del curso recién creado
      if (result.lastInsertRowid) {
        return {
          success: true,
          cursoId: Number(result.lastInsertRowid),
          message: "Curso creado exitosamente"
        };
      } else {
        throw new Error("No se pudo obtener el ID del curso creado");
      }
    } catch (error) {
      console.error('[CAPACITACION] Error al crear curso:', error);
      return {
        success: false,
        message: `Error al crear el curso: ${error instanceof Error ? error.message : String(error)}`
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
  const crearCursoAction = useCrearCursoAction();
  const navigate = useNavigate();
  
  // Estado del formulario
  const formState = useStore({
    titulo: '',
    descripcion: '',
    descripcionCompleta: '',
    categoria: 'seguridad',
    instructor: '',
    duracion: '',
    imagenColor: 'bg-red-100 dark:bg-red-900/20'
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
  
  // Navegar a la página del curso después de crearlo
  useVisibleTask$(({ track }) => {
    // Rastrear cambios en el resultado de la acción
    track(() => crearCursoAction.value);
    
    // Si se ha completado con éxito, redirigir
    if (crearCursoAction.value?.success && crearCursoAction.value.cursoId) {
      navigate(`/capacitacion/curso/${crearCursoAction.value.cursoId}`);
    }
    
    // Si hay algún resultado (éxito o error), ya no estamos enviando
    if (crearCursoAction.value) {
      isSubmitting.value = false;
    }
  });
  
  return (
    <div class="crear-curso-container">
      <header class="mb-8">
        <div class="flex items-center mb-4">
          <a href="/capacitacion" class="text-blue-600 hover:text-blue-800 flex items-center">
            <LuArrowLeft class="w-5 h-5 mr-1" />
            Volver a capacitaciones
          </a>
        </div>
        <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">
          Crear nuevo curso de capacitación
        </h1>
        <p class="text-slate-600 dark:text-slate-300 mb-6">
          Completa el formulario para crear un nuevo curso que estará disponible para todos los usuarios
        </p>
      </header>
      
      {crearCursoAction.value?.success && (
        <div class="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md mb-6">
          <p>{crearCursoAction.value.message}</p>
          <p class="text-sm mt-1">Redirigiendo al curso creado...</p>
        </div>
      )}
      
      {crearCursoAction.value?.success === false && (
        <div class="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6">
          <p>{crearCursoAction.value.message}</p>
        </div>
      )}
      
      <Form
        action={crearCursoAction}
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
            {crearCursoAction.value?.fieldErrors?.titulo && (
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                {crearCursoAction.value.fieldErrors.titulo}
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
            {crearCursoAction.value?.fieldErrors?.descripcion && (
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                {crearCursoAction.value.fieldErrors.descripcion}
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
            {crearCursoAction.value?.fieldErrors?.descripcionCompleta && (
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                {crearCursoAction.value.fieldErrors.descripcionCompleta}
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
            {crearCursoAction.value?.fieldErrors?.categoria && (
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                {crearCursoAction.value.fieldErrors.categoria}
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
                  <span>Guardar curso</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
});