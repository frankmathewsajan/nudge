// Comprehensive Gemini API Test Suite
// All-in-one testing for the new @google/genai integration
// Includes: Basic connectivity, embeddings, RAG, long context, thinking mode, and performance benchmarks

import ENV from './env';
import {
  batchEmbeddings,
  clearUserSession,
  generateEmbeddings,
  generateLongContextContent,
  generateThinkingResponse,
  getCacheStats,
  getModelCapabilities,
  RAGSystem,
  sendGoalsToGemini
} from './geminiAI';

export class GeminiTestSuite {
  
  // === QUICK TESTS (Fast & Simple) ===
  
  static async quickTest(): Promise<void> {
    console.log('Quick Gemini Test...');
    
    if (!ENV.hasGeminiKey()) {
      console.error('No Gemini API key found');
      console.log('Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file');
      return;
    }
    
    try {
      const response = await sendGoalsToGemini('I want to build amazing apps and learn programming');
      console.log('Quick test passed!');
      console.log('Urgent tasks:', response.urgent.length);
      console.log('Long-term goals:', response.long_term.length);
      console.log('Maintenance tasks:', response.maintenance.length);
      console.log('Optional tasks:', response.optional.length);
    } catch (error) {
      console.error('Quick test failed:', error);
    }
  }

  static async quickEmbeddingsTest(): Promise<void> {
    console.log('Quick Embeddings Test...');
    try {
      const embedding = await generateEmbeddings('Test embedding generation');
      console.log('Embeddings test passed!');
      console.log('Dimension:', embedding.dimension);
      console.log('Sample values:', embedding.embedding.slice(0, 3));
    } catch (error) {
      console.error('Embeddings test failed:', error);
    }
  }

  // === COMPREHENSIVE TESTS ===
  
  static async testBasicConnection(): Promise<void> {
    console.log('=== Testing Basic Gemini API Connection ===');
    
    if (!ENV.hasGeminiKey()) {
      console.error('No Gemini API key found');
      console.log('Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file');
      return;
    }
    
    console.log('API key found, length:', ENV.getGeminiKey().length);
    
    try {
      const testGoals = 'I want to build a successful React Native app that helps people achieve their goals';
      const response = await sendGoalsToGemini(testGoals);
      
      console.log('Basic API call successful!');
      console.log('Urgent tasks:', response.urgent.length);
      console.log('Long-term goals:', response.long_term.length);
      console.log('Maintenance tasks:', response.maintenance.length);
      console.log('Optional tasks:', response.optional.length);
      
    } catch (error) {
      console.error('Basic API call failed:', error);
    }
  }

  static async testSessionMemory(): Promise<void> {
    console.log('\n=== Testing Session Memory & Context ===');
    
    try {
      const userId = 'test-user-123';
      
      // Clear any existing session first
      clearUserSession(userId);
      
      // First goals request - should establish context
      console.log('First request (establishing context)...');
      const firstResponse = await sendGoalsToGemini('I want to learn React Native development', userId);
      console.log('First request successful');
      console.log('Urgent tasks:', firstResponse.urgent.length);
      
      // Second goals request - should use context
      console.log('Second request (using context)...');
      const secondResponse = await sendGoalsToGemini('I also want to learn TypeScript', userId);
      console.log('Second request successful');
      console.log('Urgent tasks:', secondResponse.urgent.length);
      
      // Check cache stats
      const stats = getCacheStats();
      console.log('Cache stats:');
      console.log('   - Cache size:', stats.cacheSize);
      console.log('   - Active sessions:', stats.activeSessions);
      console.log('   - Hit rate:', `${(stats.hitRate * 100).toFixed(1)}%`);
      
      // Clean up
      clearUserSession(userId);
      console.log('Session cleaned up');
      
    } catch (error) {
      console.error('Session memory test failed:', error);
    }
  }

