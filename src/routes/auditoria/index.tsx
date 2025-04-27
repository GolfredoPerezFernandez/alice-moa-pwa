import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { routeAction$, routeLoader$, Form, useNavigate } from '@builder.io/qwik-city';
import { LuUpload, LuFileText, LuLoader, LuCheckCircle, LuAlertCircle, LuList } from '@qwikest/icons/lucide';
import { getUserId } from '~/utils/auth';
import { tursoClient } from '~/utils/turso';
import { analyzePDF, type PDFAnalysisResult } from '~/utils/pdf-processor';

// Cargador para obtener las auditorías anteriores
export const useAuditoriasList = routeLoader$(async (requestEvent) => {
  const userId = getUserId(requestEvent);
  if (!userId) {
    return [];
  }

  const client = tursoClient(requestEvent);
  
  // Crear tabla si no existe
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS pdf_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      upload_date TEXT NOT NULL,
      analysis_json TEXT NOT NULL
    )`
  });

  // Obtener auditorías para este usuario
  const result = await client.execute({
    sql: `SELECT id, file_name, file_size, upload_date FROM pdf_audits
          WHERE user_id = ? ORDER BY upload_date DESC LIMIT 10`,
    args: [userId]
  });

  return result.rows;
});

// Acción para guardar el archivo y procesar su análisis
export const useProcessPDF = routeAction$(async (data, requestEvent) => {
  const userId = getUserId(requestEvent);
  if (!userId) {
    return {
      success: false,
      error: 'No se ha iniciado sesión'
    };
  }

  try {
    // Obtenemos la información del archivo simulado
    const fileName = data.fileName as string;
    
    if (!fileName || !fileName.endsWith('.pdf')) {
      return {
        success: false,
        error: 'Por favor, sube un archivo PDF válido'
      };
    }

    // Simular un archivo de ejemplo para nuestro procesador
    const file = new File(
      [new ArrayBuffer(1024)], // Contenido simulado
      fileName,
      { type: 'application/pdf' }
    );
    
    // Analizar el PDF utilizando nuestro procesador
    const analysis = await analyzePDF(file);
    
    // Obtener información básica del archivo
    const fileSize = file.size;
    const uploadDate = new Date().toISOString();

    // Guardar el registro en la base de datos
    const client = tursoClient(requestEvent);
    
    await client.execute({
      sql: `INSERT INTO pdf_audits (user_id, file_name, file_size, upload_date, analysis_json)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        userId,
        fileName,
        fileSize,
        uploadDate,
        JSON.stringify(analysis)
      ]
    });

    return {
      success: true,
      fileName,
      fileSize,
      uploadDate,
      analysis
    };
  } catch (error) {
    console.error('Error al procesar el PDF:', error);
    return {
      success: false,
      error: typeof error === 'object' && error !== null && 'message' in error
        ? (error as Error).message
        : 'Error al procesar el archivo. Por favor, inténtalo de nuevo.'
    };
  }
});

// Acción para ver el detalle de una auditoría anterior
export const useGetAuditDetail = routeAction$(async ({ auditId }, requestEvent) => {
  const userId = getUserId(requestEvent);
  if (!userId || !auditId) {
    return {
      success: false,
      error: 'No se ha iniciado sesión o ID de auditoría inválido'
    };
  }

  try {
    const client = tursoClient(requestEvent);
    const result = await client.execute(
      `SELECT * FROM pdf_audits WHERE id = ? AND user_id = ?`,
      [Number(auditId), userId]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Auditoría no encontrada'
      };
    }

    const audit = result.rows[0];
    const analysis = JSON.parse(audit.analysis_json as string) as PDFAnalysisResult;

    return {
      success: true,
      fileName: audit.file_name,
      fileSize: audit.file_size,
      uploadDate: audit.upload_date,
      analysis
    };
  } catch (error) {
    console.error('Error al obtener el detalle de la auditoría:', error);
    return {
      success: false,
      error: 'Error al obtener el detalle de la auditoría'
    };
  }
});

