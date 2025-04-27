import { component$, useSignal, useStore, useStylesScoped$, useVisibleTask$, $ } from '@builder.io/qwik';
import { routeLoader$, server$, Form, routeAction$, zod$, z, Link } from '@builder.io/qwik-city';
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { LuSend, LuDownload, LuCopy, LuRefreshCcw } from '@qwikest/icons/lucide';
import { useAuthCheck } from '../layout';
import { tursoClient } from '~/utils/turso';

// Interfaces
interface DocumentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface DocumentSession {
  messages: DocumentMessage[];
  title: string;
  documentType: string;
}

interface TemplatePrompt {
  title: string;
  prompt: string;
  documentType: string;
  categoria: string;
}

// Plantillas predefinidas para diferentes tipos de documentos
const plantillasDespacho: TemplatePrompt[] = [
  {
    title: 'Contrato Indefinido',
    prompt: 'Crea un contrato de trabajo indefinido entre la empresa [nombre de empresa] y el trabajador [nombre del trabajador] para el puesto de [puesto] con salario de [salario] euros mensuales.',
    documentType: 'contrato',
    categoria: 'contratos-laborales'
  },
  {
    title: 'Carta de Despido',
    prompt: 'Genera una carta de despido por causas objetivas para [nombre del empleado] que trabaja como [puesto] desde [fecha de inicio], detallando las causas económicas que justifican la decisión.',
    documentType: 'despido',
    categoria: 'despidos'
  },
  {
    title: 'Demanda por Despido Improcedente',
    prompt: 'Redacta una demanda por despido improcedente para [nombre] contra la empresa [nombre de empresa], incluyendo los hechos relevantes y la fundamentación jurídica.',
    documentType: 'demanda',
    categoria: 'demandas'
  },
  {
    title: 'Reclamación de Cantidades',
    prompt: 'Crea un documento de reclamación de cantidades adeudadas por la empresa [nombre de empresa] al trabajador [nombre del trabajador], detallando los conceptos e importes reclamados.',
    documentType: 'reclamacion',
    categoria: 'reclamaciones'
  }
];

const plantillasSindicato: TemplatePrompt[] = [
  {
    title: 'Solicitud de Afiliación',
    prompt: 'Crea un formulario de solicitud de afiliación sindical para [nombre del sindicato], incluyendo los campos necesarios y derechos y obligaciones.',
    documentType: 'afiliacion',
    categoria: 'afiliaciones'
  },
  {
    title: 'Denuncia de Incumplimiento de Convenio',
    prompt: 'Redacta una denuncia por incumplimiento del convenio colectivo por parte de la empresa [nombre de empresa], especificando los artículos vulnerados y las circunstancias.',
    documentType: 'denuncia',
    categoria: 'convenios'
  },
  {
    title: 'Comunicado Sindical',
    prompt: 'Elabora un comunicado sindical para informar a los trabajadores sobre [tema] con un tono profesional pero accesible.',
    documentType: 'comunicado',
    categoria: 'derechos'
  },
  {
    title: 'Convocatoria de Asamblea',
    prompt: 'Redacta una convocatoria para una asamblea sindical en [fecha] para tratar los siguientes temas: [temas a tratar].',
    documentType: 'convocatoria',
    categoria: 'conflictos'
  }
];

