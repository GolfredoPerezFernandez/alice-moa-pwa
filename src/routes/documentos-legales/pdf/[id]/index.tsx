import { component$, $, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, Link, routeLoader$ } from '@builder.io/qwik-city';
import { LuArrowLeft, LuDownload, LuPrinter, LuCalendar, LuTag } from '@qwikest/icons/lucide';
import { executeQuery } from '../../../../utils/turso';

// Obtener información del documento desde la base de datos
export const useDocumentoInfo = routeLoader$(async (requestEvent) => {
  const documentId = requestEvent.params.id;
  const userId = requestEvent.cookie.get('auth_token')?.value;
  
  console.log(`PDF Visor: Buscando documento con ID: ${documentId}`);
  console.log(`PDF Visor: Usuario actual: ${userId}`);
  
  try {
    // Verificar si existe la tabla documentos_legales y que tenga la columna contenido
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
    
    // Comprobar si existe la columna contenido
    try {
      await executeQuery(
        requestEvent,
        "SELECT contenido FROM documentos_legales LIMIT 1"
      );
      console.log("PDF Visor: La columna contenido existe en la tabla");
    } catch (e) {
      // Si da error, es porque no existe la columna, así que la añadimos
      console.log("PDF Visor: Añadiendo columna contenido a la tabla documentos_legales");
      await executeQuery(
        requestEvent,
        "ALTER TABLE documentos_legales ADD COLUMN contenido TEXT"
      );
      console.log("PDF Visor: Columna contenido añadida correctamente");
    }
    
    // Primero obtener todos los documentos para debugging
    const allDocs = await executeQuery(
      requestEvent,
      'SELECT id, titulo FROM documentos_legales LIMIT 10'
    );
    
    console.log(`PDF Visor: Documentos en la base de datos (máximo 10): ${allDocs.rows.length}`);
    allDocs.rows.forEach((doc: any, i: number) => {
      console.log(`PDF Visor: Doc ${i+1}: ID=${doc.id}, Título=${doc.titulo}`);
    });
    
    // Obtener información del documento incluyendo el contenido
    console.log(`PDF Visor: Obteniendo documento específico con ID: ${documentId}`);
    const result = await executeQuery(
      requestEvent,
      'SELECT titulo, categoria, fecha, contenido, user_id, origen FROM documentos_legales WHERE id = ?',
      [documentId]
    );
    
    if (result.rows.length === 0) {
      console.log(`PDF Visor: No se encontró ningún documento con ID: ${documentId}`);
      return {
        success: false,
        titulo: `Documento ${documentId}`,
        categoria: 'Categoría no disponible',
        fecha: new Date().toISOString().split('T')[0],
        contenido: null,
        userId: null,
        origen: null
      };
    }
    
    console.log(`PDF Visor: Documento encontrado: ${result.rows[0].titulo} (Origen: ${result.rows[0].origen})`);
    
    return {
      success: true,
      titulo: result.rows[0].titulo as string,
      categoria: result.rows[0].categoria as string,
      fecha: result.rows[0].fecha as string,
      contenido: result.rows[0].contenido as string,
      userId: result.rows[0].user_id as string,
      origen: result.rows[0].origen as string
    };
  } catch (error) {
    console.error('PDF Visor: Error al obtener información del documento:', error);
    return {
      success: false,
      titulo: `Documento ${documentId}`,
      categoria: 'Categoría no disponible',
      fecha: new Date().toISOString().split('T')[0],
      contenido: null,
      userId: null,
      origen: null
    };
  }
});

