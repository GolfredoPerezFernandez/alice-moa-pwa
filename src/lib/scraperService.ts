import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import "dotenv/config"; // Ensure .env variables are loaded
import * as cheerio from 'cheerio';
import type { RequestEventBase } from "@builder.io/qwik-city";
import type { Element as DomHandlerElement } from 'domhandler'; // Import Element from domhandler
import { executeQuery } from '../utils/turso'; // Corrected path

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.1,
});

const TARGET_URL = 'https://www.iberley.es/';
// const MAX_PAGES_TO_VISIT = 50; // User requested effectively unlimited crawl within TARGET_URL

interface ScrapedDocument {
  title: string;
  content: string;
  url: string;
  documentType: "sentencia" | "ley";
  publicationDate?: Date | null;
}

const documentExtractionSchema = z.object({
  isRelevantDocument: z.boolean().describe("Is the primary focus of the text a single Spanish legal document (ley or sentencia) OR a distinct, self-contained article/section of such a document from Iberley? Ignore lists, navigation, ads, general articles not part of the core document/article text."),
  documentType: z.enum(["sentencia", "ley", "none"]).describe("The type of the document or article ('sentencia' or 'ley'), or 'none' if not a relevant legal document/article."),
  title: z.string().nullable().describe("The full, specific title of the legal document or article, if relevant. Return null if not applicable."),
  fullContent: z.string().nullable().describe("The complete text content of the specific legal document or article, if relevant and available in the input text. Extract only the document/article text itself, excluding surrounding website elements. Return null if not applicable."),
  publicationDate: z.string().nullable().describe("The publication date associated with the document or article (e.g., 'DD/MM/YYYY', 'DD de Month de YYYY'), if relevant. Return null if not applicable."),
}).describe("Extracted information about a potential legal document or a distinct article/section of a legal document from the provided text.");

const extractionLlm = llm.withStructuredOutput(documentExtractionSchema, { name: "documentExtractor" });

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
    
    // Prioritize the specific content container for Iberley document/article detail pages
    let mainContent = $('div.html-content[itemprop="text"]').text();
    let extractionMethod = "specific 'div.html-content[itemprop=\"text\"]'";

    if (!mainContent || mainContent.trim().length < 200) {
        // Fallback to common semantic tags if the specific one fails or content is too short
        extractionMethod = "common semantic tags (main, article, .main-content, .entry-content)";
        console.log(`[extractTextFromHtml] Specific selector yielded short/no content. Trying: ${extractionMethod}`);
        mainContent = $('main').text() || $('article').text() || $('.main-content').text() || $('.entry-content').text();
    }

    if (!mainContent || mainContent.trim().length < 200) {
        // Further fallback: remove noise and take body text
        extractionMethod = "cleaned body text";
        console.log(`[extractTextFromHtml] Common selectors also yielded short/no content. Trying: ${extractionMethod}`);
        // Remove common noise elements, including Quasar layout components
        $('script, style, nav, header, footer, .sidebar, .menu, .ads, .q-header, .q-footer, .q-drawer, .q-page-sticky, #a2a_menu, #a2a_overlay, #a2a_modal, #q-loading-bar, #q-notify').remove();
        mainContent = $('body').text();
    }
    
    console.log(`[extractTextFromHtml] Extracted text using method: ${extractionMethod}. Length: ${mainContent.trim().length}`);
    return mainContent.replace(/\s\s+/g, ' ').trim();
}

