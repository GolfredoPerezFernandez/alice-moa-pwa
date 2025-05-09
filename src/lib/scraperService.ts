import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import "dotenv/config"; // Ensure .env variables are loaded
import * as cheerio from 'cheerio';
import type { RequestEventBase } from "@builder.io/qwik-city";
import type { Element as DomHandlerElement } from 'domhandler'; // Import Element from domhandler
import { executeQuery } from '../utils/turso'; // Corrected path
import axios from 'axios';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Buffer } from 'buffer'; // Node.js Buffer

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.1,
});

const TARGET_URL = 'https://www.iberley.es/convenios';

interface ScrapedDocument {
  title: string;
  content: string; // This will store PDF content for convenios
  url: string; // This will be the URL of the page containing the PDF link for convenios
  documentType: "convenio"; // Focused only on convenios
  publicationDate?: Date | null;
  pdfUrl?: string; // URL of the actual PDF file
}

const documentExtractionSchema = z.object({
  isRelevantDocument: z.boolean().describe("Is the primary focus of the text a Spanish 'convenio' (collective agreement) OR a distinct, self-contained article/section of such a document from Iberley? Ignore lists, navigation, ads, general articles not part of the core document/article text."),
  documentType: z.enum(["convenio", "none"]).describe("The type of the document or article ('convenio'), or 'none' if not a relevant collective agreement."),
  title: z.string().nullable().describe("The full, specific title of the collective agreement or article, if relevant. Return null if not applicable."),
  fullContent: z.string().nullable().describe("Brief introductory text or metadata from the HTML page for a 'convenio', as the main content is in a PDF. Return null if not applicable."),
  publicationDate: z.string().nullable().describe("The publication date associated with the document or article (e.g., 'DD/MM/YYYY', 'DD de Month de YYYY'), if relevant. Return null if not applicable."),
}).describe("Extracted information about a potential collective agreement (convenio) from the provided text.");

const extractionLlm = llm.withStructuredOutput(documentExtractionSchema, { name: "documentExtractor" });

async function downloadPdf(pdfUrl: string): Promise<Buffer> {
  console.log(`Downloading PDF from: ${pdfUrl}`);
  try {
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 60000, // 60 seconds timeout
    });
    if (response.status !== 200) {
      throw new Error(`Failed to download PDF. Status: ${response.status}`);
    }
    console.log(`Successfully downloaded PDF from ${pdfUrl}. Size: ${response.data.length} bytes`);
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`Error downloading PDF from ${pdfUrl}:`, error);
    throw error;
  }
}

async function extractTextFromPdf(pdfBuffer: Buffer, pdfUrlForContext: string): Promise<string> {
  console.log(`Extracting text from PDF buffer (source: ${pdfUrlForContext})...`);
  try {
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const loader = new PDFLoader(pdfBlob);
    const docs = await loader.load();
    if (docs && docs.length > 0) {
      const combinedText = docs.map(doc => doc.pageContent).join('\n\n');
      console.log(`Successfully extracted text from PDF ${pdfUrlForContext}. Length: ${combinedText.length}`);
      return combinedText.replace(/\s\s+/g, ' ').trim();
    }
    console.warn(`No text extracted from PDF: ${pdfUrlForContext}`);
    return "";
  } catch (error) {
    console.error(`Error extracting text from PDF ${pdfUrlForContext}:`, error);
    throw error;
  }
}

async function fetchPageContent(url: string): Promise<string> {
  console.log(`Fetching content from: ${url}`);
  try {
    const { PuppeteerWebBaseLoader } = await import("@langchain/community/document_loaders/web/puppeteer");
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
      gotoOptions: { waitUntil: "domcontentloaded", timeout: 60000 },
    });
    const docs = await loader.load();
    if (docs.length > 0) {
      console.log(`Successfully fetched content from ${url}. Length: ${docs[0].pageContent.length}`);
      return docs[0].pageContent;
    }
    console.warn(`No content loaded from ${url}`);
    return "";
  } catch (error) {
    console.error(`Error fetching page content from ${url}:`, error);
    throw error;
  }
}