export default component$(() => {
  const location = useLocation();
  const documentId = location.params.id;
  const documentoInfo = useDocumentoInfo();
  
  // Crear una URL de datos para mostrar el contenido HTML del documento
  const createHtmlContent = (title: string, content: string = '') => {
    // Si hay contenido guardado para este documento, lo utilizamos
    // De lo contrario, mostramos un mensaje de placeholder
    const documentContent = content || `
      <h1>${title}</h1>
      <p>Este es un documento legal generado por el sistema.</p>
      <p>ID del documento: ${documentId}</p>
      <p>Fecha: ${new Date().toLocaleDateString()}</p>
      <hr>
      <p>El contenido real del documento aún no ha sido generado o no está disponible.</p>
    `;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            margin: 2cm;
            line-height: 1.5;
          }
          h1 {
            text-align: center;
            margin-bottom: 2cm;
          }
        </style>
      </head>
      <body>
        ${documentContent}
      </body>
      </html>
    `;
    
    return `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
  };
  
  // Función para generar la URL del documento HTML
  const pdfUrl = (() => {
    // Usar el contenido almacenado en la base de datos, o un mensaje placeholder si no hay contenido
    return createHtmlContent(documentoInfo.value.titulo, documentoInfo.value.contenido || '');
  })();
  
  // Cargar HTML2PDF dinamicamente al iniciar el componente
  useVisibleTask$(({ cleanup }) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    document.body.appendChild(script);
    
    cleanup(() => {
      document.body.removeChild(script);
    });
  });
  
  // En Qwik, los event handlers deben envolverse con $() para hacerlos serializables
  const handleDownload = $(async () => {
    // Verificar si html2pdf está cargado
    if (!(window as any).html2pdf) {
      alert('La biblioteca de PDF está cargando. Por favor, intente nuevamente en unos segundos.');
      return;
    }
    
    // Crear un elemento HTML temporal para la conversión
    const container = document.createElement('div');
    container.innerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${documentoInfo.value.titulo}</title>
        <meta charset="utf-8">
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
          }
          h1 {
            font-size: 16pt;
            text-align: center;
            margin-bottom: 20px;
          }
          h2 {
            font-size: 14pt;
            margin-top: 15px;
            margin-bottom: 10px;
          }
          p {
            margin-bottom: 10px;
            text-align: justify;
          }
          ul, ol {
            margin-bottom: 10px;
          }
          .document-header {
            text-align: right;
            margin-bottom: 30px;
          }
          .document-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10pt;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="document-content">
          ${documentoInfo.value.contenido || `
            <h1>${documentoInfo.value.titulo}</h1>
            <p>Este es un documento legal generado por el sistema.</p>
            <p>ID del documento: ${documentId}</p>
            <p>Fecha: ${new Date(documentoInfo.value.fecha).toLocaleDateString()}</p>
            <hr>
            <p>El contenido del documento no está disponible.</p>
          `}
        </div>
        <div class="document-footer">
          <p>Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
          <p>Sistema Legal DAIOFF</p>
        </div>
      </body>
      </html>
    `;
    
    document.body.appendChild(container);
    
    try {
      // Generar un nombre de archivo basado en el título del documento, normalizado para archivos
      const fileName = documentoInfo.value.titulo
        .toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Opciones para html2pdf
      const options = {
        margin: [15, 15],
        filename: `${fileName}-${documentId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // Mostrar mensaje de que se está generando el PDF
      alert('Generando PDF. Por favor espere...');
      
      // Convertir a PDF y descargar
      await (window as any).html2pdf(container, options);
      
      console.log('PDF generado y descargado correctamente');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Ocurrió un error al generar el PDF. Por favor, intente de nuevo.');
    } finally {
      // Limpiar el elemento temporal
      document.body.removeChild(container);
    }
  });
  
  const handlePrint = $(() => {
    // Obtener el iframe
    const iframe = document.getElementById('pdf-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }
  });
  
  return (
    <div class="pdf-viewer-page">
      {/* Debug panel */}
      <div style="background-color: #f0f8ff; padding: 10px; margin-bottom: 15px; border-radius: 5px; border: 1px solid #ccc; font-family: monospace; font-size: 12px;">
        <h3>DEBUG INFO (PDF Visor)</h3>
        <p>Document ID: {documentId}</p>
        <p>Success: {documentoInfo.value.success ? 'Sí' : 'No'}</p>
        <p>User ID: {documentoInfo.value.userId || 'No disponible'}</p>
        <p>Origen: {documentoInfo.value.origen || 'No disponible'}</p>
        <p>Contenido disponible: {documentoInfo.value.contenido ? 'Sí' : 'No'}</p>
        <p>Longitud del contenido: {documentoInfo.value.contenido?.length || 0} caracteres</p>
        {documentoInfo.value.contenido && (
          <details>
            <summary>Primeros 200 caracteres del contenido</summary>
            <pre>{documentoInfo.value.contenido.substring(0, 200)}...</pre>
          </details>
        )}
      </div>
      
      <div class="viewer-header">
        <div class="header-left">
          <Link href="/documentos-legales/mis-documentos/" class="back-link">
            <LuArrowLeft class="w-5 h-5" />
            <span>Volver</span>
          </Link>
          <h1 class="page-title">{documentoInfo.value.titulo}</h1>
          <div class="document-meta">
            <div class="meta-item">
              <LuTag class="w-4 h-4" />
              <span>{documentoInfo.value.categoria}</span>
            </div>
            <div class="meta-item">
              <LuCalendar class="w-4 h-4" />
              <span>{new Date(documentoInfo.value.fecha).toLocaleDateString()}</span>
            </div>
            {documentoInfo.value.origen && (
              <div class="meta-item">
                <span>Origen: {documentoInfo.value.origen}</span>
              </div>
            )}
          </div>
        </div>
        
        <div class="header-actions">
          <button class="action-btn" onClick$={handleDownload}>
            <LuDownload class="w-5 h-5" />
            <span>Descargar</span>
          </button>
          <button class="action-btn" onClick$={handlePrint}>
            <LuPrinter class="w-5 h-5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
      
      <div class="viewer-content">
        <iframe
          id="pdf-iframe"
          src={pdfUrl}
          class="pdf-iframe"
          title={`Documento Legal ${documentId}`}
          onError$={() => {
            // Display error message if the PDF fails to load
            const iframe = document.getElementById('pdf-iframe');
            if (iframe) {
              const container = iframe.parentElement;
              if (container) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'pdf-error';
                errorDiv.innerHTML = `
                  <h3>El documento no pudo ser cargado</h3>
                  <p>El documento solicitado no existe o aún no ha sido generado correctamente.</p>
                  <p>ID del documento: ${documentId}</p>
                  <p>Ruta intentada: ${pdfUrl}</p>
                `;
                container.appendChild(errorDiv);
              }
            }
          }}
        ></iframe>
      </div>
      
      <style>
        {`
        .pdf-viewer-page {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .header-left {
          display: flex;
          flex-direction: column;
        }
        
        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          text-decoration: none;
        }
        
        .back-link:hover {
          color: #111827;
        }
        
        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }
        
        .document-meta {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .header-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #111827;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background-color: #f9fafb;
          border-color: #9ca3af;
        }
        
        .viewer-content {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          min-height: 70vh;
          overflow: hidden;
          height: calc(100vh - 150px);
          display: flex;
          position: relative;
        }
        
        .pdf-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .pdf-error {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #f9fafb;
          padding: 2rem;
          text-align: center;
          color: #ef4444;
        }
        
        .pdf-error h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .pdf-error p {
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        
        .link-text {
          display: inline-block;
          color: #e53e3e;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          background-color: #fee2e2;
          border-radius: 0.25rem;
        }
        
        .link-text:hover {
          background-color: #fecaca;
        }
        
        @media (max-width: 768px) {
          .viewer-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        `}
      </style>
    </div>
  );
});