// Servidor: Solicitar respuesta del modelo de IA
const serverGenerateDocument = server$(async function(
  userPrompt: string,
  documentType: string,
  previousMessages: DocumentMessage[] = []
) {
  console.log("Servidor: Generando documento legal con IA");
  const openAIApiKey = this.env.get('OPENAI_API_KEY') || import.meta.env.OPENAI_API_KEY;
  
  if (!openAIApiKey) {
    console.error("OpenAI API Key no configurada en el servidor.");
    return "Error: Servicio de IA no configurado.";
  }

  try {
    const llm = new ChatOpenAI({
      openAIApiKey: openAIApiKey,
      model: "gpt-4o-mini",
      temperature: 0.2
    });

    // Instrucción específica para la generación de documentos legales
    const systemContent = `Eres un asistente especializado en la generación de documentos legales laborales en España. 
    Genera documentos completos, bien estructurados y profesionales. Utiliza lenguaje jurídico apropiado.
    Incluye todas las cláusulas, términos y condiciones relevantes para el tipo de documento solicitado.
    Formatea el texto para que sea fácil de leer, utilizando secciones, párrafos y enumeraciones cuando sea apropiado.
    Asegúrate de que el documento sea legalmente válido según la legislación laboral española vigente.
    Si se solicita un documento específico como ${documentType}, asegúrate de seguir sus requisitos formales.`;
    
    // Añadir mensaje del sistema si no existe en el historial
    const hasSystemMessage = previousMessages.some(msg => msg.role === 'system');
    let processedHistory = [...previousMessages];
    
    if (!hasSystemMessage) {
      processedHistory.unshift({
        role: 'system',
        content: systemContent
      });
    }
    
    // Añadir mensaje actual del usuario
    processedHistory.push({
      role: 'user',
      content: userPrompt
    });
    
    // Convertir al formato de mensajes de LangChain
    const messages = processedHistory.map(msg => {
      if (msg.role === 'system') return new SystemMessage(msg.content);
      if (msg.role === 'user') return new HumanMessage(msg.content);
      return new AIMessage(msg.content);
    });

    console.log(`Servidor: Usando ${messages.length} mensajes como contexto`);
    const response = await llm.invoke(messages);
    console.log("Servidor: Documento generado correctamente");
    return response.content as string;

  } catch (error: any) {
    console.error("Servidor: Error en el modelo LangChain:", error);
    return "Lo siento, encontré un error al procesar tu solicitud de documento.";
  }
});

// Guardar sesión de documento en la base de datos
const serverSaveDocumentSession = server$(async function(
  userId: string | undefined,
  documentType: string,
  title: string,
  messages: DocumentMessage[]
) {
  if (!userId) {
    console.warn("Servidor: No se puede guardar la sesión, usuario no autenticado.");
    return;
  }

  console.log("Servidor: Guardando sesión de documento para usuario:", userId);
  try {
    // Crear cliente directamente sin usar tursoClient
    const url = this.env?.get("PRIVATE_TURSO_DATABASE_URL") ||
                import.meta.env.PRIVATE_TURSO_DATABASE_URL;
    const authToken = this.env?.get("PRIVATE_TURSO_AUTH_TOKEN") ||
                    import.meta.env.PRIVATE_TURSO_AUTH_TOKEN;
    
    if (!url) {
      console.error("Servidor: URL de base de datos no configurada");
      return null;
    }
    
    const { createClient } = await import("@libsql/client");
    const client = createClient({
      url,
      authToken: authToken || undefined
    });
    
    // Verificar si la tabla document_sessions existe
    const tableInfo = await client.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='document_sessions'"
    });
    
    // Si la tabla no existe, crearla
    if (tableInfo.rows.length === 0) {
      await client.execute({
        sql: `CREATE TABLE document_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          document_type TEXT NOT NULL,
          messages TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      });
      console.log("Servidor: Tabla document_sessions creada");
    }
    
    // Insertar la sesión
    const messagesJson = JSON.stringify(messages);
    const result = await client.execute({
      sql: `INSERT INTO document_sessions 
            (user_id, title, document_type, messages, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        userId, 
        title, 
        documentType, 
        messagesJson, 
        new Date().toISOString(), 
        new Date().toISOString()
      ]
    });
    
    console.log("Servidor: Sesión de documento guardada con éxito", result);
    return result.lastInsertRowid;
  } catch (error: any) {
    console.error("Servidor: Error al guardar sesión de documento:", error.message);
    console.error("Servidor: Detalles del error:", error);
    return null;
  }
});

// Route loader para obtener sesiones guardadas
export const useDocumentSessions = routeLoader$(async (requestEv) => {
  const authToken = requestEv.cookie.get('auth_token')?.value;
  if (!authToken) {
    return [];
  }
  
  try {
    // En un route loader usar tursoClient con requestEv
    const client = tursoClient(requestEv);
    
    // Verificar si la tabla document_sessions existe
    const tableInfo = await client.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='document_sessions'"
    });
    
    if (tableInfo.rows.length === 0) {
      return [];
    }
    
    // Obtener las sesiones ordenadas por fecha de actualización
    const result = await client.execute({
      sql: `SELECT id, title, document_type, updated_at 
            FROM document_sessions 
            WHERE user_id = ? 
            ORDER BY updated_at DESC 
            LIMIT 10`,
      args: [authToken]
    });
    
    return result.rows;
  } catch (error) {
    console.error("Error al cargar sesiones de documentos:", error);
    return [];
  }
});

