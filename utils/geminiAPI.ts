// API utility for Gemini AI integration
import config from '../config';

export interface GoalResponse {
  suggestions: string[];
  motivation: string;
  steps: string[];
}

export async function sendGoalsToGemini(goals: string): Promise<GoalResponse> {
  if (config.app.mockMode) {
    // Mock response for development/testing
    console.log('Mock mode: Simulating goals analysis for:', goals);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      suggestions: [
        "Break down your goals into smaller, manageable tasks",
        "Set specific deadlines for each milestone",
        "Track your progress daily with a journal or app",
        "Find an accountability partner or mentor"
      ],
      motivation: "Your goals are ambitious and achievable! With the right mindset, consistent effort, and a solid plan, you can absolutely make these dreams a reality. Every small step forward is progress worth celebrating.",
      steps: [
        "Write down your goals in specific, measurable terms",
        "Create a timeline with weekly and monthly milestones",
        "Identify the first small action you can take today",
        "Set up a daily routine that supports your goals"
      ]
    };
  } else {
    // Use real Gemini API
    return await sendGoalsToGeminiAPI(goals);
  }
}

// Real Gemini API implementation
export async function sendGoalsToGeminiAPI(goals: string): Promise<GoalResponse> {
  console.log('🚀 Sending goals to Gemini API:', goals);
  
  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: config.gemini.promptTemplate(goals)
            }
          ]
        }
      ]
    };
    
    console.log('📡 Making API request to:', config.gemini.apiUrl);
    console.log('🔑 Using API key:', config.gemini.apiKey ? 'Present' : 'Missing');
    
    const response = await fetch(`${config.gemini.apiUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': config.gemini.apiKey || '',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📊 API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('📝 Raw API Response:', JSON.stringify(data, null, 2));
    
    // Extract the generated text from Gemini's response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!generatedText) {
      console.error('❌ No generated text in response');
      throw new Error('No response generated from Gemini API');
    }
    
    console.log('🎯 Generated text:', generatedText);
    
    // Parse the Gemini response
    const parsedResponse = parseGeminiResponse(generatedText);
    console.log('✅ Parsed response:', parsedResponse);
    
    return parsedResponse;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Return a fallback response instead of throwing
    return {
      motivation: "Your goals are meaningful and achievable! Stay focused, take consistent action, and celebrate small wins along the way.",
      suggestions: [
        "Break down large goals into smaller, manageable tasks",
        "Set specific deadlines and create accountability systems",
        "Track progress regularly and adjust your approach as needed",
        "Find mentors or communities that support your objectives"
      ],
      steps: [
        "Write down your goals with specific, measurable outcomes",
        "Identify the first small action you can take today",
        "Create a weekly schedule that allocates time for goal work",
        "Set up progress tracking and regular review sessions"
      ]
    };
  }
}

// Helper function to parse Gemini API response
function parseGeminiResponse(text: string): GoalResponse {
  console.log('🔍 Parsing Gemini response...');
  
  try {
    // First, try to extract JSON from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      console.log('📋 Found JSON in response, attempting to parse...');
      const jsonText = jsonMatch[1] || jsonMatch[0];
      
      try {
        const parsed = JSON.parse(jsonText);
        console.log('✅ Successfully parsed JSON:', parsed);
        
        if (parsed.motivation && parsed.suggestions && parsed.steps) {
          return {
            motivation: parsed.motivation,
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
            steps: Array.isArray(parsed.steps) ? parsed.steps : []
          };
        }
      } catch (jsonError) {
        console.log('⚠️ JSON parsing failed, trying text parsing...');
      }
    }
    
    // Fallback: Parse unstructured text with improved logic
    console.log('📝 Parsing as unstructured text...');
    const lines = text.split('\n').filter(line => line.trim());
    
    let motivation = '';
    const suggestions: string[] = [];
    const steps: string[] = [];
    
    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lowerLine = line.toLowerCase();
      
      // Detect sections
      if (lowerLine.includes('motivation') || lowerLine.includes('inspiring') || lowerLine.includes('encourage')) {
        currentSection = 'motivation';
        continue;
      } else if (lowerLine.includes('suggestion') || lowerLine.includes('recommend') || lowerLine.includes('advice')) {
        currentSection = 'suggestions';
        continue;
      } else if (lowerLine.includes('step') || lowerLine.includes('action') || lowerLine.includes('next')) {
        currentSection = 'steps';
        continue;
      }
      
      // Extract content
      if (line && line.length > 10) {
        const cleanContent = line
          .replace(/^\d+\.?\s*/, '')  // Remove numbers
          .replace(/^[-*•]\s*/, '')   // Remove bullets
          .replace(/^["'`]/, '')      // Remove quotes
          .replace(/["'`]$/, '')      // Remove trailing quotes
          .trim();
        
        if (cleanContent.length < 5) continue; // Skip very short content
        
        if (currentSection === 'motivation' && !motivation) {
          motivation = cleanContent;
          console.log('📌 Found motivation:', motivation);
        } else if (currentSection === 'suggestions' && suggestions.length < 4) {
          suggestions.push(cleanContent);
          console.log('💡 Found suggestion:', cleanContent);
        } else if (currentSection === 'steps' && steps.length < 4) {
          steps.push(cleanContent);
          console.log('🎯 Found step:', cleanContent);
        }
      }
    }
    
    // Build final response with defaults if needed
    const finalResponse = {
      motivation: motivation || "Your goals are achievable with dedication and the right strategy! Stay focused and take action.",
      suggestions: suggestions.length > 0 ? suggestions : [
        "Break your goals into smaller, manageable milestones",
        "Create accountability systems and track progress",
        "Develop consistent daily habits that support your goals",
        "Seek mentorship or join communities with similar objectives"
      ],
      steps: steps.length > 0 ? steps : [
        "Define specific, measurable outcomes for each goal",
        "Schedule dedicated time blocks for goal-related work",
        "Take one small action toward your goals today",
        "Set up weekly progress reviews and adjustments"
      ]
    };
    
    console.log('✅ Final parsed response:', finalResponse);
    return finalResponse;
    
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    // Return default response if parsing fails
    return {
      motivation: "Your goals are within reach! With persistence and smart planning, you can achieve great things.",
      suggestions: [
        "Start with small, manageable tasks",
        "Build consistent daily habits",
        "Seek support from others",
        "Monitor and adjust your approach"
      ],
      steps: [
        "Clarify your specific objectives",
        "Create a realistic timeline",
        "Begin with one small action",
        "Track your progress weekly"
      ]
    };
  }
}