  static async testLongContext(): Promise<void> {
    console.log('\n=== Testing Long Context Generation ===');
    
    try {
      const longContext = `
        Project Context: Nudge App Development
        
        The Nudge app is a goal-setting mobile application built with React Native and Expo. 
        It uses Tamagui for UI components and premium design principles for visual appeal.
        The app integrates with Google's Gemini AI to provide personalized goal achievement plans.
        
        Key Features:
        - Interactive onboarding flow with animations
        - Goal input with real-time validation
        - AI-powered success plan generation
        - Premium magazine-style layout for plan display
        - Luxury typography and color theory
        
        Technical Stack:
        - React Native with Expo Router
        - Tamagui component library
        - Google Gemini AI integration
        - TypeScript for type safety
        - Modern ES6+ JavaScript patterns
        
        User Experience Goals:
        - Minimize cognitive load
        - Maximize user engagement
        - Professional, premium feel
        - Fast, responsive interactions
        - Intuitive navigation flows
        
        Business Objectives:
        - High user retention rates
        - Positive app store reviews
        - Word-of-mouth growth
        - Premium positioning in market
        - Scalable architecture for growth
      `;
      
      const query = 'Based on this project context, what are the next 3 most important features to implement for maximum user engagement and retention?';
      
      const response = await generateLongContextContent(longContext, query, 1024);
      
      console.log('Long context generation successful!');
      console.log('Response length:', response.length, 'characters');
      console.log('Preview:', response.substring(0, 200) + '...');
      
    } catch (error) {
      console.error('Long context test failed:', error);
    }
  }

  static async testThinkingMode(): Promise<void> {
    console.log('\n=== Testing Thinking Mode ===');
    
    try {
      const problem = 'How can we increase user engagement in our goal-setting app while maintaining a premium, non-intrusive user experience?';
      const context = 'Our app uses AI for personalized plans and has a premium magazine-style UI design';
      
      const response = await generateThinkingResponse(problem, context);
      
      console.log('Thinking mode successful!');
      console.log('Thought process:', response.thought_process);
      console.log('Reasoning steps:', response.reasoning.length);
      console.log('Conclusion:', response.conclusion);
      
    } catch (error) {
      console.error('Thinking mode test failed:', error);
    }
  }

  static async testEmbeddings(): Promise<void> {
    console.log('\n=== Testing Embeddings Generation ===');
    
    try {
      const testTexts = [
        'I want to learn programming and build mobile apps',
        'My goal is to get fit and healthy through regular exercise', 
        'I need to improve my productivity and time management skills',
        'Building a successful startup is my main objective'
      ];
      
      console.log('Testing single embedding generation...');
      const singleEmbedding = await generateEmbeddings(testTexts[0]);
      console.log('Single embedding successful!');
      console.log('Dimension:', singleEmbedding.dimension);
      console.log('Sample values:', singleEmbedding.embedding.slice(0, 5));
      
      console.log('\nTesting batch embedding generation...');
      const batchResults = await batchEmbeddings(testTexts);
      console.log('Batch embeddings successful!');
      console.log('Generated', batchResults.length, 'embeddings');
      console.log('First embedding dimension:', batchResults[0].dimension);
      
    } catch (error) {
      console.error('Embeddings test failed:', error);
    }
  }

  static async testRAGSystem(): Promise<void> {
    console.log('\n=== Testing RAG System ===');
    
    try {
      const rag = new RAGSystem();
      
      // Add some test documents
      const documents = [
        'Goal setting is most effective when goals are specific, measurable, achievable, relevant, and time-bound (SMART).',
        'Breaking large goals into smaller, actionable steps increases the likelihood of success and maintains motivation.',
        'Regular review and adjustment of goals based on progress and changing circumstances is crucial for long-term achievement.',
        'Visual progress tracking and celebration of milestones helps maintain momentum and positive reinforcement.',
        'Social accountability and sharing goals with others can significantly improve goal completion rates.'
      ];
      
      console.log('Adding documents to RAG system...');
      for (let i = 0; i < documents.length; i++) {
        await rag.addDocuments([{content: documents[i], id: `doc-${i + 1}`}]);
      }
      console.log('Added', documents.length, 'documents');
      
      console.log('Testing RAG query...');
      const query = 'What are the best practices for effective goal setting?';
      const ragResponse = await rag.generateWithContext(query, 2);
      
      console.log('RAG query successful!');
      console.log('Response:', ragResponse.substring(0, 200) + '...');
      
    } catch (error) {
      console.error('RAG system test failed:', error);
    }
  }