async function analyzeAndExtractWithAgent(textContent: string, sourceUrl: string): Promise<ScrapedDocument | null> {
  console.log(`Analyzing content from ${sourceUrl} with LLM agent (text length: ${textContent.length})...`);
  if (textContent.length < 100) {
      console.log("Text content too short, skipping analysis.");
      return null;
  }
  const MAX_CHARS_FOR_LLM = 15000;
  const textToSend = textContent.substring(0, MAX_CHARS_FOR_LLM);

  try {
    const systemPrompt = `You are an expert legal document analyzer specializing in Spanish law from the website iberley.es.
Your task is to determine if the provided text primarily represents EITHER:
1. A single specific legal document (a 'sentencia' - judgment/sentence, or a 'ley' - law/decree/normative).
2. A distinct, self-contained article or section of such a legal document.
Ignore lists of multiple documents, navigation elements, advertisements, general articles, or blog posts that are not the core text of the law/sentence/article itself.
If the text represents a relevant single document OR a distinct article/section, extract its key information accurately. Focus ONLY on the main legal document or article text presented.
If the text is a list page or other non-document/non-article content, set isRelevantDocument to false.`;
    const result = await extractionLlm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`Analyze the following text extracted from ${sourceUrl} and provide the structured information:\n\n\`\`\`text\n${textToSend}\n\`\`\``)
    ]);
    console.log(`LLM analysis result for ${sourceUrl}:`, result);

    if (result.isRelevantDocument && result.documentType !== 'none' && result.title && result.fullContent) {
      let parsedDate: Date | null = null;
      if (result.publicationDate) {
        try {
          const match = result.publicationDate.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
          if (match) {
            parsedDate = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
          } else {
             parsedDate = new Date(result.publicationDate);
          }
          if (parsedDate && isNaN(parsedDate.getTime())) {
             parsedDate = null;
          }
        } catch (e) {
          console.warn(`Could not parse date string "${result.publicationDate}" for ${sourceUrl}`);
          parsedDate = null;
        }
      }
      return {
        title: result.title,
        content: result.fullContent,
        url: sourceUrl,
        documentType: result.documentType as "sentencia" | "ley",
        publicationDate: parsedDate,
      };
    } else {
      console.log(`LLM determined content from ${sourceUrl} is not a relevant single document.`);
      return null;
    }
  } catch (error) {
    console.error(`Error during LLM analysis for ${sourceUrl}:`, error);
    return null;
  }
}

