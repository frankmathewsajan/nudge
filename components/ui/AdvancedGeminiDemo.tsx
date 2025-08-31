// Advanced Gemini API Demo Component
// Interactive showcase of all new API features

import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import config from '../../config';
import {
    generateEmbeddings,
    generateLongContextContent,
    generateThinkingResponse,
    RAGSystem,
    sendGoalsToGemini
} from '../../utils/geminiAI';
import {
    BodyText,
    CustomInput,
    PrimaryButton,
    Surface,
    TitleText,
} from './StyledComponents';

interface TestResult {
  success: boolean;
  data: any;
  error?: string;
  duration: number;
}

export const AdvancedGeminiDemo: React.FC = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setTestLoading = (testName: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [testName]: isLoading }));
  };

  const setTestResult = (testName: string, result: TestResult) => {
    setResults(prev => ({ ...prev, [testName]: result }));
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setTestLoading(testName, true);
    const startTime = Date.now();

    try {
      const data = await testFn();
      const duration = Date.now() - startTime;
      
      setTestResult(testName, {
        success: true,
        data,
        duration,
      });
      
      Alert.alert(
        `${testName} Success`,
        `Completed in ${duration}ms`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      
      setTestResult(testName, {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      });
      
      Alert.alert(
        `${testName} Failed`,
        `Error: ${error}`,
        [{ text: 'OK' }]
      );
    } finally {
      setTestLoading(testName, false);
    }
  };

  // === TEST FUNCTIONS ===
  
  const testBasicGoals = () => runTest('Basic Goal Generation', async () => {
    const testInput = input || 'I want to build a successful mobile app that helps people achieve their goals';
    return await sendGoalsToGemini(testInput);
  });

  const testLongContext = () => runTest('Long Context Generation', async () => {
    const context = `
      Project: Nudge App - AI-Powered Goal Achievement
      
      Technical Stack: React Native, Expo, Tamagui, Gemini AI
      Features: Interactive onboarding, AI goal planning, modern UI
      
      User Feedback: Users love the smooth animations and professional design.
      They want more personalization and social features.
      
      Market Analysis: Goal-setting apps are growing 25% yearly.
      Top competitors: Habitica, Strides, Way of Life.
      
      Revenue Model: Freemium with premium AI features.
      Target: 100K users in first year, $50K MRR.
    `;
    
    const query = input || 'Based on this project context, what are the top 3 features to implement next for maximum user engagement?';
    
    return await generateLongContextContent(context, query);
  });

  const testThinking = () => runTest('AI Thinking Mode', async () => {
    const problem = input || 'How can we make our goal-setting app more addictive than existing competitors?';
    const context = 'Our app uses AI for personalized plans and has a modern Bento-box UI design';
    
    return await generateThinkingResponse(problem, context);
  });

  const testEmbeddings = () => runTest('Text Embeddings', async () => {
    const text = input || 'Building successful mobile applications with React Native and AI integration';
    return await generateEmbeddings(text);
  });

  const testRAGSystem = () => runTest('RAG System', async () => {
    const rag = new RAGSystem();
    
    // Add sample documents
    await rag.addDocuments([
      {
        id: 'productivity',
        content: 'Productivity tips: Use time blocking, eliminate distractions, prioritize high-impact tasks, take regular breaks.',
        metadata: { category: 'productivity' }
      },
      {
        id: 'goal-setting',
        content: 'Effective goal setting: Make goals SMART, break them into milestones, track progress, celebrate wins.',
        metadata: { category: 'goals' }
      },
      {
        id: 'motivation',
        content: 'Staying motivated: Find your why, visualize success, surround yourself with supportive people.',
        metadata: { category: 'motivation' }
      }
    ]);
    
    const query = input || 'How can I stay productive while working on my goals?';
    return await rag.generateWithContext(query, 2);
  });

  // === RENDER FUNCTIONS ===
  
  const renderTestResult = (testName: string) => {
    const result = results[testName];
    const isLoading = loading[testName];
    
    if (!result && !isLoading) return null;
    
    return (
      <Surface key={testName}>
        <TitleText>{testName}</TitleText>
        
        {isLoading ? (
          <BodyText>Loading...</BodyText>
        ) : (
          <View>
            <BodyText variant="medium">
              Status: {result.success ? 'Success' : 'Failed'}
            </BodyText>
            <BodyText variant="medium">Duration: {result.duration}ms</BodyText>
            
            {result.success ? (
              <View style={styles.resultData}>
                <BodyText variant="medium">Result:</BodyText>
                <Text style={styles.resultText}>
                  {typeof result.data === 'object' 
                    ? JSON.stringify(result.data, null, 2).substring(0, 300) + '...'
                    : String(result.data).substring(0, 300) + '...'
                  }
                </Text>
              </View>
            ) : (
              <View style={styles.errorData}>
                <BodyText variant="medium">Error: {result.error}</BodyText>
              </View>
            )}
          </View>
        )}
      </Surface>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <TitleText>Advanced Gemini API Demo</TitleText>
        <BodyText variant="medium">
          Mode: {config.app.mockMode ? 'Mock' : 'Real API'}
        </BodyText>
        
        {/* Input Section */}
        <Surface>
          <TitleText>Test Input</TitleText>
          <BodyText variant="medium">
            Enter custom input or leave empty for default test data:
          </BodyText>
          <CustomInput
            value={input}
            onChangeText={setInput}
            placeholder="Enter your test input here..."
            multiline
            numberOfLines={3}
          />
        </Surface>

        {/* Test Buttons */}
        <Surface>
          <TitleText>API Tests</TitleText>
          
          <View style={styles.buttonGrid}>
            <PrimaryButton
              onPress={testBasicGoals}
              disabled={loading.basic}
              variant="primary"
            >
              Test Basic Goals
            </PrimaryButton>
            
            <PrimaryButton
              onPress={testLongContext}
              disabled={loading.longContext}
              variant="secondary"
            >
              Test Long Context
            </PrimaryButton>
            
            <PrimaryButton
              onPress={testThinking}
              disabled={loading.thinking}
              variant="outlined"
            >
              Test AI Thinking
            </PrimaryButton>
            
            <PrimaryButton
              onPress={testEmbeddings}
              disabled={loading.embeddings}
              variant="primary"
            >
              Test Embeddings
            </PrimaryButton>
            
            <PrimaryButton
              onPress={testRAGSystem}
              disabled={loading.rag}
              variant="secondary"
            >
              Test RAG System
            </PrimaryButton>
          </View>
        </Surface>

        {/* Results Section */}
        <View style={styles.resultsSection}>
          {Object.keys(results).map(renderTestResult)}
          {Object.keys(loading).some(key => loading[key]) && (
            <Surface>
              <BodyText>Running tests...</BodyText>
            </Surface>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  buttonGrid: {
    gap: 12,
    marginTop: 16,
  },
  resultsSection: {
    marginTop: 24,
    gap: 16,
  },
  resultData: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  errorData: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
    marginTop: 8,
  },
});