// Acción de formulario
export const useGenerateDocumentAction = routeAction$(async (data, { cookie, ...requestEv }) => {
  const { prompt, documentType, title } = data as {
    prompt: string;
    documentType: string;
    title: string;
  };
  
  if (!prompt) {
    return {
      success: false,
      message: "El prompt no puede estar vacío"
    };
  }
  
  // Generar documento
  const documentContent = await serverGenerateDocument(prompt, documentType || 'general', []);
  
  // Crear mensajes
  const messages: DocumentMessage[] = [
    {
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    },
    {
      role: 'assistant',
      content: documentContent,
      timestamp: new Date().toISOString()
    }
  ];
  
  // Obtener ID de usuario, o usar uno de prueba durante desarrollo
  const userId = cookie.get('auth_token')?.value || 'dev_user';
  const documentTitle = title || `Documento ${documentType} - ${new Date().toLocaleDateString()}`;
  await serverSaveDocumentSession(userId, documentType, documentTitle, messages);
  
  return {
    success: true,
    document: documentContent,
    messages
  };
}, zod$({
  prompt: z.string().min(1, "El prompt no puede estar vacío"),
  documentType: z.string().default('general'),
  title: z.string().optional()
}));

// Estilos CSS
const STYLES = `
.documento-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: #f9fafb;
  padding: 1rem;
}

.prompt-section {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.prompt-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.template-card {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  background-color: #e5e7eb;
  transform: translateY(-2px);
}

.template-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.prompt-textarea {
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  resize: vertical;
  font-family: inherit;
}

.btn-container {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #e53e3e;
  color: white;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.primary-btn:hover {
  background-color: #c53030;
}

.document-section {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.document-tools {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.tool-btn:hover {
  background-color: #e5e7eb;
}

.document-content {
  white-space: pre-wrap;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  font-family: 'Times New Roman', Times, serif;
  min-height: 300px;
  max-height: 60vh;
  overflow-y: auto;
  line-height: 1.5;
}

.past-sessions {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.sessions-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.session-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.session-card:hover {
  background-color: #f3f4f6;
}

.session-title {
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-date {
  font-size: 0.75rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .btn-container {
    flex-direction: column;
  }
  
  .document-tools {
    flex-wrap: wrap;
  }
}
`;