function extractLinks(htmlContent: string, sourceUrl: string): string[] {
    const $ = cheerio.load(htmlContent);
    const newLinks: string[] = [];
    let anchors: cheerio.Cheerio<DomHandlerElement>;
    let selectorStrategy = "general 'a[href]'"; // Default description

    if (sourceUrl.startsWith(TARGET_URL + "jurisprudencia")) {
        selectorStrategy = "specific for /jurisprudencia: 'div.sentence-home-card a.news-title[href]'";
        console.log(`[extractLinks] Using ${selectorStrategy} for page: ${sourceUrl}`);
        anchors = $('div.sentence-home-card a.news-title[href]');
        if (anchors.length === 0) {
            console.log(`[extractLinks] Specific selector for jurisprudencia found 0 links, falling back to general 'a[href]'`);
            selectorStrategy = "general 'a[href]' (fallback for /jurisprudencia)";
            anchors = $('a[href]');
        }
    } else if (sourceUrl.startsWith(TARGET_URL + "legislacion")) {
        // Speculative selectors for /legislacion. May need refinement based on its actual HTML structure.
        selectorStrategy = "speculative for /legislacion: 'div[class*=\"card\"] h2 a[href], div[class*=\"item\"] h2 a[href], article h2 a[href], div[class*=\"card\"] a[class*=\"title\"], div[class*=\"item\"] a[class*=\"title\"], article a[class*=\"title\"]'";
        console.log(`[extractLinks] Using ${selectorStrategy} for page: ${sourceUrl}`);
        anchors = $('div[class*="card"] h2 a[href], div[class*="item"] h2 a[href], article h2 a[href], div[class*="card"] a[class*="title"], div[class*="item"] a[class*="title"], article a[class*="title"]');
        if (anchors.length === 0) {
            console.log(`[extractLinks] Specific selector for legislacion found 0 links, falling back to general 'a[href]'`);
            selectorStrategy = "general 'a[href]' (fallback for /legislacion)";
            anchors = $('a[href]');
        }
    } else {
        anchors = $('a[href]');
    }

    anchors.each((i: number, el: DomHandlerElement) => {
        const href = $(el).attr('href');

        if (!href || href.trim() === '' || href.startsWith('#') || href.toLowerCase().startsWith('javascript:')) {
            return;
        }
        
        try {
            const absoluteUrl = new URL(href, sourceUrl).toString();

            if (!absoluteUrl.startsWith(TARGET_URL) ||
                absoluteUrl.startsWith('mailto:') ||
                absoluteUrl.toLowerCase().includes('/auth/') ||
                absoluteUrl.toLowerCase().includes('/carrito/') ||
                absoluteUrl.toLowerCase().includes('/suscripcion/') ||
                absoluteUrl.toLowerCase().includes('/login') ||
                absoluteUrl.toLowerCase().includes('/registro') ||
                absoluteUrl.toLowerCase().includes('/perfil') ||
                absoluteUrl.toLowerCase().includes('/mi-cuenta') ||
                absoluteUrl.endsWith('.pdf') ||
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
     if (!doc || !doc.url || !doc.title || !doc.content || !doc.documentType) {
         console.warn("Skipping document due to missing required fields:", doc);
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
        INSERT INTO legalDocument (url, title, content, documentType, publicationDate, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(url) DO UPDATE SET
          title = excluded.title,
          content = excluded.content,
          documentType = excluded.documentType,
          publicationDate = excluded.publicationDate,
          updatedAt = excluded.updatedAt;
      `;
      
      // For new inserts, createdAt is 'now'. For updates, it's preserved by ON CONFLICT not touching it.
      // The 'excluded.createdAt' in VALUES for INSERT part will be 'now'.
      // The 'excluded.updatedAt' in VALUES for INSERT part will be 'now'.
      // The 'excluded.updatedAt' in SET for UPDATE part will be 'now'.
      const createdAtForInsert = existingDoc ? existingDoc.createdAt as string : now;

      const insertResult = await executeQuery(requestEvent, upsertSql, [
        doc.url,
        doc.title,
        doc.content,
        doc.documentType,
        publicationDateStr,
        createdAtForInsert, // Use existing createdAt if updating, else now for new
        now  // updatedAt is always now
      ]);

      if (insertResult.rowsAffected > 0) {
        if (!existingDoc) {
          createdCount++;
        } else {
          // Check if anything actually changed to count as an update
          // This simple check assumes any write via ON CONFLICT is an update if it existed.
          // More precise would be to compare old values with new ones if needed.
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
  console.log("Starting scraper run...");
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
    // Loop continues as long as there are URLs in the queue.
    // The visitedUrls set prevents re-visiting and infinite loops on already seen pages.
    // The extractLinks function ensures we only add URLs from TARGET_URL.
    while (urlQueue.length > 0) {
      const currentUrl = urlQueue.shift();
      if (!currentUrl || visitedUrls.has(currentUrl)) {
        continue;
      }
      console.log(`Visiting: ${currentUrl} (Visited: ${visitedUrls.size + 1})`);
      visitedUrls.add(currentUrl);
      stats.totalPagesVisited++;

      try {
        const htmlContent = await fetchPageContent(currentUrl);
        if (htmlContent) {
          const textContent = extractTextFromHtml(htmlContent);
          const extractedDoc = await analyzeAndExtractWithAgent(textContent, currentUrl);
          if (extractedDoc) {
            stats.totalDocumentsFound++;
            const saveStats = await saveDocuments(requestEvent, [extractedDoc]);
            stats.totalCreated += saveStats.createdCount;
            stats.totalUpdated += saveStats.updatedCount;
          }
          const newLinks = extractLinks(htmlContent, currentUrl);
          newLinks.forEach(link => {
            if (!visitedUrls.has(link) && !urlQueue.includes(link)) {
              // Heuristic to prioritize likely detail page URLs from jurisprudencia or legislacion
              const isLikelyJurisprudenciaDetail = link.startsWith(TARGET_URL + "jurisprudencia/") &&
                                                 link.length > (TARGET_URL + "jurisprudencia/").length &&
                                                 !link.endsWith("/jurisprudencia") && !link.includes("?"); // Avoid query params which might be filters
              const isLikelyLegislacionDetail = link.startsWith(TARGET_URL + "legislacion/") &&
                                              link.length > (TARGET_URL + "legislacion/").length &&
                                              !link.endsWith("/legislacion") && !link.includes("?"); // Avoid query params

              if (isLikelyJurisprudenciaDetail || isLikelyLegislacionDetail) {
                urlQueue.unshift(link); // Add to FRONT of the queue
                console.log(`[runScraper] PRIORITIZED link added to front of queue: ${link}`);
              } else {
                urlQueue.push(link); // Add to END of the queue
              }
            }
          });
          stats.totalLinksDiscovered += newLinks.length;
        }
      } catch (pageError) {
        console.error(`Error processing page ${currentUrl}:`, pageError);
      }
    }
    // Warning for MAX_PAGES_TO_VISIT is no longer applicable.
    // The scraper stops when the urlQueue is exhausted.
    console.log(`Scraper run finished. Visited ${visitedUrls.size} unique pages within ${TARGET_URL}. Found ${stats.totalDocumentsFound} relevant documents. Created: ${stats.totalCreated}, Updated: ${stats.totalUpdated}. Discovered ${stats.totalLinksDiscovered} links.`);
    return stats;
  } catch (error) {
    console.error("Scraper run failed globally:", error);
    throw error;
  }
}