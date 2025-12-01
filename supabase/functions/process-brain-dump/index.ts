import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessedItem {
  category: string;
  refinedText: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
}

interface ProcessResponse {
  items: ProcessedItem[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an intelligent second brain assistant. Analyze the user's input and break it down into separate thoughts if needed.

Return a JSON response with "items" array, where each item has:
1. "category": Choose the most appropriate category - can be one of the common ones (task, reminder, note, idea) OR create a custom category that better fits the content (e.g., "quote", "recipe", "workout", "book", "movie", "contact", "goal", "habit", "travel", "learning", etc.)
2. "refinedText": Clean, clear version of the thought
3. "priority": "high", "medium", or "low" (for actionable items)
4. "tags": Array of 1-3 relevant tags (optional)

IMPORTANT: If the input contains multiple distinct thoughts, separate them into different items.

Category Guidelines:
- Use specific categories when they better describe the content (e.g., "recipe" for cooking instructions, "workout" for exercises, "quote" for memorable sayings)
- Common categories: task, reminder, note, idea, quote, recipe, workout, book, movie, contact, goal, habit, travel, learning, finance, health, project
- Tasks: Action items, deadlines, things to complete
- Reminders: Things to remember, people to contact
- Ideas: Creative thoughts, concepts, inspiration  
- Notes: Observations, feelings, general information

Return ONLY valid JSON with "items" array, no other text.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let processedData: ProcessResponse;
    try {
      // Clean the response by removing markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      processedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse DeepSeek response:', content);
      // Fallback to simple categorization
      processedData = {
        items: [{
          category: 'note',
          refinedText: text,
          priority: 'medium'
        }]
      };
    }

    return new Response(JSON.stringify(processedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-brain-dump function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      // Fallback response
      items: [{
        category: 'note',
        refinedText: text || '',
        priority: 'medium'
      }]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});