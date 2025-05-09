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
const MAX_PAGES_TO_VISIT = 50;

interface ScrapedDocument {
  title: string;
  content: string;
  url: string;
  documentType: "sentencia" | "ley";
  publicationDate?: Date | null;
}

const documentExtractionSchema = z.object({
  isRelevantDocument: z.boolean().describe("Is the primary focus of the text a single Spanish legal document (ley or sentencia) from Iberley? Ignore lists, navigation, ads, general articles."),
  documentType: z.enum(["sentencia", "ley", "none"]).describe("The type of the document ('sentencia' or 'ley'), or 'none' if not a relevant legal document."),
  title: z.string().optional().describe("The full, specific title of the legal document, if relevant."),
  fullContent: z.string().optional().describe("The complete text content of the specific legal document, if relevant and available in the input text. Extract only the document text itself, excluding surrounding website elements."),
  publicationDate: z.string().optional().describe("The publication date found in the text (e.g., 'DD/MM/YYYY', 'DD de Month de YYYY'), if relevant."),
}).describe("Extracted information about a potential legal document from the provided text.");

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
    let mainContent = $('main').text() || $('article').text() || $('.main-content').text() || $('.entry-content').text();
    if (!mainContent || mainContent.trim().length < 200) {
        $('script, style, nav, header, footer, .sidebar, .menu, .ads').remove();
        mainContent = $('body').text();
    }
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
    const systemPrompt = `You are an expert legal document analyzer specializing in Spanish law from the website iberley.es. Your task is to determine if the provided text primarily represents a single specific legal document (a 'sentencia' - judgment/sentence, or a 'ley' - law/decree/normative). Ignore lists of documents, navigation elements, advertisements, general articles, or blog posts. If it is a relevant document, extract its key information accurately. Focus ONLY on the main legal document presented.`;
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
    const linkKeywords = ["ley", "sentencia", "legislacion", "jurisprudencia", "normativa", "actualidad", "noticias", "boletin", "codigo", "resoluciones", "temas"];
    const paginationKeywords = ["siguiente", "next", "anterior", "prev", "page", "página"];

    $('a[href]').each((i: number, el: DomHandlerElement) => { // Use DomHandlerElement
        const href = $(el).attr('href');
        const linkText = $(el).text().toLowerCase();
        if (href) {
            try {
                const absoluteUrl = new URL(href, sourceUrl).toString();
                if (absoluteUrl.startsWith(TARGET_URL) &&
                    !absoluteUrl.startsWith('mailto:') &&
                    !absoluteUrl.startsWith('javascript:') &&
                    !absoluteUrl.includes('/auth/') &&
                    !absoluteUrl.includes('/carrito') &&
                    !absoluteUrl.includes('/suscripcion') &&
                    !absoluteUrl.endsWith('.pdf') && !absoluteUrl.endsWith('.zip') &&
                    !absoluteUrl.endsWith('.jpg') && !absoluteUrl.endsWith('.png'))
                {
                    const isRelevant = linkKeywords.some(kw => linkText.includes(kw) || absoluteUrl.toLowerCase().includes(kw)) ||
                                     paginationKeywords.some(kw => linkText.includes(kw) || absoluteUrl.toLowerCase().includes(kw));
                    if (isRelevant) {
                        newLinks.push(absoluteUrl);
                    }
                }
            } catch (error) { /* ignore invalid URLs */ }
        }
    });
    return [...new Set(newLinks)];
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
    while (urlQueue.length > 0 && visitedUrls.size < MAX_PAGES_TO_VISIT) {
      const currentUrl = urlQueue.shift();
      if (!currentUrl || visitedUrls.has(currentUrl)) {
        continue;
      }
      console.log(`Visiting: ${currentUrl} (${visitedUrls.size + 1}/${MAX_PAGES_TO_VISIT})`);
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
              urlQueue.push(link);
            }
          });
          stats.totalLinksDiscovered += newLinks.length;
        }
      } catch (pageError) {
        console.error(`Error processing page ${currentUrl}:`, pageError);
      }
    }
    if (visitedUrls.size >= MAX_PAGES_TO_VISIT) {
      console.warn(`Scraper reached MAX_PAGES_TO_VISIT limit (${MAX_PAGES_TO_VISIT}).`);
    }
    console.log(`Scraper run finished. Visited ${visitedUrls.size} pages. Found ${stats.totalDocumentsFound} relevant documents. Created: ${stats.totalCreated}, Updated: ${stats.totalUpdated}. Discovered ${stats.totalLinksDiscovered} links.`);
    return stats;
  } catch (error) {
    console.error("Scraper run failed globally:", error);
    throw error;
  }
}