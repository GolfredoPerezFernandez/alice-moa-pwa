import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link, useLocation } from '@builder.io/qwik-city';
import { useAuthCheck } from '../layout';
import { LuFileText, LuDownload, LuEye, LuCalendar, LuFilter, LuAlertCircle } from '@qwikest/icons/lucide';
import { executeQuery } from '../../../utils/turso';
import { getUserId } from '../../../utils/auth';

// Interfaz para documentos legales
interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  fecha: string;
  estado: string;
  origen: string;
}

// Función para determinar la URL del PDF según su origen
// Nota: Ya no usamos rutas directas a archivos PDF, sino que redirigimos al visor
const getDocumentUrl = (docId: string) => {
  // Ahora siempre usamos el visor de documentos
  return `/documentos-legales/pdf/${docId}`;
};

// Función para generar un ID único para documentos
function generateDocumentId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Route loader para cargar los documentos desde la base de datos
export const useDocumentosLegales = routeLoader$(async (requestEvent) => {
  try {
    // Intentar crear la tabla si no existe
    await executeQuery(
      requestEvent,
      `CREATE TABLE IF NOT EXISTS documentos_legales (
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
    );
    
    // Obtener el ID del usuario actual
    const userId = getUserId(requestEvent);
    
    if (!userId) {
      return {
        success: false,
        error: "Usuario no autenticado",
        documentos: []
      };
    }
    // Comprobar si existe la columna origen
    try {
      await executeQuery(
        requestEvent,
        "SELECT origen FROM documentos_legales LIMIT 1"
      );
      console.log("MIS-DOCS: La columna origen existe en la tabla");
    } catch (e) {
      console.log("MIS-DOCS: Añadiendo columna origen a la tabla documentos_legales");
      await executeQuery(
        requestEvent,
        "ALTER TABLE documentos_legales ADD COLUMN origen TEXT DEFAULT 'generador'"
      );
      console.log("MIS-DOCS: Columna origen añadida correctamente");
    }
    
    // Consultar los documentos del usuario existentes en la BD
    console.log(`MIS-DOCS: Consultando documentos para usuario ID=${userId}`);
    
    // IMPORTANTE: Esta consulta ahora incluye un ORDER BY fecha DESC para mostrar los más recientes primero
    // y NO filtra por origen, para mostrar todos los documentos independientemente de dónde fueron creados
    const result = await executeQuery(
      requestEvent,
      'SELECT id, titulo, categoria, fecha, estado, origen FROM documentos_legales WHERE user_id = ? ORDER BY fecha DESC',
      [userId]
    );
    
    console.log(`MIS-DOCS: Se encontraron ${result.rows.length} documentos para el usuario ${userId}`);
    
    // Primero intentemos verificar si hay documentos del asistente
    const asistenteDocs = result.rows.filter(doc => (doc.origen === 'asistente'));
    console.log(`MIS-DOCS: Documentos del asistente: ${asistenteDocs.length}`);
    
    // Para depuración, mostramos todos los documentos encontrados
    if (result.rows.length > 0) {
      console.log('MIS-DOCS: Todos los documentos encontrados:');
      result.rows.forEach((doc, i) => {
        console.log(`MIS-DOCS: Doc ${i+1}: ID=${doc.id}, Título=${doc.titulo}, Origen=${doc.origen || 'no definido'}`);
      });
    } else {
      console.log('MIS-DOCS: No se encontraron documentos para este usuario');
    }
    
    
    
    return {
      success: true,
      error: null,
      documentos: result.rows.map(row => ({
        id: row.id as string,
        titulo: row.titulo as string,
        categoria: row.categoria as string,
        fecha: row.fecha as string,
        estado: row.estado as string,
        origen: row.origen as string
      }))
    };
  } catch (err) {
    console.error('Error al cargar documentos:', err);
    return {
      success: false,
      error: "Error al cargar los documentos",
      documentos: []
    };
  }
});

export default component$(() => {
  const authCheck = useAuthCheck();
  const location = useLocation();
  const documentosResult = useDocumentosLegales();
  
  // Añadir timestamp para evitar caché
  const timestamp = new Date().getTime();
  
  return (
    <div class="mis-documentos-page">
      {/* Panel de depuración - Solo visible en desarrollo */}
     
      <div class="page-header">
        <h1 class="page-title">Mis Documentos</h1>
        <p class="page-description">
          Gestiona todos tus documentos legales generados
        </p>
      </div>
      
      <div class="documents-list">
        <div class="list-header">
          <div class="header-nombre">Nombre del documento</div>
          <div class="header-categoria">Categoría</div>
          <div class="header-fecha">Fecha</div>
          <div class="header-acciones">Acciones</div>
        </div>
        
        {!documentosResult.value.success ? (
          <div class="error-message">
            <LuAlertCircle class="w-8 h-8 text-red-500" />
            <p>{documentosResult.value.error}</p>
          </div>
        ) : documentosResult.value.documentos.length === 0 ? (
          <div class="empty-state">
            <p>No tienes documentos guardados.</p>
            <p>Puedes crear documentos usando el Asistente IA o seleccionando una plantilla en la sección Inicio.</p>
            <div class="empty-actions">
              <Link href="/documentos-legales/asistente/" class="create-doc-btn">
                Usar Asistente IA
              </Link>
              <Link href="/documentos-legales/" class="alternative-btn">
                Ver plantillas
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Solo mostrar los documentos de la base de datos, nada estático */}
            {documentosResult.value.documentos.map((doc) => (
              <div key={doc.id} class="document-item">
                <div class="doc-nombre">
                  <LuFileText class="w-5 h-5 doc-icon" />
                  <span class="doc-titulo">{doc.titulo}</span>
                </div>
                <div class="doc-categoria">{doc.categoria}</div>
                <div class="doc-fecha">
                  <LuCalendar class="w-4 h-4" />
                  <span>{new Date(doc.fecha).toLocaleDateString()}</span>
                </div>
                <div class="doc-acciones">
                  <Link href={`/documentos-legales/pdf/${doc.id}`} class="action-btn view">
                    <LuEye class="w-4 h-4" />
                    <span>Ver</span>
                  </Link>
                  <Link href={`/documentos-legales/pdf/${doc.id}`} target="_blank" class="action-btn download">
                    <LuDownload class="w-4 h-4" />
                    <span>Descargar</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style>
        {`
        .mis-documentos-page {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .page-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        
        .page-description {
          color: #6b7280;
          max-width: 600px;
        }
        
        .filters-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .search-box {
          flex-grow: 1;
          max-width: 400px;
        }
        
        .search-input {
          width: 100%;
          padding: 0.625rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .filter-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .filter-btn, .filter-select {
          padding: 0.625rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .filter-btn:hover, .filter-select:hover {
          border-color: #9ca3af;
        }
        
        .documents-list {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .list-header {
          display: grid;
          grid-template-columns: 3fr 1.5fr 1.5fr 1.5fr;
          padding: 1rem 1.5rem;
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .document-item {
          display: grid;
          grid-template-columns: 3fr 1.5fr 1.5fr 1.5fr;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          align-items: center;
        }
        
        .document-item:last-child {
          border-bottom: none;
        }
        
        .document-item:hover {
          background-color: #f9fafb;
        }
        
        .doc-nombre {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .doc-icon {
          color: #3b82f6;
          flex-shrink: 0;
        }
        
        .doc-titulo {
          font-weight: 500;
          color: #111827;
        }
        
        .doc-categoria {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .doc-fecha {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .doc-acciones {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-decoration: none;
        }
        
        .action-btn.view {
          background-color: #eff6ff;
          color: #1e40af;
        }
        
        .action-btn.view:hover {
          background-color: #dbeafe;
        }
        
        .action-btn.download {
          background-color: #f0fdf4;
          color: #166534;
        }
        
        .action-btn.download:hover {
          background-color: #dcfce7;
        }
        
        .error-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          color: #dc2626;
          background-color: #fee2e2;
          border-radius: 0.5rem;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          color: #6b7280;
        }
        
        .empty-state p {
          margin-bottom: 1rem;
          max-width: 500px;
        }
        
        .empty-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .create-doc-btn {
          display: inline-block;
          padding: 0.625rem 1.25rem;
          background-color: #e53e3e;
          color: white;
          font-weight: 500;
          border-radius: 0.375rem;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        
        .create-doc-btn:hover {
          background-color: #dc2626;
        }
        
        .alternative-btn {
          display: inline-block;
          padding: 0.625rem 1.25rem;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
          font-weight: 500;
          border-radius: 0.375rem;
          text-decoration: none;
          transition: all 0.2s;
        }
        
        .alternative-btn:hover {
          background-color: #e5e7eb;
          border-color: #9ca3af;
        }
        
        @media (max-width: 1024px) {
          .list-header, .document-item {
            grid-template-columns: 2fr 1fr 1fr 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .list-header {
            display: none;
          }
          
          .document-item {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          
          .doc-categoria, .doc-fecha {
            margin-left: 2.25rem;
          }
          
          .doc-acciones {
            margin-left: 2.25rem;
            justify-content: start;
          }
        }
        `}
      </style>
    </div>
  );
});