export default component$(() => {
  const auditoriasList = useAuditoriasList();
  const processPDFAction = useProcessPDF();
  const getAuditDetailAction = useGetAuditDetail();
  const navigate = useNavigate();
  
  const selectedFileName = useSignal('');
  const isFileSelected = useSignal(false);
  const isUploading = useSignal(false);
  const showPreviousAudits = useSignal(false);
  const selectedAuditId = useSignal<number | null>(null);
  
  // Reiniciar el estado cuando cambian los resultados
  useVisibleTask$(({ track }) => {
    track(() => processPDFAction.value);
    if (processPDFAction.value?.success) {
      isUploading.value = false;
      // No reiniciamos isFileSelected para que el usuario pueda ver el resultado
    }
  });

  // Cargar detalle de una auditoría existente
  const viewAuditDetail = $((id: number) => {
    selectedAuditId.value = id;
    getAuditDetailAction.submit({ auditId: id });
  });

  // Manejar el cambio de archivo
  const handleFileChange = $((event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedFileName.value = input.files[0].name;
      isFileSelected.value = true;
    } else {
      selectedFileName.value = '';
      isFileSelected.value = false;
    }
  });

  return (
    <div class="space-y-8">
      <section class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Cargar documento para auditoría
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Sube un documento PDF para que nuestro sistema lo analice y detecte posibles problemas o áreas de mejora.
        </p>

        {/* Lista de auditorías previas */}
        <div class="mb-8">
          <button
            onClick$={() => { showPreviousAudits.value = !showPreviousAudits.value }}
            class="flex items-center mb-4 text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LuList class="w-4 h-4 mr-1.5" />
            {showPreviousAudits.value ? 'Ocultar auditorías previas' : 'Mostrar auditorías previas'}
          </button>
          
          {showPreviousAudits.value && (
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h3 class="text-md font-semibold text-gray-800 dark:text-white mb-3">
                Auditorías previas
              </h3>
              
              {auditoriasList.value.length > 0 ? (
                <div class="space-y-2">
                  {auditoriasList.value.map((audit: any) => (
                    <div key={audit.id} class="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div>
                        <p class="text-sm font-medium text-gray-800 dark:text-white">
                          {audit.file_name}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(audit.upload_date).toLocaleString()} · {((audit.file_size || 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick$={() => viewAuditDetail(audit.id as number)}
                        class="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Ver detalles
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  No hay auditorías previas
                </p>
              )}
            </div>
          )}
        </div>
      
        <Form action={processPDFAction}>
          <div class="space-y-6">
            {/* File Upload Area */}
            <div class="flex justify-center">
              <div class="w-full max-w-lg">
                <label
                  for="pdfFileInput"
                  class={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer
                  ${isFileSelected.value
                    ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30'
                    : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/30'}`}
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    {isFileSelected.value ? (
                      <>
                        <LuCheckCircle class="w-10 h-10 mb-3 text-green-500 dark:text-green-400" />
                        <p class="mb-2 text-sm text-gray-700 dark:text-gray-300">
                          <span class="font-semibold">{selectedFileName.value}</span>
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Haz clic para cambiar el archivo</p>
                      </>
                    ) : (
                      <>
                        <LuUpload class="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" />
                        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                          <span class="font-semibold">Haz clic para subir</span> o arrastra y suelta
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. 10MB)</p>
                      </>
                    )}
                  </div>
                  {/* Usamos un input para seleccionar el archivo pero no para enviarlo */}
                  <input
                    id="pdfFileInput"
                    type="file"
                    accept=".pdf"
                    class="hidden"
                    onChange$={handleFileChange}
                    required
                  />
                </label>
                {/* Campo oculto para enviar el nombre del archivo */}
                <input type="hidden" name="fileName" value={selectedFileName.value} />
              </div>
            </div>

            {/* Submit Button */}
            <div class="flex justify-center">
              <button
                type="submit"
                class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={!isFileSelected.value || isUploading.value}
                onClick$={() => { isUploading.value = true }}
              >
                {isUploading.value ? (
                  <>
                    <LuLoader class="animate-spin w-5 h-5 mr-2" />
                    Analizando documento...
                  </>
                ) : (
                  <>
                    <LuFileText class="w-5 h-5 mr-2" />
                    Analizar documento
                  </>
                )}
              </button>
            </div>
          </div>
        </Form>
      </section>

      {/* Results Section */}
      {processPDFAction.value && (
        <section class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow animate-[fadeIn_0.5s]">
          {processPDFAction.value.success ? (
            <div class="space-y-4">
              <div class="flex items-start">
                <LuCheckCircle class="w-6 h-6 text-green-500 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
                    Documento analizado con éxito
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    {processPDFAction.value?.fileName} ({((processPDFAction.value?.fileSize || 0) / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              </div>

              <div class="mt-8 space-y-6">
                <div>
                  <h4 class="text-md font-semibold text-gray-800 dark:text-white mb-2">
                    Información del documento
                  </h4>
                  <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Tipo de documento:</p>
                        <p class="text-sm font-medium text-gray-800 dark:text-white">
                          {processPDFAction.value?.analysis?.documentType || 'No disponible'}
                        </p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Validez legal:</p>
                        <div class="flex items-center">
                          {processPDFAction.value?.analysis?.validityCheck ? (
                            <div class="flex items-center text-green-600 dark:text-green-400">
                              <LuCheckCircle class="w-4 h-4 mr-1" />
                              <span class="text-sm font-medium">Válido</span>
                            </div>
                          ) : (
                            <div class="flex items-center text-red-600 dark:text-red-400">
                              <LuAlertCircle class="w-4 h-4 mr-1" />
                              <span class="text-sm font-medium">Inválido</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Índice de confianza:</p>
                        <div class="flex items-center">
                          <div class="bg-gray-200 dark:bg-gray-600 w-32 h-2 rounded-full overflow-hidden mr-2">
                            <div
                              class="bg-red-600 h-full rounded-full"
                              style={`width: ${(processPDFAction.value?.analysis?.confidenceScore || 0) * 100}%`}
                            ></div>
                          </div>
                          <span class="text-sm font-medium text-gray-800 dark:text-white">
                            {((processPDFAction.value?.analysis?.confidenceScore || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="text-md font-semibold text-gray-800 dark:text-white mb-2">
                    Términos legales identificados
                  </h4>
                  <ul class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                    {processPDFAction.value?.analysis?.legalTerms?.map((term: string, index: number) => (
                      <li key={index} class="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                        <span class="inline-block w-5 text-center mr-2">•</span>
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 class="text-md font-semibold text-gray-800 dark:text-white mb-2">
                    Problemas potenciales
                  </h4>
                  <ul class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                    {processPDFAction.value?.analysis?.potentialIssues?.map((issue: string, index: number) => (
                      <li key={index} class="text-sm text-red-600 dark:text-red-400 flex items-start">
                        <LuAlertCircle class="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 class="text-md font-semibold text-gray-800 dark:text-white mb-2">
                    Acciones recomendadas
                  </h4>
                  <ul class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                    {processPDFAction.value?.analysis?.recommendedActions?.map((action: string, index: number) => (
                      <li key={index} class="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                        <span class="inline-block w-5 text-center mr-2">{index + 1}.</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div class="flex items-start">
              <LuAlertCircle class="w-6 h-6 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
                  Error al analizar el documento
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  {processPDFAction.value.error || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Note about LangChain WebPDFLoader */}
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300">
        <p class="mb-2 font-semibold">Nota sobre la integración de LangChain:</p>
        <p>
          Esta funcionalidad está simulando la integración con LangChain WebPDFLoader 
          para el análisis de documentos PDF. En una implementación completa, 
          los documentos se procesarían con la biblioteca LangChain y se analizarían con 
          un modelo de IA para proporcionar insights detallados sobre los documentos legales.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
});