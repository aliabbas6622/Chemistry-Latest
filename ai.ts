import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function sanitizeText(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
    return retryWithExponentialBackoff(operation, retries - 1);
  }
}

export async function getAITutorResponse(question: string) {
  return retryWithExponentialBackoff(async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Enhanced prompt for more engaging interactions
      const sanitizedPrompt = sanitizeText(`
        You are ChemAI, a friendly and knowledgeable chemistry tutor. Whether the student asks about specific reactions or just wants to chat about chemistry, engage them appropriately.

        If the question is chemistry-related, provide:
        1. Clear explanation
        2. Relevant examples
        3. Related concepts
        4. Practice tips

        If it's a casual greeting or conversation:
        1. Respond warmly
        2. Share an interesting chemistry fact
        3. Encourage learning about chemistry

        Student's message: ${question}

        Format the response in markdown for better readability.
      `);

      const result = await model.generateContent(sanitizedPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in getAITutorResponse:', error);
      throw new Error(`Failed to get AI tutor response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}

export async function getReactionExplanation(query: string) {
  return retryWithExponentialBackoff(async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const sanitizedPrompt = sanitizeText(`
        As an organic chemistry expert, explain the following reaction or concept:
        ${query}

        Please provide:
        1. Step-by-step mechanism
        2. Required conditions
        3. Key considerations
        4. Common mistakes to avoid
        5. Real-world applications

        Format the response in markdown for better readability.
      `);

      const result = await model.generateContent(sanitizedPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in getReactionExplanation:', error);
      throw new Error(`Failed to get reaction explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}