// Función para guardar el documento en la base de datos
const serverSaveDocumentInDB = server$(async function(
  userId: string,
  docId: string,
  title: string,
  categoria: string,
  estado: string,
  origen: string,
  contenido: string = ''
) {
  console.log(`BD ASISTENTE: Guardando documento con origen="${origen}"`);
  console.log(`BD ASISTENTE: ID=${docId}, título=${title}, categoría=${categoria}, userId=${userId}`);
  
  if (!userId) {
    console.warn("BD ASISTENTE: No se puede guardar el documento, usuario no autenticado.");
    return false;
  }
  
  // Validación de parámetros
  if (!docId || !title) {
    console.error("BD ASISTENTE: Error en parámetros - ID o título faltantes");
    return false;
  }
  
  try {
    // Crear cliente directamente sin usar tursoClient
    const url = this.env?.get("PRIVATE_TURSO_DATABASE_URL") ||
               import.meta.env.PRIVATE_TURSO_DATABASE_URL;
    const authToken = this.env?.get("PRIVATE_TURSO_AUTH_TOKEN") ||
                    import.meta.env.PRIVATE_TURSO_AUTH_TOKEN;
    
    if (!url) {
      console.error("BD ASISTENTE: URL de base de datos no configurada");
      return false;
    }
    
    console.log("BD ASISTENTE: Conectando a la base de datos:", url.substring(0, 20) + "...");
    const { createClient } = await import("@libsql/client");
    const client = createClient({
      url,
      authToken: authToken || undefined
    });
    
    // Verificar si la tabla documentos_legales existe
    console.log("BD ASISTENTE: Verificando si existe la tabla documentos_legales...");
    const tableInfo = await client.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='documentos_legales'"
    });
    
    // Si la tabla no existe, crearla
    if (tableInfo.rows.length === 0) {
      console.log("BD ASISTENTE: Creando tabla documentos_legales...");
      await client.execute({
        sql: `CREATE TABLE documentos_legales (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          titulo TEXT NOT NULL,
          categoria TEXT NOT NULL,
          fecha TEXT NOT NULL,
          estado TEXT NOT NULL,
          origen TEXT NOT NULL,
          contenido TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`
      });
      console.log("BD ASISTENTE: Tabla documentos_legales creada correctamente");
    } else {
      console.log("BD ASISTENTE: La tabla documentos_legales ya existe");
    }
    
    // Verificar si existe la columna contenido
    console.log("BD ASISTENTE: Verificando si existe la columna contenido...");
    try {
      await client.execute({
        sql: "SELECT contenido FROM documentos_legales LIMIT 1"
      });
      console.log("BD ASISTENTE: La columna contenido existe en la tabla");
    } catch (e) {
      console.log("BD ASISTENTE: Añadiendo columna contenido a la tabla...");
      await client.execute({
        sql: "ALTER TABLE documentos_legales ADD COLUMN contenido TEXT"
      });
      console.log("BD ASISTENTE: Columna contenido añadida correctamente");
    }
    
    // Verificar si existe la columna origen
    console.log("BD ASISTENTE: Verificando si existe la columna origen...");
    try {
      await client.execute({
        sql: "SELECT origen FROM documentos_legales LIMIT 1"
      });
      console.log("BD ASISTENTE: La columna origen existe en la tabla");
    } catch (e) {
      console.log("BD ASISTENTE: Añadiendo columna origen a la tabla...");
      await client.execute({
        sql: "ALTER TABLE documentos_legales ADD COLUMN origen TEXT DEFAULT 'generador'"
      });
      console.log("BD ASISTENTE: Columna origen añadida correctamente");
    }
    
    // REVISAR DOCUMENTOS EXISTENTES
    console.log("BD ASISTENTE: Consultando documentos existentes para este usuario...");
    const existingDocs = await client.execute({
      sql: "SELECT id, titulo, origen FROM documentos_legales WHERE user_id = ? LIMIT 5",
      args: [userId]
    });
    
    console.log(`BD ASISTENTE: Encontrados ${existingDocs.rows.length} documentos para el usuario (muestra de 5 max):`);
    existingDocs.rows.forEach((doc: any, i: number) => {
      console.log(`BD ASISTENTE: Doc ${i+1}: ID=${doc.id}, Título=${doc.titulo}, Origen=${doc.origen || "no definido"}`);
    });
    
    // Insertar el documento
    console.log(`BD ASISTENTE: Insertando documento en la BD...`);
    console.log(`BD ASISTENTE: Longitud del contenido: ${contenido?.length || 0} caracteres`);
    const fecha = new Date().toISOString().split('T')[0];
    
    // Asegurar que el origen es explícitamente "asistente"
    origen = origen === 'asistente' ? 'asistente' : 'generador';
    console.log(`BD ASISTENTE: Usando origen final: "${origen}"`);
    
    const result = await client.execute({
      sql: `INSERT INTO documentos_legales
            (id, user_id, titulo, categoria, fecha, estado, origen, contenido)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        docId,
        userId,
        title,
        categoria,
        fecha,
        estado,
        origen,
        contenido
      ]
    });
    
    console.log("BD ASISTENTE: Documento guardado con éxito. Resultado:", result);
    
    // Verificar que se guardó correctamente
    console.log("BD ASISTENTE: Verificando que el documento se guardó correctamente...");
    const verification = await client.execute({
      sql: "SELECT id, titulo, origen FROM documentos_legales WHERE id = ?",
      args: [docId]
    });
    
    if (verification.rows.length > 0) {
      const savedDoc = verification.rows[0];
      console.log(`BD ASISTENTE: Verificación exitosa: ID=${savedDoc.id}, Título=${savedDoc.titulo}, Origen=${savedDoc.origen}`);
    } else {
      console.error("BD ASISTENTE: ¡ALERTA! El documento no se encontró después de guardarlo.");
    }
    
    return true;
  } catch (error: any) {
    console.error("BD ASISTENTE: Error al guardar documento:", error.message);
    console.error("BD ASISTENTE: Detalles del error:", error);
    if (error.cause) {
      console.error("BD ASISTENTE: Causa del error:", error.cause);
    }
    return false;
  }
});

export default component$(() => {
  useStylesScoped$(STYLES);
  
  // Obtener datos de autenticación y sesiones
  const authCheck = useAuthCheck();
  const documentSessions = useDocumentSessions();
  const generateAction = useGenerateDocumentAction();
  
  // Estado local
  const selectedTemplate = useSignal<TemplatePrompt | null>(null);
  const promptText = useSignal('');
  const docTitle = useSignal('');
  const documentType = useSignal('general');
  const showTemplates = useSignal(true);
  
  // Estado para el documento generado
  const documentSession = useStore<DocumentSession>({
    messages: [],
    title: '',
    documentType: ''
  });
  
  // Determinar qué plantillas mostrar según el tipo de usuario
  const plantillas = authCheck.value.isDespacho ? plantillasDespacho : plantillasSindicato;
  
  // Establecer plantilla seleccionada
  const selectTemplate$ = $((template: TemplatePrompt) => {
    selectedTemplate.value = template;
    promptText.value = template.prompt;
    documentType.value = template.documentType;
    
    // Título por defecto basado en la plantilla
    if (!docTitle.value) {
      docTitle.value = `${template.title} - ${new Date().toLocaleDateString()}`;
    }
    
    showTemplates.value = false;
  });
  
  // Generar PDF del documento y guardarlo en el sistema de archivos
  const generatePDF$ = $(async () => {
    if (documentSession.messages.length === 0) {
      alert('No hay contenido para generar un documento. Por favor, genere el documento primero.');
      return;
    }
    
    const lastMessage = documentSession.messages.find(msg => msg.role === 'assistant');
    if (!lastMessage) {
      alert('No se encontró contenido del asistente en el documento.');
      return;
    }
    
    try {
      // Verificar que el usuario esté autenticado
      if (!authCheck.value.userId) {
        console.error('Usuario no autenticado:', authCheck.value);
        alert('Debe iniciar sesión para guardar documentos.');
        return;
      }
      
      // Crear ID único para el documento
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const docId = `asistente-${timestamp}-${randomSuffix}`;
      
      // Obtener el contenido del documento
      const documentContent = lastMessage.content || '';
      
      // Verificar que el documento tenga un título
      const title = documentSession.title || `Documento ${documentSession.documentType} - ${new Date().toLocaleDateString()}`;
      
      console.log(`DEPURACIÓN ASISTENTE: Usuario ID=${authCheck.value.userId}, Tipo=${documentSession.documentType}`);
      console.log(`DEPURACIÓN ASISTENTE: Generando PDF para documento: ${title} (ID: ${docId})`);
      console.log(`DEPURACIÓN ASISTENTE: Longitud del contenido: ${documentContent.length} caracteres`);
      
      // Antes de guardar, verificar que el contenido no esté vacío
      if (!documentContent.trim()) {
        console.error('DEPURACIÓN ASISTENTE: El contenido del documento está vacío');
        alert('Error: El documento generado está vacío. Por favor, inténtelo de nuevo.');
        return;
      }
      
      // Guardar el documento en la base de datos como completado
      // IMPORTANTE: El origen debe ser 'asistente' para que aparezca en mis-documentos
      console.log('DEPURACIÓN ASISTENTE: Guardando documento en la BD con origen="asistente"');
      const resultado = await serverSaveDocumentInDB(
        authCheck.value.userId,
        docId,
        title,
        documentSession.documentType || 'general',
        'completado',
        'asistente', // Este origen es crucial para que se liste en mis-documentos
        documentContent
      );
      
      if (!resultado) {
        console.error('DEPURACIÓN ASISTENTE: El servidor devolvió false al guardar el documento');
        alert('Error al guardar el documento en la base de datos. Verifique la consola para más detalles.');
        return;
      }
      
      console.log(`DEPURACIÓN ASISTENTE: Documento guardado con éxito. Redirigiendo a: /documentos-legales/pdf/${docId}`);
      
      // Redirigir al visor de PDF
      window.location.href = `/documentos-legales/pdf/${docId}`;
    } catch (err) {
      // Mejorar el mensaje de error con más detalles
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      const errorStack = err instanceof Error ? err.stack : '';
      
      console.error('DEPURACIÓN ASISTENTE: Error al generar el PDF:', errorMsg);
      console.error('DEPURACIÓN ASISTENTE: Stack de error:', errorStack);
      
      // Mostrar más detalles en la alerta
      alert(`No se pudo generar el PDF. Error: ${errorMsg}\n\nRevise la consola para más información.`);
    }
  });
  
  
  // Copiar contenido del documento al portapapeles
  const copyContent$ = $(async () => {
    if (documentSession.messages.length === 0) return;
    
    const lastMessage = documentSession.messages.find(msg => msg.role === 'assistant');
    if (!lastMessage) return;
    
    try {
      await navigator.clipboard.writeText(lastMessage.content);
      alert('Documento copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar el documento:', err);
      alert('No se pudo copiar el documento');
    }
  });
  
  // Reiniciar el formulario
  const resetForm$ = $(() => {
    promptText.value = '';
    docTitle.value = '';
    documentType.value = 'general';
    selectedTemplate.value = null;
    showTemplates.value = true;
    documentSession.messages = [];
  });
  
  // Al enviar el formulario
  useVisibleTask$(({ track }) => {
    track(() => generateAction.value);
    
    if (generateAction.value?.success && generateAction.value?.messages) {
      documentSession.messages = [...generateAction.value.messages];
      documentSession.title = docTitle.value;
      documentSession.documentType = documentType.value;
    }
  });

  return (
    <div class="documento-page">
      <div class="prompt-section">
        <h2 class="prompt-title">Generar Documento Legal</h2>
        
        {showTemplates.value && (
          <>
            <p class="mb-4">Selecciona una plantilla o escribe tu propia solicitud:</p>
            <div class="templates-grid">
              {plantillas.map((template) => (
                <div 
                  key={template.title} 
                  class="template-card"
                  onClick$={() => selectTemplate$(template)}
                >
                  <div class="template-title">{template.title}</div>
                  <p class="text-sm text-gray-600 truncate">{template.prompt.substring(0, 60)}...</p>
                </div>
              ))}
            </div>
          </>
        )}
        
        <Form action={generateAction}>
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium">Título del Documento:</label>
            <input 
              type="text" 
              name="title"
              value={docTitle.value}
              onChange$={(ev) => docTitle.value = (ev.target as HTMLInputElement).value}
              class="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Ingresa un título para tu documento"
            />
          </div>
          
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium">Instrucción para el Documento:</label>
            <textarea 
              name="prompt"
              value={promptText.value}
              onChange$={(ev) => promptText.value = (ev.target as HTMLTextAreaElement).value}
              class="prompt-textarea"
              placeholder="Describe el documento legal que necesitas. Puedes incluir detalles específicos como nombres, fechas, importes, etc."
            ></textarea>
            <input 
              type="hidden" 
              name="documentType" 
              value={documentType.value}
            />
          </div>
          
          <div class="btn-container">
            {!showTemplates.value && (
              <button 
                type="button" 
                onClick$={() => showTemplates.value = true}
                class="tool-btn"
              >
                Ver Plantillas
              </button>
            )}
            
            <button 
              type="button" 
              onClick$={resetForm$}
              class="tool-btn"
            >
              <LuRefreshCcw class="w-4 h-4" />
              <span>Reiniciar</span>
            </button>
            
            <button 
              type="submit" 
              class="primary-btn" 
              disabled={generateAction.isRunning || !promptText.value.trim()}
            >
              <LuSend class="w-4 h-4" />
              <span>{generateAction.isRunning ? 'Generando...' : 'Generar Documento'}</span>
            </button>
          </div>
        </Form>
      </div>
      
      {documentSession.messages.length > 0 && (
        <div class="document-section">
          <div class="document-tools">
            <button
              class="tool-btn"
              onClick$={async () => {
                if (documentSession.messages.length === 0) {
                  alert('Primero debe generar un documento');
                } else if (!documentSession.title) {
                  alert('Proporcione un título para el documento antes de exportar a PDF');
                } else {
                  await generatePDF$();
                }
              }}
            >
              <LuDownload class="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
            
            <button 
              onClick$={copyContent$}
              class="tool-btn"
            >
              <LuCopy class="w-4 h-4" />
              <span>Copiar</span>
            </button>
          </div>
          
          <div class="document-content">
            {documentSession.messages.find(msg => msg.role === 'assistant')?.content || ''}
          </div>
        </div>
      )}
      
      {documentSessions.value.length > 0 && (
        <div class="past-sessions">
          <h3 class="sessions-title">Documentos Recientes</h3>
          <div class="sessions-grid">
            {documentSessions.value.map((session: any) => (
              <div 
                key={session.id} 
                class="session-card"
                // Aquí se debe implementar la carga de una sesión anterior
              >
                <div class="session-title">{session.title}</div>
                <div class="session-date">
                  {new Date(session.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});