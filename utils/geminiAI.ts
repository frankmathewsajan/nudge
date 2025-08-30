// Modern Gemini API with @google/genai - Advanced Features
// Supports: Text Generation, Long Context, Vision, Thinking, Embeddings, RAG

import { GoogleGenAI } from "@google/genai";
import config from '../config';
import ENV from './env';

// Initialize the client
let genai: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genai) {
    const apiKey = ENV.getGeminiKey();
    if (!apiKey) {
      throw new Error('Gemini API key not found. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file');
    }
    genai = new GoogleGenAI({ apiKey });
  }
  return genai;
}

// Response interfaces
export interface GoalResponse {
  motivation: string;
  suggestions: string[];
  steps: string[];
}

export interface EmbeddingResponse {
  embedding: number[];
  dimension: number;
}

export interface VisionAnalysis {
  description: string;
  insights: string[];
  recommendations: string[];
}

export interface ThinkingResponse {
  thought_process: string;
  reasoning: string[];
  conclusion: string;
}

// === TEXT GENERATION ===
export async function sendGoalsToGemini(goals: string): Promise<GoalResponse> {
  if (config.app.mockMode) {
    return getMockGoalResponse(goals);
  }

  try {
    const ai = getGenAI();
    
    const prompt = `
    You are a professional life coach and goal achievement expert. Analyze the following goals and provide a comprehensive success plan.

    User Goals: "${goals}"

    Please provide your response in this exact JSON format (no markdown, no extra text):
    {
      "motivation": "A powerful, inspiring motivation message that connects emotionally with their goals",
      "suggestions": ["Strategic suggestion 1", "Strategic suggestion 2", "Strategic suggestion 3", "Strategic suggestion 4"],
      "steps": ["Actionable step 1", "Actionable step 2", "Actionable step 3", "Actionable step 4"]
    }

    Requirements:
    - Motivation should be personal, inspiring, and 2-3 sentences
    - Suggestions should be strategic, specific, and actionable
    - Steps should be concrete actions they can take immediately
    - No emojis anywhere in the response
    - Focus on practical, achievable advice
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    // Parse JSON response
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    // Validate response structure
    if (!parsed.motivation || !Array.isArray(parsed.suggestions) || !Array.isArray(parsed.steps)) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return {
      motivation: parsed.motivation,
      suggestions: parsed.suggestions.slice(0, 4),
      steps: parsed.steps.slice(0, 4),
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// === LONG CONTEXT GENERATION ===
export async function generateLongContextContent(
  context: string,
  query: string,
  maxTokens: number = 8192
): Promise<string> {
  try {
    const ai = getGenAI();
    
    const prompt = `
    Context Information:
    ${context}
    
    Based on the above context, please answer the following query:
    ${query}
    
    Provide a comprehensive, well-structured response that leverages all relevant information from the context.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", // Supports up to 2M tokens
      contents: prompt,
    });

    return response.text || '';
  } catch (error) {
    console.error('Long Context Generation Error:', error);
    throw new Error(`Failed to generate long context content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// === VISION ANALYSIS ===
export async function analyzeImage(
  imageData: string, // base64 or blob
  query: string = "Analyze this image and provide insights"
): Promise<VisionAnalysis> {
  try {
    const ai = getGenAI();
    
    const prompt = `
    ${query}
    
    Please analyze this image and provide:
    1. A detailed description of what you see
    2. Key insights and observations
    3. Practical recommendations based on the image content
    
    Respond in JSON format:
    {
      "description": "Detailed description",
      "insights": ["Insight 1", "Insight 2", "Insight 3"],
      "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          parts: [
            { text: prompt },
            { 
              inlineData: {
                mimeType: "image/jpeg", // or image/png
                data: imageData
              }
            }
          ]
        }
      ],
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response from vision analysis');
    }

    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error) {
    console.error('Vision Analysis Error:', error);
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// === THINKING MODE ===
export async function generateThinkingResponse(
  problem: string,
  context?: string
): Promise<ThinkingResponse> {
  try {
    const ai = getGenAI();
    
    const prompt = `
    Think step by step about this problem:
    ${problem}
    
    ${context ? `Additional context: ${context}` : ''}
    
    Please provide a structured thinking process:
    
    <thinking>
    Walk through your reasoning process step by step. Show your work, consider different angles, and explain your logic.
    </thinking>
    
    Then provide a JSON response:
    {
      "thought_process": "Summary of your thinking process",
      "reasoning": ["Reasoning step 1", "Reasoning step 2", "Reasoning step 3"],
      "conclusion": "Final conclusion with actionable insights"
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", // Use regular model for now
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response from thinking mode');
    }

    // Extract JSON from response (after thinking tags)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in thinking response');
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('Thinking Mode Error:', error);
    throw new Error(`Failed to generate thinking response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// === EMBEDDINGS ===
export async function generateEmbeddings(
  text: string,
  taskType: 'retrieval_document' | 'retrieval_query' | 'semantic_similarity' | 'classification' | 'clustering' = 'semantic_similarity'
): Promise<EmbeddingResponse> {
  try {
    const ai = getGenAI();
    
    const response = await ai.models.embedContent({
      model: "text-embedding-004", // Latest embedding model
      contents: [{ parts: [{ text }] }],
    });

    const embedding = response.embeddings?.[0]?.values || [];
    
    return {
      embedding: embedding,
      dimension: embedding.length || 0,
    };

  } catch (error) {
    console.error('Embeddings Error:', error);
    throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// === RAG (Retrieval Augmented Generation) ===
export interface RAGDocument {
  id: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export class RAGSystem {
  private documents: RAGDocument[] = [];
  private ai: GoogleGenAI;

  constructor() {
    this.ai = getGenAI();
  }

  // Add documents to the knowledge base
  async addDocuments(documents: Omit<RAGDocument, 'embedding'>[]): Promise<void> {
    for (const doc of documents) {
      const embeddingResponse = await generateEmbeddings(doc.content, 'retrieval_document');
      this.documents.push({
        ...doc,
        embedding: embeddingResponse.embedding,
      });
    }
  }

  // Find similar documents using cosine similarity
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Retrieve relevant documents
  async retrieve(query: string, topK: number = 3): Promise<RAGDocument[]> {
    const queryEmbedding = await generateEmbeddings(query, 'retrieval_query');
    
    const similarities = this.documents.map(doc => ({
      document: doc,
      similarity: doc.embedding ? this.cosineSimilarity(queryEmbedding.embedding, doc.embedding) : 0,
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.document);
  }

  // Generate response using retrieved context
  async generateWithContext(query: string, topK: number = 3): Promise<string> {
    const relevantDocs = await this.retrieve(query, topK);
    const context = relevantDocs.map(doc => doc.content).join('\n\n');

    return await generateLongContextContent(context, query);
  }
}

// === BATCH OPERATIONS ===
export async function batchEmbeddings(texts: string[]): Promise<EmbeddingResponse[]> {
  const embeddings: EmbeddingResponse[] = [];
  
  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(text => generateEmbeddings(text));
    const batchResults = await Promise.all(batchPromises);
    embeddings.push(...batchResults);
    
    // Small delay between batches
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return embeddings;
}

// === MOCK RESPONSES ===
function getMockGoalResponse(goals: string): GoalResponse {
  const mockResponses = {
    motivation: "Your goals show incredible ambition and clear vision. Success comes to those who combine big dreams with consistent daily action, and you have both the mindset and determination to achieve extraordinary results.",
    suggestions: [
      "Break down your main goal into weekly milestones with specific, measurable outcomes",
      "Create a daily routine that dedicates focused time blocks to your highest-priority activities", 
      "Build a support network of mentors and peers who share similar ambitions and can provide guidance",
      "Track your progress using metrics and celebrate small wins to maintain long-term motivation"
    ],
    steps: [
      "Write down your specific goal with a clear deadline and success criteria",
      "Identify the top 3 skills or knowledge areas you need to develop first",
      "Schedule 90 minutes daily for focused work on your most important tasks",
      "Find one person this week who has achieved similar goals and ask for their advice"
    ]
  };

  return mockResponses;
}

// === UTILITY FUNCTIONS ===
export async function getModelCapabilities(): Promise<Record<string, any>> {
  try {
    const ai = getGenAI();
    // Note: This would need to be implemented based on actual API capabilities
    return {
      textGeneration: true,
      longContext: true,
      vision: true,
      thinking: true,
      embeddings: true,
      maxContextTokens: 2000000, // 2M tokens for gemini-2.0-flash-exp
      supportedImageFormats: ['jpeg', 'png', 'webp', 'gif'],
      embeddingDimensions: 768,
    };
  } catch (error) {
    console.error('Error getting model capabilities:', error);
    return {};
  }
}

// Export the old function name for backward compatibility
export const sendGoalsToGeminiAPI = sendGoalsToGemini;