function extractTextFromHtml(htmlContent: string): string {
    const $ = cheerio.load(htmlContent);
    let mainContent = $('div.html-content[itemprop="text"]').text();
    let extractionMethod = "specific 'div.html-content[itemprop=\"text\"]'";

    if (!mainContent || mainContent.trim().length < 200) {
        extractionMethod = "common semantic tags (main, article, .main-content, .entry-content)";
        console.log(`[extractTextFromHtml] Specific selector yielded short/no content. Trying: ${extractionMethod}`);
        mainContent = $('main').text() || $('article').text() || $('.main-content').text() || $('.entry-content').text();
    }

    if (!mainContent || mainContent.trim().length < 200) {
        extractionMethod = "cleaned body text";
        console.log(`[extractTextFromHtml] Common selectors also yielded short/no content. Trying: ${extractionMethod}`);
        $('script, style, nav, header, footer, .sidebar, .menu, .ads, .q-header, .q-footer, .q-drawer, .q-page-sticky, #a2a_menu, #a2a_overlay, #a2a_modal, #q-loading-bar, #q-notify').remove();
        mainContent = $('body').text();
    }
    
    console.log(`[extractTextFromHtml] Extracted text using method: ${extractionMethod}. Length: ${mainContent.trim().length}`);
    return mainContent.replace(/\s\s+/g, ' ').trim();
}

async function analyzeAndExtractWithAgent(
  htmlContent: string,
  textContent: string,
  sourceUrl: string
): Promise<ScrapedDocument | null> {
  console.log(`Analyzing HTML/text from ${sourceUrl} with LLM agent (text length: ${textContent.length})...`);
  if (textContent.length < 100 && !sourceUrl.includes("/convenios/documento/") && !sourceUrl.includes("/convenios/sector/") && !sourceUrl.includes("/convenios/convenio/")) {
      console.log("Text content too short (and not a convenio detail page), skipping analysis.");
      return null;
  }
  const MAX_CHARS_FOR_LLM = 15000;
  const textToSend = textContent.substring(0, MAX_CHARS_FOR_LLM);

  try {
    const systemPrompt = `You are an expert legal document analyzer specializing in Spanish 'convenios' (collective agreements) from the website iberley.es.
Your task is to determine if the provided text (from an HTML page) primarily represents a 'convenio'.
Ignore lists of multiple documents, navigation elements, advertisements, or general articles that are not the core text of the 'convenio' itself.
If the text represents a relevant 'convenio', extract its key information accurately.
The main content of a 'convenio' is usually in a PDF. From the HTML, extract metadata like title and publication date. The 'fullContent' field for 'convenio' from this HTML analysis should be brief introductory text if available, or null; the PDF content will be added later.
If the text is a list page or other non-convenio content, set isRelevantDocument to false and documentType to 'none'.`;

    const result = await extractionLlm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Analyze the following text extracted from ${sourceUrl} and provide the structured information:\n\n\`\`\`text\n${textToSend}\n\`\`\``)
    ]);
    console.log(`LLM analysis result for ${sourceUrl}:`, result);

    if (result.isRelevantDocument && result.documentType === 'convenio' && result.title) {
      let parsedDate: Date | null = null;
      if (result.publicationDate) {
        try {
          const match = result.publicationDate.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
          if (match) {
            parsedDate = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
          } else {
             const dateParts = result.publicationDate.split(/[\sde/-]+/);
             if (dateParts.length === 3) {
                const day = parseInt(dateParts[0]);
                const year = parseInt(dateParts[2]);
                let month = -1;
                const monthNames: { [key: string]: number } = { "enero": 0, "febrero": 1, "marzo": 2, "abril": 3, "mayo": 4, "junio": 5, "julio": 6, "agosto": 7, "septiembre": 8, "octubre": 9, "noviembre": 10, "diciembre": 11 };
                if (isNaN(parseInt(dateParts[1]))) {
                    month = monthNames[dateParts[1].toLowerCase()];
                } else {
                    month = parseInt(dateParts[1]) - 1;
                }
                if (day && month >= 0 && year) {
                    parsedDate = new Date(year, month, day);
                }
             }
             if (!parsedDate) parsedDate = new Date(result.publicationDate);
          }
          if (parsedDate && isNaN(parsedDate.getTime())) {
             parsedDate = null;
          }
        } catch (e) {
          console.warn(`Could not parse date string "${result.publicationDate}" for ${sourceUrl}`);
          parsedDate = null;
        }
      }

      const baseDocument: ScrapedDocument = {
        title: result.title,
        content: result.fullContent || "", // Placeholder, will be overwritten by PDF content
        url: sourceUrl,
        documentType: "convenio",
        publicationDate: parsedDate,
      };

      const $ = cheerio.load(htmlContent);
      let pdfLink = $('a:contains("Documento oficial en PDF")').attr('href');
      
      if (!pdfLink) {
          pdfLink = $('div.html-content[itemprop="text"] a[href$=".pdf"], article a[href$=".pdf"], main a[href$=".pdf"]').first().attr('href');
      }

      if (pdfLink) {
        try {
          const absolutePdfUrl = new URL(pdfLink, sourceUrl).toString();
          console.log(`Found PDF link for convenio: ${absolutePdfUrl}`);
          baseDocument.pdfUrl = absolutePdfUrl;
          const pdfBuffer = await downloadPdf(absolutePdfUrl);
          baseDocument.content = await extractTextFromPdf(pdfBuffer, absolutePdfUrl);
        } catch (pdfError) {
          console.error(`Error processing PDF for ${sourceUrl} (PDF URL: ${pdfLink}):`, pdfError);
          baseDocument.content = result.fullContent || `Error processing PDF: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`;
        }
      } else {
        console.warn(`No PDF link found for convenio on page: ${sourceUrl}`);
        // If no PDF, content remains as what LLM extracted from HTML (likely just metadata or intro)
        // Or we could decide not to save it if PDF is mandatory. For now, save with HTML content.
        baseDocument.content = result.fullContent || "No PDF link found, HTML content (if any) used.";
      }
      return baseDocument;

    } else {
      console.log(`LLM determined content from ${sourceUrl} is not a relevant convenio or missing title.`);
      return null;
    }
  } catch (error) {
    console.error(`Error during LLM analysis or PDF processing for ${sourceUrl}:`, error);
    return null;
  }
}

