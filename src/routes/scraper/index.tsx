import { component$, useSignal, $, useTask$, type TaskCtx } from '@builder.io/qwik';
import { type DocumentHead, server$, routeLoader$, useNavigate } from '@builder.io/qwik-city';
import { executeQuery } from '../../utils/turso';
import { initAuthDatabase } from '../../utils/init-db'; // Import the init function
import { runScraper as libRunScraper } from '../../lib/scraperService'; // Ensure this path is correct
import type { RequestEventBase } from '@builder.io/qwik-city';

const serverRunScraper = server$(async function (this: RequestEventBase) {
  console.log("server$ function called: Attempting to run scraper...");
  try {
    const stats = await libRunScraper(this);
    console.log("Scraper run completed on server, stats:", stats);
    return { success: true, stats };
  } catch (error) {
    console.error("Error running scraper from server$:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
});

const serverDeleteDocument = server$(async function (this: RequestEventBase, documentId: number) {
  console.log(`server$ function called: Attempting to delete document ID: ${documentId}`);
  try {
    const result = await executeQuery(this, "DELETE FROM legalDocument WHERE id = ?", [documentId]);
    if (result.rowsAffected > 0) {
      console.log(`Document ID: ${documentId} deleted successfully.`);
      return { success: true, deletedId: documentId };
    } else {
      console.log(`Document ID: ${documentId} not found or not deleted.`);
      return { success: false, error: `Document ID ${documentId} not found.` };
    }
  } catch (error) {
    console.error(`Error deleting document ID ${documentId} from server$:`, error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
});

const serverDeleteAllDocuments = server$(async function (this: RequestEventBase) {
  console.log(`server$ function called: Attempting to delete all documents...`);
  try {
    const result = await executeQuery(this, "DELETE FROM legalDocument");
    console.log(`Successfully deleted ${result.rowsAffected} documents.`);
    return { success: true, count: result.rowsAffected };
  } catch (error) {
    console.error("Error deleting all documents from server$:", error);
    return { success: false, error: (error instanceof Error ? error.message : String(error)) };
  }
});

interface ScraperStats {
  totalPagesVisited: number;
  totalDocumentsFound: number;
  totalLinksDiscovered: number;
  totalCreated: number;
  totalUpdated: number;
}

interface DisplayDocument {
  id: number;
  title: string;
  url: string;
  documentType: string;
  content: string;
  updatedAt: string; // Keep as string from DB, format in template
  publicationDate?: string | null; // Keep as string from DB, format in template
  pdfUrl?: string | null; // Add pdfUrl
}

export const useScrapedDocuments = routeLoader$(async function (this: RequestEventBase) {
  try {
    // Attempt to initialize the database (creates tables if they don't exist)
    console.log('[Scraper RouteLoader] Attempting to initialize database...');
    const initResult = await initAuthDatabase(this);
    if (!initResult.success) {
      console.error('[Scraper RouteLoader] Database initialization failed:', initResult.message);
      // Optionally, you could throw an error here or return a specific state
      // For now, we'll log and proceed, as the query might still work if tables were created previously
      // or if the failure was non-critical for this specific table.
    } else {
      console.log('[Scraper RouteLoader] Database initialization successful or tables already exist.');
    }

    const result = await executeQuery(this,
      "SELECT id, title, url, documentType, content, updatedAt, publicationDate, pdfUrl FROM legalDocument ORDER BY updatedAt DESC LIMIT 20" // Added pdfUrl
    );
    // Ensure rows are correctly typed or cast if necessary
    return result.rows.map((row: any) => ({
      id: row.id as number,
      title: row.title as string,
      url: row.url as string,
      documentType: row.documentType as string,
      content: row.content as string,
      updatedAt: row.updatedAt as string, // Turso might return ISO string
      publicationDate: row.publicationDate ? row.publicationDate as string : null,
      pdfUrl: row.pdfUrl ? row.pdfUrl as string : null, // Add pdfUrl
    })) as DisplayDocument[];
  } catch (e) {
    console.error("Error fetching documents in routeLoader$:", e);
    return [] as DisplayDocument[];
  }
});


export default component$(() => {
  const isLoading = useSignal(false);
  const lastRunStats = useSignal<ScraperStats | null>(null);
  const lastRunError = useSignal<string | null>(null);
  const lastRunTimestamp = useSignal<string | null>(null);
  const documentsSignal = useScrapedDocuments();
  const nav = useNavigate();
  const pollingIntervalId = useSignal<NodeJS.Timeout | null>(null);

  const handleRunScraper = $(async () => {
    isLoading.value = true;
    lastRunError.value = null;
    lastRunStats.value = null;
    console.log("Client: Triggering scraper run...");
    const result = await serverRunScraper(); // This still runs the full scraper operation
    console.log("Client: Received result from server$:", result);

    // Stop polling when scraper is done or errors
    if (pollingIntervalId.value) {
      clearInterval(pollingIntervalId.value);
      pollingIntervalId.value = null;
    }

    if (result.success && result.stats) {
      lastRunStats.value = result.stats;
      lastRunTimestamp.value = new Date().toLocaleString();
      await nav(); // Final refresh
    } else {
      lastRunError.value = result.error || "Unknown error occurred during scraping.";
      // Ensure list is refreshed even on error to show any documents found before error
      await nav();
    }
    isLoading.value = false;
  });

  // Effect to start/stop polling based on isLoading
  useTask$(({ track }: TaskCtx) => {
    track(() => isLoading.value);

    if (isLoading.value) {
      // Start polling
      if (pollingIntervalId.value) clearInterval(pollingIntervalId.value); // Clear any existing
      
      // Initial immediate refresh when starting
      nav();

      pollingIntervalId.value = setInterval(async () => {
        console.log("Client: Polling for document updates...");
        await nav(); // nav() re-runs routeLoaders for the current route
      }, 5000); // Poll every 5 seconds

      // Cleanup function for when the component unmounts or isLoading changes to false
      return () => {
        if (pollingIntervalId.value) {
          clearInterval(pollingIntervalId.value);
          pollingIntervalId.value = null;
          console.log("Client: Polling stopped.");
        }
      };
    } else {
      // Stop polling if isLoading becomes false and interval is still active
      if (pollingIntervalId.value) {
        clearInterval(pollingIntervalId.value);
        pollingIntervalId.value = null;
        console.log("Client: Polling stopped because isLoading is false.");
      }
    }
  });

  const handleDeleteDocument = $((documentId: number) => {
    if (!confirm(`Are you sure you want to delete document ID: ${documentId}?`)) {
      return;
    }
    console.log(`Client: Triggering delete for document ID: ${documentId}`);
    serverDeleteDocument(documentId).then(async (result) => {
      if (result.success) {
        console.log(`Client: Document ${result.deletedId} deleted.`);
        await nav();
      } else {
        alert(`Error deleting document: ${result.error}`);
        console.error(`Client: Error deleting document: ${result.error}`);
      }
    });
  });

  const handleDeleteAllDocuments = $(() => {
    if (!confirm("Are you sure you want to delete ALL documents? This action cannot be undone.")) {
      return;
    }
    console.log("Client: Triggering delete all documents...");
    serverDeleteAllDocuments().then(async (result) => {
      if (result.success) {
        console.log(`Client: Deleted ${result.count} documents.`);
        alert(`Successfully deleted ${result.count} documents.`);
        await nav();
      } else {
        alert(`Error deleting all documents: ${result.error}`);
        console.error(`Client: Error deleting all documents: ${result.error}`);
      }
    });
  });

  return (
    <div class="container container-center">
      <h1>Iberley.es Scraper Dashboard</h1>
      
      <section class="status-section">
        <h2>Scraper Control & Status</h2>
        {!isLoading.value && (
          <div style="display: flex; gap: 10px;">
            <button onClick$={handleRunScraper}>
              Run Scraper Manually
            </button>
            <button onClick$={handleRunScraper} title="Performs a comprehensive scrape, same as 'Run Scraper Manually'">
              Iniciar Scrapeo Diario
            </button>
          </div>
        )}
        {isLoading.value && (
          <>
            <button onClick$={() => {
              // This will trigger the cleanup in useTask$ to stop polling
              isLoading.value = false;
            }}>
              Stop Scraping
            </button>
            <p>Scraping in Progress... (Polling for updates)</p>
          </>
        )}
        
        {lastRunTimestamp.value && <p>Last Run Attempted: {lastRunTimestamp.value}</p>}

        {lastRunError.value && (
          <div class="error-message">
            <p>Error during last run:</p>
            <pre>{lastRunError.value}</pre>
          </div>
        )}

        {lastRunStats.value && (
          <div class="stats-display">
            <h3>Last Run Statistics:</h3>
            <p>Pages Visited: <span>{lastRunStats.value.totalPagesVisited}</span></p>
            <p>Potential Documents Found (before saving): <span>{lastRunStats.value.totalDocumentsFound}</span></p>
            <p>New Documents Created in DB: <span>{lastRunStats.value.totalCreated}</span></p>
            <p>Documents Updated in DB: <span>{lastRunStats.value.totalUpdated}</span></p>
            <p>Total Links Discovered: <span>{lastRunStats.value.totalLinksDiscovered}</span></p>
          </div>
        )}
      </section>

      <section class="documents-list-section">
        <h2>
          Recently Scraped Documents
          {documentsSignal.value.length > 0 && (
            <button 
              onClick$={handleDeleteAllDocuments} 
              class="delete-all-btn"
              title="Delete all documents from the database"
            >
              Delete All ({documentsSignal.value.length})
            </button>
          )}
        </h2>
        {documentsSignal.value.length > 0 ? (
          <ul>
            {documentsSignal.value.map((doc: DisplayDocument) => (
              <li key={doc.id} class="document-item">
                <h3>{doc.title} ({doc.documentType})</h3>
                <p><strong>URL:</strong> <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.url}</a></p>
                <p><strong>Last Updated:</strong> {new Date(doc.updatedAt).toLocaleString()}</p>
                {doc.publicationDate && <p><strong>Published:</strong> {new Date(doc.publicationDate).toLocaleDateString()}</p>}
                {doc.documentType === 'convenio' && doc.pdfUrl && (
                  <p><strong>PDF:</strong> <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" download class="download-pdf-btn">Download PDF</a></p>
                )}
                <details>
                  <summary>View Full Content</summary>
                  <p class="content-snippet">{doc.content}...</p>
                </details>
                <button onClick$={() => handleDeleteDocument(doc.id)} class="delete-btn">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No documents found in the database yet, or an error occurred fetching them. Run the scraper to populate.</p>
        )}
      </section>

      <style>
        {`
          .container {
            padding: 20px;
            font-family: sans-serif;
          }
          .container-center {
            max-width: 900px;
            margin: 0 auto;
          }
          h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
          }
          h2 {
            color: #555;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-top: 20px;
          }
          .status-section, .documents-list-section {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .status-section p, .documents-list-section p:not(.content-snippet) {
            margin: 10px 0;
            font-size: 1.1em;
          }
          .status-section span {
            font-weight: bold;
            color: #007bff;
          }
          .documents-list-section ul {
            list-style-type: none;
            padding: 0;
          }
          .document-item {
            background-color: #fff;
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
          }
          .document-item h3 {
            display: inline-block; 
            margin-right: 10px;
            margin-top: 0;
            color: #0056b3;
          }
          .content-snippet {
            background-color: #f0f0f0;
            padding: 8px;
            border-radius: 3px;
            font-size: 0.9em;
            max-height: 100px;
            overflow-y: auto;
            white-space: pre-wrap; 
            word-break: break-word;
          }
          button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            margin-top: 10px;
          }
          button:hover {
            background-color: #0056b3;
          }
          .error-message {
            color: red;
            background-color: #ffebee;
            border: 1px solid #e57373;
            padding: 10px;
            margin-top: 10px;
            border-radius: 5px;
          }
          .stats-display {
            margin-top: 15px;
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #90caf9;
          }
          .stats-display h3 {
            margin-top: 0;
          }
          .delete-btn, .delete-all-btn {
            background-color: #f44336; /* Red */
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
            margin-left: 10px;
          }
          .delete-btn:hover, .delete-all-btn:hover {
            background-color: #d32f2f;
          }
          .delete-all-btn {
            float: right;
            margin-top: -5px;
          }
          .download-pdf-btn {
            display: inline-block;
            margin-left: 10px;
            padding: 3px 8px;
            font-size: 0.85em;
            background-color: #28a745; /* Green */
            color: white;
            text-decoration: none;
            border-radius: 3px;
          }
          .download-pdf-btn:hover {
            background-color: #218838;
          }
        `}
      </style>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Iberley Scraper Dashboard',
  meta: [
    {
      name: 'description',
      content: 'Dashboard for the Iberley.es web scraper',
    },
  ],
};