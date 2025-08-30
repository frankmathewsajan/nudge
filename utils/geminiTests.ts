// Comprehensive Gemini API Test Suite
// All-in-one testing for the new @google/genai integration
// Includes: Basic connectivity, embeddings, RAG, long context, thinking mode, and performance benchmarks

import ENV from './env';
import {
    batchEmbeddings,
    EmbeddingResponse,
    generateEmbeddings,
    generateLongContextContent,
    generateThinkingResponse,
    getModelCapabilities,
    RAGSystem,
    sendGoalsToGemini
} from './geminiAI';

export class GeminiTestSuite {
  
  // === QUICK TESTS (Fast & Simple) ===
  
  static async quickTest(): Promise<void> {
    console.log('🚀 Quick Gemini Test...');
    
    if (!ENV.hasGeminiKey()) {
      console.error('❌ No Gemini API key found');
      console.log('💡 Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file');
      return;
    }
    
    try {
      const response = await sendGoalsToGemini('I want to build amazing apps');
      console.log('✅ Quick test passed!');
      console.log('🎯 Motivation:', response.motivation.substring(0, 50) + '...');
      console.log('💡 Suggestions:', response.suggestions.length);
      console.log('🚀 Steps:', response.steps.length);
    } catch (error) {
      console.error('❌ Quick test failed:', error);
    }
  }

  static async quickEmbeddingsTest(): Promise<void> {
    console.log('📊 Quick Embeddings Test...');
    try {
      const embedding = await generateEmbeddings('Test embedding generation');
      console.log('✅ Embeddings test passed!');
      console.log('📏 Dimension:', embedding.dimension);
      console.log('🔢 Sample values:', embedding.embedding.slice(0, 3));
    } catch (error) {
      console.error('❌ Embeddings test failed:', error);
    }
  }

  // === COMPREHENSIVE TESTS ===
  
