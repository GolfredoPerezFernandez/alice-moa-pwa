import {  $ } from "@builder.io/qwik";
import { routeLoader$, routeAction$, zod$, z } from '@builder.io/qwik-city';
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { getUserId } from "~/utils/auth";
import { tursoClient } from "~/utils/turso";

// Types
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Maximum number of messages to keep in context window
const MAX_CONTEXT_MESSAGES = 10;

// API endpoint for text-only chat
export const onPost = $(async (requestEvent) => {
  try {
    // Check authentication
    const userId = getUserId(requestEvent);
    if (!userId) {
      return requestEvent.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await requestEvent.request.json();
    const { message, formatResponse = true } = body;

    if (!message) {
      return requestEvent.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Get OpenAI API key
    const openaiApiKey = requestEvent.env.get('OPENAI_API_KEY') || import.meta.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return requestEvent.json(
        { success: false, error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Initialize database client
    const client = tursoClient(requestEvent);

    // Get chat history from database
    const historyResult = await client.execute({
      sql: `SELECT role, content 
            FROM text_chat_messages 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?`,
      args: [userId, MAX_CONTEXT_MESSAGES]
    });
    
    // Format messages for OpenAI
    const messages: Array<HumanMessage | AIMessage | SystemMessage> = [];

    // Add system message if it's the first message
    if (historyResult.rows.length === 0) {
      const systemMessage = new SystemMessage(
        "You are Alice, a helpful and friendly AI assistant. You provide clear, concise, and accurate information."
      );
      messages.push(systemMessage);
      
      // Save system message to database
      await client.execute({
        sql: `INSERT INTO text_chat_messages (user_id, role, content) VALUES (?, ?, ?)`,
        args: [userId, 'system', systemMessage.content]
      });
    } else {
      // Add existing messages (reversed to maintain chronological order)
      for (let i = historyResult.rows.length - 1; i >= 0; i--) {
        const row = historyResult.rows[i];
        const content = String(row.content || ''); // Ensure content is a string and not null
        
        if (row.role === 'user') {
          messages.push(new HumanMessage(content));
        } else if (row.role === 'assistant') {
          messages.push(new AIMessage(content));
        } else if (row.role === 'system') {
          messages.push(new SystemMessage(content));
        }
      }
    }
    
    // Add the new user message
    messages.push(new HumanMessage(message));

    // Save user message to database
    await client.execute({
      sql: `INSERT INTO text_chat_messages (user_id, role, content) VALUES (?, ?, ?)`,
      args: [userId, 'user', message]
    });

    // Initialize OpenAI chat model
    const model = new ChatOpenAI({
      openAIApiKey: openaiApiKey,
      modelName: "gpt-4-turbo-preview",
      temperature: 0.7,
    });
    
    // If formatting is requested, instruct the model to use Markdown
    if (formatResponse) {
      // Find the system message and update or add formatting instructions
      const systemMsgIndex = messages.findIndex(msg => msg instanceof SystemMessage);
      
      if (systemMsgIndex >= 0) {
        const systemMsg = messages[systemMsgIndex];
        // Update existing system message with formatting instructions
        messages[systemMsgIndex] = new SystemMessage(
          `${systemMsg.content}\n\nFormat your responses using Markdown where appropriate: use **double asterisks** around important information, concepts, or key terms to highlight them in bold.`
        );
      } else {
        // Add a new system message if none exists
        messages.unshift(new SystemMessage(
          "You are Alice, a helpful and friendly AI assistant. You provide clear, concise, and accurate information. Format your responses using Markdown where appropriate: use **double asterisks** around important information, concepts, or key terms to highlight them in bold."
        ));
      }
    }
    
    // Generate response
    const response = await model.invoke(messages);
    
    // Ensure we handle non-string content (could be MessageContentComplex[])
    const assistantMessage = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);

    // Save assistant message to database
    await client.execute({
      sql: `INSERT INTO text_chat_messages (user_id, role, content) VALUES (?, ?, ?)`,
      args: [userId, 'assistant', assistantMessage]
    });

    // Return success response
    return requestEvent.json({
      success: true,
      message: assistantMessage
    });
  } catch (error) {
    console.error("Error in chat-text API:", error);
    return requestEvent.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
});