  static async testModelCapabilities(): Promise<void> {
    console.log('\n=== Testing Model Capabilities ===');
    
    try {
      const capabilities = await getModelCapabilities();
      
      console.log('Model capabilities retrieved!');
      console.log('Vision Support:', capabilities.vision);
      console.log('Long Context:', capabilities.longContext);
      console.log('Thinking Mode:', capabilities.thinking);
      console.log('Embeddings:', capabilities.embeddings);
      console.log('Max Context Tokens:', capabilities.maxContextTokens);
      console.log('Max Output Tokens:', capabilities.maxOutputTokens);
      
    } catch (error) {
      console.error('Model capabilities test failed:', error);
    }
  }

  // === BENCHMARK TESTS ===
  
  static async benchmarkPerformance(): Promise<void> {
    console.log('\n=== Performance Benchmarks ===');
    
    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;
    
    try {
      // Test basic API speed
      console.log('Testing basic API response time...');
      const apiStart = Date.now();
      await sendGoalsToGemini('Test goal for performance benchmark');
      const apiTime = Date.now() - apiStart;
      console.log('Basic API call:', apiTime + 'ms');
      successCount++;
      
      // Test embeddings speed
      console.log('Testing embeddings response time...');
      const embStart = Date.now();
      await generateEmbeddings('Test text for embedding benchmark');
      const embTime = Date.now() - embStart;
      console.log('Embeddings generation:', embTime + 'ms');
      successCount++;
      
      // Test thinking mode speed
      console.log('Testing thinking mode response time...');
      const thinkStart = Date.now();
      await generateThinkingResponse('Simple test problem', 'Basic context');
      const thinkTime = Date.now() - thinkStart;
      console.log('Thinking mode:', thinkTime + 'ms');
      successCount++;
      
    } catch (error) {
      console.error('Benchmark test failed:', error);
      failCount++;
    }
    
    const totalTime = Date.now() - startTime;
    console.log('\n=== Benchmark Results ===');
    console.log('Total time:', totalTime + 'ms');
    console.log('Successful tests:', successCount);
    console.log('Failed tests:', failCount);
    console.log('Success rate:', ((successCount / (successCount + failCount)) * 100).toFixed(1) + '%');
  }

  // === FULL TEST SUITE ===
  
  static async runAllTests(): Promise<void> {
    console.log('=== Running Complete Gemini Test Suite ===\n');
    const startTime = Date.now();
    
    try {
      await this.testBasicConnection();
      await this.testSessionMemory();
      await this.testLongContext();
      await this.testThinkingMode();
      await this.testEmbeddings();
      await this.testRAGSystem();
      await this.testModelCapabilities();
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log('\n=== All Tests Completed ===');
      console.log('Total duration:', duration.toFixed(2) + ' seconds');
      console.log('All Gemini features are working correctly!');
      
    } catch (error) {
      console.error('Test suite failed:', error);
    }
  }

  static async runQuickTests(): Promise<void> {
    console.log('=== Running Quick Tests ===\n');
    
    try {
      await this.quickTest();
      await this.quickEmbeddingsTest();
      await this.testSessionMemory();
      
      console.log('\n=== Quick Tests Completed ===');
      console.log('Basic functionality verified!');
      
    } catch (error) {
      console.error('Quick tests failed:', error);
    }
  }
}

// === ADDITIONAL UTILITY FUNCTIONS ===

export async function testGeminiAPI(): Promise<void> {
  console.log('Starting Gemini API Test...');
  
  if (!ENV.hasGeminiKey()) {
    console.error('Gemini API key not found!');
    console.log('Please add your API key to the .env file:');
    console.log('EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here');
    return;
  }
  
  try {
    await GeminiTestSuite.quickTest();
    console.log('Gemini API is working correctly!');
    console.log('Ready for advanced features like RAG, long context, and thinking mode!');
  } catch (error) {
    console.error('Gemini API test failed. Please check:');
    console.log('   - Your API key is valid and active');
    console.log('   - You have internet connectivity');
    console.log('   - Make sure you have API quota remaining');
    console.log('   - Ensure @google/genai is properly installed');
  }
}

// Quick convenience exports
export const quickTestGemini = GeminiTestSuite.quickTest;
export const quickTestEmbeddings = GeminiTestSuite.quickEmbeddingsTest;
export const runAllTests = GeminiTestSuite.runAllTests;
export const runQuickTests = GeminiTestSuite.runQuickTests;
export const benchmarkPerformance = GeminiTestSuite.benchmarkPerformance;

// Uncomment to run tests immediately
// GeminiTestSuite.runQuickTests();
// GeminiTestSuite.runAllTests();
// testGeminiAPI();