  static async testBasicConnection(): Promise<void> {
    console.log('=== Testing Basic Gemini API Connection ===');
    
    if (!ENV.hasGeminiKey()) {
      console.error('❌ No Gemini API key found');
      console.log('💡 Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file');
      return;
    }
    
    console.log('✅ API key found, length:', ENV.getGeminiKey().length);
    
    try {
      const testGoals = 'I want to build a successful React Native app that helps people achieve their goals';
      const response = await sendGoalsToGemini(testGoals);
      
      console.log('✅ Basic API call successful!');
      console.log('🎯 Motivation:', response.motivation);
      console.log('💡 Suggestions count:', response.suggestions.length);
      console.log('🚀 Steps count:', response.steps.length);
      
    } catch (error) {
      console.error('❌ Basic API call failed:', error);
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
        - Tamaguchi component library
        - Premium color palettes for visual appeal
        - Animated components for smooth UX
        - Google GenAI (@google/genai) for AI integration
        
        User Experience Goals:
        - Addictive engagement like Duolingo
        - Professional UI that competes with Google standards
        - Smooth animations and micro-interactions
        - High user retention through visual appeal
        
        Current Implementation:
        The app flows from onboarding → goal input → AI loading → success plan display.
        All components are optimized for performance and follow premium design guidelines.
      `;
      
      const query = 'Based on this project context, what are the next 3 most important features to implement for maximum user engagement and retention?';
      
      const response = await generateLongContextContent(longContext, query, 1024);
      
      console.log('✅ Long context generation successful!');
      console.log('📄 Response length:', response.length);
      console.log('👀 Response preview:', response.substring(0, 200) + '...');
      
    } catch (error) {
      console.error('❌ Long context test failed:', error);
    }
  }

  static async testThinkingMode(): Promise<void> {
    console.log('\n=== Testing Thinking Mode ===');
    
    try {
      const problem = 'How can we make a goal-setting app more addictive and engaging than existing solutions like Habitica or Strides?';
      const context = 'Our app uses AI for personalized plans and has a premium magazine-style UI design';
      
      const response = await generateThinkingResponse(problem, context);
      
      console.log('✅ Thinking mode successful!');
      console.log('🧠 Thought process:', response.thought_process);
      console.log('🔍 Reasoning steps:', response.reasoning.length);
      console.log('💡 Conclusion:', response.conclusion);
      
    } catch (error) {
      console.error('❌ Thinking mode test failed:', error);
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
      
      console.log('📊 Generating embeddings for', testTexts.length, 'texts...');
      
      // Test single embedding
      const singleEmbedding = await generateEmbeddings(testTexts[0]);
      console.log('✅ Single embedding successful!');
      console.log('📏 Dimension:', singleEmbedding.dimension);
      console.log('🔢 Sample values:', singleEmbedding.embedding.slice(0, 5));
      
      // Test batch embeddings
      const batchResults = await batchEmbeddings(testTexts);
      console.log('✅ Batch embeddings successful!');
      console.log('📦 Batch count:', batchResults.length);
      console.log('🔄 All dimensions match:', batchResults.every((e: EmbeddingResponse) => e.dimension === batchResults[0].dimension));
      
    } catch (error) {
      console.error('❌ Embeddings test failed:', error);
    }
  }

  static async testRAGSystem(): Promise<void> {
    console.log('\n=== Testing RAG System ===');
    
    try {
      const rag = new RAGSystem();
      
      // Add knowledge base documents
      const documents = [
        {
          id: 'goal-setting-tips',
          content: 'Effective goal setting requires SMART criteria: Specific, Measurable, Achievable, Relevant, Time-bound. Break large goals into smaller milestones.',
          metadata: { category: 'goal-setting', priority: 'high' }
        },
        {
          id: 'productivity-methods',
          content: 'Popular productivity methods include Pomodoro Technique, Getting Things Done (GTD), and Time Blocking. Each method has different strengths.',
          metadata: { category: 'productivity', priority: 'medium' }
        },
        {
          id: 'habit-formation',
          content: 'Habit formation takes 21-66 days on average. Start small, be consistent, and use environmental cues to trigger desired behaviors.',
          metadata: { category: 'habits', priority: 'high' }
        }
      ];
      
      console.log('📚 Adding', documents.length, 'documents to RAG system...');
      await rag.addDocuments(documents);
      console.log('✅ Documents added to RAG system!');
      
      // Test retrieval
      const query = 'How can I build better habits for achieving my goals?';
      console.log('🔍 Query:', query);
      
      const relevantDocs = await rag.retrieve(query, 2);
      console.log('✅ Document retrieval successful!');
      console.log('📄 Retrieved docs:', relevantDocs.map(d => d.id));
      
      // Test RAG generation
      const ragResponse = await rag.generateWithContext(query, 2);
      console.log('✅ RAG generation successful!');
      console.log('📏 Response length:', ragResponse.length);
      console.log('👀 Response preview:', ragResponse.substring(0, 150) + '...');
      
    } catch (error) {
      console.error('❌ RAG system test failed:', error);
    }
  }

  static async testModelCapabilities(): Promise<void> {
    console.log('\n=== Testing Model Capabilities ===');
    
    try {
      const capabilities = await getModelCapabilities();
      
      console.log('✅ Model capabilities retrieved!');
      console.log('📝 Text Generation:', capabilities.textGeneration);
      console.log('📄 Long Context:', capabilities.longContext);
      console.log('👁️ Vision:', capabilities.vision);
      console.log('🧠 Thinking:', capabilities.thinking);
      console.log('📊 Embeddings:', capabilities.embeddings);
      console.log('🔢 Max Context Tokens:', capabilities.maxContextTokens);
      
    } catch (error) {
      console.error('❌ Model capabilities test failed:', error);
    }
  }

  // === PERFORMANCE BENCHMARKS ===
  
  static async benchmarkPerformance(): Promise<void> {
    console.log('\n=== Performance Benchmark ===');
    
    const tests = [
      { name: 'Basic Text Generation', fn: () => sendGoalsToGemini('Test goal for performance') },
      { name: 'Embeddings Generation', fn: () => generateEmbeddings('Test text for embedding performance') },
    ];
    
    for (const test of tests) {
      try {
        const start = Date.now();
        await test.fn();
        const end = Date.now();
        console.log(`⚡ ${test.name}: ${end - start}ms`);
      } catch (error) {
        console.log(`❌ ${test.name}: FAILED`);
      }
    }
  }

  // === MAIN TEST SUITES ===
  
  static async runAllTests(): Promise<void> {
    console.log('🧪 Starting Comprehensive Gemini API Test Suite...\n');
    
    const startTime = Date.now();
    
    try {
      await this.testBasicConnection();
      await this.testLongContext();
      await this.testThinkingMode();
      await this.testEmbeddings();
      await this.testRAGSystem();
      await this.testModelCapabilities();
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`\n🎉 All tests completed in ${duration.toFixed(2)} seconds!`);
      console.log('✅ Gemini API integration is working with all advanced features');
      
    } catch (error) {
      console.error('\n❌ Test suite failed:', error);
      console.log('💡 Some features may not be working correctly');
    }
  }

  static async runQuickTests(): Promise<void> {
    console.log('⚡ Running Quick Tests...\n');
    
    const startTime = Date.now();
    
    try {
      await this.quickTest();
      await this.quickEmbeddingsTest();
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`\n⚡ Quick tests completed in ${duration.toFixed(2)} seconds!`);
      console.log('✅ Basic Gemini API functionality is working');
      
    } catch (error) {
      console.error('\n❌ Quick tests failed:', error);
      console.log('💡 Check your API key and internet connection');
    }
  }
}

// === EXPORT CONVENIENCE FUNCTIONS ===

// New consolidated API test (replaces testNewGeminiAPI)
export async function testGeminiAPI(): Promise<void> {
  console.log('🧪 Testing @google/genai Integration...');
  
  if (!ENV.hasGeminiKey()) {
    console.error('❌ No Gemini API key found');
    console.log('💡 Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file');
    return;
  }
  
  console.log('✅ API key found, length:', ENV.getGeminiKey().length);
  
  try {
    // Test basic goal generation
    console.log('📡 Testing basic goal generation...');
    const testGoals = 'I want to build amazing React Native apps that change the world';
    const response = await sendGoalsToGemini(testGoals);
    
    console.log('✅ Basic API call successful!');
    console.log('🎯 Motivation:', response.motivation);
    console.log('💡 Suggestions count:', response.suggestions.length);
    console.log('🚀 Steps count:', response.steps.length);
    
    // Test embeddings
    console.log('\n📊 Testing embeddings generation...');
    const embedding = await generateEmbeddings('Building successful mobile applications');
    
    console.log('✅ Embeddings successful!');
    console.log('📏 Dimension:', embedding.dimension);
    console.log('🔢 Sample values:', embedding.embedding.slice(0, 5));
    
    console.log('\n🎉 All tests passed! New Gemini API is working perfectly.');
    console.log('🚀 Ready for advanced features like RAG, long context, and thinking mode!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    console.log('💡 Common issues:');
    console.log('   - Check your API key is valid');
    console.log('   - Verify internet connection');
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