function extractLinks(htmlContent: string, sourceUrl: string): string[] {
    const $ = cheerio.load(htmlContent);
    const newLinks: string[] = [];
    let anchors: cheerio.Cheerio<DomHandlerElement> = $(); 
    let selectorStrategy = "";

    if (sourceUrl === TARGET_URL || sourceUrl === TARGET_URL + "/") {
        selectorStrategy = `main /convenios page: constructing links from 'div.q-item[data-v-352473c6] span.q-ml-xs'`;
        console.log(`[extractLinks] Using ${selectorStrategy} for: ${sourceUrl}`);
        const regionCityItems = $('div.q-list[data-v-352473c6] div.q-item[data-v-352473c6]');
        regionCityItems.each((i, el) => {
            // Attempt to get href directly from the q-item if it's an <a> tag or has an href
            let href = $(el).attr('href');
            if (!href) {
                // If not, try to find an <a> tag within it
                href = $(el).find('a').attr('href');
            }

            if (href) {
                 try {
                    const tempUrl = new URL(href, sourceUrl).toString();
                    if (tempUrl.startsWith(TARGET_URL + "/search")) {
                        newLinks.push(tempUrl);
                        console.log(`[extractLinks] Found direct search link on main /convenios: ${tempUrl}`);
                    }
                } catch (e) { /* ignore invalid hrefs */ }
            } else {
                 // If no href found, try constructing from text
                const itemText = $(el).find('span.q-ml-xs').text().trim();
                if (itemText && itemText.toLowerCase() !== 'boe') {
                    try {
                        const encodedAmbit = encodeURIComponent(itemText);
                        const constructedUrl = `${TARGET_URL}/search?ambito=${encodedAmbit}&tipo=Sector`;
                        new URL(constructedUrl); // Validate
                        newLinks.push(constructedUrl);
                        console.log(`[extractLinks] Constructed link for main /convenios: ${constructedUrl}`);
                    } catch (e) {
                        console.warn(`[extractLinks] Could not construct valid URL for item text "${itemText}": ${e}`);
                    }
                }
            }
        });
        if (newLinks.length === 0) {
             selectorStrategy = "general 'main.q-page a[href*=\"/convenios/search\"]' (fallback for main /convenios)";
             console.log(`[extractLinks] No region/city items found to construct/extract links on main /convenios page. Falling back to: ${selectorStrategy}`);
             anchors = $('main.q-page a[href*="/convenios/search"]');
        }
    } else if (sourceUrl.startsWith(TARGET_URL + "/search")) {
        selectorStrategy = `convenios search page: 'td[data-v-67784b70] a.link[data-v-67784b70][href^="/convenios/"]'`;
        console.log(`[extractLinks] Using ${selectorStrategy} for /convenios/search page: ${sourceUrl}`);
        anchors = $('td[data-v-67784b70] a.link[data-v-67784b70][href^="/convenios/"]');
        if (anchors.length === 0) {
            selectorStrategy = "fallback for /convenios/search: 'div.q-table__middle td a[href*=\"/convenios/\"]'";
            console.log(`[extractLinks] Initial selector for /convenios/search found 0 links. Trying fallback: ${selectorStrategy}`);
            anchors = $('div.q-table__middle td a[href*="/convenios/"]');
        }
        if (anchors.length === 0) {
            selectorStrategy = "general 'main a[href]' (ultimate fallback for /convenios/search)";
            console.log(`[extractLinks] All targeted selectors for /convenios/search failed. Using general 'main a[href]': ${selectorStrategy}`);
            anchors = $('main a[href]');
        }
    } else if (sourceUrl.startsWith(TARGET_URL + "/documento/") || sourceUrl.startsWith(TARGET_URL + "/sector/") || sourceUrl.startsWith(TARGET_URL + "/convenio/")) {
        selectorStrategy = "convenio detail page: No further link extraction from this page type.";
        console.log(`[extractLinks] ${selectorStrategy} for ${sourceUrl}`);
        // anchors remains empty, so the .each loop won't run
    } else {
        selectorStrategy = `general 'a[href]' for unexpected page type: ${sourceUrl}`;
        console.warn(`[extractLinks] Unexpected page type for link extraction: ${sourceUrl}. Using general selector.`);
        anchors = $('a[href]');
    }

    anchors.each((i: number, el: DomHandlerElement) => {
        const href = $(el).attr('href');
        if (!href || href.trim() === '' || href.trim().toLowerCase() === 'undefined' || href.startsWith('#') || href.toLowerCase().startsWith('javascript:')) {
            return;
        }
        try {
            const absoluteUrl = new URL(href, sourceUrl).toString();
            if (
                !absoluteUrl.startsWith(TARGET_URL) || // Must be within /convenios path
                absoluteUrl.startsWith('mailto:') ||
                absoluteUrl.toLowerCase().includes('/auth/') ||
                absoluteUrl.toLowerCase().includes('/carrito/') ||
                absoluteUrl.toLowerCase().includes('/suscripcion/') ||
                absoluteUrl.toLowerCase().includes('/login') ||
                absoluteUrl.toLowerCase().includes('/registro') ||
                absoluteUrl.toLowerCase().includes('/perfil') ||
                absoluteUrl.toLowerCase().includes('/mi-cuenta') ||
                absoluteUrl.endsWith('.pdf') || // PDFs are handled by analyzeAndExtractWithAgent
                absoluteUrl.endsWith('.zip') ||
                absoluteUrl.endsWith('.doc') || absoluteUrl.endsWith('.docx') ||
                absoluteUrl.endsWith('.xls') || absoluteUrl.endsWith('.xlsx') ||
                absoluteUrl.endsWith('.ppt') || absoluteUrl.endsWith('.pptx') ||
                absoluteUrl.endsWith('.jpg') || absoluteUrl.endsWith('.jpeg') ||
                absoluteUrl.endsWith('.png') || absoluteUrl.endsWith('.gif') ||
                absoluteUrl.endsWith('.svg') || absoluteUrl.endsWith('.webp') ||
                absoluteUrl.endsWith('.mp3') || absoluteUrl.endsWith('.mp4') ||
                absoluteUrl.endsWith('.xml') || absoluteUrl.endsWith('.rss') ||
                absoluteUrl.endsWith('.css') || absoluteUrl.endsWith('.js')
            ) {
                return;
            }
            newLinks.push(absoluteUrl);
        } catch (error) {
            console.warn(`[extractLinks] Skipping invalid URL: "${href}" on page ${sourceUrl} (selector strategy: ${selectorStrategy}) due to error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    const uniqueNewLinks = [...new Set(newLinks)];
    console.log(`[extractLinks] Found ${uniqueNewLinks.length} new unique links on ${sourceUrl} (using selector strategy: ${selectorStrategy})`);
    return uniqueNewLinks;
}

async function saveDocuments(
  requestEvent: RequestEventBase,
  documents: ScrapedDocument[]
): Promise<{ createdCount: number, updatedCount: number }> {
  if (documents.length === 0) {
    console.log("No documents to save.");
    return { createdCount: 0, updatedCount: 0 };
  }
  console.log(`Attempting to save/update ${documents.length} documents...`);
  let createdCount = 0;
  let updatedCount = 0;
  const now = new Date().toISOString();

  for (const doc of documents) {
     if (!doc || !doc.url || !doc.title || !doc.content || doc.documentType !== 'convenio' || !doc.pdfUrl) {
         console.warn("Skipping document due to missing required fields for convenio or not being a convenio:", doc);
         continue;
     }
    try {
      const publicationDateStr = doc.publicationDate instanceof Date ? doc.publicationDate.toISOString() : null;
      const selectResult = await executeQuery(
        requestEvent,
        "SELECT createdAt FROM legalDocument WHERE url = ?",
        [doc.url]
      );
      const existingDoc = selectResult.rows.length > 0 ? selectResult.rows[0] : null;
      const upsertSql = `
        INSERT INTO legalDocument (url, title, content, documentType, publicationDate, pdfUrl, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(url) DO UPDATE SET
          title = excluded.title,
          content = excluded.content,
          documentType = excluded.documentType,
          publicationDate = excluded.publicationDate,
          pdfUrl = excluded.pdfUrl,
          updatedAt = excluded.updatedAt;
      `;
      const createdAtForInsert = existingDoc ? existingDoc.createdAt as string : now;
      const insertResult = await executeQuery(requestEvent, upsertSql, [
        doc.url,
        doc.title,
        doc.content,
        doc.documentType,
        publicationDateStr,
        doc.pdfUrl,
        createdAtForInsert,
        now
      ]);
      if (insertResult.rowsAffected > 0) {
        if (!existingDoc) {
          createdCount++;
        } else {
          updatedCount++;
        }
      }
    } catch (error) {
      console.error(`Error saving document ${doc.title} (${doc.url}):`, error);
    }
  }
  console.log(`Finished saving documents. Created: ${createdCount}, Updated: ${updatedCount}`);
  return { createdCount, updatedCount };
}

export async function runScraper(requestEvent: RequestEventBase): Promise<{
  totalPagesVisited: number;
  totalDocumentsFound: number;
  totalLinksDiscovered: number;
  totalCreated: number;
  totalUpdated: number;
}> {
  console.log("Starting scraper run for Convenios...");
  const stats = {
    totalPagesVisited: 0,
    totalDocumentsFound: 0,
    totalLinksDiscovered: 0,
    totalCreated: 0,
    totalUpdated: 0,
  };
  const urlQueue: string[] = [TARGET_URL];
  const visitedUrls: Set<string> = new Set();

  try {
    while (urlQueue.length > 0) {
      const currentUrl = urlQueue.shift();
      if (!currentUrl || visitedUrls.has(currentUrl) || !currentUrl.startsWith(TARGET_URL)) {
        if (currentUrl && !currentUrl.startsWith(TARGET_URL)) {
             console.log(`[runScraper] Skipping URL outside of TARGET_URL scope: ${currentUrl}`);
        }
        continue;
      }
      console.log(`Visiting: ${currentUrl} (Visited: ${visitedUrls.size + 1}, Queue: ${urlQueue.length})`);
      visitedUrls.add(currentUrl);
      stats.totalPagesVisited++;

      try {
        const htmlContent = await fetchPageContent(currentUrl);
        if (htmlContent) {
          const textContent = extractTextFromHtml(htmlContent);
          const extractedDoc = await analyzeAndExtractWithAgent(htmlContent, textContent, currentUrl);
          
          if (extractedDoc && extractedDoc.documentType === 'convenio' && extractedDoc.pdfUrl && extractedDoc.content.length > 50) {
            stats.totalDocumentsFound++;
            const saveStats = await saveDocuments(requestEvent, [extractedDoc]);
            stats.totalCreated += saveStats.createdCount;
            stats.totalUpdated += saveStats.updatedCount;
          } else if (extractedDoc && extractedDoc.documentType === 'convenio') {
            console.warn(`[runScraper] Convenio found at ${currentUrl} but PDF content seems missing or too short. PDF URL: ${extractedDoc.pdfUrl}, Content Length: ${extractedDoc.content.length}. Not saving.`);
          } else if (extractedDoc) {
            console.log(`[runScraper] LLM found a document of type '${extractedDoc.documentType}' at ${currentUrl}, but we are only saving 'convenio' type for this scraper.`);
          }

          if (currentUrl === TARGET_URL || currentUrl.startsWith(TARGET_URL + "/search")) {
            const newLinks = extractLinks(htmlContent, currentUrl);
            newLinks.forEach(link => {
              if (!visitedUrls.has(link) && !urlQueue.includes(link) && link.startsWith(TARGET_URL)) {
                const isConvenioSearchPage = link.startsWith(TARGET_URL + "/search");
                const isLikelyConvenioDetail = (
                  link.startsWith(TARGET_URL + "/documento/") ||
                  link.startsWith(TARGET_URL + "/sector/") ||
                  link.startsWith(TARGET_URL + "/convenio/")
                ) && !link.includes("?") && 
                  !link.endsWith("/sector") && 
                  !link.endsWith("/convenio") &&
                  !link.endsWith("/documento");

                if (isConvenioSearchPage || isLikelyConvenioDetail) {
                  urlQueue.unshift(link);
                  console.log(`[runScraper] PRIORITIZED convenios link added to front of queue: ${link}`);
                } else {
                  if (link.startsWith(TARGET_URL) && link.includes("/convenios/")) {
                      urlQueue.push(link);
                  }
                }
              }
            });
            stats.totalLinksDiscovered += newLinks.length;
          } else {
            console.log(`[runScraper] Not extracting further links from detail page: ${currentUrl}`);
          }
        }
      } catch (pageError) {
        console.error(`Error processing page ${currentUrl}:`, pageError);
      }
    }
    console.log(`Scraper run finished. Visited ${visitedUrls.size} unique pages within ${TARGET_URL}. Found ${stats.totalDocumentsFound} relevant documents. Created: ${stats.totalCreated}, Updated: ${stats.totalUpdated}. Discovered ${stats.totalLinksDiscovered} links.`);
    return stats;
  } catch (error) {
    console.error("Scraper run failed globally:", error);
    throw error;
  }
}